'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText } from "lucide-react"

// Partner logos - add the actual logo images to public/images/partners/
const partners = [
  { name: 'Vivo', logo: '/images/partners/vivo.png', category: 'Smartphones' },
  { name: 'Tecno', logo: '/images/partners/tecno.png', category: 'Smartphones' },
  { name: 'Infinix', logo: '/images/partners/infinix.png', category: 'Smartphones' },
  { name: 'Brother', logo: '/images/partners/brother.jpeg', category: 'Office Equipment' },
  { name: 'Hikvision', logo: '/images/partners/hikvision.png', category: 'CCTV & Security' },
  { name: 'Samsung', logo: '/images/partners/samsung.png', category: 'Appliances & Mobile' },
  { name: 'Xiaomi', logo: '/images/partners/xiaomi.png', category: 'Smart Home' },
  { name: 'Anker', logo: '/images/partners/anker.png', category: 'Accessories' },
]

// Animation variants for staggered entrance - one after another
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    }
  }
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6
    }
  }
}

export function HeroSection() {
  const [isPaused, setIsPaused] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Trigger animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Hero Content Section */}
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

      {/* Animated Partners Section - Staggered One After Another */}
      <section
        className="bg-slate-900 py-16 border-b relative overflow-hidden"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold mb-3 border border-teal-500/20 shadow-sm">
              OFFICIAL PARTNERS
            </span>
            <h3 className="text-3xl font-bold text-white tracking-tight">Trusted Industry Leaders</h3>
          </div>
          
          {/* Scrolling Partners - Duplicate for seamless loop */}
          <div className="overflow-hidden">
            <div className="flex animate-scroll gap-6">
              {/* First set of partners */}
              {partners.map((partner, index) => (
                <div
                  key={`first-${partner.name}`}
                  className="flex-shrink-0 group animate-fade-in-up"
                  style={{
                    animationDelay: `${index * 0.15}s`
                  }}
                >
                  <div className="w-48 h-40 relative flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 shadow-xl group-hover:border-teal-500/40 group-hover:bg-slate-800 transition-all duration-300">
                    <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500" />
                    <div className="relative h-14 w-28 grayscale group-hover:grayscale-0 transition-all duration-500">
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        fill
                        className="object-contain pointer-events-none"
                      />
                    </div>
                    <p className="text-slate-400 text-sm font-medium group-hover:text-teal-400 transition-colors mt-3">
                      {partner.name}
                    </p>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {partner.category}
                    </span>
                  </div>
                </div>
              ))}
              {/* Duplicate for seamless scroll */}
              {partners.map((partner, index) => (
                <div
                  key={`second-${partner.name}`}
                  className="flex-shrink-0 group animate-fade-in-up"
                  style={{
                    animationDelay: `${(partners.length + index) * 0.15}s`
                  }}
                >
                  <div className="w-48 h-40 relative flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 shadow-xl group-hover:border-teal-500/40 group-hover:bg-slate-800 transition-all duration-300">
                    <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500" />
                    <div className="relative h-14 w-28 grayscale group-hover:grayscale-0 transition-all duration-500">
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        fill
                        className="object-contain pointer-events-none"
                      />
                    </div>
                    <p className="text-slate-400 text-sm font-medium group-hover:text-teal-400 transition-colors mt-3">
                      {partner.name}
                    </p>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {partner.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}