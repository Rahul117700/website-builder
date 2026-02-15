/**
 * User Activity Tracking Library
 * 
 * This library tracks user behavior including:
 * - Page views and navigation
 * - Scroll depth
 * - Click events
 * - Time on page
 * - Exit points
 * - Form interactions
 */

import { v4 as uuidv4 } from 'uuid';

// Get or create session ID
export function getSessionId(): string {
    if (typeof window === 'undefined') return '';

    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
        sessionId = uuidv4();
        sessionStorage.setItem('analytics_session_id', sessionId);
        sessionStorage.setItem('session_start_time', Date.now().toString());
    }
    return sessionId;
}

// Get device information
export function getDeviceInfo() {
    if (typeof window === 'undefined') return {};

    const ua = navigator.userAgent;
    let device = 'desktop';
    let browser = 'unknown';
    let os = 'unknown';

    // Detect device
    if (/mobile/i.test(ua)) device = 'mobile';
    else if (/tablet|ipad/i.test(ua)) device = 'tablet';

    // Detect browser
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edge')) browser = 'Edge';

    // Detect OS
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';

    return { device, browser, os, userAgent: ua };
}

// Track page view
export async function trackPageView(path: string, referrer?: string) {
    try {
        const sessionId = getSessionId();
        const deviceInfo = getDeviceInfo();

        await fetch('/api/analytics/page-view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId,
                path,
                referrer: referrer || document.referrer,
                ...deviceInfo,
            }),
        });

        // Store page entry time for duration calculation
        sessionStorage.setItem('page_entry_time', Date.now().toString());
    } catch (error) {
        console.error('Failed to track page view:', error);
    }
}

// Track page exit
export async function trackPageExit(path: string, scrollDepth: number) {
    try {
        const sessionId = getSessionId();
        const entryTime = parseInt(sessionStorage.getItem('page_entry_time') || '0');
        const timeOnPage = entryTime ? Math.floor((Date.now() - entryTime) / 1000) : 0;

        await fetch('/api/analytics/exit-point', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId,
                path,
                scrollDepth,
                timeOnPage,
                exitType: 'navigation',
            }),
        });
    } catch (error) {
        console.error('Failed to track page exit:', error);
    }
}

// Track user interaction
export async function trackInteraction(
    eventType: string,
    data: {
        elementId?: string;
        elementClass?: string;
        elementText?: string;
        scrollDepth?: number;
        metadata?: any;
    }
) {
    try {
        const sessionId = getSessionId();
        const path = window.location.pathname;

        await fetch('/api/analytics/interaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId,
                path,
                eventType,
                ...data,
            }),
        });
    } catch (error) {
        console.error('Failed to track interaction:', error);
    }
}

// Track conversion event
export async function trackConversion(
    eventName: string,
    eventValue?: number,
    metadata?: any
) {
    try {
        const sessionId = getSessionId();

        await fetch('/api/analytics/conversion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId,
                eventName,
                eventValue,
                metadata,
            }),
        });
    } catch (error) {
        console.error('Failed to track conversion:', error);
    }
}

// Calculate scroll depth
export function getScrollDepth(): number {
    if (typeof window === 'undefined') return 0;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    const scrollDepth = ((scrollTop + windowHeight) / documentHeight) * 100;
    return Math.min(Math.round(scrollDepth), 100);
}

// Initialize analytics tracking
export function initializeAnalytics() {
    if (typeof window === 'undefined') return;

    let maxScrollDepth = 0;
    let scrollTimeout: NodeJS.Timeout;

    // Track page view on load
    trackPageView(window.location.pathname);

    // Track scroll depth
    const handleScroll = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const currentScrollDepth = getScrollDepth();
            if (currentScrollDepth > maxScrollDepth) {
                maxScrollDepth = currentScrollDepth;

                // Track milestone scrolls (25%, 50%, 75%, 100%)
                if ([25, 50, 75, 100].includes(currentScrollDepth)) {
                    trackInteraction('scroll', {
                        scrollDepth: currentScrollDepth,
                        metadata: { milestone: true },
                    });
                }
            }
        }, 150);
    };

    // Track clicks
    const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        trackInteraction('click', {
            elementId: target.id,
            elementClass: target.className,
            elementText: target.textContent?.substring(0, 100),
            scrollDepth: getScrollDepth(),
        });
    };

    // Track page exit
    const handleBeforeUnload = () => {
        trackPageExit(window.location.pathname, maxScrollDepth);
    };

    // Track visibility change (tab switch)
    const handleVisibilityChange = () => {
        if (document.hidden) {
            trackInteraction('tab_hidden', {
                scrollDepth: getScrollDepth(),
            });
        }
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('click', handleClick);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
}
