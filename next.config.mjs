/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dbconay0k/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:3001',
  },
}

export default nextConfig
