import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, Eye, Heart, Shield, Users, Zap, Award, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const values = [
  {
    icon: Shield,
    title: "Integrity",
    description: "We conduct business with honesty and transparency in all our dealings.",
  },
  {
    icon: Users,
    title: "Customer Focus",
    description: "Your success is our priority. We go above and beyond to meet your needs.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "We embrace technology to deliver smarter commerce solutions.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We strive for the highest quality in products and services.",
  },
]

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-muted py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                About 254 Convex Comm LTD
              </h1>
              <p className="mt-4 text-pretty text-lg text-muted-foreground">
                Your peace of mind is our priority
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  Our Story
                </span>
                <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Building Trust Through Technology-Driven Commerce
                </h2>
                <p className="mt-4 text-muted-foreground">
                  254 Convex Comm LTD was founded with a clear mission: to provide businesses across Kenya with reliable, high-quality products and services at competitive prices. We understand the unique challenges facing enterprises in the region, and we've built our platform to address those needs directly.
                </p>
                <p className="mt-4 text-muted-foreground">
                  As a technology-driven ecommerce supplier, we leverage modern systems to streamline procurement, ensure fast quotations, and deliver professional service that corporate clients can depend on. From electronics to security solutions, home appliances to office equipment — we're your one-stop B2B partner.
                </p>
              </div>
              <div className="flex justify-center">
                <Image
                  src="/images/logo-web.png"
                  alt="254 Convex Comm LTD Logo"
                  width={400}
                  height={400}
                  className="max-w-sm"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-muted py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-0 bg-background shadow-lg">
                <CardHeader>
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white">
                    <Target className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    To empower businesses across Kenya with reliable, affordable, and technology-driven commerce solutions. We aim to be the preferred B2B partner for enterprises seeking quality products, professional service, and seamless procurement experiences.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-background shadow-lg">
                <CardHeader>
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-primary text-white">
                    <Eye className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-2xl">Our Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    To become East Africa's leading ecommerce supplier for corporate and enterprise clients, recognized for our commitment to quality, innovation, and customer satisfaction. We envision a future where every business has access to world-class procurement solutions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                Our Values
              </span>
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                What We Stand For
              </h2>
              <p className="mt-4 text-pretty text-muted-foreground">
                Our core values guide every decision we make and every interaction we have with our clients.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => {
                const Icon = value.icon
                return (
                  <div
                    key={value.title}
                    className="group rounded-2xl border border-border bg-background p-6 text-center transition-all hover:shadow-lg hover:border-primary/20"
                  >
                    <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground">{value.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-primary to-secondary py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Heart className="mx-auto h-12 w-12 text-white/80" />
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Your Peace of Mind is Our Priority
              </h2>
              <p className="mt-4 text-pretty text-lg text-white/90">
                Partner with us and experience the difference of working with a company that truly cares about your success.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="mt-8 gap-2 bg-white text-primary hover:bg-white/90"
                asChild
              >
                <Link href="/contact">
                  Get in Touch
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
