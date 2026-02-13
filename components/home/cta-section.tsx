import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary px-6 py-16 sm:px-16 sm:py-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:3rem_3rem]" />
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Need a Customized Quotation?
            </h2>
            <p className="mt-4 text-pretty text-lg text-white/90">
              Let us know your requirements and we'll provide a tailored quote within 24 hours. Your peace of mind is our priority.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 px-8 bg-white text-primary hover:bg-white/90"
                asChild
              >
                <Link href="/contact">
                  Get Your Quote
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 px-8 border-white/30 text-white hover:bg-white/10 bg-transparent"
                asChild
              >
                <a href="https://wa.me/254722745703" target="_blank" rel="noopener noreferrer">
                  WhatsApp Us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
