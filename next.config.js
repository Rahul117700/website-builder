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
    serverActions: {
      allowedOrigins: ['*'],
      bodySizeLimit: '500mb', // Increase body size limit for file uploads (500MB)
    },
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

    // Exclude ffmpeg/ffprobe installers from frontend bundling
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        child_process: false,
        crypto: false,
      };
    }

    config.externals = [...(config.externals || []), 'canvas', 'jsdom', '@ffmpeg-installer/ffmpeg', '@ffprobe-installer/ffprobe'];

    return config;
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Changed from DENY to allow framing on same origin (better for some previews)
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer-when-downgrade',
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.google.com https://adservice.google.com https://adservice.google.co.in",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://checkout.razorpay.com",
              "img-src 'self' data: blob: *",
              "font-src 'self' data: https://fonts.gstatic.com https://checkout.razorpay.com",
              "connect-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://www.google-analytics.com https://www.googletagmanager.com https://connect.facebook.net https://googleads.g.doubleclick.net https://www.google.com https://pagead2.googlesyndication.com https://stats.g.doubleclick.net",
              "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://www.youtube.com https://googleads.g.doubleclick.net https://www.google.com https://tpc.googlesyndication.com",
              "media-src 'self' blob: data: https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'" // Changed from none to self
            ].join('; '),
          },
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
      // Keep your existing static assets rule
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
      'i.pravatar.cc',
      'images.unsplash.com',
      'cloudflare-ipfs.com',
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
