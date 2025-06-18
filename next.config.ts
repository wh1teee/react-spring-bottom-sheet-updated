import type { NextConfig } from 'next'
 
const nextConfig: NextConfig = {
  // Optimize for production
  productionBrowserSourceMaps: false,
  
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Optimize bundle size  
  poweredByHeader: false,
  
  // For library development, we may want to transpile certain packages
  transpilePackages: [],
  
  // Since we're using Pages Router, ensure proper static optimization
  experimental: {
    optimizePackageImports: ['@react-spring/web', '@use-gesture/react'],
  },
  
  // Modern image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // SWC compiler options (SWC is enabled by default in Next.js 15)
  compiler: {
    // Remove console.log in production (replaces babel transform-remove-console)
    removeConsole: process.env.NODE_ENV === 'production',
  },
}
 
export default nextConfig