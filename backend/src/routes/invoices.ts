import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Resend } from 'resend';

const router = Router();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Get sender email from environment or use default
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'orders@254convexcomltd.co.ke';
const COMPANY_NAME = process.env.COMPANY_NAME || '254 Convex Communication LTD';

// Order Schema (copied from orders.ts for consistency)
const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    invoiceNumber: { type: String, unique: true },
    receiptNumber: String,
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
    shippingAddress: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String },
    paymentMethod: { 
      type: String, 
      enum: ['mpesa', 'pay_on_delivery', 'card', 'bank_transfer'],
      default: 'mpesa' 
    },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'failed', 'on_delivery', 'cancelled'],
      default: 'pending' 
    },
    mpesaReceipt: String,
    invoiceSentAt: Date,
    receiptSentAt: Date,
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

const generateInvoiceHTML = (order: any) => {
  const itemsList = order.items.map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">KES ${item.price.toLocaleString()}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">KES ${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
      <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;">
          <div>
            <h1 style="margin: 0; color: #1e293b; font-size: 28px;">INVOICE</h1>
            <p style="margin: 8px 0 0 0; color: #64748b;">${order.invoiceNumber}</p>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; color: #2563eb; font-size: 24px;">254 Convex Communication LTD</h2>
            <p style="margin: 8px 0 0 0; color: #64748b;">Nairobi, Kenya</p>
            <p style="margin: 4px 0 0 0; color: #64748b;">orders@254convexcomltd.co.ke</p>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 40px; gap: 40px;">
          <div style="flex: 1;">
            <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Bill To</h3>
            <p style="margin: 0; color: #1e293b; font-weight: 600;">${order.customerName}</p>
            <p style="margin: 4px 0 0 0; color: #475569;">${order.customerEmail}</p>
            <p style="margin: 4px 0 0 0; color: #475569;">${order.customerPhone}</p>
            <p style="margin: 4px 0 0 0; color: #475569;">${order.shippingAddress}</p>
            <p style="margin: 4px 0 0 0; color: #475569;">${order.city}, ${order.postalCode}</p>
          </div>
          <div style="flex: 1; text-align: right;">
            <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Order Details</h3>
            <p style="margin: 0; color: #475569;"><strong>Order #:</strong> ${order.orderNumber}</p>
            <p style="margin: 4px 0 0 0; color: #475569;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 4px 0 0 0; color: #475569;"><strong>Payment:</strong> ${order.paymentMethod === 'pay_on_delivery' ? 'Pay on Delivery' : order.paymentMethod === 'mpesa' ? 'M-Pesa' : order.paymentMethod}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #374151;">Item</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0; color: #374151;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0; color: #374151;">Unit Price</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0; color: #374151;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>

        <div style="display: flex; justify-content: flex-end;">
          <div style="width: 300px;">
            <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
              <span style="color: #475569;">Subtotal</span>
              <span style="color: #1e293b; font-weight: 600;">KES ${order.totalAmount.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
              <span style="color: #475569;">Shipping</span>
              <span style="color: #1e293b; font-weight: 600;">KES 0</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 16px 0 0 0;">
              <span style="color: #1e293b; font-weight: 700; font-size: 18px;">Total</span>
              <span style="color: #2563eb; font-weight: 700; font-size: 18px;">KES ${order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style="margin-top: 60px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">Thank you for your business!</p>
          <p style="margin: 0; color: #94a3b8; font-size: 12px;">This is a computer-generated invoice. No signature required.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateReceiptHTML = (order: any, paymentDetails: any = {}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Courier New', monospace; max-width: 400px; margin: 0 auto; padding: 20px; background-color: #1e293b;">
      <div style="background: white; border-radius: 8px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="margin: 0; color: #1e293b; font-size: 20px; font-weight: bold;">RECEIPT</h1>
          <p style="margin: 8px 0 0 0; color: #64748b; font-size: 12px;">${order.receiptNumber || order.invoiceNumber}</p>
        </div>

        <div style="border-top: 1px dashed #cbd5e1; border-bottom: 1px dashed #cbd5e1; padding: 16px 0; margin-bottom: 16px;">
          <p style="margin: 0 0 4px 0; color: #475569; font-size: 12px;">Date: ${new Date().toLocaleDateString('en-KE')}</p>
          <p style="margin: 0 0 4px 0; color: #475569; font-size: 12px;">Order: ${order.orderNumber}</p>
          <p style="margin: 0; color: #475569; font-size: 12px;">Customer: ${order.customerName}</p>
        </div>

        <div style="margin-bottom: 16px;">
          ${order.items.map((item: any) => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #1e293b; font-size: 12px;">${item.name}</span>
              <span style="color: #64748b; font-size: 12px;">x${item.quantity}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #64748b; font-size: 12px;">KES ${(item.price * item.quantity).toLocaleString()}</span>
            </div>
          `).join('')}
        </div>

        <div style="border-top: 2px solid #1e293b; padding-top: 12px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #1e293b; font-weight: bold;">TOTAL PAID</span>
            <span style="color: #16a34a; font-weight: bold; font-size: 18px;">KES ${order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        ${paymentDetails.mpesaReceipt ? `
          <div style="text-align: center; padding: 12px; background: #f0fdf4; border-radius: 4px;">
            <p style="margin: 0 0 4px 0; color: #166534; font-size: 12px;">M-Pesa Receipt</p>
            <p style="margin: 0; color: #166534; font-weight: bold;">${paymentDetails.mpesaReceipt}</p>
          </div>
        ` : `
          <div style="text-align: center; padding: 12px; background: #f0fdf4; border-radius: 4px;">
            <p style="margin: 0; color: #166534; font-size: 12px;">Pay on Delivery</p>
          </div>
        `}

        <div style="text-align: center; margin-top: 24px;">
          <p style="margin: 0 0 8px 0; color: #64748b; font-size: 11px;">Thank you for shopping with</p>
          <p style="margin: 0; color: #1e293b; font-weight: bold; font-size: 14px;">254 Convex Communication LTD</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// POST send invoice
router.post('/send-invoice/:orderId', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const invoiceHTML = generateInvoiceHTML(order);
    
    console.log('=== INVOICE EMAIL ===');
    console.log(`To: ${order.customerEmail}`);
    console.log(`Subject: Invoice ${order.invoiceNumber}`);
    console.log(`Order: ${order.orderNumber}`);
    console.log(`Amount: KES ${order.totalAmount.toLocaleString()}`);
    
    // Send actual email if RESEND_API_KEY is configured
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: `Invoice <${SENDER_EMAIL}>`,
          to: [order.customerEmail],
          subject: `Invoice ${order.invoiceNumber} - ${COMPANY_NAME}`,
          html: invoiceHTML,
        });
        console.log('✅ Invoice email sent successfully!');
      } catch (emailError: any) {
        console.error('❌ Failed to send invoice email:', emailError.message);
      }
    } else {
      console.log('⚠️ RESEND_API_KEY not configured - email not sent');
    }
    console.log('======================');

    order.invoiceSentAt = new Date();
    await order.save();

    res.json({ 
      success: true, 
      message: 'Invoice sent successfully',
      invoiceNumber: order.invoiceNumber
    });
  } catch (error) {
    console.error('Error sending invoice:', error);
    res.status(500).json({ error: 'Failed to send invoice' });
  }
});

// POST send receipt
router.post('/send-receipt/:orderId', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const receiptHTML = generateReceiptHTML(order, req.body.paymentDetails || {});
    const receiptNumber = order.receiptNumber || `RCP-${Date.now()}`;

    console.log('=== RECEIPT EMAIL ===');
    console.log(`To: ${order.customerEmail}`);
    console.log(`Subject: Receipt ${receiptNumber}`);
    console.log(`Order: ${order.orderNumber}`);
    console.log(`Amount: KES ${order.totalAmount.toLocaleString()}`);
    
    // Send actual email if RESEND_API_KEY is configured
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: `Receipt <${SENDER_EMAIL}>`,
          to: [order.customerEmail],
          subject: `Payment Confirmed - Receipt ${receiptNumber} - ${COMPANY_NAME}`,
          html: receiptHTML,
        });
        console.log('✅ Receipt email sent successfully!');
      } catch (emailError: any) {
        console.error('❌ Failed to send receipt email:', emailError.message);
      }
    } else {
      console.log('⚠️ RESEND_API_KEY not configured - email not sent');
    }
    console.log('======================');

    order.receiptNumber = receiptNumber;
    order.receiptSentAt = new Date();
    await order.save();

    res.json({ 
      success: true, 
      message: 'Receipt sent successfully',
      receiptNumber 
    });
  } catch (error) {
    console.error('Error sending receipt:', error);
    res.status(500).json({ error: 'Failed to send receipt' });
  }
});

// POST auto-send payment confirmation email (called by payment callback)
router.post('/payment-confirmation/:orderId', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Skip if receipt already sent
    if (order.receiptSentAt) {
      return res.json({ 
        success: true, 
        message: 'Receipt already sent',
        receiptNumber: order.receiptNumber 
      });
    }

    const paymentDetails = req.body.paymentDetails || {};
    const receiptHTML = generateReceiptHTML(order, paymentDetails);
    const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    console.log('=== AUTO PAYMENT CONFIRMATION EMAIL ===');
    console.log(`To: ${order.customerEmail}`);
    console.log(`Subject: Payment Confirmed - ${receiptNumber}`);
    console.log(`Order: ${order.orderNumber}`);
    console.log(`Amount: KES ${order.totalAmount.toLocaleString()}`);
    
    // Send actual email if RESEND_API_KEY is configured
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: `Confirmation <${SENDER_EMAIL}>`,
          to: [order.customerEmail],
          subject: `Payment Confirmed - Order ${order.orderNumber} - ${COMPANY_NAME}`,
          html: receiptHTML,
        });
        console.log('✅ Payment confirmation email sent!');
      } catch (emailError: any) {
        console.error('❌ Failed to send confirmation email:', emailError.message);
      }
    } else {
      console.log('⚠️ RESEND_API_KEY not configured - email not sent');
    }
    console.log('===========================================');

    // Update order with receipt info
    order.receiptNumber = receiptNumber;
    order.receiptSentAt = new Date();
    await order.save();

    res.json({ 
      success: true, 
      message: 'Payment confirmation sent',
      receiptNumber 
    });
  } catch (error) {
    console.error('Error sending payment confirmation:', error);
    res.status(500).json({ error: 'Failed to send payment confirmation' });
  }
});

// GET generate invoice/receipt HTML (for printing)
router.get('/generate/:orderId', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const format = req.query.format || 'invoice';
    
    if (format === 'receipt') {
      const receiptHTML = generateReceiptHTML(order);
      res.setHeader('Content-Type', 'text/html');
      res.send(receiptHTML);
    } else {
      const invoiceHTML = generateInvoiceHTML(order);
      res.setHeader('Content-Type', 'text/html');
      res.send(invoiceHTML);
    }
  } catch (error) {
    console.error('Error generating document:', error);
    res.status(500).json({ error: 'Failed to generate document' });
  }
});

export default router;
