// Run this in your browser console on any page to generate test analytics data
// Or run with: node scripts/seed-analytics.js

const generateTestData = async () => {
    const sessionId = `test-session-${Date.now()}`;

    // Track a page view
    await fetch('/api/analytics/page-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId,
            path: '/test-page',
            referrer: 'https://google.com',
            device: 'desktop',
            browser: 'Chrome',
            os: 'Windows',
        })
    });

    // Track some interactions
    await fetch('/api/analytics/interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId,
            path: '/test-page',
            eventType: 'scroll',
            scrollDepth: 75,
        })
    });

    // Track an exit point
    await fetch('/api/analytics/exit-point', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId,
            path: '/test-page',
            scrollDepth: 75,
            timeOnPage: 120,
        })
    });

    console.log('Test analytics data generated!');
};

// Run it
generateTestData();
