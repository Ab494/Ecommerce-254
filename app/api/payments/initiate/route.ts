import { NextRequest, NextResponse } from 'next/server';
import { initiateSTKPush } from '@/lib/daraja';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { orderId, phoneNumber, amount } = body;

    if (!orderId || !phoneNumber || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Initiate STK push with account reference (max 12 characters for Safaricom)
    const shortOrderNum = order.orderNumber.replace('ORD-', '').slice(-8); // Get last 8 digits
    const accountReference = `CVX${shortOrderNum}`;
    const stkResponse = await initiateSTKPush(phoneNumber, amount, accountReference);

    // Store the checkout request ID in the order
    await Order.findByIdAndUpdate(orderId, {
      mpesaTransactionId: stkResponse.CheckoutRequestID,
    });

    return NextResponse.json({
      success: true,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      message: 'STK push sent successfully',
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
