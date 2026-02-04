import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone, Video, Home, Printer, ArrowRight } from "lucide-react"
import Link from "next/link"

const categories = [
  {
    icon: Smartphone,
    title: "Electronics",
    description: "Phones, tablets, laptops, and accessories from leading global brands. Perfect for corporate procurement and office setups.",
    items: ["Smartphones & Feature Phones", "Laptops & Desktops", "Tablets & iPads", "Phone Accessories", "Computer Peripherals"],
    color: "from-primary to-primary/80",
  },
  {
    icon: Video,
    title: "CCTV Surveillance",
    description: "Complete security solutions for businesses, offices, and residential properties. Professional-grade equipment with installation support.",
    items: ["IP Cameras", "DVR/NVR Systems", "Outdoor Cameras", "Motion Sensors", "Complete Security Kits"],
    color: "from-secondary to-secondary/80",
  },
  {
    icon: Home,
    title: "Home Appliances",
    description: "Quality appliances for modern offices and homes. Energy-efficient products from trusted manufacturers.",
    items: ["Refrigerators & Freezers", "Microwaves & Ovens", "Water Dispensers", "Air Conditioners", "Kitchen Appliances"],
    color: "from-primary to-primary/80",
  },
  {
    icon: Printer,
    title: "Office Equipment",
    description: "Essential office supplies and equipment to keep your business running smoothly. Bulk orders welcome.",
    items: ["Printers & Scanners", "Toners & Cartridges", "Office Furniture", "Stationery Supplies", "Presentation Equipment"],
    color: "from-secondary to-secondary/80",
  },
]

export default function ProductsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-muted py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Our Product Categories
              </h1>
              <p className="mt-4 text-pretty text-lg text-muted-foreground">
                Explore our comprehensive range of products designed to meet all your business and enterprise needs.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Card
                    key={category.title}
                    className="group overflow-hidden border-0 bg-background shadow-md transition-all hover:shadow-xl"
                  >
                    <CardHeader className={`bg-gradient-to-r ${category.color} text-white`}>
                      <div className="flex items-center gap-4">
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                          <Icon className="h-7 w-7" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl text-white">{category.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <CardDescription className="text-base text-muted-foreground">
                        {category.description}
                      </CardDescription>
                      <ul className="mt-6 space-y-2">
                        {category.items.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Button variant="outline" className="mt-6 w-full gap-2 bg-transparent" asChild>
                        <Link href="/contact">
                          Request Quote
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="mt-16 rounded-2xl bg-muted p-8 text-center sm:p-12">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                {"Can't find what you're looking for?"}
              </h2>
              <p className="mt-3 text-muted-foreground">
                We source products from multiple suppliers. Contact us with your specific requirements and we'll provide a custom quote.
              </p>
              <Button size="lg" className="mt-6 gap-2" asChild>
                <Link href="/contact">
                  Contact Us
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
