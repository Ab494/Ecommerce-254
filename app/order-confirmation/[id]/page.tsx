'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download, FileText, MessageCircle } from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  invoiceNumber: string;
  receiptNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: any[];
  totalAmount: number;
  shippingAddress: string;
  city: string;
  postalCode: string;
  paymentMethod: string;
  paymentStatus: string;
  mpesaReceipt: string;
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/orders/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch order');
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-muted-foreground mb-4">{error || 'Order not found'}</p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </main>
    );
  }

  const isPayOnDelivery = order.paymentMethod === 'pay_on_delivery';
  const isPendingPayment = order.paymentStatus === 'pending' && !isPayOnDelivery;
  const isPaymentComplete = order.paymentStatus === 'completed' || order.paymentStatus === 'on_delivery';
  const showReceipt = isPaymentComplete && order.receiptNumber;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {isPendingPayment ? 'Payment Pending' : isPayOnDelivery ? 'Order Placed!' : 'Payment Successful!'}
            </h1>
            <p className="text-muted-foreground">
              {isPendingPayment 
                ? 'Please complete the M-Pesa payment to confirm your order'
                : isPayOnDelivery 
                  ? 'Your order has been placed. You will pay on delivery.'
                  : 'Thank you for your purchase!'}
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-card border rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">Order #{order.orderNumber}</h2>
                <p className="text-sm text-muted-foreground">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-KE', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-right">
                {order.invoiceNumber && (
                  <p className="text-sm text-muted-foreground">Invoice: {order.invoiceNumber}</p>
                )}
                {order.receiptNumber && (
                  <p className="text-sm text-muted-foreground">Receipt: {order.receiptNumber}</p>
                )}
                {order.mpesaReceipt && (
                  <p className="text-sm text-muted-foreground">M-Pesa: {order.mpesaReceipt}</p>
                )}
              </div>
            </div>

            {/* Payment Status */}
            <div className={`p-4 rounded-lg mb-6 ${
              order.paymentStatus === 'completed' ? 'bg-green-50' :
              order.paymentStatus === 'on_delivery' ? 'bg-blue-50' :
              order.paymentStatus === 'pending' ? 'bg-yellow-50' :
              'bg-red-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payment Status</p>
                  <p className="text-sm text-muted-foreground">
                    {order.paymentMethod === 'pay_on_delivery' 
                      ? 'Pay on Delivery' 
                      : order.paymentMethod === 'mpesa' 
                        ? 'M-Pesa' 
                        : order.paymentMethod}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                  order.paymentStatus === 'on_delivery' ? 'bg-blue-100 text-blue-800' :
                  order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
              {isPendingPayment && (
                <p className="text-sm text-yellow-800 mt-2">
                  Check your phone for the M-Pesa STK push to complete payment.
                </p>
              )}
            </div>

            {/* Order Items */}
            <div className="border-t pt-4 mb-4">
              <h3 className="font-medium mb-3">Items Ordered</h3>
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between py-2">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                  </div>
                  <span>KES {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">KES {order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="bg-card border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Shipping Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {order.customerName}</p>
              <p><span className="font-medium">Email:</span> {order.customerEmail}</p>
              <p><span className="font-medium">Phone:</span> {order.customerPhone}</p>
              <p><span className="font-medium">Address:</span> {order.shippingAddress}</p>
              <p><span className="font-medium">City:</span> {order.city} {order.postalCode}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 flex-wrap">
            {showReceipt ? (
              <Button 
                variant="outline" 
                className="flex-1 gap-2" 
                onClick={() => {
                  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                  window.open(`${API_URL}/api/invoices/generate/${order._id}?format=receipt`, '_blank');
                }}
              >
                <Download className="h-4 w-4" />
                Download Receipt
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="flex-1 gap-2" 
                onClick={() => {
                  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                  window.open(`${API_URL}/api/invoices/generate/${order._id}?format=invoice`, '_blank');
                }}
              >
                <FileText className="h-4 w-4" />
                View Invoice
              </Button>
            )}
            <Button 
              variant="outline" 
              className="flex-1 gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white border-[#25D366]"
              asChild
            >
              <a 
                href={`https://wa.me/254722745703?text=${encodeURIComponent(`Hi, I have a question about my order ${order.orderNumber}`)}`}
                target="_blank" 
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </a>
            </Button>
            <Link href="/products" className="flex-1">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button className="w-full">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
