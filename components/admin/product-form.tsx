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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    category: initialData?.category || 'Electronics',
    stock: initialData?.stock || '',
    sku: initialData?.sku || '',
    image: initialData?.image || '',
    images: initialData?.images || [],
    // Discount fields
    discountPercent: initialData?.discountPercent?.toString() || '',
    saleStart: initialData?.saleStart ? new Date(initialData.saleStart).toISOString().slice(0, 16) : '',
    saleEnd: initialData?.saleEnd ? new Date(initialData.saleEnd).toISOString().slice(0, 16) : '',
    // Variants
    hasVariants: initialData?.hasVariants || false,
    variants: initialData?.variants || [],
  });

  // Available colors for variants
  const colorOptions = ['Black', 'Cyan', 'Magenta', 'Yellow', 'White', 'Red', 'Blue', 'Green', 'Other'];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate live preview
  const price = parseFloat(formData.price) || 0;
  const discountPercent = parseFloat(formData.discountPercent) || 0;
  const finalPrice = price > 0 && discountPercent > 0 
    ? price * (1 - discountPercent / 100) 
    : price;
  const savings = price - finalPrice;
  const now = new Date();
  const hasSaleStart = formData.saleStart && new Date(formData.saleStart) <= now;
  const hasSaleEnd = formData.saleEnd && new Date(formData.saleEnd) >= now;
  const isSaleActive = discountPercent > 0 && (!formData.saleStart || hasSaleStart) && (!formData.saleEnd || hasSaleEnd);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear validation error when field is updated
    setValidationErrors(prev => ({ ...prev, [name]: '' }));
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (discountPercent < 0 || discountPercent > 99) {
      errors.discountPercent = 'Discount must be between 0 and 99';
    }
    
    if (discountPercent > 0) {
      if (formData.saleStart && formData.saleEnd) {
        const start = new Date(formData.saleStart);
        const end = new Date(formData.saleEnd);
        if (start >= end) {
          errors.saleEnd = 'Sale end date must be after start date';
        }
      }
    }
    
    if (finalPrice >= price && discountPercent > 0) {
      errors.discountPercent = 'Discounted price must be lower than original price';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
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
      
      // Add new images to existing ones (avoid duplicates)
      const newUrls = data.files.map((f: any) => f.url);
      
      setFormData(prev => {
        // Use a Set to remove duplicates, but maintain order
        const existingImages = prev.images || [];
        const allImages = [...existingImages, ...newUrls];
        const uniqueImages = [...new Set(allImages)];
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

  // Variant management functions
  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { color: 'Black', price: '', stock: '0' }],
      hasVariants: true,
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      newVariants.splice(index, 1);
      return {
        ...prev,
        variants: newVariants,
        hasVariants: newVariants.length > 0,
      };
    });
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      newVariants[index] = { ...newVariants[index], [field]: value };
      return { ...prev, variants: newVariants };
    });
  };

  const toggleHasVariants = () => {
    setFormData(prev => ({
      ...prev,
      hasVariants: !prev.hasVariants,
      variants: !prev.hasVariants ? [{ color: 'Black', price: '', stock: '0' }] : [],
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
          // Only send unique images - remove the separate image field to avoid duplication
          image: formData.images[0] || '',
          images: [...new Set(formData.images)],
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          discountPercent: parseFloat(formData.discountPercent) || 0,
          saleStart: formData.discountPercent ? (formData.saleStart || null) : null,
          saleEnd: formData.discountPercent ? (formData.saleEnd || null) : null,
          variants: formData.variants.map((v: any) => ({
            ...v,
            price: v.price ? parseFloat(v.price) : null,
            stock: parseInt(v.stock) || 0,
          })),
          hasVariants: formData.hasVariants,
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
        discountPercent: '',
        saleStart: '',
        saleEnd: '',
        hasVariants: false,
        variants: [],
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

      {/* Discount Section */}
      <div className="bg-slate-50 rounded-lg p-4 space-y-4">
        <h3 className="font-medium text-slate-900">Sale / Discount</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Discount (%)</label>
            <Input
              type="number"
              name="discountPercent"
              value={formData.discountPercent}
              onChange={handleChange}
              min="0"
              max="99"
              placeholder="0"
              className={discountPercent > 0 ? 'border-green-500' : ''}
            />
            {validationErrors.discountPercent && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.discountPercent}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sale Start</label>
            <Input
              type="datetime-local"
              name="saleStart"
              value={formData.saleStart}
              onChange={handleChange}
              disabled={discountPercent <= 0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sale End</label>
            <Input
              type="datetime-local"
              name="saleEnd"
              value={formData.saleEnd}
              onChange={handleChange}
              disabled={discountPercent <= 0}
            />
            {validationErrors.saleEnd && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.saleEnd}</p>
            )}
          </div>
        </div>

        {/* Live Preview */}
        {price > 0 && (
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-2">Price Preview</p>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-green-600">
                KES {finalPrice.toLocaleString()}
              </span>
              {discountPercent > 0 && (
                <>
                  <span className="text-lg text-slate-400 line-through">
                    KES {price.toLocaleString()}
                  </span>
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    -{discountPercent}% OFF
                  </span>
                </>
              )}
            </div>
            {savings > 0 && (
              <p className="text-sm text-green-600 mt-1">
                Save KES {savings.toLocaleString()}
              </p>
            )}
            {isSaleActive && (
              <p className="text-xs text-green-600 mt-2">✓ Sale is active</p>
            )}
            {!isSaleActive && discountPercent > 0 && (
              <p className="text-xs text-yellow-600 mt-2">
                ⚠ Sale will be active during {formData.saleStart || 'start date'} to {formData.saleEnd || 'end date'}
              </p>
            )}
          </div>
        )}
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

      {/* Color Variants Section */}
      <div className="bg-blue-50 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-slate-900">Color Variants</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasVariants}
              onChange={toggleHasVariants}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Enable variants</span>
          </label>
        </div>

        {formData.hasVariants && (
          <div className="space-y-3">
            {formData.variants.map((variant: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1">Color</label>
                    <select
                      value={variant.color}
                      onChange={(e) => updateVariant(index, 'color', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm"
                    >
                      {colorOptions.map((color) => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1">Price (optional)</label>
                    <Input
                      type="number"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', e.target.value)}
                      placeholder={`Default: ${formData.price || '0'}`}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1">Stock</label>
                    <Input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                      placeholder="0"
                      className="h-8 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="mt-4 text-red-500 hover:text-red-700 p-1"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addVariant}
              className="w-full"
            >
              + Add Color Variant
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Add variants for different colors (e.g., Black, Cyan, Magenta, Yellow for printer cartridges)
            </p>
          </div>
        )}
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
              <div className="flex flex-col gap-2">
                {formData.images.map((img: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded text-xs">
                    <span className="w-6 h-6 flex-shrink-0 bg-slate-200 rounded flex items-center justify-center text-[10px]">
                      {index + 1}
                    </span>
                    <span className="truncate flex-1 min-w-0" title={img.split('/').pop()}>{img.split('/').pop()}</span>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="text-red-500 hover:text-red-700 flex-shrink-0"
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
