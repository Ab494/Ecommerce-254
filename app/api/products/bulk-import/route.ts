import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import { NextRequest, NextResponse } from "next/server";

interface BulkProductInput {
  code: string;
  name: string;
  category: string;
  priceExVAT: number;
  priceIncVAT: number;
  availability: string;
  image: string;
  description?: string;
  stock?: number;
}

export async function POST(req: NextRequest) {
  try {
    const products: BulkProductInput[] = await req.json();

    await connectDB();

    const createdProducts = await Product.insertMany(
      products.map((product) => ({
        code: product.code,
        name: product.name,
        description:
          product.description ||
          `${product.name} - Professional printing supplies from Brother`,
        category: product.category,
        price: product.priceIncVAT,
        originalPrice: product.priceExVAT,
        image: product.image,
        stock:
          product.stock ||
          (product.availability === "No Stock"
            ? 0
            : product.availability === "New"
              ? 50
              : 100),
        availability: product.availability,
      }))
    );

    return NextResponse.json(
      {
        success: true,
        message: `Successfully imported ${createdProducts.length} products`,
        products: createdProducts,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Import failed",
      },
      { status: 500 }
    );
  }
}
