import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { Body } = body;

    if (!Body || !Body.stkCallback) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const { stkCallback } = Body;
    const { ResultCode, CheckoutRequestID, CallbackMetadata } = stkCallback;

    // Update order based on payment result
    if (ResultCode === 0) {
      // Payment successful
      const amount = CallbackMetadata?.Item?.find(
        (item: any) => item.Name === 'Amount'
      )?.Value;
      const transactionId = CallbackMetadata?.Item?.find(
        (item: any) => item.Name === 'MpesaReceiptNumber'
      )?.Value;

      await Order.findOneAndUpdate(
        { mpesaTransactionId: CheckoutRequestID },
        {
          paymentStatus: 'completed',
          orderStatus: 'processing',
          mpesaTransactionId: transactionId,
        }
      );

      console.log(`[v0] Payment successful for order with txn: ${CheckoutRequestID}`);
    } else {
      // Payment failed
      await Order.findOneAndUpdate(
        { mpesaTransactionId: CheckoutRequestID },
        { paymentStatus: 'failed' }
      );

      console.log(`[v0] Payment failed for order with txn: ${CheckoutRequestID}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error processing payment callback:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
