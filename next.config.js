/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    serverActions: true,
  },

  // ─── Performance: Enable gzip compression & ETags ─────────────────────────
  generateEtags: true,
  poweredByHeader: false,
  compress: true,

  // ─── CDN Asset Prefix ────────────────────────────────────────────────────
  // Set CDN_URL env var on your server to point to your CDN
  // e.g. CDN_URL=https://cdn.yourdomain.com  (Cloudflare, BunnyCDN, etc.)
  assetPrefix: process.env.CDN_URL || undefined,

  async redirects() {
    return [
      {
        source: '/landing',
        destination: '/',
        permanent: true,
      },
    ];
  },

  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  webpack: (config, { isServer }) => {
    config.cache = false;

    config.watchOptions = {
      ignored: [
        '**/templates_start_bootstrap/**',
        '**/node_modules/**',
        '**/.git/**',
        '**/.next/**'
      ]
    };

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
      // ─── Security headers applied to every route ───────────────────────────
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer-when-downgrade' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
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
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },

      // ─── HTML pages: CDN can cache for 60s, serve stale up to 5 mins ──────
      {
        source: '/((?!_next|api|uploads).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
          { key: 'Vary', value: 'Accept-Encoding' },
        ],
      },

      // ─── Next.js JS/CSS bundles: hash-fingerprinted → cache forever ────────
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          { key: 'Vary', value: 'Accept-Encoding' },
        ],
      },

      // ─── Next.js image optimization ────────────────────────────────────────
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=3600',
          },
        ],
      },

      // ─── Public static files (favicon, fonts, icons) ──────────────────────
      {
        source: '/(.+\\.(?:ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|otf|eot))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
          { key: 'Vary', value: 'Accept-Encoding' },
        ],
      },

      // ─── API Routes: always fresh (never CDN cached) ───────────────────────
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },

      // ─── User uploaded content: short CDN cache ────────────────────────────
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Vary', value: 'Accept-Encoding, Accept' },
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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.pexels.com',
        pathname: '/**',
      }
    ],
    unoptimized: true,
    minimumCacheTTL: 86400, // cache optimized images for 24h
  },

  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/view-image/:path*',
      },
      {
        source: '/api/v1/:path*',
        destination: `${process.env.EXPRESS_SERVER_URL || 'http://localhost:3001'}/api/v1/:path*`,
      },
    ];
  },

  serverRuntimeConfig: {
    maxFileSize: 500 * 1024 * 1024, // 500MB
  },
};

module.exports = nextConfig;
