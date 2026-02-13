import { Router, Request, Response } from 'express';
import axios from 'axios';
import mongoose from 'mongoose';

const router = Router();

// Environment-based configuration
const isSandbox = process.env.MPESA_ENV === 'sandbox' || !process.env.MPESA_ENV;

const DARAJA_AUTH_URL = isSandbox
  ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
  : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

const DARAJA_STK_PUSH_URL = isSandbox
  ? 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
  : 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

const DARAJA_QUERY_URL = isSandbox
  ? 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query'
  : 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query';

// Credentials - use sandbox test shortcode for development
const consumerKey = process.env.DARAJA_CONSUMER_KEY || '';
const consumerSecret = process.env.DARAJA_CONSUMER_SECRET || '';
const businessShortcode = process.env.DARAJA_BUSINESS_SHORTCODE || (isSandbox ? '174379' : '');
const passkey = process.env.DARAJA_PASSKEY || (isSandbox ? 'bfb279f9aa9bdbcf158a97eee74a5584e8ba3f2e47463734d0623d7d3739b151' : '');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const response = await axios.get(DARAJA_AUTH_URL, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;

    return accessToken;
  } catch (error: any) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw new Error('Failed to get M-Pesa access token');
  }
}

function generateTimestamp() {
  return new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, -3);
}

function generatePassword(shortCode: string, passKey: string, timestamp: string) {
  const str = shortCode + passKey + timestamp;
  return Buffer.from(str).toString('base64');
}

