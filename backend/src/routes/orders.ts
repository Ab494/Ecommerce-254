import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import axios from 'axios';

const router = Router();

// Product Schema (for stock reduction)
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0, min: 0 },
    variants: [{
      color: String,
      stock: { type: Number, default: 0 }
    }]
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Get company configuration from environment
const COMPANY_NAME = process.env.COMPANY_NAME || '254 Convex Communication LTD';
const COMPANY_PHONE = process.env.COMPANY_PHONE || '+254790287003';
const OWNER_WHATSAPP = process.env.OWNER_WHATSAPP || '+254790287003';

// Send invoice via email (helper function)
async function sendInvoiceEmail(order: any): Promise<void> {
  try {
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
    await axios.post(`${BACKEND_URL}/api/invoices/send-invoice/${order._id}`, {}, { timeout: 10000 });
    console.log('✅ Invoice email sent automatically');
  } catch (error: any) {
    console.error('❌ Failed to send invoice email:', error.message);
  }
}

// Log WhatsApp message for owner notification (manual WhatsApp instead of API)
function getOwnerNotificationMessage(order: any): string {
  const itemsList = order.items.map((item: any) => `${item.name} x${item.quantity}`).join('\n');
  return `NEW ORDER: ${order.orderNumber}\n` +
    `Customer: ${order.customerName}\n` +
    `Phone: ${order.customerPhone}\n` +
    `Items:\n${itemsList}\n` +
    `Total: KES ${order.totalAmount.toLocaleString()}`;
}

// Get WhatsApp click-to-chat link for customer
function getCustomerWhatsAppLink(order: any): string {
  const message = `Hello ${order.customerName}! Your order *${order.orderNumber}* has been received. Total: KES ${order.totalAmount.toLocaleString()}. Thank you for shopping with ${COMPANY_NAME}!`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${order.customerPhone.replace(/^\+/, '').replace(/^0/, '254')}?text=${encodedMessage}`;
}

// Order Schema
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    invoiceNumber: {
      type: String,
      unique: true,
    },
    receiptNumber: String,
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    items: [{
      productId: String,
      name: String,
      price: Number,
      quantity: Number,
    }],
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: String,
    city: String,
    postalCode: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'on_delivery'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['mpesa', 'pay_on_delivery', 'card', 'bank_transfer'],
      default: 'mpesa',
    },
    mpesaTransactionId: String,
    mpesaReceipt: String,
    invoiceSentAt: Date,
    receiptSentAt: Date,
    notes: String,
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// GET all orders
router.get('/', async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET single order by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST create new order
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      items,
      totalAmount,
      shippingAddress,
      city,
      postalCode,
      paymentMethod,
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !items || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const orderNumber = `ORD-${Date.now()}`;
    const invoiceNumber = `INV-${Date.now()}`;

    // Set payment status based on payment method
    let paymentStatus = 'pending';
    if (paymentMethod === 'pay_on_delivery') {
      paymentStatus = 'on_delivery';
    }

    const order = new Order({
      orderNumber,
      invoiceNumber,
      customerName,
      customerEmail,
      customerPhone,
      items,
      totalAmount,
      shippingAddress,
      city,
      postalCode,
      paymentMethod: paymentMethod || 'mpesa',
      paymentStatus,
    });

    await order.save();
    
    // Send invoice email automatically
    sendInvoiceEmail(order);
    
    // Log owner notification message (owner can then message via WhatsApp click-to-chat)
    console.log('=== NEW ORDER NOTIFICATION ===');
    console.log(getOwnerNotificationMessage(order));
    console.log('Owner WhatsApp: https://wa.me/254790287003');
    console.log('===============================');
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT update order
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// DELETE order
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

export default router;
