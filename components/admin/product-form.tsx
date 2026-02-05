'use client';

import React, { useState, useRef } from "react";

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
    images: initialData?.images || [],
  });
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Upload multiple images
      const uploadFormData = new FormData();
      for (let i = 0; i < files.length; i++) {
        uploadFormData.append('files', files[i]);
      }

      const response = await fetch(`${API_URL}/api/upload/multiple`, {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      const data = await response.json();
      
      // Add new images to existing ones
      const newUrls = data.files.map((f: any) => f.url);
      
      setFormData(prev => {
        const updatedImages = [...(prev.image ? [prev.image, ...prev.images] : prev.images), ...newUrls];
        // Remove duplicates
        const uniqueImages = [...new Set(updatedImages)];
        return {
          ...prev,
          images: uniqueImages,
          image: prev.image || uniqueImages[0] || '',
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      // Reset file input to allow selecting more files
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return {
        ...prev,
        images: newImages,
        image: index === selectedImageIndex 
          ? (newImages[0] || '') 
          : prev.image,
      };
    });
    if (selectedImageIndex >= formData.images.length - 1) {
      setSelectedImageIndex(Math.max(0, formData.images.length - 2));
    }
  };

  const setPrimaryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      image: prev.images[index],
    }));
    setSelectedImageIndex(index);
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
        images: [],
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

      {/* Product Images Gallery */}
      <div>
        <label className="block text-sm font-medium mb-1">Product Images</label>
        <div className="space-y-3">
          {/* Image Upload */}
          <div className="flex gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              multiple
              className="flex-1"
              ref={fileInputRef}
            />
            {uploading && <span className="text-sm text-primary">Uploading...</span>}
          </div>
          <p className="text-xs text-muted-foreground">Upload multiple images to show different angles</p>

          {/* Image Gallery Preview */}
          {formData.images.length > 0 && (
            <div className="space-y-3">
              {/* Main Image Display */}
              <div className="relative w-full h-64 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                {formData.images[selectedImageIndex] ? (
                  <Image
                    src={formData.images[selectedImageIndex] || "/placeholder.svg"}
                    alt={`Product view ${selectedImageIndex + 1}`}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No image selected
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {selectedImageIndex + 1} / {formData.images.length}
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {formData.images.map((img: string, index: number) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === selectedImageIndex ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Image Actions */}
              <div className="flex gap-2 flex-wrap">
                {formData.images.map((img: string, index: number) => (
                  <div key={index} className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded text-xs">
                    <span className="truncate max-w-[100px]">{img.split('/').pop()}</span>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Single URL Input (alternative) */}
          <div className="pt-2 border-t">
            <label className="block text-xs font-medium mb-1">Or add image URL directly</label>
            <Input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving...' : initialData ? 'Update Product' : 'Add Product'}
      </Button>
    </form>
  );
}
