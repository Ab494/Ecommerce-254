import mongoose from 'mongoose';

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
  }
);

export default mongoose.models.Product || mongoose.model('Product', productSchema);

// TypeScript interfaces for frontend use
export interface ProductVariant {
  _id?: string;
  color: 'Black' | 'Cyan' | 'Magenta' | 'Yellow' | 'White' | 'Red' | 'Blue' | 'Green' | 'Other';
  price?: number | null;
  stock: number;
  sku?: string;
  image?: string | null;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPercent?: number;
  saleStart?: Date | null;
  saleEnd?: Date | null;
  category: string;
  image: string;
  images?: string[];
  stock: number;
  sku?: string;
  featured?: boolean;
  variants?: ProductVariant[];
  hasVariants?: boolean;
  // Computed fields
  finalPrice?: number;
  hasDiscount?: boolean;
  originalPrice?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
