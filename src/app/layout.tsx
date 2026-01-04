import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import FacebookPixel from '@/components/analytics/FacebookPixel';
import RetentionManager from '@/components/retention/RetentionManager';
import PageViewTracker from '@/components/PageViewTracker';
import GoogleAdsScript from '@/components/ads/GoogleAdsScript';
import { generateSEOMetadata, generateWebsiteSchema, generateOrganizationSchema } from '@/utils/seo';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Force dynamic + no data cache (App Router)
export const dynamic = 'force-dynamic';       // disable full-route cache
export const revalidate = 0;                  // disable ISR
export const fetchCache = 'force-no-store';   // disable fetch cache

export const metadata = {
  ...generateSEOMetadata({
    title: 'Create & Sell Digital Products Online',
    description: 'Build beautiful sales funnels and sell digital products online with ease. Create high-converting landing pages, process payments with Razorpay, and track analytics. No coding required!',
    keywords: [
      'digital products',
      'sales funnel builder',
      'online selling platform',
      'ecommerce',
      'creator economy',
      'sell ebooks',
      'sell courses',
      'sell videos',
      'sell code',
      'sell software',
      'landing page builder',
      'payment integration',
      'Razorpay',
      'India ecommerce',
      'digital marketplace',
    ],
    image: '/logo/logo.png',
    url: '/',
    type: 'website',
  }),
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Generate structured data schemas
  const websiteSchema = generateWebsiteSchema({
    name: 'SellEarnDirect',
    url: '/',
    description: 'Create sales funnels and sell digital products online with ease.',
    searchUrl: '/marketplace',
  });

  const organizationSchema = generateOrganizationSchema({
    name: 'SellEarnDirect',
    url: '/',
    logo: '/logo/logo.png',
    description: 'Digital product selling platform with integrated payment processing and analytics.',
  });

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-KMVVHTV8MX"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-KMVVHTV8MX');
            `,
          }}
        />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        
        {/* Preconnect to improve performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        
        {/* RSS Feed */}
        <link rel="alternate" type="application/rss+xml" title="Sell Earn Direct Blog RSS Feed" href="/feed.xml" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          <GoogleAdsScript />
          <FacebookPixel />
          <PageViewTracker />
          <RetentionManager />
          {children}
        </Providers>
      </body>
    </html>
  );
}
