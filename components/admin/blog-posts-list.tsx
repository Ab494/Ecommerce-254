'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: {
    name: string;
  };
  category: string;
  tags: string[];
  featuredImage: string;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  views: number;
  commentCount: number;
}

interface BlogPostsListProps {
  onEdit?: (post: BlogPost) => void;
}

const CATEGORIES = [
  'Product Guides & Tutorials',
  'Industry News',
  'Promotions & Sales',
  'Brand Stories',
];

export default function BlogPostsList({ onEdit }: BlogPostsListProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [filterCategory, filterStatus]);

  const fetchPosts = async () => {
    try {
      let url = '/api/blog?limit=100';
      if (filterCategory) {
        url += `&category=${encodeURIComponent(filterCategory)}`;
      }
      const response = await fetch(url);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/blog/${post._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPublished: !post.isPublished,
        }),
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  const handleToggleFeatured = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/blog/${post._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isFeatured: !post.isFeatured,
        }),
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      !filterStatus ||
      (filterStatus === 'published' && post.isPublished) ||
      (filterStatus === 'draft' && !post.isPublished);
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Link href="/admin/blog/new">
          <Button>Create New Post</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                type="search"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="p-2 border rounded-md"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              className="p-2 border rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      {loading ? (
        <div className="text-center py-8">Loading posts...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No posts found</p>
          <Link href="/admin/blog/new">
            <Button className="mt-4">Create Your First Post</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted">
              <tr>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Author</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Views</th>
                <th className="text-center p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post._id} className="border-b hover:bg-muted/50">
                  <td className="p-3">
                    <div className="font-medium">{post.title}</div>
                    <div className="text-xs text-muted-foreground">/{post.slug}</div>
                  </td>
                  <td className="p-3">
                    <Badge className={getCategoryColor(post.category)}>
                      {post.category}
                    </Badge>
                  </td>
                  <td className="p-3">{post.author?.name}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Badge variant={post.isPublished ? 'default' : 'secondary'}>
                        {post.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      {post.isFeatured && (
                        <Badge variant="outline" className="text-yellow-600">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {formatDate(post.publishedAt || post.createdAt)}
                  </td>
                  <td className="p-3 text-muted-foreground">{post.views}</td>
                  <td className="p-3">
                    <div className="flex gap-1 justify-center">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onEdit ? onEdit(post) : window.open(`/blog/${post.slug}`, '_blank')}
                      >
                        {onEdit ? 'Edit' : 'View'}
                      </Button>
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant={post.isPublished ? 'secondary' : 'default'}
                        onClick={() => handleTogglePublish(post)}
                      >
                        {post.isPublished ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        size="sm"
                        variant={post.isFeatured ? 'default' : 'outline'}
                        onClick={() => handleToggleFeatured(post)}
                      >
                        {post.isFeatured ? 'Unfeature' : 'Feature'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(post._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
