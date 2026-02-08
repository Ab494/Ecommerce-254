import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Add computed discount fields
    const now = new Date();
    const hasDiscount = product.discountPercent > 0;
    const saleStarted = !product.saleStart || new Date(product.saleStart) <= now;
    const saleEnded = !product.saleEnd || new Date(product.saleEnd) >= now;
    const isDiscountActive = hasDiscount && saleStarted && saleEnded;

    return NextResponse.json({
      ...product.toObject(),
      hasDiscount: isDiscountActive,
      finalPrice: isDiscountActive 
        ? product.price * (1 - product.discountPercent / 100) 
        : product.price,
      originalPrice: product.price,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Extract discount-related fields
    const { discountPercent, saleStart, saleEnd, ...updateData } = body;

    // Validate discount if provided
    if (discountPercent !== undefined && (discountPercent < 0 || discountPercent > 99)) {
      return NextResponse.json(
        { error: 'Discount must be between 0 and 99' },
        { status: 400 }
      );
    }

    // Build update object with discount fields
    const updateObj: any = { ...updateData };
    
    if (discountPercent !== undefined) {
      updateObj.discountPercent = discountPercent;
      if (discountPercent === 0) {
        updateObj.saleStart = null;
        updateObj.saleEnd = null;
      } else {
        updateObj.saleStart = saleStart || null;
        updateObj.saleEnd = saleEnd || null;
      }
    }

    const product = await Product.findByIdAndUpdate(id, updateObj, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Add computed discount fields
    const now = new Date();
    const hasDiscount = product.discountPercent > 0;
    const saleStarted = !product.saleStart || new Date(product.saleStart) <= now;
    const saleEnded = !product.saleEnd || new Date(product.saleEnd) >= now;
    const isDiscountActive = hasDiscount && saleStarted && saleEnded;

    return NextResponse.json({
      ...product.toObject(),
      hasDiscount: isDiscountActive,
      finalPrice: isDiscountActive 
        ? product.price * (1 - product.discountPercent / 100) 
        : product.price,
      originalPrice: product.price,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
