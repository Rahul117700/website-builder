export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourwebsite.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/auth/dashboard/',
          '/api/',
          '/auth/verify-request',
          '/auth/error',
          '/auth/reset-password',
          '/auth/forgot-password',
          '/auth/signout',
          '/download/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/auth/dashboard/',
          '/api/',
          '/download/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
