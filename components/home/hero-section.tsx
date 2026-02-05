import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-aqua-50 to-teal-100 py-20 sm:py-28 lg:py-32">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d948810_1px,transparent_1px),linear-gradient(to_bottom,#0d948810_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Powering Smart Commerce & Enterprise Solutions
          </h1>
          <p className="mt-6 text-pretty text-lg text-muted-foreground sm:text-xl">
            Electronics, CCTV Surveillance, Home Appliances & Office Equipment — delivered professionally to businesses across Kenya.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="gap-2 px-8" asChild>
              <Link href="/contact">
                <FileText className="h-4 w-4" />
                Request a Quote
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 px-8 bg-transparent" asChild>
              <Link href="/products">
                View Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
