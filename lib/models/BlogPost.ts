import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  content: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
    default: '',
  },
  author: {
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  category: {
    type: String,
    required: true,
    enum: ['Product Guides & Tutorials', 'Industry News', 'Promotions & Sales', 'Brand Stories'],
  },
  tags: [{
    type: String,
  }],
  featuredImage: {
    type: String,
    default: '',
  },
  // Video support
  videoUrl: {
    type: String,
    default: '',
  },
  videoType: {
    type: String,
    enum: ['upload', 'youtube', 'vimeo', 'none'],
    default: 'none',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  publishedAt: {
    type: Date,
    default: null,
  },
  scheduledAt: {
    type: Date,
    default: null,
  },
  views: {
    type: Number,
    default: 0,
  },
  // Related products that can be linked in the post
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  // Comments
  comments: [{
    author: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  }],
  commentCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Generate slug from title
blogPostSchema.pre('save', async function() {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});
blogPostSchema.index({ category: 1, isPublished: 1, publishedAt: -1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ isFeatured: 1 });

const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema);

export default BlogPost;
