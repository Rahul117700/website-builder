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
  // Comprehensive domain routing - this will work reliably in production
  async redirects() {
    return [
      // nextskillpro.com redirects
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
      // agoda.com redirects
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'agoda.com',
          },
        ],
        destination: '/s/agoda',
        permanent: false,
      },
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'www.agoda.com',
          },
        ],
        destination: '/s/agoda',
        permanent: false,
      },
      // Dynamic domain resolution for any other domains
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: '(?!localhost|127\\.0\\.0\\.1|.*\\.local|.*\\.test).*',
          },
        ],
        destination: '/api/resolve-domain-redirect',
        permanent: false,
      },
    ];
  },
  // Enable experimental features for App Router
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
