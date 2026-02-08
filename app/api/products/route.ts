import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';

// Helper function to generate unique SKU
const generateUniqueSKU = (): string => {
  return `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

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

    return NextResponse.json(productsWithDiscounts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { 
      name, 
      description, 
      price, 
      category, 
      image, 
      stock, 
      sku,
      discountPercent,
      saleStart,
      saleEnd
    } = body;

    if (!name || !description || !price || !category || !image) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate discount
    if (discountPercent && (discountPercent < 0 || discountPercent > 99)) {
      return NextResponse.json(
        { error: 'Discount must be between 0 and 99' },
        { status: 400 }
      );
    }

    // Validate sale dates
    if (discountPercent > 0 && saleStart && saleEnd) {
      const startDate = new Date(saleStart);
      const endDate = new Date(saleEnd);
      if (startDate >= endDate) {
        return NextResponse.json(
          { error: 'Sale start date must be before sale end date' },
          { status: 400 }
        );
      }
    }

    // Generate or validate SKU
    let productSku = sku || generateUniqueSKU();
    
    if (sku) {
      const existingProduct = await Product.findOne({ sku: sku });
      if (existingProduct) {
        productSku = generateUniqueSKU();
      }
    }

    const product = new Product({
      name,
      description,
      price,
      discountPercent: discountPercent || 0,
      saleStart: discountPercent > 0 ? saleStart : null,
      saleEnd: discountPercent > 0 ? saleEnd : null,
      category,
      image,
      stock: stock || 0,
      sku: productSku,
    });

    await product.save();

    // Return with computed fields
    const now = new Date();
    const hasDiscount = product.discountPercent > 0;
    const saleStarted = !product.saleStart || new Date(product.saleStart) <= now;
    const saleEnded = !product.saleEnd || new Date(product.saleEnd) >= now;

    return NextResponse.json({
      ...product.toObject(),
      hasDiscount: hasDiscount && saleStarted && saleEnded,
      finalPrice: hasDiscount && saleStarted && saleEnded
        ? product.price * (1 - product.discountPercent / 100)
        : product.price,
      originalPrice: product.price,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
