import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Megaphone, ShoppingCart } from "lucide-react"

const solutions = [
  {
    icon: Users,
    title: "HR Services",
    description: "Streamline your recruitment and HR operations with our professional support services.",
  },
  {
    icon: Megaphone,
    title: "Marketing Support",
    description: "Strategic marketing assistance to help grow your business presence and reach.",
  },
  {
    icon: ShoppingCart,
    title: "Procurement Consulting",
    description: "Expert guidance on procurement strategies and vendor management for optimal outcomes.",
  },
]

export function ProfessionalSolutions() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary">
            Professional Solutions
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Beyond Products — Complete Business Support
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            We go beyond product supply to offer comprehensive business solutions that help your organization thrive.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {solutions.map((solution) => {
            const Icon = solution.icon
            return (
              <Card
                key={solution.title}
                className="group border border-border bg-background shadow-sm transition-all hover:shadow-lg hover:border-primary/20"
              >
                <CardHeader>
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white">
                    <Icon className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-xl">{solution.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {solution.description}
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
