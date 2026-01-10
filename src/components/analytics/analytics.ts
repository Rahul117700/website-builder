let isInitialized = false;

function initAnalytics() {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        isInitialized = true;
    }
}

export function track(eventName: string, params?: Record<string, any>) {
    if (!isInitialized) initAnalytics();
    if (isInitialized && typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', eventName, params);
    } else {
        console.log('Analytics event:', eventName, params);
    }
}

export default { track };
