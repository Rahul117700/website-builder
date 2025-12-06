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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's funnels with analytics and orders
    const funnels = await prisma.funnel.findMany({
      where: { userId: user.id },
      include: {
        analytics: true,
        orders: {
          where: { status: 'COMPLETED' }
        }
      }
    });

    // Calculate overall stats
    let totalVisitors = 0;
    let totalConversions = 0;
    let totalRevenue = 0;
    let totalFunnels = funnels.length;
    let publishedFunnels = 0;

    funnels.forEach(funnel => {
      totalVisitors += funnel.analytics.filter(a => a.event === 'VIEW').length;
      totalConversions += funnel.orders.length;
      totalRevenue += funnel.orders.reduce((sum, order) => sum + order.amount, 0);
      if (funnel.published) publishedFunnels++;
    });

    const conversionRate = totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;

    // Generate 7-day revenue chart data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Get revenue for this day
      let dayRevenue = 0;
      funnels.forEach(funnel => {
        funnel.orders.forEach(order => {
          const orderDate = order.createdAt.toISOString().split('T')[0];
          if (orderDate === dateStr) {
            dayRevenue += order.amount;
          }
        });
      });

      last7Days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayRevenue,
        orders: funnels.reduce((count, funnel) => {
          return count + funnel.orders.filter(order => 
            order.createdAt.toISOString().split('T')[0] === dateStr
          ).length;
        }, 0)
      });
    }

    // Get top performing funnels
    const topFunnels = funnels
      .map(funnel => {
        const visitors = funnel.analytics.filter(a => a.event === 'VIEW').length;
        const conversions = funnel.orders.length;
        const revenue = funnel.orders.reduce((sum, order) => sum + order.amount, 0);
        const conversionRate = visitors > 0 ? (conversions / visitors) * 100 : 0;

        return {
          id: funnel.id,
          name: funnel.name,
          visitors,
          conversions,
          revenue,
          conversionRate: Math.round(conversionRate * 10) / 10,
          status: funnel.status,
          published: funnel.published
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Get recent activity
    const recentAnalytics = await prisma.funnelAnalytics.findMany({
      where: {
        funnel: { userId: user.id }
      },
      include: {
        funnel: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const recentActivity = recentAnalytics.map(analytics => ({
      id: analytics.id,
      type: analytics.event === 'VIEW' ? 'funnel_view' : 
            analytics.event === 'PURCHASE' ? 'order_completed' : 'funnel_created',
      title: analytics.event === 'VIEW' ? `New view on ${analytics.funnel.name}` :
             analytics.event === 'PURCHASE' ? `Purchase on ${analytics.funnel.name}` :
             `Created ${analytics.funnel.name}`,
      description: analytics.event === 'VIEW' ? 'Someone viewed your funnel' :
                   analytics.event === 'PURCHASE' ? 'New order completed' :
                   'New funnel created',
      timestamp: analytics.createdAt.toISOString(),
      icon: analytics.event === 'VIEW' ? 'eye' : 
            analytics.event === 'PURCHASE' ? 'dollar' : 'plus'
    }));

    // Calculate growth rates
    const previous7Days = last7Days.slice(0, 3).reduce((sum, day) => sum + day.revenue, 0);
    const current7Days = last7Days.slice(-3).reduce((sum, day) => sum + day.revenue, 0);
    const revenueGrowth = previous7Days > 0 ? ((current7Days - previous7Days) / previous7Days) * 100 : 0;

    return NextResponse.json({
      overview: {
        totalFunnels,
        publishedFunnels,
        totalRevenue,
        totalVisitors,
        totalConversions,
        conversionRate: Math.round(conversionRate * 10) / 10,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10
      },
      chartData: {
        revenue7Days: last7Days,
        topFunnels
      },
      recentActivity
    });

  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
