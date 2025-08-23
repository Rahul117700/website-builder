/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  images: {
    domains: ['images.pexels.com', 'localhost'],
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
  // Handle domain routing
  async redirects() {
    return [
      // Redirect nextskillpro.com to the subdomain route
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'nextskillpro.com',
          },
        ],
        destination: '/s/nextskillpro',
        permanent: false,
      },
      // Redirect www.nextskillpro.com to the subdomain route
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'www.nextskillpro.com',
          },
        ],
        destination: '/s/nextskillpro',
        permanent: false,
      },
      // Handle subdomain routing (legacy)
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
