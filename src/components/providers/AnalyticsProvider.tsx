'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initializeAnalytics, trackPageView } from '@/lib/analytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        // Initialize analytics tracking
        const cleanup = initializeAnalytics();
        return cleanup;
    }, []);

    useEffect(() => {
        // Track page view on route change
        if (pathname) {
            trackPageView(pathname);
        }
    }, [pathname]);

    return <>{children}</>;
}
