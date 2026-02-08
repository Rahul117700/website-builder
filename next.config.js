/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },
  experimental: {
    appDir: true,
    serverActions: true,
  },
  // Disable Next.js caching completely
  generateEtags: false,
  poweredByHeader: false,
  compress: false,

  // Exclude template folders from compilation
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },

  // Exclude template folders from Next.js compilation
  webpack: (config, { isServer }) => {
    // Set watch options to ignore template folders
    config.watchOptions = {
      ignored: [
        '**/templates_start_bootstrap/**',
        '**/node_modules/**',
        '**/.git/**',
        '**/.next/**'
      ]
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
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://checkout.razorpay.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data: https://fonts.gstatic.com https://checkout.razorpay.com",
              "connect-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://www.google-analytics.com https://www.googletagmanager.com https://connect.facebook.net",
              "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://www.youtube.com",
              "media-src 'self' blob: data: https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'"
            ].join('; '),
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
      // Allow uploaded images to be accessible
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
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
    unoptimized: true, // Disable image optimization for better compatibility
  },

  async rewrites() {
    return [
      // Rewrite /uploads requests to the dynamic image server
      {
        source: '/uploads/:path*',
        destination: '/api/view-image/:path*',
      },
      // Rewrite API requests to the Express server
      {
        source: '/api/v1/:path*',
        destination: `${process.env.EXPRESS_SERVER_URL || 'http://localhost:3001'}/api/v1/:path*`,
      },
    ];
  },

  // Configure for large file uploads (500MB)
  serverRuntimeConfig: {
    maxFileSize: 500 * 1024 * 1024, // 500MB
  },
};

module.exports = nextConfig;
