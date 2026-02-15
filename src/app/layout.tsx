import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import Script from 'next/script';
import FacebookPixel from '@/components/analytics/FacebookPixel';
import RetentionManager from '@/components/retention/RetentionManager';
import PageViewTracker from '@/components/PageViewTracker';
import InstallPWA from '@/components/InstallPWA';
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';
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
    image: '/logo/logo.gif',
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
    name: 'sedStudios',
    url: '/',
    description: 'Create sales funnels and sell digital products online with ease.',
    searchUrl: '/marketplace',
  });

  const organizationSchema = generateOrganizationSchema({
    name: 'sedStudios',
    url: '/',
    logo: '/logo/logo.gif',
    description: 'Digital product selling platform with integrated payment processing and analytics.',
  });

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KMVVHTV8MX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KMVVHTV8MX');
          `}
        </Script>

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        {/* Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />

        {/* Google AdSense */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5167608413139807"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />

        {/* PWA & Mobile Optimization */}
        <link rel="manifest" href="/manifest.json?v=4" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo/app_logo.gif" />

        {/* RSS Feed */}
        <link rel="alternate" type="application/rss+xml" title="sedStudios Blog RSS Feed" href="/feed.xml" />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          <AnalyticsProvider>
            <FacebookPixel />
            <PageViewTracker />
            <RetentionManager />
            <InstallPWA />
            {children}
          </AnalyticsProvider>
        </Providers>
      </body>
    </html>
  );
}
