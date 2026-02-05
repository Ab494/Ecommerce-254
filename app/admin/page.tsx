'use client';

import ProductsList from '@/components/admin/products-list';
import BulkImport from '@/components/admin/bulk-import';
import AdminProtected from '@/components/admin/admin-protected';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

function AdminDashboardContent() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
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

        <div className="grid gap-8">
          <BulkImport />
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Products Catalogue</h2>
            <ProductsList />
          </div>
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