// Order Schema (same as in orders.ts)
const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    items: [{
      productId: String,
      name: String,
      price: Number,
      quantity: Number,
    }],
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    mpesaTransactionId: String,
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// POST initiate STK push
router.post('/initiate', async (req: Request, res: Response) => {
  try {
    const { orderId, phoneNumber, amount } = req.body;

    if (!orderId || !phoneNumber || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const token = await getAccessToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(businessShortcode, passkey, timestamp);

    // Format phone number to 254XXXXXXXXX format
    let formattedPhone = phoneNumber.replace(/^0/, '254');
    if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    console.log('=== STK PUSH REQUEST ===');
    console.log(`Environment: ${isSandbox ? 'Sandbox' : 'Production'}`);
    console.log(`Shortcode: ${businessShortcode}`);
    console.log(`Phone: ${formattedPhone}`);
    console.log(`Amount: ${amount}`);
    console.log('========================');

    const response = await axios.post(
      DARAJA_STK_PUSH_URL,
      {
        BusinessShortCode: businessShortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: businessShortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`}/api/payments/callback`,
        AccountReference: orderId,
        TransactionDesc: `Payment for order ${order.orderNumber}`,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Store the checkout request ID in the order
    await Order.findByIdAndUpdate(orderId, {
      mpesaTransactionId: response.data.CheckoutRequestID,
    });

    res.json({
      success: true,
      checkoutRequestId: response.data.CheckoutRequestID,
      message: 'STK push sent successfully',
    });
  } catch (error: any) {
    console.error('=== PAYMENT INITIATE ERROR ===');
    console.error('Error details:', JSON.stringify(error.response?.data || error.message, null, 2));
    console.error('Full error:', error);
    res.status(500).json({ 
      error: 'Failed to initiate payment',
      details: error.response?.data?.errorMessage || error.message,
      debug: {
        env: isSandbox ? 'sandbox' : 'production',
        hasCredentials: !!consumerKey && !!consumerSecret && !!businessShortcode && !!passkey
      }
    });
  }
});

// POST payment callback - handles M-Pesa payment notifications
router.post('/callback', async (req: Request, res: Response) => {
  try {
    console.log('=== PAYMENT CALLBACK RECEIVED ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const body = req.body;
    
    // Handle different callback formats from M-Pesa partners
    let ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata, MerchantRequestID;
    
    // Format 1: Standard M-Pesa Daraja API
    if (body.Body?.stkCallback) {
      const { stkCallback } = body.Body;
      ResultCode = stkCallback.ResultCode;
      ResultDesc = stkCallback.ResultDesc;
      CheckoutRequestID = stkCallback.CheckoutRequestID;
      MerchantRequestID = stkCallback.MerchantRequestID;
      CallbackMetadata = stkCallback.CallbackMetadata;
    } 
    // Format 2: Direct callback with Result at top level
    else if (body.ResultCode !== undefined) {
      ResultCode = body.ResultCode;
      ResultDesc = body.ResultDesc;
      CheckoutRequestID = body.CheckoutRequestID || body.CheckoutRequestId;
      MerchantRequestID = body.MerchantRequestID || body.MerchantRequestId;
      CallbackMetadata = body.CallbackMetadata;
    }
    // Format 3: Partner custom format
    else {
      ResultCode = body.resultCode || body.result_code || body.statusCode || 0;
      ResultDesc = body.resultDesc || body.result_desc || body.statusMessage || 'Unknown';
      CheckoutRequestID = body.checkoutRequestId || body.CheckoutRequestId || body.transactionId;
      MerchantRequestID = body.merchantRequestId || body.MerchantRequestId;
      CallbackMetadata = body.callbackMetadata || body.metadata;
    }

    console.log('Parsed callback:', { ResultCode, ResultDesc, CheckoutRequestID, MerchantRequestID });

    if (ResultCode === 0 || ResultCode === '0' || ResultCode === null) {
      // Payment successful
      let amount, mpesaReceiptNumber, transactionDate, phoneNumber;
      
      if (CallbackMetadata) {
        // Handle array format
        if (Array.isArray(CallbackMetadata)) {
          amount = CallbackMetadata.find((item: any) => item.Name === 'Amount')?.Value;
          mpesaReceiptNumber = CallbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
          transactionDate = CallbackMetadata.find((item: any) => item.Name === 'TransactionDate')?.Value;
          phoneNumber = CallbackMetadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;
        } else {
          // Handle object format
          amount = CallbackMetadata.Amount || CallbackMetadata.amount;
          mpesaReceiptNumber = CallbackMetadata.MpesaReceiptNumber || CallbackMetadata.mpesaReceiptNumber;
          transactionDate = CallbackMetadata.TransactionDate || CallbackMetadata.transactionDate;
          phoneNumber = CallbackMetadata.PhoneNumber || CallbackMetadata.phoneNumber;
        }
      }

      console.log('Payment success:', { amount, mpesaReceiptNumber, transactionDate, phoneNumber });

      // Find order by checkout request ID or transaction ID
      const order = await Order.findOneAndUpdate(
        { 
          $or: [
            { mpesaTransactionId: CheckoutRequestID },
            { mpesaTransactionId: mpesaReceiptNumber }
          ]
        },
        {
          paymentStatus: 'completed',
          mpesaReceipt: mpesaReceiptNumber,
          orderStatus: 'processing',
        },
        { new: true }
      );

      if (order) {
        // Generate receipt number
        order.receiptNumber = `RCP-${Date.now()}`;
        order.receiptSentAt = new Date();
        await order.save();

        console.log('=== AUTO RECEIPT GENERATED ===');
        console.log(`Order: ${order.orderNumber}`);
        console.log(`Receipt: ${order.receiptNumber}`);
        console.log(`M-Pesa Receipt: ${mpesaReceiptNumber}`);
        console.log(`Amount: KES ${order.totalAmount.toLocaleString()}`);
        console.log('===============================');
      } else {
        console.log('Order not found for callback:', CheckoutRequestID);
      }
    } else {
      // Payment failed
      console.log('Payment failed:', ResultDesc);
      
      await Order.findOneAndUpdate(
        { mpesaTransactionId: CheckoutRequestID },
        { paymentStatus: 'failed' }
      );
    }

    // Always respond with success to prevent retries
    res.json({ success: true, ResultCode: 0 });
  } catch (error) {
    console.error('Error processing callback:', error);
    // Still return success to prevent callback retries
    res.json({ success: true });
  }
});

// GET query payment status
router.get('/status/:checkoutRequestId', async (req: Request, res: Response) => {
  try {
    const { checkoutRequestId } = req.params;

    const token = await getAccessToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(businessShortcode, passkey, timestamp);

    const response = await axios.post(
      DARAJA_QUERY_URL,
      {
        BusinessShortCode: businessShortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json(response.data);
  } catch (error: any) {
    console.error('Error querying payment status:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to query payment status' });
  }
});

export default router;
