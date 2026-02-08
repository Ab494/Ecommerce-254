'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/cart-context';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    city: '',
    postalCode: '',
    paymentMethod: 'mpesa',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (items.length === 0) {
        setError('Your cart is empty');
        setLoading(false);
        return;
      }

      // Create order
      const orderResponse = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          totalAmount: total,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }
      const order = await orderResponse.json();

      // If Pay on Delivery, skip M-Pesa and go to confirmation
      if (formData.paymentMethod === 'pay_on_delivery') {
        clearCart();
        router.push(`/order-confirmation/${order._id}`);
        return;
      }

      // Initiate M-Pesa payment
      const paymentResponse = await fetch(`${API_URL}/api/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order._id,
          phoneNumber: formData.customerPhone,
          amount: total,
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || 'Failed to initiate payment. Please check your M-Pesa configuration.');
      }
      
      clearCart();
      router.push(`/order-confirmation/${order._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">Checkout</h1>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="bg-card border rounded-lg p-6 space-y-6">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded">{error}</div>
              )}

              <div>
                <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
                <div className="space-y-4">
                  <Input
                    type="text"
                    name="customerName"
                    placeholder="Full Name"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    type="email"
                    name="customerEmail"
                    placeholder="Email Address"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    type="tel"
                    name="customerPhone"
                    placeholder="Phone Number (e.g., 0712345678)"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    type="text"
                    name="shippingAddress"
                    placeholder="Street Address"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      type="text"
                      name="postalCode"
                      placeholder="Postal Code"
                      value={formData.postalCode}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mpesa"
                      checked={formData.paymentMethod === 'mpesa'}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <span className="font-medium">M-Pesa</span>
                      <p className="text-sm text-muted-foreground">Pay instantly via M-Pesa STK push</p>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="pay_on_delivery"
                      checked={formData.paymentMethod === 'pay_on_delivery'}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <span className="font-medium">Pay on Delivery</span>
                      <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                    </div>
                  </label>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Processing...' : formData.paymentMethod === 'pay_on_delivery' ? 'Place Order' : 'Proceed to Payment'}
              </Button>
            </form>
          </div>

          <div>
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>{item.name} x {item.quantity}</span>
                    <span>KES {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t pt-4 font-bold flex justify-between">
                  <span>Total:</span>
                  <span>KES {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
