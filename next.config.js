/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  async rewrites() {
    return [
      // Rewrite API requests to the Express server
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:3001/api/v1/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  // Handle subdomain routing
  async redirects() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: '(?<subdomain>[a-zA-Z0-9-]+)\\.yourdomain\\.com',
          },
        ],
        destination: '/sites/:subdomain',
        permanent: true,
      },
    ];
  },
  // Enable experimental features for App Router
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
