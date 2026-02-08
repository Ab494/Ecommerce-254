'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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

export default function ProductsListingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { addItem } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const categories = [
    'all',
    'Electronics',
    'CCTV Surveillance',
    'Home Appliances',
    'Office Equipment',
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
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
    e.stopPropagation(); // Prevent card click
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

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-slate-50">
        <section className="bg-slate-900 py-12 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold">Our Products</h1>
            <p className="mt-2 text-slate-400">
              Browse our complete range of products
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Category Filter */}
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={`capitalize ${
                  selectedCategory === category 
                    ? 'bg-slate-900 hover:bg-slate-800' 
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {category === 'all' ? 'All Products' : category}
              </Button>
            ))}
          </div>

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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <Card
                  key={product._id}
                  className="overflow-hidden transition-all hover:shadow-lg cursor-pointer group"
                  onClick={() => handleProductClick(product._id)}
                >
                  <div className="aspect-square relative bg-slate-100">
                    {product.image ? (
                      <>
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                        {/* Multi-image indicator */}
                        {product.images && product.images.length > 1 && (
                          <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded-full text-xs font-medium text-slate-700 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {product.images.length + 1} photos
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        No Image
                      </div>
                    )}
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
                    {/* Quick view overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-white text-slate-900 px-4 py-2 rounded-full text-sm font-medium transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        Quick View
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2 text-xs font-medium text-slate-500 uppercase">
                      {product.category}
                    </div>
                    <h3 className="mb-2 line-clamp-1 font-semibold text-slate-900 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="mb-3 line-clamp-2 text-sm text-slate-500">
                      {product.description}
                    </p>
                    
                    {/* Jumia-style pricing */}
                    <div className="flex flex-wrap items-baseline gap-2 mb-3">
                      {product.hasDiscount ? (
                        <>
                          <span className="text-lg font-bold text-red-600">
                            {formatCurrency(product.finalPrice || product.price)}
                          </span>
                          <span className="text-sm text-slate-400 line-through">
                            {formatCurrency(product.originalPrice || product.price)}
                          </span>
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded font-medium">
                            -{product.discountPercent}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-slate-900">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Button
                        size="sm"
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={product.stock === 0}
                        className="bg-slate-900 hover:bg-slate-800"
                      >
                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
