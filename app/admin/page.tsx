'use client';

import { useEffect, useState } from 'react';
import ProductsList from '@/components/admin/products-list';
import BulkImport from '@/components/admin/bulk-import';
import AdminProtected from '@/components/admin/admin-protected';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface Order {
  _id: string;
  orderNumber: string;
  invoiceNumber: string;
  receiptNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  items: any[];
  createdAt: string;
  invoiceSentAt: string;
  receiptSentAt: string;
}

function AdminDashboardContent() {
  const { logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/orders`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const sendInvoice = async (orderId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/invoices/send-invoice/${orderId}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to send invoice');
      alert('Invoice sent successfully!');
      fetchOrders();
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Failed to send invoice');
    }
  };

  const sendReceipt = async (orderId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/invoices/send-receipt/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error('Failed to send receipt');
      alert('Receipt sent successfully!');
      fetchOrders();
    } catch (error) {
      console.error('Error sending receipt:', error);
      alert('Failed to send receipt');
    }
  };

  const updatePaymentStatus = async (orderId: string, status: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: status }),
      });
      if (!response.ok) throw new Error('Failed to update order');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your products and orders</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-slate-300"
          >
            Logout
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'products' ? 'default' : 'outline'}
            onClick={() => setActiveTab('products')}
          >
            Products
          </Button>
          <Button
            variant={activeTab === 'orders' ? 'default' : 'outline'}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </Button>
        </div>

        <div className="grid gap-8">
          {activeTab === 'products' ? (
            <>
              <BulkImport />
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Products Catalogue</h2>
                <ProductsList />
              </div>
            </>
          ) : (
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Orders Management</h2>
              {loadingOrders ? (
                <p>Loading orders...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted">
                      <tr>
                        <th className="text-left p-3">Order #</th>
                        <th className="text-left p-3">Customer</th>
                        <th className="text-left p-3">Amount</th>
                        <th className="text-left p-3">Payment</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id} className="border-b">
                          <td className="p-3">
                            <div className="font-medium">{order.orderNumber}</div>
                            <div className="text-xs text-muted-foreground">
                              Invoice: {order.invoiceNumber || 'N/A'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Receipt: {order.receiptNumber || 'N/A'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium">{order.customerName}</div>
                            <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                            <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                          </td>
                          <td className="p-3">KES {order.totalAmount.toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              order.paymentMethod === 'pay_on_delivery' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {order.paymentMethod === 'pay_on_delivery' ? 'Pay on Delivery' : order.paymentMethod}
                            </span>
                          </td>
                          <td className="p-3">
                            <select
                              value={order.paymentStatus}
                              onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                              className={`px-2 py-1 rounded text-xs border ${
                                order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.paymentStatus === 'on_delivery' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="on_delivery">On Delivery</option>
                              <option value="failed">Failed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-3">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => sendInvoice(order._id)}
                                disabled={!order.invoiceNumber || !!order.invoiceSentAt}
                              >
                                {order.invoiceSentAt ? 'Sent' : 'Invoice'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => sendReceipt(order._id)}
                                disabled={!!order.receiptSentAt}
                              >
                                {order.receiptSentAt ? 'Sent' : 'Receipt'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No orders yet</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function AdminDashboard() {
  return (
    <AdminProtected>
      <AdminDashboardContent />
    </AdminProtected>
  );
}
