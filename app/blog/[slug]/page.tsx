'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  videoUrl: string;
  videoType: string;
  isFeatured: boolean;
  publishedAt: string;
  views: number;
  commentCount: number;
  relatedProducts: any[];
}

interface Comment {
  _id: string;
  author: string;
  email: string;
  content: string;
  createdAt: string;
  isApproved?: boolean;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({ author: '', email: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  // Fetch comments after post is loaded
  useEffect(() => {
    if (post?._id) {
      fetchComments();
    }
  }, [post?._id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog?slug=${slug}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
        if (data.category) {
          fetchRelatedPosts(data.category);
        }
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (category: string) => {
    try {
      const response = await fetch(`/api/blog?category=${encodeURIComponent(category)}&limit=3`);
      if (response.ok) {
        const data = await response.json();
        setRelatedPosts(data.filter((p: BlogPost) => p.slug !== slug));
      }
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  const fetchComments = async () => {
    if (!post?._id) return;
    try {
      const response = await fetch(`/api/blog/${post._id}/comments`);
      if (response.ok) {
        const data = await response.json();
        if (data.comments) {
          setComments(data.comments);
        }
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.author || !commentForm.content) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/blog/${post?._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentForm),
      });

      if (response.ok) {
        setCommentForm({ author: '', email: '', content: '' });
        fetchComments();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const parseContent = (content: string) => {
    if (!content) return '';
    
    let html = content;
    
    // Convert ## heading to h2
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>');
    
    // Convert ### heading to h3
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>');
    
    // Convert unordered lists with - or * to styled li elements
    html = html.replace(/^[-*] (.+)$/gm, '<li class="ml-4 mb-2">$1</li>');
    
    // Wrap consecutive li elements in ul
    html = html.replace(/(<li class="ml-4 mb-2">.*?<\/li>\n?)+/g, '<ul class="list-disc list-inside my-4 space-y-2">$&</ul>');
    
    // Convert paragraphs (double newlines) with proper spacing
    html = html.replace(/\n\n/g, '</p><p class="mb-4">');
    
    // Wrap content in paragraph if not already wrapped
    if (!html.startsWith('<')) {
      html = '<p class="mb-4">' + html + '</p>';
    }
    
    return html;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-primary">Blog</Link>
            <span>/</span>
            <span className="text-foreground">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Article */}
      <article className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <header className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge className={getCategoryColor(post.category)}>
                  {post.category}
                </Badge>
                {post.isFeatured && (
                  <Badge variant="outline" className="text-yellow-600">
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>

              {post.excerpt && (
                <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
              )}

              {/* Author & Meta */}
              <div className="flex items-center justify-between py-4 border-y">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={post.author?.avatar} />
                    <AvatarFallback>
                      {post.author?.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{post.author?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(post.publishedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{post.views} views</span>
                  <span>{post.commentCount} comments</span>
                </div>
              </div>
            </header>

            {/* Featured Image - After Title */}
            {post.featuredImage && (
              <div className="relative h-[250px] sm:h-[300px] md:h-[350px] w-full overflow-hidden mb-8 rounded-lg">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Video Section */}
            {post.videoUrl && post.videoType && post.videoType !== 'none' && (
              <div className="mb-8">
                {post.videoType === 'youtube' && post.videoUrl && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={post.videoUrl.replace('watch?v=', 'embed/')}
                      title="YouTube video"
                      className="absolute top-0 left-0 w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
                {post.videoType === 'vimeo' && post.videoUrl && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={post.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                      title="Vimeo video"
                      className="absolute top-0 left-0 w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
                {post.videoType === 'upload' && post.videoUrl && (
                  <video
                    src={post.videoUrl}
                    controls
                    className="w-full rounded-lg"
                    preload="metadata"
                  />
                )}
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="blog-content mb-12">
              <div 
                dangerouslySetInnerHTML={{ __html: parseContent(post.content) }} 
              />
            </div>

            {/* Share */}
            <div className="flex items-center justify-between py-6 border-t border-b mb-12">
              <span className="font-medium">Share this post</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="hover:bg-[#1877F2] hover:text-white border-[#1877F2] text-[#1877F2]"
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank')}
                >
                  Facebook
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="hover:bg-black hover:text-white border-black text-black"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?url=${shareUrl}&text=${post.title}`, '_blank')}
                >
                  Twitter
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="hover:bg-[#0A66C2] hover:text-white border-[#0A66C2] text-[#0A66C2]"
                  onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${post.title}`, '_blank')}
                >
                  LinkedIn
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Products */}
      {post.relatedProducts && post.relatedProducts.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {post.relatedProducts.map((product) => (
                <Link key={product._id} href={`/products/${product._id}`}>
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                    {product.image && (
                      <div className="relative h-40">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                      <p className="text-primary font-bold mt-2">
                        KES {product.price?.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost._id} href={`/blog/${relatedPost.slug}`}>
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                    {relatedPost.featuredImage && (
                      <div className="relative h-40">
                        <Image
                          src={relatedPost.featuredImage}
                          alt={relatedPost.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-2">{relatedPost.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {formatDate(relatedPost.publishedAt)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Comments Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">
              Comments ({comments.length})
            </h2>

            {/* Comment Form */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Leave a Comment</h3>
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name *</label>
                      <input
                        type="text"
                        required
                        value={commentForm.author}
                        onChange={(e) => setCommentForm({ ...commentForm, author: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        value={commentForm.email}
                        onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Comment *</label>
                    <textarea
                      required
                      rows={4}
                      value={commentForm.content}
                      onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Post Comment'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <Card key={comment._id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {comment.author?.charAt(0) || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{comment.author}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{comment.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
