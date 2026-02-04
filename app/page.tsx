import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/home/hero-section"
import { AboutPreview } from "@/components/home/about-preview"
import { BusinessSegments } from "@/components/home/business-segments"
import { ProfessionalSolutions } from "@/components/home/professional-solutions"
import { WhyChooseUs } from "@/components/home/why-choose-us"
import { CTASection } from "@/components/home/cta-section"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <AboutPreview />
        <BusinessSegments />
        <ProfessionalSolutions />
        <WhyChooseUs />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
