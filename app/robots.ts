import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/checkout/', '/cart/'],
    },
    sitemap: 'https://254convexcomltd.co.ke/sitemap.xml',
  }
}
