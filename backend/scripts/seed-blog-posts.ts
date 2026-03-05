import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://cheruiyotevans646_db_user:Evans6042@cluster0.tgnopmy.mongodb.net/ecommerce254?appName=Cluster0';

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  content: { type: String, required: true },
  excerpt: { type: String, default: '' },
  author: {
    name: { type: String, required: true },
    avatar: { type: String, default: '' },
  },
  category: {
    type: String,
    required: true,
    enum: ['Product Guides & Tutorials', 'Industry News', 'Promotions & Sales', 'Brand Stories'],
  },
  tags: [{ type: String }],
  featuredImage: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  videoType: { 
    type: String, 
    enum: ['none', 'upload', 'youtube', 'vimeo'], 
    default: 'none' 
  },
  isFeatured: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date, default: null },
  views: { type: Number, default: 0 },
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  comments: [{
    author: String,
    email: String,
    content: String,
    createdAt: { type: Date, default: Date.now },
    isApproved: { type: Boolean, default: true },
  }],
  commentCount: { type: Number, default: 0 },
}, { timestamps: true });

const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema);

const samplePosts = [
  {
    title: "How to Choose the Right Printer for Your Business",
    slug: "how-to-choose-the-right-printer-for-your-business",
    content: '<h2>Introduction</h2><p>Choosing the right printer for your business can be a daunting task. With so many options available in the market, it is important to consider your specific needs before making a decision.</p><h2>Factors to Consider</h2><h3>1. Print Volume</h3><p>Consider how many pages you need to print per month. If you have high-volume printing needs, a laser printer might be more suitable. For lower volumes, an inkjet printer could be more cost-effective.</p><h3>2. Print Quality</h3><p>If you need professional-quality prints for client presentations, invest in a printer with higher resolution. Brother printers are known for their exceptional print quality.</p><h3>3. Cost per Page</h3><p>Look at the cost of replacement cartridges and how many pages they can print. This will help you understand the long-term costs.</p><h2>Our Recommendations</h2><p>At 254 Convex Communication, we recommend the following printers based on business needs:</p><ul><li><strong>Brother HL-L2350DW</strong> - Perfect for small offices with moderate print volumes</li><li><strong>Brother MFC-L8900CDW</strong> - Ideal for larger offices needing color printing and scanning</li></ul><h2>Conclusion</h2><p>Take your time to evaluate your needs and budget before making a decision. Contact us today for personalized recommendations!</p>',
    excerpt: "A comprehensive guide to help you choose the perfect printer for your business needs.",
    author: { name: "254 Convex Team", avatar: "" },
    category: "Product Guides & Tutorials",
    tags: ["Printer", "Guide", "Business", "Technology"],
    featuredImage: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800",
    videoUrl: "",
    videoType: "none",
    isFeatured: true,
    isPublished: true,
    publishedAt: new Date(),
  },
  {
    title: "The Future of Office Technology in Kenya",
    slug: "the-future-of-office-technology-in-kenya",
    content: '<h2>Introduction</h2><p>Kenya office technology landscape is rapidly evolving. From advanced printers to integrated payment solutions, businesses are embracing digital transformation.</p><h2>Key Trends</h2><h3>1. Cloud-Based Solutions</h3><p>More businesses are moving to cloud-based document management systems, enabling remote work and better collaboration.</p><h3>2. M-Pesa Integration</h3><p>Mobile payment solutions like M-Pesa are revolutionizing how businesses handle transactions, making it easier for customers to pay for products and services.</p><h3>3. Smart Office Equipment</h3><p>IoT-enabled devices are becoming more common, allowing businesses to monitor and manage their office equipment remotely.</p><h2>What This Means for Your Business</h2><p>Staying ahead of these trends can give your business a competitive edge. Invest in technology that scales with your needs and embraces the digital future.</p><h2>Conclusion</h2><p>254 Convex Communication is committed to bringing the latest office technology solutions to Kenyan businesses. Contact us to learn more!</p>',
    excerpt: "Explore the latest trends shaping office technology in Kenya and how your business can benefit.",
    author: { name: "254 Convex Team", avatar: "" },
    category: "Industry News",
    tags: ["Technology", "Kenya", "Business", "Innovation"],
    featuredImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    videoUrl: "",
    videoType: "none",
    isFeatured: false,
    isPublished: true,
    publishedAt: new Date(),
  },
  {
    title: "Black Friday Special: Save Big on Printers",
    slug: "black-friday-special-save-big-on-printers",
    content: '<h2>Black Friday is Here!</h2><p>Get ready for our biggest sale of the year! From November 24th to 30th, enjoy unprecedented discounts on all our products.</p><h2>Featured Deals</h2><ul><li><strong>Brother HL-L2350DW</strong> - Was KES 45,000, Now KES 35,000!</li><li><strong>Brother MFC-L8900CDW</strong> - Was KES 85,000, Now KES 65,000!</li><li><strong>All Ink Cartridges</strong> - Buy 2 Get 1 Free!</li></ul><h2>Additional Benefits</h2><p>During this promotion, all purchases include:</p><ul><li>Free delivery within Nairobi</li><li>Free installation and setup</li><li>2-year warranty</li><li>Priority customer support</li></ul><h2>How to Order</h2><p>Visit our website or call us at +254 790 287 003 to place your order. Hurry, while stocks last!</p><h2>Terms and Conditions</h2><p>Offer valid from November 24-30, 2024. Free delivery applies to Nairobi metropolitan area only. While stocks last.</p>',
    excerpt: "Don not miss our biggest sale of the year! Save up to KES 20,000 on printers and more.",
    author: { name: "254 Convex Team", avatar: "" },
    category: "Promotions & Sales",
    tags: ["Sale", "Black Friday", "Printer", "Discount"],
    featuredImage: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=800",
    videoUrl: "",
    videoType: "none",
    isFeatured: true,
    isPublished: true,
    publishedAt: new Date(),
  },
  {
    title: "Why We Partner with Brother",
    slug: "why-we-partner-with-brother",
    content: '<h2>Our Partnership Philosophy</h2><p>At 254 Convex Communication, we carefully select our brand partners to ensure we offer only the best quality products to our customers. Our partnership with Brother is a testament to this commitment.</p><h2>Why Brother?</h2><h3>1. Quality and Reliability</h3><p>Brother is renowned for producing durable, high-performance printers that stand the test of time. Their products are built to handle high-volume printing without compromising quality.</p><h3>2. Innovation</h3><p>Brother consistently leads the industry with innovative features like wireless printing, cloud connectivity, and energy-efficient designs.</p><h3>3. Customer Support</h3><p>Brother excellent customer support aligns with our own commitment to outstanding service.</p><h2>What This Means for You</h2><p>When you buy a Brother product from 254 Convex Communication, you are getting:</p><ul><li>Genuine products with full warranty</li><li>Expert advice and recommendations</li><li>Professional installation and setup</li><li>Ongoing technical support</li></ul><h2>Our Commitment</h2><p>We stand behind every product we sell. Our team is here to help you choose the right solution and provide support whenever you need it.</p>',
    excerpt: "Learn why Brother is our trusted partner for quality office equipment.",
    author: { name: "254 Convex Team", avatar: "" },
    category: "Brand Stories",
    tags: ["Brother", "Partnership", "Quality", "Brand"],
    featuredImage: "https://images.unsplash.com/photo-1560472355-536de3962603?w=800",
    videoUrl: "",
    videoType: "none",
    isFeatured: false,
    isPublished: true,
    publishedAt: new Date(),
  },
];

async function seedBlogPosts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing posts
    await BlogPost.deleteMany({});
    console.log('Cleared existing blog posts');

    // Insert sample posts
    await BlogPost.insertMany(samplePosts);
    console.log('Successfully seeded blog posts with videos!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding blog posts:', error);
    process.exit(1);
  }
}

seedBlogPosts();
