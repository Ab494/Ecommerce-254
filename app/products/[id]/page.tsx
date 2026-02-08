'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/hooks/use-toast';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  finalPrice?: number;
  discountPercent?: number;
  hasDiscount?: boolean;
  category: string;
  image: string;
  images: string[];
  stock: number;
  sku: string;
}

// Helper function to format Kenyan Shillings
const formatCurrency = (amount: number): string => {
  return `KES ${amount.toLocaleString()}`;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  // Auto-scroll thumbnail to selected image
  useEffect(() => {
    if (thumbnailRef.current && product && images.length > 1) {
      const thumbnail = thumbnailRef.current.children[selectedImageIndex] as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [selectedImageIndex]);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/products/${params.id}`);
      if (!response.ok) throw new Error('Product not found');
      const data = await response.json();
      setProduct(data);
      // Set initial image index to first image
      if (data.image || (data.images && data.images.length > 0)) {
        setSelectedImageIndex(0);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const finalPrice = product.finalPrice || product.price;

    addItem({
      productId: product._id,
      name: product.name,
      price: finalPrice,
      quantity,
      image: product.image,
      category: product.category,
    });

    toast({
      title: 'Added to Cart',
      description: `${quantity} x ${product.name} added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  // Get all images for gallery
  const getAllImages = (): string[] => {
    if (!product) return [];
    const images: string[] = [];
    if (product.image) images.push(product.image);
    if (product.images) {
      product.images.forEach((img: string) => {
        if (!images.includes(img)) images.push(img);
      });
    }
    return images;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading product...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <Button onClick={() => router.push('/products')}>Back to Products</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = getAllImages();
  const currentImage = images[selectedImageIndex] || product.image || '/placeholder.svg';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <button onClick={() => router.push('/products')} className="text-slate-500 hover:text-slate-700">
                  Products
                </button>
              </li>
              <li className="text-slate-300">/</li>
              <li className="text-slate-900 font-medium truncate max-w-[200px]">{product.name}</li>
            </ol>
          </nav>

          <div className="lg:grid lg:grid-cols-2 lg:gap-12">
            {/* Product Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden aspect-square">
                <Image
                  src={currentImage}
                  alt={`${product.name} - View ${selectedImageIndex + 1}`}
                  fill
                  className="object-contain p-4"
                  priority
                />
                
                {/* Navigation Arrows */}
                {images.length > 0 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-all z-10"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-all z-10"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 0 && (
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full z-10">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip with Horizontal Scroll */}
              {images.length > 1 && (
                <div className="relative">
                  {/* Scroll Left Button */}
                  {images.length > 2 && (
                    <button
                      onClick={() => {
                        const container = document.getElementById('thumbnail-container');
                        if (container) container.scrollLeft -= 100;
                      }}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-slate-100 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  
                  <div 
                    ref={thumbnailRef}
                    id="thumbnail-container"
                    className="flex gap-3 overflow-x-auto pb-2 px-8 scroll-smooth"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
                  >
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                          index === selectedImageIndex 
                            ? 'border-primary shadow-md' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.name} - Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        {/* Thumbnail indicator dots */}
                        {index === selectedImageIndex && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-b-xl" />
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {/* Scroll Right Button */}
                  {images.length > 2 && (
                    <button
                      onClick={() => {
                        const container = document.getElementById('thumbnail-container');
                        if (container) container.scrollLeft += 100;
                      }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-slate-100 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Show total images count */}
                  <div className="text-center mt-2 text-sm text-muted-foreground">
                    {images.length} images
                  </div>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="mt-8 lg:mt-0">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
                {/* Category Badge */}
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                    {product.category?.toLowerCase() || 'Product'}
                  </span>
                </div>

                {/* Product Name */}
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">
                  {product.name}
                </h1>

                {/* SKU */}
                {product.sku && (
                  <p className="text-sm text-slate-500 mb-4">
                    SKU: <span className="font-medium text-slate-700">{product.sku}</span>
                  </p>
                )}

                {/* Price */}
                <div className="mb-6">
                  {product.hasDiscount ? (
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold text-red-600">
                          {formatCurrency(product.finalPrice || product.price)}
                        </span>
                        <span className="text-lg text-slate-400 line-through">
                          {formatCurrency(product.originalPrice || product.price)}
                        </span>
                        <span className="bg-red-500 text-white text-sm px-2 py-1 rounded font-medium">
                          -{product.discountPercent}% OFF
                        </span>
                      </div>
                      <p className="text-sm text-green-600">
                        You save {formatCurrency((product.price - (product.finalPrice || product.price)) * quantity)}
                      </p>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-slate-900">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="mb-6">
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center text-sm text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      In Stock ({product.stock} available)
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-sm text-red-600">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Description</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Quantity Selector */}
                {product.stock > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-900 mb-3">Quantity</label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                        <button
                          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                          className="w-12 h-12 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all rounded-l-xl"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                          </svg>
                        </button>
                        <span className="w-16 text-center font-semibold text-slate-900">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                          className="w-12 h-12 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all rounded-r-xl"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {product.stock > 0 ? (
                  <div className="flex gap-4">
                    <Button
                      onClick={handleAddToCart}
                      className="flex-1 h-12 text-base font-semibold bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200"
                      variant="outline"
                    >
                      Add to Cart
                    </Button>
                    <Button
                      onClick={handleBuyNow}
                      className="flex-1 h-12 text-base font-semibold bg-slate-900 text-white hover:bg-slate-800"
                    >
                      Buy Now
                    </Button>
                  </div>
                ) : (
                  <Button
                    disabled
                    className="w-full h-12 text-base font-semibold bg-slate-200 text-slate-500"
                  >
                    Out of Stock
                  </Button>
                )}

                {/* Additional Info */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      Free Shipping on orders over KSh 5,000
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Secure M-Pesa Payment
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
