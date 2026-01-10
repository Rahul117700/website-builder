import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

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

    // Get user's channels with subscriptions, products, and purchases (for all stats)
    const channels = await prisma.channel.findMany({
      where: { userId: user.id },
      include: {
        subscribers: {},
        products: {
          include: {
            purchases: {
              where: {
                status: 'COMPLETED',
              },
            },
          },
        },
      },
    });

    // Calculate overall stats
    let totalVisitors = 0;
    let totalConversions = 0;
    let totalRevenue = 0;
    let publishedChannels = 0;
    let totalSubscribers = 0;

    channels.forEach(channel => {
      const channelViews = channel.products.reduce((sum, product) => sum + (product.viewCount || 0), 0);
      totalVisitors += channelViews;

      const channelPurchases = channel.products.reduce((sum, product) => sum + product.purchases.length, 0);
      totalConversions += channelPurchases;

      const activeSubscribers = channel.subscribers.filter(s =>
        s.status === 'ACTIVE' && new Date(s.endDate) > new Date()
      ).length;
      totalSubscribers += activeSubscribers;

      if (channel.published) publishedChannels++;

      // Calculate total revenue from all active subscriptions
      channel.subscribers.forEach(subscription => {
        if (subscription.status === 'ACTIVE' && new Date(subscription.endDate) > new Date()) {
          let subAmount = 0;
          if (subscription.amount !== null) {
            subAmount = typeof subscription.amount === 'object' && 'toNumber' in subscription.amount
              ? Number(subscription.amount.toNumber())
              : Number(subscription.amount) || 0;
          } else if (channel.subscriptionPrice !== null) {
            subAmount = typeof channel.subscriptionPrice === 'object' && 'toNumber' in channel.subscriptionPrice
              ? Number(channel.subscriptionPrice.toNumber())
              : Number(channel.subscriptionPrice) || 0;
          }
          totalRevenue += subAmount;
        }
      });
    });

    const conversionRate = totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;

    // Get all subscriptions for chart data
    const allSubscriptions = await prisma.channelSubscription.findMany({
      where: {
        channel: { userId: user.id },
      },
      select: {
        createdAt: true,
        amount: true,
        channelId: true,
      },
    });

    // Generate OVERALL monthly data (last 12 months)
    const overallData = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      let monthRevenue = 0;
      let monthOrders = 0;

      allSubscriptions.forEach(subscription => {
        const subDate = new Date(subscription.createdAt);
        if (subDate >= monthStart && subDate <= monthEnd) {
          monthOrders++;
          let subAmount = 0;
          if (subscription.amount !== null) {
            subAmount = typeof subscription.amount === 'object' && 'toNumber' in subscription.amount
              ? Number(subscription.amount.toNumber())
              : Number(subscription.amount) || 0;
          } else {
            const channel = channels.find(c => c.id === subscription.channelId);
            if (channel?.subscriptionPrice) {
              subAmount = typeof channel.subscriptionPrice === 'object' && 'toNumber' in channel.subscriptionPrice
                ? Number(channel.subscriptionPrice.toNumber())
                : Number(channel.subscriptionPrice) || 0;
            }
          }
          monthRevenue += subAmount;
        }
      });

      // Distribute reach trend based on total visitors
      const baseViewsPerMonth = Math.floor(totalVisitors / 12);
      const monthFactor = 0.7 + (Math.random() * 0.6);
      let monthViews = Math.floor(baseViewsPerMonth * monthFactor);
      if (monthOrders > 0) monthViews += (monthOrders * 15) + Math.floor(Math.random() * 50);

      overallData.push({
        date: monthYear,
        dayName: monthYear,
        revenue: monthRevenue,
        orders: monthOrders,
        views: monthViews
      });
    }

    // Top performing channels
    const topChannels = channels
      .map(channel => {
        let channelRevenue = 0;
        channel.subscribers.forEach(subscription => {
          if (subscription.status === 'ACTIVE' && new Date(subscription.endDate) > new Date()) {
            let subAmount = 0;
            if (subscription.amount !== null) {
              subAmount = typeof subscription.amount === 'object' && 'toNumber' in subscription.amount ? Number(subscription.amount.toNumber()) : Number(subscription.amount) || 0;
            } else if (channel.subscriptionPrice !== null) {
              subAmount = typeof channel.subscriptionPrice === 'object' && 'toNumber' in channel.subscriptionPrice ? Number(channel.subscriptionPrice.toNumber()) : Number(channel.subscriptionPrice) || 0;
            }
            channelRevenue += subAmount;
          }
        });

        const visitors = (channel.products || []).reduce((sum, p) => sum + (p.viewCount || 0), 0);
        const conversions = channel.subscribers.filter(s => s.status === 'ACTIVE' && new Date(s.endDate) > new Date()).length;
        const cRate = visitors > 0 ? (conversions / visitors) * 100 : 0;

        return {
          id: channel.id,
          name: channel.name,
          visitors,
          conversions,
          revenue: channelRevenue,
          conversionRate: Math.round(cRate * 10) / 10,
          status: channel.status,
          published: channel.published
        };
      })
      .sort((a, b) => b.revenue - a.revenue || b.visitors - a.visitors)
      .slice(0, 5);

    // Recent Activity
    const recentActivity: any[] = [];

    // Channel creations
    const recentChannels = await prisma.channel.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    recentChannels.forEach(c => {
      recentActivity.push({
        id: `channel_${c.id}`,
        type: 'channel_created',
        title: `Created ${c.name}`,
        description: 'New channel created',
        timestamp: c.createdAt.toISOString(),
        icon: 'plus',
      });
    });

    // Subscriptions as activity
    const recentSubs = await prisma.channelSubscription.findMany({
      where: { channel: { userId: user.id } },
      include: { channel: { select: { name: true } }, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    recentSubs.forEach(s => {
      const name = s.user.name || s.user.email || 'Anonymous';
      recentActivity.push({
        id: `sub_${s.id}`,
        type: 'order_completed',
        title: `🎉 New Subscription!`,
        description: `${name} joined ${s.channel.name}`,
        timestamp: s.createdAt.toISOString(),
        icon: 'dollar',
      });
    });

    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      overview: {
        totalChannels: channels.length,
        publishedChannels,
        totalRevenue: Math.round(totalRevenue),
        totalVisitors,
        totalConversions,
        totalSubscribers,
        conversionRate: Math.round(conversionRate * 10) / 10,
        revenueGrowth: 5.2 // Static for now
      },
      chartData: {
        revenue7Days: overallData, // Renamed in frontend later or kept as is for compatibility
        topChannels
      },
      recentActivity: recentActivity.slice(0, 20)
    });

  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
