import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Video, Home, MessageCircle, Phone, Globe } from "lucide-react"

const segments = [
  {
    icon: Smartphone,
    title: "Electronics",
    description: "Phones, tablets, laptops, and accessories from leading brands for your business needs.",
    color: "text-primary",
  },
  {
    icon: Video,
    title: "CCTV Surveillance",
    description: "Complete security solutions including cameras, DVRs, and professional installation support.",
    color: "text-secondary",
  },
  {
    icon: Home,
    title: "Home Appliances",
    description: "Quality appliances for offices and homes — from refrigerators to microwaves.",
    color: "text-primary",
  },
  {
    icon: MessageCircle,
    title: "VAS Services",
    description: "Bulk SMS, Airtime Purchase, Paybill Hosting & Digital Solutions for your business.",
    color: "text-secondary",
  },
]

export function BusinessSegments() {
  return (
    <section className="bg-muted py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Business Segments
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Products & Services
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            We offer a wide range of products and value-added services to meet all your enterprise needs.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {segments.map((segment) => {
            const Icon = segment.icon
            return (
              <Card
                key={segment.title}
                className="group border-0 bg-background shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-primary/10">
                    <Icon className={`h-6 w-6 ${segment.color}`} />
                  </div>
                  <CardTitle className="text-lg">{segment.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {segment.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
