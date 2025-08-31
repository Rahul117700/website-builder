import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../../lib/prisma';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the site belongs to the user
    const site = await prisma.site.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Get time range from query params
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    // For now, return mock analytics data
    // In the future, this would query the actual analytics from the database
    const mockAnalyticsData = {
      visitors: {
        total: 15420,
        change: 12.5,
        trend: 'up' as const
      },
      pageViews: {
        total: 45680,
        change: 8.3,
        trend: 'up' as const
      },
      conversionRate: {
        total: 3.2,
        change: -1.1,
        trend: 'down' as const
      },
      revenue: {
        total: 125000,
        change: 15.7,
        trend: 'up' as const
      },
      topPages: [
        { path: '/', views: 12500, change: 12.5 },
        { path: '/about', views: 8900, change: 8.3 },
        { path: '/services', views: 7200, change: 15.2 },
        { path: '/contact', views: 5400, change: -2.1 },
        { path: '/blog', views: 3800, change: 22.4 }
      ],
      trafficSources: [
        { source: 'Direct', visitors: 6200, percentage: 40.2 },
        { source: 'Google', visitors: 4800, percentage: 31.1 },
        { source: 'Social Media', visitors: 2800, percentage: 18.2 },
        { source: 'Referrals', visitors: 1200, percentage: 7.8 },
        { source: 'Other', visitors: 420, percentage: 2.7 }
      ],
      deviceBreakdown: [
        { device: 'Desktop', visitors: 8200, percentage: 53.2 },
        { device: 'Mobile', visitors: 5800, percentage: 37.6 },
        { device: 'Tablet', visitors: 1420, percentage: 9.2 }
      ],
      monthlyData: [
        { month: 'Jan', visitors: 1200, revenue: 12000 },
        { month: 'Feb', visitors: 1350, revenue: 13500 },
        { month: 'Mar', visitors: 1420, revenue: 14200 },
        { month: 'Apr', visitors: 1580, revenue: 15800 },
        { month: 'May', visitors: 1680, revenue: 16800 },
        { month: 'Jun', visitors: 1750, revenue: 17500 },
        { month: 'Jul', visitors: 1820, revenue: 18200 },
        { month: 'Aug', visitors: 1950, revenue: 19500 },
        { month: 'Sep', visitors: 2100, revenue: 21000 },
        { month: 'Oct', visitors: 2250, revenue: 22500 },
        { month: 'Nov', visitors: 2400, revenue: 24000 },
        { month: 'Dec', visitors: 2580, revenue: 25800 }
      ]
    };

    return NextResponse.json(mockAnalyticsData);

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
