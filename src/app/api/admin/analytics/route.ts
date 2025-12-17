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
    
    const totalFunnels = await prisma.funnel.count();
    console.log('Total funnels:', totalFunnels);
    
    const totalProducts = await prisma.digitalProduct.count();
    console.log('Total products:', totalProducts);
    
    const activeFunnels = await prisma.funnel.count({
      where: { status: 'ACTIVE' }
    });
    console.log('Active funnels:', activeFunnels);
    
    const publishedFunnels = await prisma.funnel.count({
      where: { published: true }
    });
    console.log('Published funnels:', publishedFunnels);
    
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

    // Total platform revenue
    const totalRevenue = transactionRevenue + subscriptionRevenue;

    console.log('Revenue calculation:', {
      transactionRevenue,
      subscriptionRevenue,
      totalRevenue,
      orderCount: completedOrders.length,
      subscriptionCount: totalSubscriptions,
      activeSubscriptions
    });

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
    console.log('Platform conversion rate:', platformConversionRate);

    // Calculate average revenue per user
    const averageRevenuePerUser = activeUsers > 0 ? totalRevenue / activeUsers : 0;
    console.log('Average revenue per user:', averageRevenuePerUser);

    // Get recent funnels with user info
    const recentFunnels = await prisma.funnel.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        product: {
          select: {
            name: true,
            price: true,
          }
        }
      }
    });

    // Get all users with their basic counts and funnels
    const allUsers = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            funnels: true,
          }
        },
        funnels: {
          select: {
            id: true,
          }
        }
      }
    });

    // Calculate revenue and conversion rate for each user
    const usersWithMetrics = await Promise.all(
      allUsers.map(async (user) => {
        // Get all funnel IDs for this user
        const userFunnelIds = user.funnels.map(f => f.id);

        let userRevenue = 0;
        let userViews = 0;
        let userConversions = 0;

        // Only query if user has funnels
        if (userFunnelIds.length > 0) {
          // Query completed orders directly for this user's funnels
          const userCompletedOrders = await prisma.funnelOrder.findMany({
            where: {
              funnelId: {
                in: userFunnelIds
              },
              status: {
                in: ['COMPLETED', 'completed', 'Completed'] // Handle different case variations
              }
            },
            select: {
              amount: true,
              id: true,
            }
          });

          // Calculate total revenue
          userRevenue = userCompletedOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
          userConversions = userCompletedOrders.length;

          // Query views for this user's funnels
          userViews = await prisma.funnelAnalytics.count({
            where: {
              funnelId: {
                in: userFunnelIds
              },
              event: {
                in: ['VIEW', 'view', 'View']
              }
            }
          });
        }

        // Calculate conversion rate
        const conversionRate = userViews > 0 ? (userConversions / userViews) * 100 : 0;

        // Debug logging for ALL users to see what's happening
        console.log(`User ${user.email} (${user.id}):`);
        console.log(`  - Funnels: ${user._count.funnels}`);
        console.log(`  - Funnel IDs: [${userFunnelIds.join(', ')}]`);
        console.log(`  - Completed orders: ${userConversions}`);
        console.log(`  - Revenue: ₹${userRevenue}`);
        console.log(`  - Views: ${userViews}`);
        console.log(`  - Conversion rate: ${conversionRate.toFixed(2)}%`);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          funnels: user._count.funnels,
          products: 0, // Digital products count removed - relation doesn't exist on User model
          revenue: userRevenue,
          conversionRate: conversionRate,
        };
      })
    );

    // Log total stats before sorting
    console.log(`\nTotal users processed: ${usersWithMetrics.length}`);
    console.log(`Users with revenue > 0: ${usersWithMetrics.filter(u => u.revenue > 0).length}`);

    // Sort by revenue (descending) and take top 10
    const formattedTopUsers = usersWithMetrics
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    console.log('Top users summary:');
    formattedTopUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}: ₹${user.revenue} (${user.funnels} funnels)`);
    });
    
    // Calculate some basic metrics
    const publishedFunnelsRatio = totalFunnels > 0 ? (publishedFunnels / totalFunnels) * 100 : 0;
    const activeUsersRatio = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

    const responseData = {
      overview: {
        totalUsers,
        totalFunnels,
        totalProducts,
        activeFunnels,
        publishedFunnels,
        totalRevenue: totalRevenue,
        subscriptionRevenue: subscriptionRevenue,
        transactionRevenue: transactionRevenue,
        activeSubscriptions: activeSubscriptions,
        totalSubscriptions: totalSubscriptions,
        activeUsers,
        platformHealth: {
          activeUsersRatio,
          publishedFunnelsRatio,
          averageRevenuePerUser: averageRevenuePerUser,
          conversionRate: platformConversionRate,
        }
      },
      analytics: {
        topUsers: formattedTopUsers,
        recentFunnels: recentFunnels.map(funnel => ({
          id: funnel.id,
          name: funnel.name,
          userName: funnel.user?.name || 'Unknown',
          userEmail: funnel.user?.email,
          productName: funnel.product?.name,
          productPrice: funnel.product?.price,
          status: funnel.status,
          createdAt: funnel.createdAt,
        })),
        recentActivity: recentFunnels.slice(0, 5).map(funnel => ({
          type: 'funnel_created',
          description: `${funnel.user?.name || 'User'} created funnel "${funnel.name}"`,
          timestamp: funnel.createdAt,
          user: funnel.user?.name || 'Unknown',
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

