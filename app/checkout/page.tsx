'use client';

import React from "react";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/cart-context';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

const getImageUrl = (url: string | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('/images') || url.startsWith('/placeholder')) return url;
  if (url.startsWith('http')) return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  return url;
};

interface FormErrors {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  city?: string;
  mpesaPhone?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const API_URL = 'https://ecommerce-254.onrender.com';
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    city: '',
    postalCode: '',
    paymentMethod: 'mpesa',
    mpesaPhone: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validatePhone = (phone: string): boolean => {
    const kenyanPhoneRegex = /^(07\d{8}|01\d{8})$/;
    return kenyanPhoneRegex.test(phone);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'mpesaPhone' && !prev.mpesaPhone && prev.customerPhone ? prev.customerPhone : value 
    }));
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    let errorMsg = '';
    
    switch (name) {
      case 'customerName':
        if (!value.trim()) errorMsg = 'Full name is required';
        break;
      case 'customerEmail':
        if (!value.trim()) errorMsg = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = 'Invalid email format';
        break;
      case 'customerPhone':
        if (!value.trim()) errorMsg = 'Phone number is required';
        else if (!validatePhone(value)) errorMsg = 'Use Kenyan format (07XXXXXXXX or 01XXXXXXXX)';
        break;
      case 'shippingAddress':
        if (!value.trim()) errorMsg = 'Address is required';
        break;
      case 'city':
        if (!value.trim()) errorMsg = 'City is required';
        break;
      case 'mpesaPhone':
        if (formData.paymentMethod === 'mpesa' && value.trim() && !validatePhone(value)) {
          errorMsg = 'Use Kenyan format (07XXXXXXXX or 01XXXXXXXX)';
        }
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
    return !errorMsg;
  };

  const validateForm = () => {
    const fields = ['customerName', 'customerEmail', 'customerPhone', 'shippingAddress', 'city'];
    if (formData.paymentMethod === 'mpesa') {
      fields.push('mpesaPhone');
    }
    
    let isValid = true;
    const newErrors: FormErrors = {};
    
    fields.forEach(field => {
      setTouched(prev => ({ ...prev, [field]: true }));
      const value = formData[field as keyof typeof formData];
      if (!validateField(field, value || '')) {
        isValid = false;
        newErrors[field as keyof FormErrors] = errors[field as keyof FormErrors];
      }
    });
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handlePaymentMethodChange = (method: string) => {
    setFormData(prev => ({ 
      ...prev, 
      paymentMethod: method,
      mpesaPhone: method === 'mpesa' && !prev.mpesaPhone ? prev.customerPhone : prev.mpesaPhone 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      if (items.length === 0) {
        setError('Your cart is empty');
        setLoading(false);
        return;
      }

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

      if (formData.paymentMethod === 'mpesa') {
        const paymentResponse = await fetch(`${API_URL}/api/payments/initiate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order._id,
            phoneNumber: formData.mpesaPhone || formData.customerPhone,
            amount: total,
          }),
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json();
          throw new Error(errorData.error || 'Failed to initiate payment. Please check your M-Pesa configuration.');
        }
      }
      
      clearCart();
      router.push(`/order-confirmation/${order._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const shippingCost = 0;
  const subtotal = total;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6 py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
            <h1 className="text-2xl font-semibold mb-4">Checkout</h1>
            <p className="text-slate-500 mb-8 text-sm">Your cart is empty</p>
            <Link href="/products">
              <Button className="h-11 px-8 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <nav className="flex items-center justify-center">
              <ol className="flex items-center gap-2 sm:gap-4">
                <li className="flex items-center">
                  <Link href="/cart" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600">1</span>
                    <span className="hidden sm:inline">Cart</span>
                  </Link>
                </li>
                <li className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-px w-4 sm:w-8 bg-slate-300"></div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white font-medium">2</span>
                    <span className="text-sm font-medium text-teal-600">Checkout</span>
                  </div>
                </li>
                <li className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-px w-4 sm:w-8 bg-slate-300"></div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-500">3</span>
                    <span className="hidden sm:inline text-sm text-slate-500">Confirmation</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">{error}</div>
                )}

                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Shipping Information</h2>
                  <div className="space-y-4">
                    <div>
                      <Input
                        type="text"
                        name="customerName"
                        placeholder="Full Name *"
                        value={formData.customerName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={errors.customerName && touched.customerName ? 'border-red-500' : ''}
                      />
                      {errors.customerName && touched.customerName && (
                        <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
                      )}
                    </div>
                    <div>
                      <Input
                        type="email"
                        name="customerEmail"
                        placeholder="Email Address *"
                        value={formData.customerEmail}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={errors.customerEmail && touched.customerEmail ? 'border-red-500' : ''}
                      />
                      {errors.customerEmail && touched.customerEmail && (
                        <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>
                      )}
                    </div>
                    <div>
                      <Input
                        type="tel"
                        name="customerPhone"
                        placeholder="Phone Number * (07XXXXXXXX or 01XXXXXXXX)"
                        value={formData.customerPhone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={errors.customerPhone && touched.customerPhone ? 'border-red-500' : ''}
                      />
                      {errors.customerPhone && touched.customerPhone && (
                        <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>
                      )}
                    </div>
                    <div>
                      <Input
                        type="text"
                        name="shippingAddress"
                        placeholder="Street Address *"
                        value={formData.shippingAddress}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={errors.shippingAddress && touched.shippingAddress ? 'border-red-500' : ''}
                      />
                      {errors.shippingAddress && touched.shippingAddress && (
                        <p className="text-red-500 text-xs mt-1">{errors.shippingAddress}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Input
                          type="text"
                          name="city"
                          placeholder="City *"
                          value={formData.city}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={errors.city && touched.city ? 'border-red-500' : ''}
                        />
                        {errors.city && touched.city && (
                          <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                        )}
                      </div>
                      <Input
                        type="text"
                        name="postalCode"
                        placeholder="Postal Code (optional)"
                        value={formData.postalCode}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment Method</h2>
                  <div 
                    onClick={() => handlePaymentMethodChange('mpesa')}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.paymentMethod === 'mpesa' 
                        ? 'border-teal-600 bg-teal-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.paymentMethod === 'mpesa' ? 'border-teal-600' : 'border-slate-300'
                      }`}>
                        {formData.paymentMethod === 'mpesa' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-teal-600"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">M-Pesa</span>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">Popular</span>
                        </div>
                        <p className="text-sm text-slate-500">Pay instantly via M-Pesa STK push</p>
                      </div>
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-700 font-bold text-lg">M</span>
                      </div>
                    </div>
                    
                    {formData.paymentMethod === 'mpesa' && (
                      <div className="mt-4 pt-4 border-t border-teal-200">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">M-Pesa Phone Number</label>
                          <Input
                            type="tel"
                            name="mpesaPhone"
                            placeholder="07XXXXXXXX or 01XXXXXXXX"
                            value={formData.mpesaPhone || formData.customerPhone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={errors.mpesaPhone && touched.mpesaPhone ? 'border-red-500' : ''}
                          />
                          {errors.mpesaPhone && touched.mpesaPhone && (
                            <p className="text-red-500 text-xs mt-1">{errors.mpesaPhone}</p>
                          )}
                          <p className="text-xs text-slate-500 mt-1">We'll send an STK push to this number</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg">
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </Button>

                <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-xs">Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs">M-Pesa Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    <span className="text-xs">Free Returns</span>
                  </div>
                </div>
              </form>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>
                <div className="space-y-4">
                  {items.map((item) => {
                    const imageUrl = getImageUrl(item.image);
                    return (
                      <div key={item.productId} className="flex gap-3">
                        {imageUrl ? (
                          <img src={imageUrl} alt={item.name} className="w-14 h-14 object-cover rounded-lg bg-slate-50 flex-shrink-0" />
                        ) : (
                          <div className="w-14 h-14 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                            <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-900 truncate" title={item.name}>{item.name}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-slate-900">KES {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    );
                  })}
                  
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="text-slate-900">KES {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Shipping</span>
                      <span className="text-green-600">{shippingCost === 0 ? 'Free' : `KES ${shippingCost.toLocaleString()}`}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-4 flex justify-between">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="font-semibold text-teal-600">KES {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}