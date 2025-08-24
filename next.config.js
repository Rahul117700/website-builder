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
    try {
      // Get base URL from environment variable
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      
      // Fetch dynamic redirects from database
      const response = await fetch(`${baseUrl}/api/dynamic-redirects`);
      const data = await response.json();
      
      if (data.success && data.redirects) {
        console.log(`✅ Loaded ${data.count} dynamic redirects from database`);
        return data.redirects;
      } else {
        console.log('⚠️ Using fallback redirects');
        // Fallback redirects if API fails
        return [
          {
            source: '/',
            has: [{ type: 'host', value: 'nextskillpro.com' }],
            destination: '/s/nextskillpro',
            permanent: false,
          },
          {
            source: '/',
            has: [{ type: 'host', value: 'agoda.com' }],
            destination: '/s/agoda',
            permanent: false,
          },
        ];
      }
    } catch (error) {
      console.error('❌ Error loading dynamic redirects:', error);
      // Fallback redirects if API fails
      return [
        {
          source: '/',
          has: [{ type: 'host', value: 'nextskillpro.com' }],
          destination: '/s/nextskillpro',
          permanent: false,
        },
        {
          source: '/',
          has: [{ type: 'host', value: 'agoda.com' }],
          destination: '/s/agoda',
          permanent: false,
        },
      ];
    }
  },
  images: {
    domains: [
      'images.pexels.com',
      ...(process.env.IMAGE_DOMAINS?.split(',').map(domain => domain.trim()) || []),
      ...(process.env.NEXTAUTH_URL ? [process.env.NEXTAUTH_URL.replace(/^https?:\/\//, '')] : [])
    ].filter(Boolean),
  },
  async rewrites() {
    return [
      // Rewrite API requests to the Express server
      {
        source: '/api/v1/:path*',
        destination: `${process.env.EXPRESS_SERVER_URL || 'http://localhost:3001'}/api/v1/:path*`,
      },
    ];
  },
  // Enable experimental features for App Router
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
