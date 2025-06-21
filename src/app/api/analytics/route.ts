import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET /api/analytics - Get analytics for a site
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const siteId = url.searchParams.get('siteId');
    const period = url.searchParams.get('period') || '30d'; // Default to 30 days

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!siteId) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }

    // Check if the user owns the site
    const site = await prisma.site.findUnique({
      where: {
        id: siteId,
      },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    if (site.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate the start date based on the period
    const startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get analytics for the site
    const analytics = await prisma.analytics.findMany({
      where: {
        siteId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate summary statistics
    const totalPageViews = analytics.reduce(
      (sum: number, record: any) => sum + record.pageViews,
      0
    );
    const totalVisitors = analytics.reduce(
      (sum: number, record: any) => sum + record.visitors,
      0
    );

    // Group by page path to find popular pages
    const pageViewsByPath: Record<string, number> = {};
    analytics.forEach((record: any) => {
      if (record.path) {
        pageViewsByPath[record.path] = (pageViewsByPath[record.path] || 0) + record.pageViews;
      }
    });

    // Sort pages by views
    const popularPages = Object.entries(pageViewsByPath)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Group by date for time series data
    const timeSeriesData = analytics.reduce((acc: Record<string, any>, record: any) => {
      const date = record.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          pageViews: 0,
          visitors: 0,
        };
      }
      acc[date].pageViews += record.pageViews;
      acc[date].visitors += record.visitors;
      return acc;
    }, {});

    return NextResponse.json({
      summary: {
        totalPageViews,
        totalVisitors,
        popularPages,
      },
      timeSeriesData: Object.values(timeSeriesData),
      rawData: analytics,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// POST /api/analytics - Record analytics data
export async function POST(req: NextRequest) {
  try {
    const { siteId, path, referrer, userAgent, pageViews = 1, visitors = 1 } = await req.json();

    // Validate required fields
    if (!siteId) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }

    // Check if the site exists
    const site = await prisma.site.findUnique({
      where: {
        id: siteId,
      },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Create the analytics record
    const analytics = await prisma.analytics.create({
      data: {
        path,
        referrer,
        userAgent,
        pageViews,
        visitors,
        site: {
          connect: {
            id: siteId,
          },
        },
      },
    });

    return NextResponse.json(analytics, { status: 201 });
  } catch (error) {
    console.error('Error recording analytics:', error);
    return NextResponse.json(
      { error: 'Failed to record analytics' },
      { status: 500 }
    );
  }
}
