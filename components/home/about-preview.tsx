import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2, Globe, Users, ArrowRight } from "lucide-react"

export function AboutPreview() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              About Us
            </span>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Technology-Driven Commerce for Modern Businesses
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              254 Convex Comm LTD is a leading ecommerce supplier serving businesses throughout Kenya. We specialize in providing high-quality electronics, security solutions, home appliances, and office equipment with a focus on professional delivery and customer satisfaction.
            </p>
            <p className="mt-4 text-pretty text-muted-foreground">
              Our commitment to excellence and technology-driven approach ensures that your business receives the best products at competitive prices, with reliable service you can count on.
            </p>
            <Button variant="outline" className="mt-6 gap-2 bg-transparent" asChild>
              <Link href="/about">
                Learn More About Us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-2xl bg-muted p-6 transition-all hover:shadow-lg">
              <Building2 className="h-10 w-10 text-primary" />
              <h3 className="mt-4 font-semibold text-foreground">Enterprise Solutions</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Tailored solutions for businesses of all sizes
              </p>
            </div>
            <div className="rounded-2xl bg-muted p-6 transition-all hover:shadow-lg">
              <Globe className="h-10 w-10 text-secondary" />
              <h3 className="mt-4 font-semibold text-foreground">Kenya-Wide Delivery</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Professional delivery across the country
              </p>
            </div>
            <div className="col-span-2 rounded-2xl bg-muted p-6 transition-all hover:shadow-lg">
              <Users className="h-10 w-10 text-primary" />
              <h3 className="mt-4 font-semibold text-foreground">Corporate Clients Focus</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Dedicated support and services designed specifically for B2B partnerships and corporate procurement needs
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
