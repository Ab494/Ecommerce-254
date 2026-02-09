'use client';

import { useState, useRef } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText } from "lucide-react"

// Partner logos - add actual logo images to public/images/partners/
const partners = [
  { name: 'Vivo', logo: '/images/partners/vivo.png', alt: 'Vivo', fallback: 'Vivo' },
  { name: 'Tecno', logo: '/images/partners/tecno.png', alt: 'Tecno', fallback: 'Tecno' },
  { name: 'Infinix', logo: '/images/partners/infinix.png', alt: 'Infinix', fallback: 'Infinix' },
  { name: 'Brother', logo: '/images/partners/brother.png', alt: 'Brother', fallback: 'Brother' },
  { name: 'Hikvision', logo: '/images/partners/hikvision.png', alt: 'Hikvision', fallback: 'Hikvision' },
  { name: 'Samsung', logo: '/images/partners/samsung.png', alt: 'Samsung', fallback: 'Samsung' },
  { name: 'Xiaomi', logo: '/images/partners/xiaomi.png', alt: 'Xiaomi', fallback: 'Xiaomi' },
  { name: 'Anker', logo: '/images/partners/anker.png', alt: 'Anker', fallback: 'Anker' },
]

function PartnerLogo({ partner }: { partner: typeof partners[0] }) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className="flex items-center justify-center px-4 py-4 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 border border-slate-500 shadow-lg">
        <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
          {partner.fallback}
        </span>
      </div>
    );
  }

  return (
    <div className="h-14 w-32 grayscale hover:grayscale-0 transition-all duration-300">
      <Image
        src={partner.logo}
        alt={partner.alt}
        fill
        className="object-contain p-2"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

export function HeroSection() {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Duplicate partners for seamless infinite scroll
  const duplicatedPartners = [...partners, ...partners, ...partners];

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-aqua-50 to-teal-100 py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d948810_1px,transparent_1px),linear-gradient(to_bottom,#0d948810_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Powering Smart Commerce & Enterprise Solutions
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground sm:text-xl">
              Electronics, CCTV Surveillance, Home Appliances, Office Equipment & VAS Services — delivered professionally to businesses across Kenya.
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

      {/* Animated Partners Section */}
      <section 
        className="bg-slate-900 py-12 border-b relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Gradient masks for smooth fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-900 text-sm font-bold mb-3 shadow-lg">
              OFFICIAL PARTNERS
            </span>
            <h3 className="text-2xl font-bold text-white">Trusted by Industry Leaders</h3>
          </div>
          
          <div className="overflow-hidden">
            <div 
              ref={scrollRef}
              className="flex gap-8 animate-scroll whitespace-nowrap"
              style={{ 
                animationPlayState: isPaused ? 'paused' : 'running',
              }}
            >
              {duplicatedPartners.map((partner, index) => (
                <div
                  key={`${partner.name}-${index}`}
                  className="group relative flex-shrink-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <div className="relative flex items-center justify-center px-8 py-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 shadow-xl hover:shadow-2xl hover:border-teal-400/50 transition-all duration-300 hover:-translate-y-2">
                    <PartnerLogo partner={partner} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </>
  )
}
