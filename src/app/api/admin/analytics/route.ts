import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is super admin
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      console.error('Analytics API: Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Analytics API: Fetching data for super admin');

    // Get counts
    const totalUsers = await prisma.user.count();
    console.log('Total users:', totalUsers);

    const totalChannels = await prisma.channel.count();
    console.log('Total channels:', totalChannels);

    const totalProducts = await prisma.digitalProduct.count();
    console.log('Total products:', totalProducts);

    const activeChannels = await prisma.channel.count({
      where: { status: 'ACTIVE' }
    });
    console.log('Active channels:', activeChannels);

    const publishedChannels = await prisma.channel.count({
      where: { published: true }
    });
    console.log('Published channels:', publishedChannels);

    const activeUsers = await prisma.user.count({
      where: { status: 'ACTIVE' }
    });
    console.log('Active users:', activeUsers);

    // Calculate total revenue from completed orders (case-insensitive check)
    const allOrders = await prisma.funnelOrder.findMany({
      select: {
        amount: true,
        status: true,
      }
    });

    const completedOrders = allOrders.filter(order =>
      order.status && order.status.toUpperCase() === 'COMPLETED'
    );
    const transactionRevenue = completedOrders.reduce((sum, order) => sum + order.amount, 0);

    // Calculate subscription revenue
    const subscriptionPayments = await prisma.userSubscription.findMany({
      select: {
        amount: true,
        status: true,
      }
    });
    const subscriptionRevenue = subscriptionPayments.reduce((sum, sub) => sum + sub.amount, 0);
    const activeSubscriptions = subscriptionPayments.filter(sub => sub.status === 'ACTIVE').length;
    const totalSubscriptions = subscriptionPayments.length;

    // Calculate expected revenue for next month (sum of active subscriptions)
    const expectedNextMonthRevenue = subscriptionPayments
      .filter(sub => sub.status === 'ACTIVE')
      .reduce((sum, sub) => sum + sub.amount, 0);

    // Get monthly revenue for the last 6 months for the growth chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyOrders = await prisma.funnelOrder.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: sixMonthsAgo }
      },
      select: {
        amount: true,
        createdAt: true
      }
    });

    const monthlySubscriptions = await prisma.userSubscription.findMany({
      where: {
        status: 'ACTIVE',
        createdAt: { gte: sixMonthsAgo }
      },
      select: {
        amount: true,
        createdAt: true
      }
    });

    // Group revenue by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const growthDataMap: Record<string, { revenue: number, subscriptions: number, transactions: number }> = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = `${months[d.getMonth()]} ${d.getFullYear()}`;
      growthDataMap[monthLabel] = { revenue: 0, subscriptions: 0, transactions: 0 };
    }

    monthlyOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthLabel = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (growthDataMap[monthLabel]) {
        growthDataMap[monthLabel].revenue += order.amount;
        growthDataMap[monthLabel].transactions += order.amount;
      }
    });

    monthlySubscriptions.forEach(sub => {
      const date = new Date(sub.createdAt);
      const monthLabel = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (growthDataMap[monthLabel]) {
        growthDataMap[monthLabel].revenue += sub.amount;
        growthDataMap[monthLabel].subscriptions += sub.amount;
      }
    });

    const growthData = Object.entries(growthDataMap).map(([name, data]) => ({
      name,
      ...data
    }));

    // Calculate plan distribution
    const planCounts = await prisma.userSubscription.groupBy({
      by: ['planId'],
      where: { status: 'ACTIVE' },
      _count: true
    });

    const activePlans = await prisma.subscriptionPlan.findMany({
      where: { id: { in: planCounts.map(p => p.planId) } },
      select: { id: true, name: true }
    });

    const planDistribution = planCounts.map(pc => ({
      name: activePlans.find(p => p.id === pc.planId)?.name || 'Unknown',
      value: pc._count
    }));

    // Total platform revenue
    const totalRevenue = transactionRevenue + subscriptionRevenue;

    // Calculate platform-wide conversion metrics
    const totalViews = await prisma.funnelAnalytics.count({
      where: {
        event: { in: ['VIEW', 'view'] }
      }
    });
    const totalConversions = await prisma.funnelOrder.count({
      where: {
        status: 'COMPLETED'
      }
    });
    const platformConversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;

    // Calculate average revenue per user
    const averageRevenuePerUser = activeUsers > 0 ? totalRevenue / activeUsers : 0;

    // Get recent channels with user info
    const recentChannels = await prisma.channel.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        _count: {
          select: {
            products: true,
            subscribers: true,
          }
        }
      }
    });

    // Get all users with their basic counts and channels
    const allUsers = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            channels: true,
          }
        },
        channels: {
          select: {
            id: true,
          }
        }
      }
    });

    // Calculate revenue and metrics for each user
    const usersWithMetrics = await Promise.all(
      allUsers.map(async (user) => {
        const userChannelIds = user.channels.map(c => c.id);
        let userRevenue = 0;
        let userSubscribers = 0;

        if (userChannelIds.length > 0) {
          const channelSubscriptions = await prisma.channelSubscription.findMany({
            where: {
              channelId: { in: userChannelIds },
              status: 'ACTIVE',
              endDate: { gt: new Date() }
            },
            select: { amount: true }
          });

          channelSubscriptions.forEach(sub => {
            const amount = typeof sub.amount === 'object' && 'toNumber' in sub.amount
              ? sub.amount.toNumber()
              : typeof sub.amount === 'string'
                ? parseFloat(sub.amount)
                : Number(sub.amount || 0);
            userRevenue += amount;
          });
          userSubscribers = channelSubscriptions.length;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          channels: user._count.channels,
          products: 0,
          revenue: userRevenue,
          conversionRate: 0,
        };
      })
    );

    // Sort by revenue (descending) and take top 10
    const formattedTopUsers = usersWithMetrics
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate some basic metrics
    const publishedChannelsRatio = totalChannels > 0 ? (publishedChannels / totalChannels) * 100 : 0;
    const activeUsersRatio = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

    const responseData = {
      overview: {
        totalUsers,
        totalChannels,
        totalProducts,
        activeChannels,
        publishedChannels,
        totalRevenue: totalRevenue,
        expectedNextMonthRevenue,
        subscriptionRevenue: subscriptionRevenue,
        transactionRevenue: transactionRevenue,
        activeSubscriptions: activeSubscriptions,
        totalSubscriptions: totalSubscriptions,
        activeUsers,
        platformHealth: {
          activeUsersRatio,
          publishedChannelsRatio,
          averageRevenuePerUser: averageRevenuePerUser,
          conversionRate: platformConversionRate,
        }
      },
      analytics: {
        growthData,
        planDistribution,
        topUsers: formattedTopUsers,
        recentChannels: recentChannels.map(channel => ({
          id: channel.id,
          name: channel.name,
          userName: channel.user?.name || 'Unknown',
          userEmail: channel.user?.email,
          productsCount: channel._count?.products || 0,
          subscribersCount: channel._count?.subscribers || 0,
          status: channel.status,
          published: channel.published,
          createdAt: channel.createdAt,
        })),
        recentActivity: recentChannels.slice(0, 5).map(channel => ({
          type: 'channel_created',
          description: `${channel.user?.name || 'User'} created channel "${channel.name}"`,
          timestamp: channel.createdAt,
          user: channel.user?.name || 'Unknown',
        })),
      }
    };

    console.log('Analytics API: Sending response:', JSON.stringify(responseData, null, 2));
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

