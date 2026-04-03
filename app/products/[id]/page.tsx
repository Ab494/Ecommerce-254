'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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
  category: string;
  image: string;
  images: string[];
  stock: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
}

const formatCurrency = (amount: number): string => {
  return `KES ${amount.toLocaleString()}`;
};

export default function ProductDetailPage() {
  const params = useParams();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [cartButtonText, setCartButtonText] = useState('Add to Cart');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviewFilter, setReviewFilter] = useState<number | null>(null);

  const buyNowRef = useRef<HTMLDivElement>(null);
  const id = params?.id as string;

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const API_URL = 'http://localhost:3001';

    Promise.all([
      fetch(`${API_URL}/api/products/${id}`).then(res => res.json()),
      fetch(`${API_URL}/api/products`).then(res => res.json())
    ])
      .then(([productData, allProducts]) => {
        setProduct(productData);
        setSelectedImage(productData.image || productData.images?.[0] || '');
        const related = allProducts
          .filter((p: Product) => p.category === productData.category && p._id !== productData._id)
          .slice(0, 3);
        setRelatedProducts(related);
      })
      .catch(err => console.error('Fetch error:', err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      if (buyNowRef.current) {
        const rect = buyNowRef.current.getBoundingClientRect();
        setShowStickyBar(rect.top < 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder.svg';
    if (url.startsWith('/images') || url.startsWith('/placeholder')) return url;
    if (url.startsWith('http')) return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    return url;
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
      category: product.category,
    });
    setCartButtonText('Added ✓');
    setTimeout(() => setCartButtonText('Add to Cart'), 1500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = '/cart';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatDescription = (description: string) => {
    const lines = description.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      const match = line.match(/^([A-Z][^:]*):\s*(.*)$/);
      if (match) {
        return <div key={index} className="mb-4"><span className="font-semibold text-gray-800">{match[1]}:</span> <span className="text-gray-600">{match[2]}</span></div>;
      }
      return <div key={index} className="mb-2 text-gray-600">{line}</div>;
    });
  };

  const mockReviews: Review[] = [
    { id: '1', rating: 5, comment: 'Great product, highly recommended!', author: 'John D.', date: '2024-01-15' },
    { id: '2', rating: 4, comment: 'Good quality, fast delivery.', author: 'Mary K.', date: '2024-01-10' },
    { id: '3', rating: 5, comment: 'Excellent value for money.', author: 'Peter M.', date: '2024-01-05' },
    { id: '4', rating: 3, comment: 'Decent product, could be better.', author: 'Sarah L.', date: '2024-01-01' },
    { id: '5', rating: 5, comment: 'Exactly as described, very happy.', author: 'Mike R.', date: '2023-12-28' },
  ];

  const filteredReviews = reviewFilter ? mockReviews.filter(r => r.rating === reviewFilter) : mockReviews;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
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
            <Link href="/products">
              <Button>Back to Products</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 pb-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/products" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            Back to Products
          </Link>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <img
                  src={getImageUrl(selectedImage)}
                  alt={product.name}
                  className="w-full max-h-96 object-contain bg-gray-50 rounded-lg"
                />
                {product.images?.length > 1 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {product.images.map((img, i) => (
                      <img
                        key={i}
                        src={getImageUrl(img)}
                        alt=""
                        className={`w-16 h-16 object-cover rounded cursor-pointer border-2 flex-shrink-0 ${selectedImage === img ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setSelectedImage(img)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <span className="text-sm text-gray-500 uppercase">{product.category}</span>
                <h1 className="text-2xl font-bold mt-2">{product.name}</h1>
                <p className="text-3xl font-bold text-blue-600 mt-4">{formatCurrency(product.price)}</p>
                <p className="text-sm text-gray-500 mt-4">Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p>

                <div ref={buyNowRef} className="flex items-center gap-4 mt-6">
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="border rounded px-3 py-2 w-20 text-center"
                  />
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`px-6 ${cartButtonText === 'Added ✓' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    {cartButtonText}
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="bg-green-600 hover:bg-green-700 text-white px-6"
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-6">
                {['description', 'specifications', 'shipping'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 px-1 capitalize font-medium transition-colors ${
                      activeTab === tab
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'description' ? 'Description' : tab === 'specifications' ? 'Specifications' : 'Shipping & Returns'}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'description' && (
              <div className="prose max-w-none p-4">
                {formatDescription(product.description)}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="bg-gray-50"><td className="py-3 px-4 font-medium text-gray-700 w-1/2">Length</td><td className="py-3 px-4 text-gray-600">6ft</td></tr>
                    <tr><td className="py-3 px-4 font-medium text-gray-700">Connector Type</td><td className="py-3 px-4 text-gray-600">Micro USB</td></tr>
                    <tr className="bg-gray-50"><td className="py-3 px-4 font-medium text-gray-700">Max Charging Current</td><td className="py-3 px-4 text-gray-600">2.4A</td></tr>
                    <tr><td className="py-3 px-4 font-medium text-gray-700">Data Transfer Speed</td><td className="py-3 px-4 text-gray-600">480Mbps</td></tr>
                    <tr className="bg-gray-50"><td className="py-3 px-4 font-medium text-gray-700">Core Material</td><td className="py-3 px-4 text-gray-600">Aramid fiber</td></tr>
                    <tr><td className="py-3 px-4 font-medium text-gray-700">Cable Weight</td><td className="py-3 px-4 text-gray-600">25g</td></tr>
                    <tr className="bg-gray-50"><td className="py-3 px-4 font-medium text-gray-700">Warranty</td><td className="py-3 px-4 text-gray-600">12 months</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="p-4 space-y-6 text-gray-600">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Estimated Delivery Time</h3>
                  <p>Standard delivery: 3-5 business days within Kenya. Express delivery: 1-2 business days for Nairobi and surrounding areas. Orders placed before 2 PM are processed same-day.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Return Window</h3>
                  <p>We offer a 30-day return policy for all eligible items. Products must be unused, in original packaging, and accompanied by the receipt. To initiate a return, please contact our support team at sales@254convexcomltd.co.ke or call 0722745703.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Contact Information</h3>
                  <p>Email: sales@254convexcomltd.co.ke | Phone: 0722745703 | WhatsApp: 0722745703</p>
                  <p className="mt-2">Our support team is available Monday to Friday, 8 AM to 6 PM.</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setReviewFilter(null)} className={`px-3 py-1 rounded-full text-sm ${reviewFilter === null ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All</button>
              {[5, 4, 3].map(star => (
                <button key={star} onClick={() => setReviewFilter(star)} className={`px-3 py-1 rounded-full text-sm ${reviewFilter === star ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{'★'.repeat(star)}</button>
              ))}
            </div>
            <div className="space-y-4">
              {filteredReviews.map(review => (
                <div key={review.id} className="border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                    <span className="text-gray-500 text-sm">{formatDate(review.date)}</span>
                  </div>
                  <p className="text-gray-700 mt-2">{review.comment}</p>
                  <p className="text-gray-500 text-sm mt-1">- {review.author}</p>
                </div>
              ))}
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {relatedProducts.map((related) => (
                  <div key={related._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <img src={getImageUrl(related.image)} alt={related.name} className="w-full h-32 object-contain bg-gray-50 rounded-lg mb-3" />
                    <h3 className="font-medium text-gray-900 line-clamp-2">{related.name}</h3>
                    <p className="text-blue-600 font-bold mt-2">{formatCurrency(related.price)}</p>
                    <Link href={`/products/${related._id}`}>
                      <Button className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white">View Details</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="min-w-0" style={{ maxWidth: '50%' }}>
              <p className="font-medium text-gray-900 truncate" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</p>
              <p className="text-blue-600 font-bold">{formatCurrency(product.price)}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="border rounded px-2 py-1 w-16 text-center"
              />
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}