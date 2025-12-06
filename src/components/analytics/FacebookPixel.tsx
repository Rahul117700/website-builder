'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface FacebookPixelProps {
  pixelId?: string;
}

/**
 * Facebook Pixel Component
 * Free - tracks conversions and enables retargeting
 * 
 * Setup:
 * 1. Get your Pixel ID from Facebook Events Manager
 * 2. Add to .env: NEXT_PUBLIC_FB_PIXEL_ID=1234567890123456
 */
export default function FacebookPixel({ pixelId }: FacebookPixelProps) {
  const pixel = pixelId || process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  const pathname = usePathname();

  useEffect(() => {
    if (pixel && typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView');
    }
  }, [pathname, pixel]);

  if (!pixel) {
    return null; // Don't render if no Pixel ID provided
  }

  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixel}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixel}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

/**
 * Track custom Facebook Pixel events
 * Usage: trackFacebookEvent('Purchase', { value: 100, currency: 'INR' })
 */
export function trackFacebookEvent(eventName: string, eventParams?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, eventParams);
  }
}

/**
 * Common Facebook Pixel events
 */
export const FacebookEvents = {
  Purchase: (value: number, currency: string = 'INR') => {
    trackFacebookEvent('Purchase', { value, currency });
  },
  AddToCart: (value: number, currency: string = 'INR') => {
    trackFacebookEvent('AddToCart', { value, currency });
  },
  InitiateCheckout: (value: number, currency: string = 'INR') => {
    trackFacebookEvent('InitiateCheckout', { value, currency });
  },
  ViewContent: (contentName: string, contentCategory?: string) => {
    trackFacebookEvent('ViewContent', {
      content_name: contentName,
      content_category: contentCategory,
    });
  },
  Lead: () => {
    trackFacebookEvent('Lead');
  },
};

