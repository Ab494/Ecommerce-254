'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
            <p className="text-xl opacity-90">
              Stay updated with the latest news, guides, and stories from our store
            </p>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">See What We Do</h2>
          <p className="text-muted-foreground mb-8">Quality technology products for every Kenyan business</p>
          <div className="relative w-full mx-auto rounded-xl overflow-hidden shadow-lg" style={{ aspectRatio: '16/9' }}>
            <video
              src="/videos/welcome.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Featured Posts</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <Link key={post._id} href={`/blog/${post.slug}`} className="group">
                  <Card className="h-full overflow-hidden hover:shadow-xl transition-shadow duration-300">
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
                    <CardHeader>
                      <Badge className={`w-fit ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </Badge>
                      <h3 className="text-xl font-semibold mt-2 text-foreground group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                    </CardContent>
                    <CardFooter className="text-sm text-muted-foreground">
                      <span>{post.author?.name}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(post.publishedAt)}</span>
                    </CardFooter>
                  </Card>
                </Link>
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
                  {filteredPosts.map((post) => (
                    <Link key={post._id} href={`/blog/${post.slug}`} className="group">
                      <Card className="h-full overflow-hidden hover:shadow-xl transition-shadow duration-300">
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
                        <CardHeader>
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
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground line-clamp-3">
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
                        </CardContent>
                        <CardFooter className="text-sm text-muted-foreground">
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
                        </CardFooter>
                      </Card>
                    </Link>
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
