'use client';

import { motion } from 'framer-motion'; // Added Framer Motion
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Video, Home, MessageCircle, ArrowRight } from "lucide-react"

const segments = [
  {
    icon: Smartphone,
    title: "Electronics",
    description: "Phones, tablets, laptops, and accessories from leading brands for your business needs.",
    color: "from-blue-500/20",
    iconColor: "text-blue-600",
  },
  {
    icon: Video,
    title: "CCTV Surveillance",
    description: "Complete security solutions including cameras, DVRs, and professional installation support.",
    color: "from-teal-500/20",
    iconColor: "text-teal-600",
  },
  {
    icon: Home,
    title: "Home Appliances",
    description: "Quality appliances for offices and homes — from refrigerators to microwaves.",
    color: "from-emerald-500/20",
    iconColor: "text-emerald-600",
  },
  {
    icon: MessageCircle,
    title: "VAS Services",
    description: "Bulk SMS, Airtime Purchase, Paybill Hosting & Digital Solutions for your business.",
    color: "from-cyan-500/20",
    iconColor: "text-cyan-600",
  },
]

// Animation Logic
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

export function BusinessSegments() {
  return (
    <section className="bg-slate-50 py-20 sm:py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Animated Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <span className="inline-block rounded-full bg-teal-500/10 px-4 py-1.5 text-sm font-bold text-teal-600 border border-teal-500/20">
            Business Segments
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Products & Services
          </h2>
          <p className="mt-4 text-pretty text-slate-600">
            We offer a wide range of products and value-added services to meet all your enterprise needs.
          </p>
        </motion.div>

        {/* Animated Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {segments.map((segment) => {
            const Icon = segment.icon
            return (
              <motion.div
                key={segment.title}
                variants={cardVariants}
                whileHover={{ y: -12 }} // Interactive lift
                className="group h-full"
              >
                <Card className="relative h-full overflow-hidden border-0 bg-white shadow-sm transition-all duration-300 group-hover:shadow-2xl group-hover:border-teal-500/20">
                  {/* Dynamic Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${segment.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <CardHeader className="relative z-10">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 transition-all duration-300 group-hover:bg-white group-hover:shadow-md">
                      <Icon className={`h-6 w-6 ${segment.iconColor} transition-transform group-hover:scale-110`} />
                    </div>
                    <CardTitle className="text-lg mt-4 font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                      {segment.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="relative z-10">
                    <CardDescription className="text-slate-600 leading-relaxed mb-4">
                      {segment.description}
                    </CardDescription>
                    
                    <div className="flex items-center text-teal-600 font-bold text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300">
                      Explore Segment <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}