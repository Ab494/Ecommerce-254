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
    category: initialData?.category || 'Phones & Accessories',
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
      const API_URL = 'https://ecommerce-254-lye8.onrender.com';
      
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
      const API_URL = 'https://ecommerce-254-lye8.onrender.com';
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
        category: 'Phones & Accessories',
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Add New Product</h2>
        <div className="text-sm text-muted-foreground">
          Product ID: NEW
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 text-foreground">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Smart TV 55 inch"
                required
                className={`h-11 ${validationErrors.name ? 'border-red-500 focus:ring-red-200' : ''}`}
              />
              {validationErrors.name && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">SKU</label>
              <Input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g., TV-55-INCH-BLK"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your product in detail..."
              required
              className={`w-full px-3 py-2 border rounded-lg resize-none h-24 transition-colors focus:ring-2 focus:ring-blue-200 focus:border-blue-500 ${validationErrors.description ? 'border-red-500' : 'border-border'}`}
            />
            {validationErrors.description && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.description}</p>
            )}
          </div>
        </div>
        
        {/* Product Details Section */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 text-foreground">Product Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Price (KES)</label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                className={`h-11 ${validationErrors.price ? 'border-red-500 focus:ring-red-200' : ''}`}
              />
              {validationErrors.price && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.price}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Stock Quantity</label>
              <Input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
                className={`h-11 ${validationErrors.stock ? 'border-red-500 focus:ring-red-200' : ''}`}
              />
              {validationErrors.stock && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.stock}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg h-11 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
              >
                <option value="Phones & Accessories">Phones & Accessories</option>
                <option value="Computers & Accessories">Computers & Accessories</option>
                <option value="CCTV Surveillance">CCTV Surveillance</option>
                <option value="Appliances">Appliances</option>
                <option value="Office Equipment">Office Equipment</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Pricing & Discount Section */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 text-foreground">Pricing & Discount</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Discount (%)</label>
              <Input
                type="number"
                name="discountPercent"
                value={formData.discountPercent}
                onChange={handleChange}
                placeholder="0"
                min="0"
                max="99"
                step="1"
                className={`h-11 ${validationErrors.discountPercent ? 'border-red-500 focus:ring-red-200' : ''}`}
              />
              {validationErrors.discountPercent && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.discountPercent}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Sale Start (Optional)</label>
              <Input
                type="datetime-local"
                name="saleStart"
                value={formData.saleStart}
                onChange={handleChange}
                className="h-11"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Sale End (Optional)</label>
              <Input
                type="datetime-local"
                name="saleEnd"
                value={formData.saleEnd}
                onChange={handleChange}
                className="h-11"
              />
            </div>
          </div>
          
          {/* Price Display */}
          {(price > 0 || discountPercent > 0) && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="text-sm font-medium text-slate-700 mb-2">Price Summary</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-semibold ${isSaleActive ? 'text-red-600 line-through' : 'text-slate-900'}`}
                    >KES {price.toLocaleString()}</span>
                  {isSaleActive && (
                    <span className="text-2xl font-bold text-green-600">KES {finalPrice.toLocaleString()}</span>
                  )}
                </div>
                <div className="text-right">
                  {isSaleActive && (
                    <div className="text-sm text-green-600 font-medium">Save KES {savings.toLocaleString()}</div>
                  )}
                  {isSaleActive && (
                    <div className="text-xs text-slate-500">({discountPercent}% OFF)</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Variants Section */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 text-foreground">Product Variants</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Enable Color Variants</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasVariants}
                  onChange={toggleHasVariants}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {formData.hasVariants && (
              <div className="space-y-4">
                {formData.variants.map((variant, index) => (
                  <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-slate-900">Variant {index + 1}</h4>
                      <Button
                        type="button"
                        onClick={() => removeVariant(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Color</label>
                        <select
                          value={variant.color}
                          onChange={(e) => updateVariant(index, 'color', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg h-10 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        >
                          <option value="Black">Black</option>
                          <option value="White">White</option>
                          <option value="Red">Red</option>
                          <option value="Blue">Blue</option>
                          <option value="Green">Green</option>
                          <option value="Yellow">Yellow</option>
                          <option value="Cyan">Cyan</option>
                          <option value="Magenta">Magenta</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Price (KES)</label>
                        <Input
                          type="number"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, 'price', e.target.value)}
                          placeholder="0"
                          min="0"
                          step="0.01"
                          className="h-10"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Stock</label>
                        <Input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                          placeholder="0"
                          min="0"
                          className="h-10"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">SKU</label>
                        <Input
                          type="text"
                          value={variant.sku}
                          onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                          placeholder="SKU-001"
                          className="h-10"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  onClick={addVariant}
                  variant="outline"
                  className="w-full border-dashed border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                >
                  + Add Another Variant
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Add variants for different colors (e.g., Black, Cyan, Magenta, Yellow for printer cartridges)
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Product Images Section */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Product Images</h3>
          
          <div className="space-y-4">
            {/* Image Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 transition-colors ${isDragging 
                ? 'border-blue-400 bg-blue-50' 
                : uploading 
                ? 'border-slate-300 bg-slate-50' 
                : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleImageUpload(e.target.files)}
                accept="image/*"
                multiple
                className="hidden"
                id="image-upload"
                disabled={uploading}
              />
              
              {uploading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-sm text-slate-600">Uploading images...</p>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h4 className="text-lg font-medium text-slate-700 mb-2">Upload Product Images</h4>
                  <p className="text-sm text-slate-500 mb-4">Drag and drop images here or click to select files</p>
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Select Images
                  </Button>
                  <p className="text-xs text-slate-400 mt-2">PNG, JPG, GIF up to 10MB each</p>
                </div>
              )}
            </div>
            
            {/* Image Gallery Preview */}
            {formData.images.length > 0 && (
              <div className="space-y-4">
                {/* Main Image Display */}
                <div className="relative w-full h-64 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                  {formData.images[selectedImageIndex] ? (
                    <img
                      src={formData.images[selectedImageIndex] || "/placeholder.svg"}
                      alt={`Product view ${selectedImageIndex + 1}`}
                      className="w-full h-full object-contain"
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
                  {formData.images.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === selectedImageIndex ? 'border-blue-500' : 'border-transparent'}
                      }`
                    >
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                
                {/* Image Actions */}
                <div className="flex flex-col gap-2">
                  {formData.images.map((img, index) => (
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
        
        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || uploading}
            className="px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Product'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
