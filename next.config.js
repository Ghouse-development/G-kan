/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['dtdtexkwbirnpqkwzzxl.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  // Optimize for Vercel deployment
  swcMinify: true,
  reactStrictMode: true,

  // Environment variable validation
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Reduce build size
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', 'openai'],
  },

  // Production optimization
  poweredByHeader: false,
  compress: true,
}

module.exports = nextConfig
