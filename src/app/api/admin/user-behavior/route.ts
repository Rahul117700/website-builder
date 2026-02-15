import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper function to convert BigInt to Number
function convertBigIntToNumber(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return Number(obj);
    if (Array.isArray(obj)) return obj.map(convertBigIntToNumber);
    if (typeof obj === 'object') {
        const converted: any = {};
        for (const key in obj) {
            converted[key] = convertBigIntToNumber(obj[key]);
        }
        return converted;
    }
    return obj;
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is super admin
        if (!session || session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const timeRange = searchParams.get('timeRange') || '7d'; // 24h, 7d, 30d, 90d
        const page = searchParams.get('page') || 'all';

        // Calculate date range
        const now = new Date();
        let startDate = new Date();

        switch (timeRange) {
            case '24h':
                startDate.setHours(now.getHours() - 24);
                break;
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
        }

        // Fetch analytics data
        const [
            totalPageViews,
            uniqueVisitors,
            avgSessionDuration,
            bounceRate,
            topPages,
            exitPoints,
            deviceBreakdown,
            browserBreakdown,
            hourlyActivity,
            conversionFunnel,
            scrollDepthData,
        ] = await Promise.all([
            // Total page views
            prisma.pageView.count({
                where: {
                    createdAt: { gte: startDate },
                    ...(page !== 'all' && { path: page }),
                },
            }),

            // Unique visitors
            prisma.userSession.count({
                where: {
                    createdAt: { gte: startDate },
                },
            }),

            // Average session duration
            prisma.userSession.aggregate({
                where: {
                    createdAt: { gte: startDate },
                    duration: { not: null },
                },
                _avg: { duration: true },
            }),

            // Bounce rate (sessions with only 1 page view)
            prisma.userSession.count({
                where: {
                    createdAt: { gte: startDate },
                    pageViews: 1,
                },
            }),

            // Top pages
            prisma.$queryRaw`
        SELECT path, COUNT(*) as views, AVG(duration) as avg_duration
        FROM "page_views"
        WHERE "createdAt" >= ${startDate}
        GROUP BY path
        ORDER BY views DESC
        LIMIT 10
      `,

            // Exit points
            prisma.$queryRaw`
        SELECT path, COUNT(*) as exits, AVG("scrollDepth") as avg_scroll
        FROM "exit_points"
        WHERE "createdAt" >= ${startDate}
        GROUP BY path
        ORDER BY exits DESC
        LIMIT 10
      `,

            // Device breakdown
            prisma.$queryRaw`
        SELECT device, COUNT(*) as count
        FROM "user_sessions"
        WHERE "createdAt" >= ${startDate} AND device IS NOT NULL
        GROUP BY device
      `,

            // Browser breakdown
            prisma.$queryRaw`
        SELECT browser, COUNT(*) as count
        FROM "user_sessions"
        WHERE "createdAt" >= ${startDate} AND browser IS NOT NULL
        GROUP BY browser
      `,

            // Hourly activity
            prisma.$queryRaw`
        SELECT 
          EXTRACT(HOUR FROM "createdAt") as hour,
          COUNT(*) as count
        FROM "page_views"
        WHERE "createdAt" >= ${startDate}
        GROUP BY hour
        ORDER BY hour
      `,

            // Conversion funnel
            prisma.$queryRaw`
        SELECT "eventName", COUNT(*) as count
        FROM "conversion_events"
        WHERE "createdAt" >= ${startDate}
        GROUP BY "eventName"
        ORDER BY count DESC
      `,

            // Scroll depth distribution
            prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN "scrollDepth" < 25 THEN '0-25%'
            WHEN "scrollDepth" < 50 THEN '25-50%'
            WHEN "scrollDepth" < 75 THEN '50-75%'
            ELSE '75-100%'
          END as depth_range,
          COUNT(*) as count
        FROM "user_interactions"
        WHERE "createdAt" >= ${startDate} AND "eventType" = 'scroll' AND "scrollDepth" IS NOT NULL
        GROUP BY depth_range
        ORDER BY depth_range
      `,
        ]);

        // Calculate bounce rate percentage
        const bounceRatePercentage = uniqueVisitors > 0
            ? ((bounceRate / uniqueVisitors) * 100).toFixed(2)
            : '0';

        // Convert all BigInt values to Numbers
        const response = {
            overview: {
                totalPageViews,
                uniqueVisitors,
                avgSessionDuration: Math.round(avgSessionDuration._avg.duration || 0),
                bounceRate: bounceRatePercentage,
            },
            topPages: convertBigIntToNumber(topPages),
            exitPoints: convertBigIntToNumber(exitPoints),
            deviceBreakdown: convertBigIntToNumber(deviceBreakdown),
            browserBreakdown: convertBigIntToNumber(browserBreakdown),
            hourlyActivity: convertBigIntToNumber(hourlyActivity),
            conversionFunnel: convertBigIntToNumber(conversionFunnel),
            scrollDepthData: convertBigIntToNumber(scrollDepthData),
            timeRange,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching user behavior analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
