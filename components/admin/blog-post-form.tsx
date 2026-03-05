'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const CATEGORIES = [
  'Product Guides & Tutorials',
  'Industry News',
  'Promotions & Sales',
  'Brand Stories',
];

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
}

interface BlogPostFormProps {
  initialData?: {
    _id?: string;
    title: string;
    content: string;
    excerpt: string;
    author: {
      name: string;
      avatar: string;
    };
    category: string;
    tags: string[];
    featuredImage: string;
    videoUrl: string;
    videoType: string;
    isFeatured: boolean;
    isPublished: boolean;
    publishedAt: string;
    scheduledAt: string;
    relatedProducts: string[];
  };
  onSuccess?: () => void;
}

export default function BlogPostForm({ initialData, onSuccess }: BlogPostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    authorName: initialData?.author?.name || '',
    authorAvatar: initialData?.author?.avatar || '',
    category: initialData?.category || CATEGORIES[0],
    tags: initialData?.tags?.join(', ') || '',
    featuredImage: initialData?.featuredImage || '',
    videoUrl: initialData?.videoUrl || '',
    videoType: initialData?.videoType || 'none',
    isFeatured: initialData?.isFeatured || false,
    isPublished: initialData?.isPublished || false,
    publishedAt: initialData?.publishedAt || '',
    scheduledAt: initialData?.scheduledAt || '',
    relatedProducts: initialData?.relatedProducts || [] as string[],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        author: {
          name: formData.authorName,
          avatar: formData.authorAvatar,
        },
        category: formData.category,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        featuredImage: formData.featuredImage,
        videoUrl: formData.videoUrl,
        videoType: formData.videoType,
        isFeatured: formData.isFeatured,
        isPublished: formData.isPublished,
        publishedAt: formData.publishedAt || null,
        scheduledAt: formData.scheduledAt || null,
        relatedProducts: formData.relatedProducts,
      };

      const url = initialData?._id
        ? `/api/blog/${initialData._id}`
        : '/api/blog';
      const method = initialData?._id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/admin/blog');
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save post');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({ ...prev, featuredImage: data.url }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const toggleProduct = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      relatedProducts: prev.relatedProducts.includes(productId)
        ? prev.relatedProducts.filter((id) => id !== productId)
        : [...prev.relatedProducts, productId],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Enter post title"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Short description (optional)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  placeholder="Write your post content here (HTML supported)"
                  rows={15}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Select products to link in this post
              </p>
              <div className="grid md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.relatedProducts.includes(product._id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => toggleProduct(product._id)}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.relatedProducts.includes(product._id)}
                        onChange={() => toggleProduct(product._id)}
                      />
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublished">Published</Label>
                <Switch
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPublished: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured">Featured</Label>
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFeatured: checked })
                  }
                />
              </div>

              <div>
                <Label htmlFor="publishedAt">Publish Date</Label>
                <Input
                  id="publishedAt"
                  type="datetime-local"
                  value={formData.publishedAt}
                  onChange={(e) =>
                    setFormData({ ...formData, publishedAt: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="scheduledAt">Schedule for Later</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledAt: e.target.value })
                  }
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : initialData?._id ? 'Update Post' : 'Create Post'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate tags with commas
                </p>
              </div>

              <div>
                <Label htmlFor="authorName">Author Name *</Label>
                <Input
                  id="authorName"
                  value={formData.authorName}
                  onChange={(e) =>
                    setFormData({ ...formData, authorName: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="authorAvatar">Author Avatar URL</Label>
                <Input
                  id="authorAvatar"
                  value={formData.authorAvatar}
                  onChange={(e) =>
                    setFormData({ ...formData, authorAvatar: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.featuredImage && (
                <div className="relative h-40 w-full rounded-lg overflow-hidden">
                  <img
                    src={formData.featuredImage}
                    alt="Featured"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="featuredImage">Image URL</Label>
                <Input
                  id="featuredImage"
                  value={formData.featuredImage}
                  onChange={(e) =>
                    setFormData({ ...formData, featuredImage: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="imageUpload">Or upload image</Label>
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </CardContent>
          </Card>

          {/* Video Section */}
          <Card>
            <CardHeader>
              <CardTitle>Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="videoType">Video Type</Label>
                <select
                  id="videoType"
                  className="w-full p-2 border rounded-md"
                  value={formData.videoType}
                  onChange={(e) => setFormData({ ...formData, videoType: e.target.value })}
                >
                  <option value="none">No Video</option>
                  <option value="upload">Upload Video</option>
                  <option value="youtube">YouTube URL</option>
                  <option value="vimeo">Vimeo URL</option>
                </select>
              </div>
              
              {formData.videoType !== 'none' && (
                <div>
                  <Label htmlFor="videoUrl">
                    {formData.videoType === 'upload' ? 'Video URL (from upload)' : 
                     formData.videoType === 'youtube' ? 'YouTube URL' : 'Vimeo URL'}
                  </Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder={formData.videoType === 'upload' ? 'https://...' : 
                                 formData.videoType === 'youtube' ? 'https://youtube.com/watch?v=...' : 
                                 'https://vimeo.com/...'}
                  />
                </div>
              )}

              {formData.videoType === 'upload' && (
                <div>
                  <Label htmlFor="videoUpload">Upload Video</Label>
                  <Input
                    id="videoUpload"
                    type="file"
                    accept="video/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const uploadFormData = new FormData();
                      uploadFormData.append('file', file);
                      
                      try {
                        const response = await fetch('/api/upload', {
                          method: 'POST',
                          body: uploadFormData,
                        });
                        
                        if (response.ok) {
                          const data = await response.json();
                          setFormData((prev) => ({ ...prev, videoUrl: data.url }));
                        }
                      } catch (error) {
                        console.error('Error uploading video:', error);
                      }
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
