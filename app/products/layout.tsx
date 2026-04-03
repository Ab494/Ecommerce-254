import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop Products | Electronics, CCTV & Appliances',
  description: 'Browse our wide selection of electronics, CCTV surveillance systems, home appliances, and office equipment. Fast delivery across Kenya.',
  keywords: ['buy electronics Kenya', 'CCTV cameras for sale', 'shop appliances online Kenya', 'office equipment supplier Kenya', ' electronics online store'],
  openGraph: {
    title: 'Shop Products | 254 Convex Communication Ltd',
    description: 'Browse our wide selection of electronics, CCTV surveillance systems, home appliances, and office equipment.',
    type: 'website',
  },
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}