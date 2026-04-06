'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
// Card components removed - using plain divs for better height control
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
}

// Helper function to format Kenyan Shillings
const formatCurrency = (amount: number): string => {
  return `KES ${amount.toLocaleString()}`;
};

// Category icons (using emoji as placeholders - can be replaced with actual icons)
const categoryIcons: Record<string, string> = {
  'Phones & Accessories': '📱',
  'Computers & Accessories': '💻',
  'CCTV Surveillance': '📹',
  'Appliances': '🏠',
  'Office Equipment': '🖥️',
  'Other': '📦',
};

// Category background colors
const categoryColors: Record<string, string> = {
  'Phones & Accessories': 'bg-pink-50',
  'Computers & Accessories': 'bg-cyan-50',
  'CCTV Surveillance': 'bg-green-50',
  'Appliances': 'bg-orange-50',
  'Office Equipment': 'bg-purple-50',
  'Other': 'bg-gray-50',
};

export default function ProductsListingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const router = useRouter();
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product>>({});
  const { addItem } = useCart();
  const { toast } = useToast();

  const categories = [
    'all',
    'Phones & Accessories',
    'Computers & Accessories',
    'CCTV Surveillance',
    'Appliances',
    'Office Equipment',
    'Other',
  ];

  const categoryList = categories.filter(c => c !== 'all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const API_URL = 'https://ecommerce-254.onrender.com';
      console.log('API_URL:', API_URL);
      const response = await fetch(`${API_URL}/api/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
      
      const representative: Record<string, Product> = {};
      categoryList.forEach(cat => {
        const catProducts = data.filter((p: Product) => p.category === cat);
        if (catProducts.length > 0) {
          representative[cat] = catProducts[0];
        }
      });
      setCategoryProducts(representative);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Connection Error',
        description: 'Unable to load products. Please check your connection.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      productId: product._id,
      name: product.name,
      price: product.finalPrice || product.price,
      quantity: 1,
      image: product.image,
      category: product.category,
    });
    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    // Smooth scroll to products section
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-slate-50">
        {/* Hero Section */}
        <section className="bg-slate-900 py-12 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold">Our Products</h1>
            <p className="mt-2 text-slate-400">
              Browse our complete range of products
            </p>
          </div>
        </section>

        <div className="w-full px-2 md:px-4 py-8">
          <div className="">
            {/* Top Categories Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-gray-800">Top Categories</h2>
                <a className="text-sm text-[#0B3C5D]">See All →</a>
              </div>
              <hr className="border-t border-gray-200 mb-4" />
              
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {categoryList.map((category) => {
                  const product = categoryProducts[category];
                  return (
                    <button
                      key={category}
                      onClick={() => handleCategoryClick(category)}
                      className={`${categoryColors[category] || 'bg-gray-50'} p-2 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer text-center flex flex-col items-center justify-center`}
                    >
                      {product ? (
                        <div className="w-full">
                          <div className="relative h-14 w-full mb-1 bg-white rounded-lg overflow-hidden">
                            <img
                              src={product.image.startsWith('/images') ? product.image : `/api/image-proxy?url=${encodeURIComponent(product.image)}`}
                              alt={product.name}
                              className="w-full h-full object-contain p-1"
                            />
                          </div>
                          <span className="text-[10px] font-medium text-slate-700 line-clamp-2 leading-tight">{product.name}</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 mb-1 bg-white rounded-full flex items-center justify-center text-2xl">
                            {categoryIcons[category] || '📦'}
                          </div>
                          <span className="text-xs font-medium text-slate-700">{category}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Pills - Scrollable on mobile */}
            <div className="mb-6 overflow-x-auto flex flex-nowrap gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className={`capitalize rounded-full flex-shrink-0 ${
                    selectedCategory === category 
                      ? 'bg-[#0B3C5D] hover:bg-[#0a3550]' 
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-white'
                  }`}
                >
                  {category === 'all' ? 'All Products' : category}
                </Button>
              ))}
            </div>

            {/* Products Section Header */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedCategory === 'all' ? 'Our Products' : selectedCategory}
              </h2>
              <a 
                className="text-sm text-[#0B3C5D]"
                onClick={(e) => { e.preventDefault(); setSelectedCategory('all'); }}
              >
                See All →
              </a>
            </div>
            <hr className="border-t border-gray-200 mb-4" />

            {/* Products Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center text-muted-foreground">Loading products...</div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center text-muted-foreground">
                  No products found in this category.
                </div>
              </div>
            ) : (
              <div id="products-section" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3 w-full">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="relative overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-lg cursor-pointer group flex flex-col w-full"
                    onClick={() => window.location.href = `/products/${product._id}`}
                  >
                    {/* Image Area - Fixed height 150px */}
                    <div className="relative bg-gray-50 overflow-hidden" style={{ height: '150px', minHeight: '150px', maxHeight: '150px' }}>
                      {product.image ? (
                        <img
                          src={product.image.startsWith('/images') ? product.image : `/api/image-proxy?url=${encodeURIComponent(product.image)}`}
                          alt={product.name}
                          className="w-full h-full object-contain p-3"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          No Image
                        </div>
                      )}
                      {/* Multi-image indicator */}
                      {product.images && product.images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-medium text-slate-700 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {product.images.length}
                        </div>
                      )}
                      {/* Out of Stock badge */}
                      {product.stock === 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          Out of Stock
                        </div>
                      )}
                      {/* Discount badge */}
                      {product.hasDiscount && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
                          -{product.discountPercent}%
                        </div>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="p-3 flex flex-col gap-1">
                      {/* Category */}
                      <div className="text-xs font-medium text-slate-500 uppercase">
                        {product.category}
                      </div>
                      
                      {/* Product Name - tight leading, 2 lines max */}
                      <h3 className="text-sm font-semibold leading-tight text-slate-900 group-hover:text-[#0B3C5D] transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      
                      {/* Pricing - compact row */}
                      <div className="flex items-center gap-2 flex-wrap text-sm">
                        {product.hasDiscount ? (
                          <>
                            <span className="font-bold text-[#0B3C5D]">
                              {formatCurrency(product.finalPrice || product.price)}
                            </span>
                            <span className="text-xs text-slate-400 line-through">
                              {formatCurrency(product.originalPrice || product.price)}
                            </span>
                            <span className="text-xs text-red-600 font-medium">
                              -{product.discountPercent}%
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-[#0B3C5D]">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                      </div>
                      
                      {/* Add to Cart Button */}
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleAddToCart(product, e);
                        }}
                        disabled={product.stock === 0}
                        className="relative z-20 w-full bg-[#0B3C5D] hover:bg-[#0a3550] text-white mt-1"
                      >
                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
