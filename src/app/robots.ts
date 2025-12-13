import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourwebsite.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/contact',
          '/terms',
          '/privacy',
          '/blog',
          '/blog/*',
          '/auth/signin',
          '/auth/signup',
        ],
        disallow: [
          '/auth/dashboard',
          '/auth/dashboard/*',
          '/api/*',
          '/admin/*',
          '/_next/*',
          '/f/*',
          '/s/*',
          '/download/*',
          '/auth/reset-password',
          '/auth/forgot-password',
          '/auth/verify-request',
          '/auth/error',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/about',
          '/contact',
          '/terms',
          '/privacy',
          '/blog',
          '/blog/*',
        ],
        disallow: [
          '/auth/*',
          '/api/*',
          '/admin/*',
          '/_next/*',
          '/f/*',
          '/s/*',
          '/download/*',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/about',
          '/contact',
          '/terms',
          '/privacy',
          '/blog',
          '/blog/*',
        ],
        disallow: [
          '/auth/*',
          '/api/*',
          '/admin/*',
          '/_next/*',
          '/f/*',
          '/s/*',
          '/download/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
