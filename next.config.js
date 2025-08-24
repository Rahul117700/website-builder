/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Disable Next.js caching completely
  generateEtags: false,
  poweredByHeader: false,
  compress: false,
  
  // Exclude template folders from Next.js compilation
  webpack: (config, { isServer }) => {
    // Ignore template folders during compilation
    config.module.rules.push({
      test: /\.(js|ts|tsx|jsx)$/,
      exclude: [
        /templates_start_bootstrap/,
        /node_modules/,
        /\.next/
      ]
    });
    
    // Set watch options to ignore template folders
    config.watchOptions = {
      ignored: [
        '**/templates_start_bootstrap/**',
        '**/node_modules/**',
        '**/.git/**',
        '**/.next/**'
      ]
    };
    
    // Ignore specific template files
    config.resolve.alias = {
      ...config.resolve.alias,
      'templates_start_bootstrap': false
    };
    
    return config;
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
          // Enhanced no-store headers as suggested by ChatGPT
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store',
          },
        ],
      },
      // Allow static assets to be cached for performance
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
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
