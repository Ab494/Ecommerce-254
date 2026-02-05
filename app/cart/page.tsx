'use client';

import { useCart } from '@/lib/cart-context';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const router = useRouter();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    setIsApplyingCoupon(true);
    // Simulate API call delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (couponCode.toLowerCase() === 'save10') {
      setDiscount(total * 0.1);
    }
    setIsApplyingCoupon(false);
  };

  const shippingCost = total > 5000 ? 0 : 500;
  const finalTotal = total - discount + shippingCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6 py-12 bg-white rounded-2xl shadow-sm border border-slate-100 mx-4">
            <div className="mb-6">
              <div className="mx-auto h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center">
                <svg
                  className="h-10 w-10 text-slate-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 mb-8 text-sm">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button 
              onClick={() => router.push('/products')} 
              className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-all duration-200"
            >
              Start Shopping
            </Button>
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
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-900">Shopping Cart</h1>
            <p className="text-sm text-slate-500 mt-1">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
          </div>

          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <ul className="divide-y divide-slate-50">
                  {items.map((item) => (
                    <li key={item.productId} className="p-5 sm:p-6">
                      <div className="flex gap-5">
                        {/* Product Image */}
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <svg
                                className="h-8 w-8 text-slate-200"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex flex-1 flex-col min-w-0">
                          <div className="flex justify-between gap-4">
                            <div className="min-w-0">
                              <h3 className="text-sm font-medium text-slate-900 line-clamp-2">
                                {item.name}
                              </h3>
                              <p className="mt-0.5 text-xs text-slate-500 capitalize">
                                {item.category?.toLowerCase() || 'Product'}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                              KSh {item.price.toLocaleString()}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center h-9 rounded-lg border border-slate-200 bg-slate-50">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="px-2.5 h-full text-slate-500 hover:text-slate-900 hover:bg-white transition-all rounded-l-lg"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />
                                </svg>
                              </button>
                              <span className="px-3 text-sm font-medium text-slate-900 min-w-[2.5rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="px-2.5 h-full text-slate-500 hover:text-slate-900 hover:bg-white transition-all rounded-r-lg"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14m7-7H5" />
                                </svg>
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="text-xs text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-50"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Clear Cart */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={clearCart}
                    className="text-xs text-slate-400 hover:text-red-600 transition-colors"
                  >
                    Clear all items
                  </button>
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="mt-5">
                <button
                  onClick={() => router.push('/products')}
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 group"
                >
                  <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  Continue Shopping
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5 mt-8 lg:mt-0">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 sticky top-6">
                <div className="px-6 py-5 border-b border-slate-50">
                  <h2 className="text-base font-semibold text-slate-900">Order Summary</h2>
                </div>

                <div className="p-6 space-y-5">
                  {/* Coupon Code */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Coupon Code</label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="h-10 flex-1 bg-slate-50 border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        className="h-10 px-5 border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
                      >
                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                      </Button>
                    </div>
                    {discount > 0 && (
                      <p className="text-sm text-emerald-600 font-medium">Coupon applied! -KSh {discount.toLocaleString()}</p>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-5 space-y-3.5">
                    {/* Subtotal */}
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-medium text-slate-900">KSh {total.toLocaleString()}</span>
                    </div>

                    {/* Discount */}
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Discount</span>
                        <span className="font-medium text-emerald-600">-KSh {discount.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Shipping */}
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Shipping</span>
                      <span className="font-medium text-slate-900">
                        {shippingCost === 0 ? (
                          <span className="text-emerald-600">Free</span>
                        ) : (
                          `KSh ${shippingCost.toLocaleString()}`
                        )}
                      </span>
                    </div>

                    {shippingCost > 0 && (
                      <p className="text-xs text-slate-400">
                        Free shipping on orders over KSh 5,000
                      </p>
                    )}

                    {/* Total */}
                    <div className="border-t border-slate-100 pt-4 mt-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-semibold text-slate-900">Total</span>
                        <span className="text-xl font-bold text-slate-900">KSh {finalTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    onClick={() => router.push('/checkout')}
                    className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.99]"
                    size="lg"
                  >
                    Proceed to Checkout
                  </Button>

                  {/* Security Badges */}
                  <div className="flex items-center justify-center gap-6 pt-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>M-Pesa</span>
                    </div>
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
