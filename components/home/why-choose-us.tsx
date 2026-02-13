'use client';

import { motion } from 'framer-motion';
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

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12, // Delay between each card appearing
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export function WhyChooseUs() {
  return (
    <section className="bg-slate-50 py-20 sm:py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Animated Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-block rounded-full bg-teal-500/10 px-4 py-1.5 text-sm font-bold text-teal-600 border border-teal-500/20 shadow-sm">
            Why Choose Us
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Built for Business Excellence
          </h2>
          <p className="mt-4 text-pretty text-slate-600">
            We understand what businesses need. That's why we've built our platform with features that matter.
          </p>
        </motion.div>

        {/* Animated Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover={{ y: -10 }} // Elevates the card on hover
                className="group relative flex flex-col gap-4 rounded-2xl bg-white p-8 border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-2xl hover:border-teal-500/30"
              >
                {/* Internal Glow Effect */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.08),transparent)] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-all duration-300 group-hover:bg-teal-500 group-hover:text-white group-hover:scale-110 shadow-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-teal-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}