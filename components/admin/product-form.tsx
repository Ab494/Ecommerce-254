'use client';

import React from "react"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface ProductFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

export default function ProductForm({ onSuccess, initialData }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    category: initialData?.category || 'Electronics',
    stock: initialData?.stock || '',
    sku: initialData?.sku || '',
    image: initialData?.image || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        image: data.url,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const endpoint = initialData ? `${API_URL}/api/products/${initialData._id}` : `${API_URL}/api/products`;
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save product');
      }

      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Electronics',
        stock: '',
        sku: '',
        image: '',
      });

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-lg border">
      <h2 className="text-xl font-bold">{initialData ? 'Edit Product' : 'Add New Product'}</h2>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Product Name</label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g., Smart TV 55 inch"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          placeholder="Product description..."
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Price (KES)</label>
          <Input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            step="0.01"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <Input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option>Electronics</option>
            <option>CCTV Surveillance</option>
            <option>Home Appliances</option>
            <option>Office Equipment</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">SKU</label>
          <Input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="e.g., SKU-001"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Product Image</label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">or</span>
            <Input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="flex-1"
            />
          </div>
          {formData.image && (
            <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden">
              <Image
                src={formData.image || "/placeholder.svg"}
                alt="Product preview"
                fill
                className="object-cover"
              />
            </div>
          )}
          {uploading && <p className="text-sm text-primary">Uploading...</p>}
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving...' : initialData ? 'Update Product' : 'Add Product'}
      </Button>
    </form>
  );
}
