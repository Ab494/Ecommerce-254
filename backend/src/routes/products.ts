import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

const router = Router();

// MongoDB connection string (reuse connection from main server)
const MONGODB_URI = process.env.MONGODB_URI!;

// Helper function to generate unique SKU
const generateUniqueSKU = (): string => {
  return `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// Variant Schema (embedded in Product)
const variantSchema = new mongoose.Schema(
  {
    color: {
      type: String,
      required: true,
      enum: ['Black', 'Cyan', 'Magenta', 'Yellow', 'White', 'Red', 'Blue', 'Green', 'Other'],
    },
    price: {
      type: Number,
      min: 0,
      default: null, // If null, uses parent product price
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      sparse: true,
    },
    image: {
      type: String,
      default: null, // Optional variant-specific image
    },
  },
  { _id: true }
);

// Product Schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Discount fields
    discountPercent: {
      type: Number,
      min: 0,
      max: 99,
      default: 0,
    },
    saleStart: {
      type: Date,
      default: null,
    },
    saleEnd: {
      type: Date,
      default: null,
    },
    category: {
      type: String,
      enum: ['Electronics', 'CCTV Surveillance', 'Home Appliances', 'Office Equipment'],
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    // Color variants
    variants: {
      type: [variantSchema],
      default: [],
    },
    hasVariants: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    // Add virtuals and methods
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for final price (applies discount if active)
productSchema.virtual('finalPrice').get(function(this: any) {
  const now = new Date();
  const hasDiscount = this.discountPercent > 0;
  const saleStarted = !this.saleStart || new Date(this.saleStart) <= now;
  const saleEnded = !this.saleEnd || new Date(this.saleEnd) >= now;
  
  if (hasDiscount && saleStarted && saleEnded) {
    return this.price * (1 - this.discountPercent / 100);
  }
  return this.price;
});

// Virtual for hasDiscount (check if discount is currently active)
productSchema.virtual('hasDiscount').get(function(this: any) {
  const now = new Date();
  const hasDiscount = this.discountPercent > 0;
  const saleStarted = !this.saleStart || new Date(this.saleStart) <= now;
  const saleEnded = !this.saleEnd || new Date(this.saleEnd) >= now;
  
  return hasDiscount && saleStarted && saleEnded;
});

// Virtual for original price (alias for price)
productSchema.virtual('originalPrice').get(function(this: any) {
  return this.price;
});

// Get model or create new one
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET all products or by category
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== 'all') {
      query = { category };
    }
    const products = await Product.find(query).sort({ createdAt: -1 });
    
    // Add computed discount fields to each product
    const productsWithDiscounts = products.map(product => {
      const now = new Date();
      const hasDiscount = product.discountPercent > 0;
      const saleStarted = !product.saleStart || new Date(product.saleStart) <= now;
      const saleEnded = !product.saleEnd || new Date(product.saleEnd) >= now;
      const isDiscountActive = hasDiscount && saleStarted && saleEnded;
      
      return {
        ...product.toObject(),
        hasDiscount: isDiscountActive,
        finalPrice: isDiscountActive 
          ? product.price * (1 - product.discountPercent / 100) 
          : product.price,
        originalPrice: product.price,
      };
    });
    
    res.json(productsWithDiscounts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Add computed discount fields
    const now = new Date();
    const hasDiscount = product.discountPercent > 0;
    const saleStarted = !product.saleStart || new Date(product.saleStart) <= now;
    const saleEnded = !product.saleEnd || new Date(product.saleEnd) >= now;
    const isDiscountActive = hasDiscount && saleStarted && saleEnded;
    
    const productWithDiscount = {
      ...product.toObject(),
      hasDiscount: isDiscountActive,
      finalPrice: isDiscountActive 
        ? product.price * (1 - product.discountPercent / 100) 
        : product.price,
      originalPrice: product.price,
    };
    
    res.json(productWithDiscount);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST create new product
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      images,
      stock,
      sku,
      discountPercent,
      saleStart,
      saleEnd,
      variants,
      hasVariants
    } = req.body;

    if (!name || !description || !price || !category || !image) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate discount
    if (discountPercent && (discountPercent < 0 || discountPercent > 99)) {
      return res.status(400).json({ error: 'Discount must be between 0 and 99' });
    }

    // Validate sale dates
    if (discountPercent > 0 && saleStart && saleEnd) {
      const startDate = new Date(saleStart);
      const endDate = new Date(saleEnd);
      if (startDate >= endDate) {
        return res.status(400).json({ error: 'Sale start date must be before sale end date' });
      }
    }

    // Calculate final price
    const finalPrice = discountPercent > 0
      ? price * (1 - discountPercent / 100)
      : price;

    // Generate or validate SKU
    let productSku = sku || generateUniqueSKU();
    
    // If SKU is provided but already exists, generate a new one
    if (sku) {
      const existingProduct = await Product.findOne({ sku: sku });
      if (existingProduct) {
        productSku = generateUniqueSKU();
      }
    }

    // Process variants - generate SKUs for each variant
    const processedVariants = (variants || []).map((variant: any) => ({
      ...variant,
      sku: variant.sku || `${productSku}-${variant.color?.toUpperCase() || 'VAR'}`,
    }));

    const product = new Product({
      name,
      description,
      price,
      discountPercent: discountPercent || 0,
      saleStart: discountPercent > 0 ? saleStart : null,
      saleEnd: discountPercent > 0 ? saleEnd : null,
      category,
      image,
      images: images || [],
      stock: stock || 0,
      sku: productSku,
      variants: processedVariants,
      hasVariants: hasVariants || processedVariants.length > 0,
    });

    await product.save();
    
    // Return with computed fields
    const now = new Date();
    const hasDiscount = product.discountPercent > 0;
    const saleStarted = !product.saleStart || new Date(product.saleStart) <= now;
    const saleEnded = !product.saleEnd || new Date(product.saleEnd) >= now;
    
    res.status(201).json({
      ...product.toObject(),
      hasDiscount: hasDiscount && saleStarted && saleEnded,
      finalPrice,
      originalPrice: price,
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT update product
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const {
      discountPercent,
      saleStart,
      saleEnd,
      price,
      variants,
      hasVariants,
      ...updateData
    } = req.body;

    // Validate discount if provided
    if (discountPercent !== undefined && (discountPercent < 0 || discountPercent > 99)) {
      return res.status(400).json({ error: 'Discount must be between 0 and 99' });
    }

    // Validate sale dates if discount is being set
    if (discountPercent > 0 && saleStart && saleEnd) {
      const startDate = new Date(saleStart);
      const endDate = new Date(saleEnd);
      if (startDate >= endDate) {
        return res.status(400).json({ error: 'Sale start date must be before sale end date' });
      }
    }

    // Build update object with discount fields
    const updateObj: any = { ...updateData };
    
    // Include price if provided
    if (price !== undefined) {
      updateObj.price = price;
    }
    
    if (discountPercent !== undefined) {
      updateObj.discountPercent = discountPercent;
      if (discountPercent === 0) {
        updateObj.saleStart = null;
        updateObj.saleEnd = null;
      } else {
        updateObj.saleStart = saleStart || updateObj.saleStart || null;
        updateObj.saleEnd = saleEnd || updateObj.saleEnd || null;
      }
    }

    // Handle variants update
    if (variants !== undefined) {
      // Get existing product to use its SKU for variant SKUs
      const existingProduct = await Product.findById(req.params.id);
      const baseSku = existingProduct?.sku || generateUniqueSKU();
      
      updateObj.variants = variants.map((variant: any) => ({
        ...variant,
        sku: variant.sku || `${baseSku}-${variant.color?.toUpperCase() || 'VAR'}`,
      }));
      updateObj.hasVariants = hasVariants !== undefined ? hasVariants : variants.length > 0;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateObj,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Return with computed fields
    const now = new Date();
    const hasDiscountFlag = product.discountPercent > 0;
    const saleStarted = !product.saleStart || new Date(product.saleStart) <= now;
    const saleEnded = !product.saleEnd || new Date(product.saleEnd) >= now;
    const finalPrice = hasDiscountFlag && saleStarted && saleEnded
      ? product.price * (1 - product.discountPercent / 100)
      : product.price;
    
    res.json({
      ...product.toObject(),
      hasDiscount: hasDiscountFlag && saleStarted && saleEnded,
      finalPrice,
      originalPrice: product.price,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// POST bulk import products
router.post('/bulk-import', async (req: Request, res: Response) => {
  try {
    const { products } = req.body;
    
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'Products array is required' });
    }

    const results = await Product.insertMany(products, { ordered: false });
    res.status(201).json({ 
      message: 'Products imported successfully',
      count: results.length,
      products: results
    });
  } catch (error) {
    console.error('Error importing products:', error);
    res.status(500).json({ error: 'Failed to import products' });
  }
});

export default router;
