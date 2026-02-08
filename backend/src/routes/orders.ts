import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';

const router = Router();

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
    receiptNumber: {
      type: String,
      unique: true,
    },
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
