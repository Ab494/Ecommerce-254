import { Store, Settings, Zap, FileText, BarChart3, Building2 } from "lucide-react"

const features = [
  {
    icon: Store,
    title: "Independent Ecommerce Platform",
    description: "Our own platform means better prices and direct support for your business.",
  },
  {
    icon: Settings,
    title: "Customized Solutions",
    description: "Tailored products and services designed to meet your specific needs.",
  },
  {
    icon: Zap,
    title: "Fast Quotations",
    description: "Quick turnaround on quotes so you can make decisions confidently.",
  },
  {
    icon: FileText,
    title: "Invoice Generation",
    description: "Professional invoicing system for seamless financial transactions.",
  },
  {
    icon: BarChart3,
    title: "Reporting Dashboard",
    description: "Track your orders and spending with our comprehensive dashboard.",
  },
  {
    icon: Building2,
    title: "Corporate Clients Focus",
    description: "Dedicated account management for B2B partnerships.",
  },
]

export function WhyChooseUs() {
  return (
    <section className="bg-muted py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Why Choose Us
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for Business Excellence
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            We understand what businesses need. That's why we've built our platform with features that matter.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group flex gap-4 rounded-xl bg-background p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex-shrink-0">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}