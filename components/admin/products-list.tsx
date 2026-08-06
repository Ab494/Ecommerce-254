'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import ProductForm from './product-form';
import { useToast } from '@/hooks/use-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  images: string[];
}

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const API_URL = 'https://ecommerce-254-lye8.onrender.com';
      const response = await fetch(`${API_URL}/api/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const product = products.find((p) => p._id === id);
    if (!confirm(`Are you sure you want to delete "${product?.name ?? 'this product'}"? This action cannot be undone.`)) return;

    setDeletingId(id);
    try {
      const API_URL = 'https://ecommerce-254-lye8.onrender.com';
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
      await fetchProducts();
      toast({
        title: 'Product deleted',
        description: `"${product?.name ?? 'Product'}" has been removed from your inventory.`,
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Something went wrong while deleting the product.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    setInlineEditId(null);
    fetchProducts();
    toast({
      title: editingProduct ? 'Product updated' : 'Product created',
      description: editingProduct
        ? `"${editingProduct.name}" has been updated successfully.`
        : 'New product has been added to your inventory.',
    });
  };

  if (loading) return <div className="text-center py-8">Loading products...</div>;

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Products Catalogue</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your product inventory</p>
        </div>
        <Button 
          onClick={() => { setEditingProduct(null); setShowForm(true); }} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200 h-10 px-6"
        >
          Add New Product
        </Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl shadow-lg border border-border p-8 relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-semibold text-foreground">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setShowForm(false); setEditingProduct(null); }}
              className="h-8 w-8 p-0 hover:bg-muted/80 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
          <ProductForm
            key={editingProduct?._id ?? 'new'}
            onSuccess={handleFormSuccess}
            initialData={editingProduct}
          />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-lg">
        <div className="relative max-w-sm mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full px-4 py-2 pl-9 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 text-lg">×</button>
        )}
      </div>

      <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="text-left p-6 text-sm font-semibold text-slate-700">#</th>
                <th className="text-left p-6 text-sm font-semibold text-slate-700">Product Name</th>
                <th className="text-left p-6 text-sm font-semibold text-slate-700">Category</th>
                <th className="text-left p-6 text-sm font-semibold text-slate-700">Price</th>
                <th className="text-left p-6 text-sm font-semibold text-slate-700">Stock</th>
                <th className="text-center p-6 text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product, index) => (
                <>
                  <tr key={product._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-6 text-sm text-slate-600 font-mono">{(index + 1).toString().padStart(3, '0')}</td>
                    <td className="p-6">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="font-semibold text-slate-900">KES {product.price.toLocaleString()}</div>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border shadow-sm ${product.stock > 0 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-center gap-3">
                        <Button
                          size="sm"
                          variant={inlineEditId === product._id ? 'default' : 'outline'}
                          onClick={() => {
                            if (inlineEditId === product._id) {
                              setInlineEditId(null);
                            } else {
                              setInlineEditId(product._id);
                              setEditingProduct(product);
                              setShowForm(false);
                            }
                          }}
                          className="h-9 px-4 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          {inlineEditId === product._id ? 'Cancel Editing' : 'Edit Product'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(product._id)}
                          disabled={deletingId === product._id}
                          className="h-9 px-4 text-sm font-medium transition-all duration-200 hover:bg-red-600 hover:scale-105 active:scale-95 disabled:opacity-60"
                        >
                          {deletingId === product._id ? 'Deleting...' : 'Delete Product'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {inlineEditId === product._id && (
                    <tr>
                      <td colSpan={6} className="p-0 border-t-0">
                        <div className="bg-slate-50 p-8 border-t border-slate-200">
                          <div className="max-w-4xl mx-auto">
                            <div className="flex items-center justify-between mb-6">
                              <h4 className="text-xl font-semibold text-slate-900">Edit Product #{index + 1}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setInlineEditId(null)}
                                className="h-8 w-8 p-0 hover:bg-muted/80 transition-colors"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </Button>
                            </div>
                            <ProductForm
                              key={product._id}
                              onSuccess={handleFormSuccess}
                              initialData={product}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 transition-all duration-200 hover:shadow-lg">
          <div className="max-w-md mx-auto px-6">
            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V7a4 4 0 00-8 0v6M12 17v5m0-5v5m0-5h8m-8 0H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">No products yet</h3>
            <p className="text-slate-500 mb-8">Add your first product to get started with your inventory</p>
            <Button 
              onClick={() => { setEditingProduct(null); setShowForm(true); }} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200 h-11"
            >
              Add Your First Product
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
