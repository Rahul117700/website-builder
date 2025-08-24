/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Disable Next.js caching completely
  generateEtags: false,
  poweredByHeader: false,
  compress: false,
  
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
          // Aggressive cache-busting headers
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, private, max-age=0',
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
    ];
  },
  async redirects() {
    // Generate unique cache-busting parameters
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const requestId = `${timestamp}-${randomId}`;
    
    console.log('🚀 [NextConfig] redirects() function called');
    console.log('🆔 [NextConfig] Request ID:', requestId);
    console.log('📅 [NextConfig] Timestamp:', new Date().toISOString());
    console.log('🌐 [NextConfig] NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    
    try {
      // Get base URL from environment variable
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      console.log('🔗 [NextConfig] Using base URL:', baseUrl);
      
      // Create unique cache-busting URL with multiple parameters
      const apiUrl = `${baseUrl}/api/dynamic-redirects?t=${timestamp}&id=${randomId}&req=${requestId}&cb=${Math.random()}`;
      console.log('📡 [NextConfig] Fetching from API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'X-Request-Timestamp': timestamp.toString(),
          'X-Request-ID': requestId,
          'X-Cache-Buster': randomId
        },
        // Force fresh request
        cache: 'no-store'
      });
      
      const data = await response.json();
      console.log('📊 [NextConfig] API Response:', data);
      
      if (data.success && data.redirects) {
        console.log(`✅ [NextConfig] Loaded ${data.count} dynamic redirects from database`);
        return data.redirects;
      } else {
        console.log('⚠️ [NextConfig] Using fallback redirects');
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
      console.error('❌ [NextConfig] Error loading dynamic redirects:', error);
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
