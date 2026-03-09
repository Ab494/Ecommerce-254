'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CATEGORIES = [
  'All Posts',
  'Product Guides & Tutorials',
  'Industry News',
  'Promotions & Sales',
  'Brand Stories',
];

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  tags: string[];
  featuredImage: string;
  isFeatured: boolean;
  publishedAt: string;
  views: number;
  commentCount: number;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All Posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    fetchFeaturedPosts();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    try {
      const categoryParam = selectedCategory === 'All Posts' ? '' : `&category=${encodeURIComponent(selectedCategory)}`;
      const response = await fetch(`/api/blog?limit=20${categoryParam}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedPosts = async () => {
    try {
      const response = await fetch('/api/blog?featured=true&limit=3');
      if (response.ok) {
        const data = await response.json();
        setFeaturedPosts(data);
      }
    } catch (error) {
      console.error('Error fetching featured posts:', error);
    }
  };

  const filteredPosts = posts
    .filter(post => !post.isFeatured) // Exclude featured posts from main grid
    .filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Product Guides & Tutorials': 'bg-blue-100 text-blue-800',
      'Industry News': 'bg-purple-100 text-purple-800',
      'Promotions & Sales': 'bg-green-100 text-green-800',
      'Brand Stories': 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-[#ECFDF5]">
      {/* Hero Section with Video */}
      <section className="relative overflow-hidden text-white py-24 md:py-32">
        {/* Background Video */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute w-full h-full object-cover"
          >
            <source src="/videos/hero-section.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
            <p className="text-xl opacity-90">
              Stay updated with the latest news, guides, and stories from our store
            </p>
            {/* Navigation Links */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors"
              >
                ← Home
              </Link>
              <Link 
                href="/products" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors"
              >
                Products
              </Link>
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Featured Posts</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredPosts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full"
                >
                  <Link key={post._id} href={`/blog/${post.slug}`} className="group block h-full">
                    <motion.div
                      className="h-full bg-white border border-[#D1FAE5] rounded-xl overflow-hidden"
                      style={{ boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)' }}
                      whileHover={{ y: -8, boxShadow: '0 12px 24px rgba(16, 185, 129, 0.15)' }}
                      transition={{ duration: 0.3 }}
                    >
                      {post.featuredImage && (
                        <div className="relative h-[200px] overflow-hidden">
                          <Image
                            src={post.featuredImage}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <Badge className={`w-fit ${getCategoryColor(post.category)}`}>
                          {post.category}
                        </Badge>
                        <h3 className="text-xl font-semibold mt-2 text-foreground group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-2 mt-2">
                          {post.excerpt}
                        </p>
                        <div className="text-sm text-muted-foreground mt-4 flex items-center">
                          <span>{post.author?.name}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(post.publishedAt)}</span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-1/4">
              <div className="sticky top-4 space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Search</h3>
                  <Input
                    type="search"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        className={selectedCategory !== category ? 'bg-gray-100 hover:bg-gray-200' : ''}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Popular Tags */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Printer', 'Ink', 'Technology', 'Sale', 'Guide', 'Review'].map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary/10"
                        onClick={() => setSearchQuery(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Posts Grid */}
            <div className="lg:w-3/4">
              {loading ? (
                <div className="text-center py-12">Loading posts...</div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No posts found</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredPosts.map((post, index) => (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="h-full"
                    >
                      <Link key={post._id} href={`/blog/${post.slug}`} className="group block h-full">
                        <motion.div
                          className="h-full bg-white border border-[#D1FAE5] rounded-xl overflow-hidden"
                          style={{ boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)' }}
                          whileHover={{ y: -8, boxShadow: '0 12px 24px rgba(16, 185, 129, 0.15)' }}
                          transition={{ duration: 0.3 }}
                        >
                          {post.featuredImage && (
                            <div className="relative h-[200px] overflow-hidden">
                              <Image
                                src={post.featuredImage}
                                alt={post.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <Badge className={`${getCategoryColor(post.category)}`}>
                                {post.category}
                              </Badge>
                              {post.isFeatured && (
                                <Badge variant="outline" className="text-yellow-600">
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-xl font-semibold mt-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-muted-foreground line-clamp-3 mt-2">
                              {post.excerpt}
                            </p>
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {post.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <div className="text-sm text-muted-foreground mt-4 flex items-center">
                              <div className="flex items-center gap-2">
                                {post.author?.avatar && (
                                  <Image
                                    src={post.author.avatar}
                                    alt={post.author.name}
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                  />
                                )}
                                <span>{post.author?.name}</span>
                              </div>
                              <span className="mx-2">•</span>
                              <span>{formatDate(post.publishedAt)}</span>
                              <span className="mx-2">•</span>
                              <span>{post.views} views</span>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-muted-foreground mb-4">
              Get the latest blog posts and updates delivered to your inbox
            </p>
            <form className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
