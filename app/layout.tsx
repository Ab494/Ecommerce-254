import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/lib/cart-context'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://254convex.co.ke'),
  title: {
    default: '254 Convex Communication Ltd | Electronics, CCTV & Appliances in Kenya',
    template: '%s | 254 Convex Comm Ltd'
  },
  description: 'Leading technology-driven ecommerce supplier in Kenya. Shop electronics, CCTV surveillance systems, home appliances & office equipment with delivery across Kenya.',
  keywords: ['electronics Kenya', 'CCTV cameras Kenya', 'home appliances Kenya', 'office equipment Kenya', 'online shopping Kenya', '254 Convex', 'tech supplier Kenya'],
  authors: [{ name: '254 Convex Communication Ltd' }],
  creator: '254 Convex Communication Ltd',
  publisher: '254 Convex Communication Ltd',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: 'https://254convex.co.ke',
    siteName: '254 Convex Communication Ltd',
    title: '254 Convex Communication Ltd | Electronics, CCTV & Appliances in Kenya',
    description: 'Leading technology-driven ecommerce supplier in Kenya. Shop electronics, CCTV surveillance systems, home appliances & office equipment.',
    images: [
      {
        url: '/images/logo-web.png',
        width: 1200,
        height: 630,
        alt: '254 Convex Communication Ltd - Technology Solutions in Kenya'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '254 Convex Communication Ltd | Electronics, CCTV & Appliances in Kenya',
    description: 'Leading technology-driven ecommerce supplier in Kenya. Shop electronics, CCTV surveillance systems, home appliances & office equipment.',
    images: ['/images/logo-web.png'],
    creator: '@254Convex',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <CartProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
