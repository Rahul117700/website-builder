import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import GoogleAnalytics from '@/components/analytics/google-analytics';
import FacebookPixel from '@/components/analytics/FacebookPixel';
import RetentionManager from '@/components/retention/RetentionManager';
import { generateSEOMetadata, generateWebsiteSchema, generateOrganizationSchema } from '@/utils/seo';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Force dynamic + no data cache (App Router)
export const dynamic = 'force-dynamic';       // disable full-route cache
export const revalidate = 0;                  // disable ISR
export const fetchCache = 'force-no-store';   // disable fetch cache

export const metadata = generateSEOMetadata({
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
});

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
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo/logo.png" />
        
        {/* Preconnect to improve performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* RSS Feed */}
        <link rel="alternate" type="application/rss+xml" title="Sell Earn Direct Blog RSS Feed" href="/feed.xml" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          <GoogleAnalytics />
          <FacebookPixel />
          <RetentionManager />
          {children}
        </Providers>
      </body>
    </html>
  );
}
