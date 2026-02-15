const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAnalytics() {
    console.log('🌱 Seeding analytics data...');

    try {
        // Insert test sessions
        await prisma.$executeRaw`
      INSERT INTO "user_sessions" (id, "sessionId", "startTime", "endTime", duration, "pageViews", interactions, device, browser, os, country, "createdAt")
      VALUES 
        (gen_random_uuid(), 'session-1', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 3600, 5, 12, 'desktop', 'Chrome', 'Windows', 'India', NOW() - INTERVAL '2 hours'),
        (gen_random_uuid(), 'session-2', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours', 1800, 3, 8, 'mobile', 'Safari', 'iOS', 'India', NOW() - INTERVAL '3 hours'),
        (gen_random_uuid(), 'session-3', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '30 minutes', 1800, 4, 10, 'desktop', 'Firefox', 'Windows', 'USA', NOW() - INTERVAL '1 day'),
        (gen_random_uuid(), 'session-4', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '45 minutes', 2700, 6, 15, 'tablet', 'Chrome', 'Android', 'UK', NOW() - INTERVAL '2 days'),
        (gen_random_uuid(), 'session-5', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '20 minutes', 1200, 2, 5, 'mobile', 'Chrome', 'Android', 'India', NOW() - INTERVAL '3 days')
    `;

        // Insert test page views
        await prisma.$executeRaw`
      INSERT INTO "page_views" (id, "sessionId", path, referrer, "userAgent", device, browser, os, country, duration, "createdAt")
      VALUES 
        (gen_random_uuid(), 'session-1', '/', 'https://google.com', 'Mozilla/5.0', 'desktop', 'Chrome', 'Windows', 'India', 120, NOW() - INTERVAL '2 hours'),
        (gen_random_uuid(), 'session-1', '/marketplace', '/', 'Mozilla/5.0', 'desktop', 'Chrome', 'Windows', 'India', 180, NOW() - INTERVAL '2 hours' + INTERVAL '2 minutes'),
        (gen_random_uuid(), 'session-1', '/auth/signin', '/marketplace', 'Mozilla/5.0', 'desktop', 'Chrome', 'Windows', 'India', 90, NOW() - INTERVAL '2 hours' + INTERVAL '5 minutes'),
        (gen_random_uuid(), 'session-2', '/', 'https://facebook.com', 'Mozilla/5.0', 'mobile', 'Safari', 'iOS', 'India', 60, NOW() - INTERVAL '3 hours'),
        (gen_random_uuid(), 'session-2', '/marketplace', '/', 'Mozilla/5.0', 'mobile', 'Safari', 'iOS', 'India', 150, NOW() - INTERVAL '3 hours' + INTERVAL '1 minute'),
        (gen_random_uuid(), 'session-3', '/auth/dashboard/super-admin', NULL, 'Mozilla/5.0', 'desktop', 'Firefox', 'Windows', 'USA', 300, NOW() - INTERVAL '1 day'),
        (gen_random_uuid(), 'session-3', '/auth/dashboard/super-admin/users', '/auth/dashboard/super-admin', 'Mozilla/5.0', 'desktop', 'Firefox', 'Windows', 'USA', 240, NOW() - INTERVAL '1 day' + INTERVAL '5 minutes'),
        (gen_random_uuid(), 'session-4', '/', 'https://twitter.com', 'Mozilla/5.0', 'tablet', 'Chrome', 'Android', 'UK', 100, NOW() - INTERVAL '2 days'),
        (gen_random_uuid(), 'session-4', '/marketplace', '/', 'Mozilla/5.0', 'tablet', 'Chrome', 'Android', 'UK', 200, NOW() - INTERVAL '2 days' + INTERVAL '2 minutes'),
        (gen_random_uuid(), 'session-5', '/feedback', NULL, 'Mozilla/5.0', 'mobile', 'Chrome', 'Android', 'India', 80, NOW() - INTERVAL '3 days')
    `;

        // Insert test interactions
        await prisma.$executeRaw`
      INSERT INTO "user_interactions" (id, "sessionId", path, "eventType", "elementId", "scrollDepth", "createdAt")
      VALUES 
        (gen_random_uuid(), 'session-1', '/', 'scroll', NULL, 25, NOW() - INTERVAL '2 hours'),
        (gen_random_uuid(), 'session-1', '/', 'scroll', NULL, 50, NOW() - INTERVAL '2 hours' + INTERVAL '30 seconds'),
        (gen_random_uuid(), 'session-1', '/', 'scroll', NULL, 75, NOW() - INTERVAL '2 hours' + INTERVAL '1 minute'),
        (gen_random_uuid(), 'session-1', '/marketplace', 'scroll', NULL, 100, NOW() - INTERVAL '2 hours' + INTERVAL '3 minutes'),
        (gen_random_uuid(), 'session-2', '/', 'scroll', NULL, 40, NOW() - INTERVAL '3 hours'),
        (gen_random_uuid(), 'session-2', '/marketplace', 'scroll', NULL, 60, NOW() - INTERVAL '3 hours' + INTERVAL '1 minute'),
        (gen_random_uuid(), 'session-3', '/auth/dashboard/super-admin', 'scroll', NULL, 90, NOW() - INTERVAL '1 day'),
        (gen_random_uuid(), 'session-4', '/marketplace', 'scroll', NULL, 80, NOW() - INTERVAL '2 days'),
        (gen_random_uuid(), 'session-5', '/feedback', 'scroll', NULL, 30, NOW() - INTERVAL '3 days')
    `;

        // Insert test exit points
        await prisma.$executeRaw`
      INSERT INTO "exit_points" (id, "sessionId", path, "scrollDepth", "timeOnPage", "exitType", "createdAt")
      VALUES 
        (gen_random_uuid(), 'session-1', '/auth/signin', 75, 90, 'navigation', NOW() - INTERVAL '2 hours' + INTERVAL '7 minutes'),
        (gen_random_uuid(), 'session-2', '/marketplace', 60, 150, 'close', NOW() - INTERVAL '3 hours' + INTERVAL '2 minutes'),
        (gen_random_uuid(), 'session-3', '/auth/dashboard/super-admin/users', 90, 240, 'navigation', NOW() - INTERVAL '1 day' + INTERVAL '10 minutes'),
        (gen_random_uuid(), 'session-4', '/marketplace', 80, 200, 'close', NOW() - INTERVAL '2 days' + INTERVAL '4 minutes'),
        (gen_random_uuid(), 'session-5', '/feedback', 30, 80, 'close', NOW() - INTERVAL '3 days' + INTERVAL '2 minutes')
    `;

        // Insert test conversion events
        await prisma.$executeRaw`
      INSERT INTO "conversion_events" (id, "sessionId", "eventName", "eventValue", "createdAt")
      VALUES 
        (gen_random_uuid(), 'session-1', 'sign_up', 0, NOW() - INTERVAL '2 hours' + INTERVAL '6 minutes'),
        (gen_random_uuid(), 'session-3', 'page_view', 0, NOW() - INTERVAL '1 day'),
        (gen_random_uuid(), 'session-4', 'page_view', 0, NOW() - INTERVAL '2 days')
    `;

        console.log('✅ Analytics data seeded successfully!');
        console.log('\nData summary:');
        console.log('- 5 user sessions');
        console.log('- 10 page views');
        console.log('- 9 user interactions');
        console.log('- 5 exit points');
        console.log('- 3 conversion events');
        console.log('\n🎉 You can now view the data in the User Activity dashboard!');
    } catch (error) {
        console.error('❌ Error seeding analytics:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedAnalytics();
