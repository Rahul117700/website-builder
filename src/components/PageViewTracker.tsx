'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view
    const trackPageView = async () => {
      try {
        const referrer = document.referrer || 'direct';
        
        await fetch('/api/track/page-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: pathname,
            referrer,
          }),
        });
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.debug('Page tracking error:', error);
      }
    };

    // Track after a short delay to ensure page is loaded
    const timer = setTimeout(trackPageView, 1000);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null; // This component doesn't render anything
}

