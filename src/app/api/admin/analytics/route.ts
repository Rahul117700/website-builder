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

    // Check if current user is SUPER_ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Super Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y

    // Calculate date range
    const now = new Date();
    const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Platform Overview Stats
    const [
      totalUsers,
      totalFunnels,
      publishedFunnels,
      totalTransactionRevenue,
      totalSubscriptionRevenue,
      totalTransactions,
      totalProducts,
      totalSites
    ] = await Promise.all([
      prisma.user.count(),
      prisma.funnel.count(),
      prisma.funnel.count({ where: { published: true } }),
      prisma.funnelOrder.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
      }),
      prisma.userSubscription.aggregate({
        _sum: { amount: true },
        where: { status: 'ACTIVE' }
      }),
      prisma.funnelOrder.count({ where: { status: 'COMPLETED' } }),
      prisma.digitalProduct.count(),
      prisma.site.count()
    ]);

    // Set activeUsers to totalUsers for now (since status field is not working yet)
    const activeUsers = totalUsers;

    // Revenue Analytics
    const revenueData = await prisma.funnelOrder.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate }
      },
      select: {
        amount: true,
        createdAt: true,
        currency: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group revenue by day
    const dailyRevenue = revenueData.reduce((acc: any, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, orders: 0 };
      }
      acc[date].revenue += order.amount;
      acc[date].orders += 1;
      return acc;
    }, {});

    // User Growth Analytics
    const userGrowth = await prisma.user.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        createdAt: true,
        role: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group users by day
    const dailyUserGrowth = userGrowth.reduce((acc: any, user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, users: 0, superAdmins: 0, activeUsers: 0 };
      }
      acc[date].users += 1;
      if (user.role === 'SUPER_ADMIN') acc[date].superAdmins += 1;
      // For now, treat all users as active
      acc[date].activeUsers += 1;
      return acc;
    }, {});

    // Top Performing Users
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        funnels: {
          select: {
            id: true,
            revenue: true,
            visitors: true,
            conversions: true,
            published: true
          }
        },
        products: {
          select: {
            revenue: true,
            sales: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Calculate user performance metrics
    const usersWithMetrics = topUsers.map(user => {
      const totalRevenue = user.funnels.reduce((sum, funnel) => sum + funnel.revenue, 0) +
                          user.products.reduce((sum, product) => sum + product.revenue, 0);
      const totalVisitors = user.funnels.reduce((sum, funnel) => sum + funnel.visitors, 0);
      const totalConversions = user.funnels.reduce((sum, funnel) => sum + funnel.conversions, 0);
      const publishedFunnels = user.funnels.filter(f => f.published).length;
      const conversionRate = totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;

      return {
        ...user,
        metrics: {
          totalRevenue,
          totalVisitors,
          totalConversions,
          conversionRate,
          publishedFunnels,
          totalFunnels: user.funnels.length,
          totalProducts: user.products.length
        }
      };
    });

    // Top Performing Funnels
    const topFunnels = await prisma.funnel.findMany({
      select: {
        id: true,
        name: true,
        published: true,
        revenue: true,
        visitors: true,
        conversions: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { revenue: 'desc' },
      take: 10
    });

    // Platform Health Metrics
    const totalRevenue = (totalTransactionRevenue._sum.amount || 0) + (totalSubscriptionRevenue._sum.amount || 0);
    const platformHealth = {
      activeUsersRatio: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
      publishedFunnelsRatio: totalFunnels > 0 ? (publishedFunnels / totalFunnels) * 100 : 0,
      averageRevenuePerUser: totalUsers > 0 ? totalRevenue / totalUsers : 0,
      conversionRate: totalTransactions > 0 ? (totalTransactions / totalUsers) * 100 : 0
    };

    // Recent Activity
    const recentActivity = await prisma.funnelOrder.findMany({
      select: {
        id: true,
        amount: true,
        createdAt: true,
        customerEmail: true,
        funnel: {
          select: {
            name: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // Geographic Distribution (if we had location data)
    const userRegions = await prisma.user.groupBy({
      by: ['createdAt'],
      _count: true,
      orderBy: { _count: { createdAt: 'desc' } }
    });

    // System Performance Metrics
    const systemMetrics = {
      totalStorage: 0, // Would need file storage analysis
      averageResponseTime: 0, // Would need monitoring integration
      uptime: 99.9, // Would need actual monitoring
      errorRate: 0.1 // Would need error tracking
    };

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsers,
        totalFunnels,
        publishedFunnels,
        totalRevenue,
        subscriptionRevenue: totalSubscriptionRevenue._sum.amount || 0,
        transactionRevenue: totalTransactionRevenue._sum.amount || 0,
        totalTransactions,
        totalProducts,
        totalSites,
        platformHealth
      },
      analytics: {
        revenueData: Object.values(dailyRevenue),
        userGrowthData: Object.values(dailyUserGrowth),
        topUsers: usersWithMetrics,
        topFunnels,
        recentActivity,
        userRegions,
        systemMetrics
      },
      period,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}