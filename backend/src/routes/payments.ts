import { Router, Request, Response } from 'express';
import axios from 'axios';
import mongoose from 'mongoose';

const router = Router();

const DARAJA_AUTH_URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
const DARAJA_STK_PUSH_URL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
const DARAJA_QUERY_URL = 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query';

const consumerKey = process.env.DARAJA_CONSUMER_KEY;
const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
const businessShortcode = process.env.DARAJA_BUSINESS_SHORTCODE;
const passkey = process.env.DARAJA_PASSKEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await axios.get(DARAJA_AUTH_URL, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  accessToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;

  return accessToken;
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
    const password = generatePassword(
      businessShortcode!,
      passkey!,
      timestamp
    );

    // Format phone number to 254XXXXXXXXX format
    let formattedPhone = phoneNumber.replace(/^0/, '254');
    if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

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
        TransactionDesc: `Payment for order ${orderId}`,
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
    console.error('Error initiating payment:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// POST payment callback
router.post('/callback', async (req: Request, res: Response) => {
  try {
    const { Body } = req.body;

    if (Body?.stkCallback) {
      const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = Body.stkCallback;

      if (ResultCode === 0) {
        // Payment successful
        const callbackMetadata = Body.stkCallback.CallbackMetadata;
        const amount = callbackMetadata?.find((item: any) => item.Name === 'Amount')?.Value;
        const mpesaReceiptNumber = callbackMetadata?.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;

        // Find order by checkout request ID and update
        await Order.findOneAndUpdate(
          { mpesaTransactionId: CheckoutRequestID },
          {
            paymentStatus: 'completed',
            mpesaReceiptNumber,
          }
        );
      } else {
        // Payment failed
        await Order.findOneAndUpdate(
          { mpesaTransactionId: CheckoutRequestID },
          { paymentStatus: 'failed' }
        );
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing callback:', error);
    res.status(500).json({ success: false });
  }
});

// GET query payment status
router.get('/status/:checkoutRequestId', async (req: Request, res: Response) => {
  try {
    const { checkoutRequestId } = req.params;

    const token = await getAccessToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(
      businessShortcode!,
      passkey!,
      timestamp
    );

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
