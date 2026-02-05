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

// Map incoming categories to valid enum values
function mapCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    // INK BOTTLE variations
    'INK BOTTLE': 'Office Equipment',
    'INK BOTTLES': 'Office Equipment',
    'INK CARTRIDGE': 'Office Equipment',
    'INK CARTRIDGES': 'Office Equipment',
    'INK TANK PRINTER': 'Office Equipment',
    'INK TANK PRINTERS': 'Office Equipment',
    'LASER PRINTER': 'Office Equipment',
    'LASER PRINTERS': 'Office Equipment',
    'DRUM': 'Office Equipment',
    'DRUMS': 'Office Equipment',
    'TONER': 'Office Equipment',
    'TONER CARTRIDGE': 'Office Equipment',
    'TONER CARTRIDGES': 'Office Equipment',
    'PRINTER': 'Office Equipment',
    'PRINTERS': 'Office Equipment',
    
    // CCTV variations
    'CCTV': 'CCTV Surveillance',
    'CAMERA': 'CCTV Surveillance',
    'CAMERAS': 'CCTV Surveillance',
    'SURVEILLANCE': 'CCTV Surveillance',
    
    // Electronics
    'LAPTOP': 'Electronics',
    'LAPTOPS': 'Electronics',
    'PHONE': 'Electronics',
    'PHONES': 'Electronics',
    'TABLET': 'Electronics',
    'TABLETS': 'Electronics',
    
    // Home Appliances
    'APPLIANCE': 'Home Appliances',
    'APPLIANCES': 'Home Appliances',
    'FRIDGE': 'Home Appliances',
    'REFRIGERATOR': 'Home Appliances',
    'MICROWAVE': 'Home Appliances',
    'AC': 'Home Appliances',
    'AIR CONDITIONER': 'Home Appliances',
  };
  
  const normalized = category.toUpperCase().trim();
  return categoryMap[normalized] || 'Office Equipment'; // Default to Office Equipment
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Support both { products: [...] } and [...] formats
    const products: BulkProductInput[] = body.products || body;

    if (!Array.isArray(products)) {
      return NextResponse.json(
        { success: false, error: 'Products array is required' },
        { status: 400 }
      );
    }

    // Use external backend API
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // Transform products to match backend format
    const transformedProducts = products.map((product) => ({
      code: product.code,
      name: product.name,
      description:
        product.description ||
        `${product.name} - Professional printing supplies from Brother`,
      category: mapCategory(product.category),
      price: product.priceIncVAT,
      image: product.image,
      stock:
        product.stock ||
        (product.availability === "No Stock"
          ? 0
          : product.availability === "New"
            ? 50
            : 100),
    }));

    const response = await fetch(`${API_URL}/api/products/bulk-import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ products: transformedProducts }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Import failed');
    }

    return NextResponse.json(result, { status: 201 });
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
