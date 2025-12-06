import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all user's funnels with analytics
    const funnels = await prisma.funnel.findMany({
      where: {
        userId: user.id,
      },
      include: {
        analytics: true,
        orders: true,
        product: true,
      },
    });

    // Calculate overall statistics
    let totalVisitors = 0;
    let totalConversions = 0;
    let totalRevenue = 0;
    let totalFunnels = funnels.length;
    let activeFunnels = 0;
    let publishedFunnels = 0;

    funnels.forEach(funnel => {
      totalVisitors += funnel.analytics.filter(a => a.event === 'VIEW').length;
      totalConversions += funnel.analytics.filter(a => a.event === 'PURCHASE' || a.event === 'CONVERSION').length;
      totalRevenue += funnel.orders
        .filter(o => o.status === 'COMPLETED')
        .reduce((sum, order) => sum + order.amount, 0);
      
      if (funnel.status === 'ACTIVE') activeFunnels++;
      if (funnel.published) publishedFunnels++;
    });

    const avgConversionRate = totalVisitors > 0 
      ? Math.round((totalConversions / totalVisitors) * 1000) / 10 
      : 0;

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAnalytics = await prisma.funnelAnalytics.findMany({
      where: {
        funnel: {
          userId: user.id,
        },
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    // Group analytics by date
    const analyticsByDate: { [key: string]: { views: number; conversions: number } } = {};
    recentAnalytics.forEach(analytics => {
      const date = analytics.createdAt.toISOString().split('T')[0];
      if (!analyticsByDate[date]) {
        analyticsByDate[date] = { views: 0, conversions: 0 };
      }
      if (analytics.event === 'VIEW') {
        analyticsByDate[date].views++;
      } else if (analytics.event === 'PURCHASE' || analytics.event === 'CONVERSION') {
        analyticsByDate[date].conversions++;
      }
    });

    // Get recent activity (last 10 events)
    const recentFunnels = await prisma.funnel.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        name: true,
        published: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const recentOrders = await prisma.funnelOrder.findMany({
      where: {
        funnel: {
          userId: user.id
        },
        status: 'COMPLETED'
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        funnel: {
          select: {
            name: true
          }
        }
      }
    });

    // Combine and format recent activity
    const activity: any[] = [];

    // Add funnel creations
    recentFunnels.forEach(funnel => {
      activity.push({
        id: `funnel_${funnel.id}`,
        type: 'funnel_created',
        title: 'New funnel created',
        description: funnel.name,
        timestamp: funnel.createdAt.toISOString(),
        icon: 'plus'
      });

      if (funnel.published && funnel.updatedAt > funnel.createdAt) {
        activity.push({
          id: `funnel_pub_${funnel.id}`,
          type: 'funnel_published',
          title: 'Funnel published',
          description: funnel.name,
          timestamp: funnel.updatedAt.toISOString(),
          icon: 'eye'
        });
      }
    });

    // Add orders
    recentOrders.forEach(order => {
      activity.push({
        id: `order_${order.id}`,
        type: 'order_completed',
        title: 'Sale completed',
        description: `₹${order.amount.toLocaleString()} from ${order.funnel.name}`,
        timestamp: order.createdAt.toISOString(),
        icon: 'dollar'
      });
    });

    // Sort by timestamp and take latest 10
    const sortedActivity = activity
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return NextResponse.json({
      overview: {
        totalFunnels,
        activeFunnels,
        publishedFunnels,
        totalVisitors,
        totalConversions,
        totalRevenue,
        avgConversionRate,
      },
      recentActivity: sortedActivity,
      topPerformingFunnels: funnels
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map(f => ({
          id: f.id,
          name: f.name,
          revenue: f.revenue,
          visitors: f.visitors,
          conversions: f.conversions,
          conversionRate: f.conversionRate,
          productType: f.product?.type || 'SOFTWARE'
        })),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
