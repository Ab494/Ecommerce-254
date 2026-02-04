import ProductsList from '@/components/admin/products-list';
import BulkImport from '@/components/admin/bulk-import';

export const metadata = {
  title: '254 Convex Comm LTD | Admin Dashboard',
  description: 'Manage products, orders, and inventory',
};

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your products and orders</p>
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
