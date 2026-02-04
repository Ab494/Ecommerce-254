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

    // Initiate STK push
    const stkResponse = await initiateSTKPush(phoneNumber, amount, orderId);

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
