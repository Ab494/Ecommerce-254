"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const SAMPLE_PRODUCTS = [
  {
    code: "BTD100BK",
    name: "Brother Ink - Black",
    category: "INK BOTTLE",
    priceExVAT: 1351.05,
    priceIncVAT: 1567.22,
    availability: "New",
    image: "/images/products/brother-ink-bottle.jpg",
  },
  {
    code: "BTD100C",
    name: "Brother Ink - Cyan",
    category: "INK BOTTLE",
    priceExVAT: 1134.89,
    priceIncVAT: 1316.47,
    availability: "New",
    image: "/images/products/brother-ink-bottle.jpg",
  },
  {
    code: "BTD100M",
    name: "Brother Ink - Magenta",
    category: "INK BOTTLE",
    priceExVAT: 1134.89,
    priceIncVAT: 1316.47,
    availability: "New",
    image: "/images/products/brother-ink-bottle.jpg",
  },
  {
    code: "BTD100Y",
    name: "Brother Ink - Yellow",
    category: "INK BOTTLE",
    priceExVAT: 1134.89,
    priceIncVAT: 1316.47,
    availability: "New",
    image: "/images/products/brother-ink-bottle.jpg",
  },
  {
    code: "BT5000C",
    name: "Brother Ink - Cyan (BT5000)",
    category: "INK BOTTLE",
    priceExVAT: 928.55,
    priceIncVAT: 1077.11,
    availability: "In Stock",
    image: "/images/products/brother-ink-bottle.jpg",
  },
  {
    code: "BT5000M",
    name: "Brother Ink - Magenta (BT5000)",
    category: "INK BOTTLE",
    priceExVAT: 928.55,
    priceIncVAT: 1077.11,
    availability: "In Stock",
    image: "/images/products/brother-ink-bottle.jpg",
  },
  {
    code: "BT5000Y",
    name: "Brother Ink - Yellow (BT5000)",
    category: "INK BOTTLE",
    priceExVAT: 928.55,
    priceIncVAT: 1077.11,
    availability: "In Stock",
    image: "/images/products/brother-ink-bottle.jpg",
  },
  {
    code: "BTD60BK",
    name: "Brother Ink - Black (BTD60)",
    category: "INK BOTTLE",
    priceExVAT: 972.24,
    priceIncVAT: 1127.8,
    availability: "No Stock",
    image: "/images/products/brother-ink-bottle.jpg",
  },
  {
    code: "DR-2305",
    name: "Brother Drum - Black",
    category: "DRUM",
    priceExVAT: 8318.22,
    priceIncVAT: 9649.14,
    availability: "In Stock",
    image: "/images/products/brother-drum.jpg",
  },
  {
    code: "DR-273CL",
    name: "Brother Drum - Contains Black/Cyan/Magenta/Yellow",
    category: "DRUM",
    priceExVAT: 12960.95,
    priceIncVAT: 15034.71,
    availability: "In Stock",
    image: "/images/products/brother-drum.jpg",
  },
  {
    code: "TN-2305",
    name: "Brother Toner Approx 1200 Pages",
    category: "TONER",
    priceExVAT: 4065.72,
    priceIncVAT: 4716.24,
    availability: "In Stock",
    image: "/images/products/brother-toner-cartridge.jpg",
  },
  {
    code: "TN-2355",
    name: "Brother Toner Approx 2600 Pages",
    category: "TONER",
    priceExVAT: 7247.59,
    priceIncVAT: 8407.21,
    availability: "In Stock",
    image: "/images/products/brother-toner-cartridge.jpg",
  },
  {
    code: "TN-273BK",
    name: "Brother Black Toner Cartridge",
    category: "TONER",
    priceExVAT: 9865.8,
    priceIncVAT: 11444.33,
    availability: "In Stock",
    image: "/images/products/brother-toner-cartridge.jpg",
  },
  {
    code: "TN-273C",
    name: "Brother Cyan Toner Cartridge",
    category: "TONER",
    priceExVAT: 7931.33,
    priceIncVAT: 9200.34,
    availability: "In Stock",
    image: "/images/products/brother-toner-cartridge.jpg",
  },
  {
    code: "TN-273M",
    name: "Brother Magenta Toner Cartridge",
    category: "TONER",
    priceExVAT: 7931.33,
    priceIncVAT: 9200.34,
    availability: "In Stock",
    image: "/images/products/brother-toner-cartridge.jpg",
  },
  {
    code: "TN-273Y",
    name: "Brother Yellow Toner Cartridge",
    category: "TONER",
    priceExVAT: 7931.33,
    priceIncVAT: 9200.34,
    availability: "In Stock",
    image: "/images/products/brother-toner-cartridge.jpg",
  },
  {
    code: "MFC-T4500DW",
    name: "MFC-T4500DW A3 Ink Tank Printer",
    category: "INK TANK PRINTER",
    priceExVAT: 82082.16,
    priceIncVAT: 95215.31,
    availability: "In Stock",
    image: "/images/products/brother-ink-tank-printer.jpg",
  },
  {
    code: "DCP-T220",
    name: "DCP-T220 Ink Tank Printer",
    category: "INK TANK PRINTER",
    priceExVAT: 15202.27,
    priceIncVAT: 17634.63,
    availability: "In Stock",
    image: "/images/products/brother-ink-tank-printer.jpg",
  },
  {
    code: "DCP-T420W",
    name: "DCP-T420W Ink Tank Printer",
    category: "INK TANK PRINTER",
    priceExVAT: 16616.44,
    priceIncVAT: 19275.06,
    availability: "In Stock",
    image: "/images/products/brother-ink-tank-printer.jpg",
  },
  {
    code: "DCP-T530DW",
    name: "DCP-T530DW Ink Tank Printer",
    category: "INK TANK PRINTER",
    priceExVAT: 20505.39,
    priceIncVAT: 23786.25,
    availability: "New",
    image: "/images/products/brother-ink-tank-printer.jpg",
  },
  {
    code: "DCP-T730DW",
    name: "DCP-T730DW Ink Tank Printer",
    category: "INK TANK PRINTER",
    priceExVAT: 29167.15,
    priceIncVAT: 33833.89,
    availability: "New",
    image: "/images/products/brother-ink-tank-printer.jpg",
  },
  {
    code: "DCP-T720DW",
    name: "DCP-T720DW Ink Tank Printer",
    category: "INK TANK PRINTER",
    priceExVAT: 29707.56,
    priceIncVAT: 34460.77,
    availability: "In Stock",
    image: "/images/products/brother-ink-tank-printer.jpg",
  },
  {
    code: "DCP-T830DW",
    name: "DCP-T830DW Ink Tank Printer",
    category: "INK TANK PRINTER",
    priceExVAT: 37121.82,
    priceIncVAT: 43061.32,
    availability: "New",
    image: "/images/products/brother-ink-tank-printer.jpg",
  },
  {
    code: "MFC-T930DW",
    name: "MFC-T930DW Ink Tank Printer",
    category: "INK TANK PRINTER",
    priceExVAT: 37950.12,
    priceIncVAT: 44022.14,
    availability: "In Stock",
    image: "/images/products/brother-ink-tank-printer.jpg",
  },
  {
    code: "MFC-T920DW",
    name: "MFC-T920DW Ink Tank Printer",
    category: "INK TANK PRINTER",
    priceExVAT: 37950.12,
    priceIncVAT: 44022.14,
    availability: "In Stock",
    image: "/images/products/brother-ink-tank-printer.jpg",
  },
  {
    code: "MFC-L3760CDW",
    name: "MFC-L3760CDW Color Laser Printer",
    category: "LASER PRINTER",
    priceExVAT: 42424.94,
    priceIncVAT: 49212.93,
    availability: "New",
    image: "/images/products/brother-laser-printer.jpg",
  },
  {
    code: "DCP-L2540DW",
    name: "DCP-L2540DW Mono Laser Printer",
    category: "LASER PRINTER",
    priceExVAT: 25631.74,
    priceIncVAT: 29732.81,
    availability: "In Stock",
    image: "/images/products/brother-laser-printer.jpg",
  },
  {
    code: "HL-L2365DW",
    name: "HL-L2365DW Mono Laser Printer",
    category: "LASER PRINTER",
    priceExVAT: 31818.71,
    priceIncVAT: 36909.7,
    availability: "In Stock",
    image: "/images/products/brother-laser-printer.jpg",
  },
];

export default function BulkImport() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleBulkImport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/products/bulk-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(SAMPLE_PRODUCTS),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `Successfully imported ${data.products.length} products`,
        });
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to import products",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Bulk Import Brother Products</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Import {SAMPLE_PRODUCTS.length} Brother printer products with all details and images.
        </p>
      </div>

      <Button
        onClick={handleBulkImport}
        disabled={isLoading}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isLoading ? "Importing..." : `Import ${SAMPLE_PRODUCTS.length} Products`}
      </Button>
    </div>
  );
}
