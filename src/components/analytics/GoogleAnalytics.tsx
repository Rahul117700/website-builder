'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  measurementId?: string;
}

/**
 * Google Analytics Component
 * Free forever - tracks page views and events
 * 
 * Setup:
 * 1. Get your Measurement ID from Google Analytics
 * 2. Add to .env: NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 */
export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const gaId = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!gaId) {
    return null; // Don't render if no ID provided
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}

/**
 * Track custom events in Google Analytics
 * Usage: trackEvent('purchase', { value: 100, currency: 'INR' })
 */
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventParams);
  }
}

/**
 * Track page views
 */
export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
}

