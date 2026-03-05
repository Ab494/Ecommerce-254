import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BlogPost from '@/lib/models/BlogPost';

// Helper to generate slug
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// GET all blog posts (public)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');
    const slug = searchParams.get('slug');

    // Get single post by slug
    if (slug) {
      const post = await BlogPost.findOne({ slug });
      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      // Increment views
      await BlogPost.updateOne({ slug }, { $inc: { views: 1 } });
      return NextResponse.json(post);
    }

    // Build query
    let query: any = { isPublished: true };

    // Check if post is scheduled and should be published
    const now = new Date();
    query.$or = [
      { publishedAt: { $lte: now } },
      { publishedAt: null }
    ];

    if (category && category !== 'all') {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Execute query
    let postsQuery = BlogPost.find(query)
      .sort({ publishedAt: -1, createdAt: -1 });

    if (limit) {
      postsQuery = postsQuery.limit(parseInt(limit));
    }

    const posts = await postsQuery;

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// POST create new blog post (admin)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      author,
      category,
      tags,
      featuredImage,
      isFeatured,
      isPublished,
      publishedAt,
      scheduledAt,
      relatedProducts,
    } = body;

    if (!title || !content || !author?.name || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = generateSlug(title);
    const existingPost = await BlogPost.findOne({ slug });
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    // Handle publishing
    let finalPublishedAt = publishedAt;
    if (isPublished && !publishedAt) {
      finalPublishedAt = new Date();
    }

    const post = new BlogPost({
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 150) + '...',
      author,
      category,
      tags: tags || [],
      featuredImage: featuredImage || '',
      isFeatured: isFeatured || false,
      isPublished: isPublished || false,
      publishedAt: finalPublishedAt,
      scheduledAt: scheduledAt || null,
      relatedProducts: relatedProducts || [],
    });

    await post.save();

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
