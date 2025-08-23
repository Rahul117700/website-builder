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
      // Add more domains here as needed
      // Example for a new domain:
      // {
      //   source: '/',
      //   has: [
      //     {
      //       type: 'host',
      //       value: 'newsite.com',
      //     },
      //   ],
      //   destination: '/s/newsite',
      //   permanent: false,
      // },
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
  // Enable experimental features for App Router
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
