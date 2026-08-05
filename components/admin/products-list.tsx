'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import ProductForm from './product-form';

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
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const API_URL = 'https://ecommerce-254-lye8.onrender.com';
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    setInlineEditId(null);
    fetchProducts();
  };

  if (loading) return <div className="text-center py-8">Loading products...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="mb-4">
          Add New Product
        </Button>
        {showForm && (
          <Button variant="ghost" onClick={() => { setShowForm(false); setEditingProduct(null); }} className="mb-4">
            Cancel
          </Button>
        )}
      </div>

      {showForm && (
        <ProductForm
          key={editingProduct?._id ?? 'new'}
          onSuccess={handleFormSuccess}
          initialData={editingProduct}
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted">
            <tr>
              <th className="text-left p-2">Product Name</th>
              <th className="text-left p-2">Category</th>
              <th className="text-left p-2">Price</th>
              <th className="text-left p-2">Stock</th>
              <th className="text-center p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <>
              <tr key={product._id} className="border-b hover:bg-muted/50">
                <td className="p-2 font-medium">{product.name}</td>
                <td className="p-2">{product.category}</td>
                <td className="p-2">KES {product.price.toLocaleString()}</td>
                <td className="p-2">
                  <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                    {product.stock}
                  </span>
                </td>
                <td className="p-2 text-center space-x-2">
                  <Button
                    size="sm"
                    variant={inlineEditId === product._id ? 'default' : 'outline'}
                    onClick={() => {
                      if (inlineEditId === product._id) {
                        setInlineEditId(null);
                      } else {
                        setInlineEditId(product._id);
                      }
                    }}
                  >
                    {inlineEditId === product._id ? 'Cancel' : 'Edit'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
              {inlineEditId === product._id && (
                <tr>
                  <td colSpan={5} className="p-4 bg-muted/30 border-b">
                    <ProductForm
                      key={product._id}
                      onSuccess={handleFormSuccess}
                      initialData={product}
                    />
                  </td>
                </tr>
              )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No products yet. Add your first product to get started!
        </div>
      )}
    </div>
  );
}
