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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get counts
    const totalUsers = await prisma.user.count();
    const totalFunnels = await prisma.funnel.count();
    const totalProducts = await prisma.digitalProduct.count();
    const activeFunnels = await prisma.funnel.count({
      where: { status: 'ACTIVE' }
    });
    
    const activeUsers = await prisma.user.count({
      where: { status: 'ACTIVE' }
    });

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

    // Get top users by funnel count
    const topUsers = await prisma.user.findMany({
      take: 10,
      include: {
        _count: {
          select: {
            funnels: true,
            digitalProducts: true,
          }
        }
      },
      orderBy: {
        funnels: {
          _count: 'desc'
        }
      }
    });

    // Format top users data
    const formattedTopUsers = topUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      funnels: user._count.funnels,
      products: user._count.digitalProducts,
      revenue: 0, // Placeholder - you can add order tracking later
      conversionRate: 0, // Placeholder
    }));
    
    // Calculate some basic metrics
    const publishedFunnelsRatio = totalFunnels > 0 ? (activeFunnels / totalFunnels) * 100 : 0;
    const activeUsersRatio = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

    return NextResponse.json({
      overview: {
        totalUsers,
        totalFunnels,
        totalProducts,
        activeFunnels,
        totalRevenue: 0, // Placeholder
        subscriptionRevenue: 0, // Placeholder  
        transactionRevenue: 0, // Placeholder
        activeUsers,
        platformHealth: {
          activeUsersRatio,
          publishedFunnelsRatio,
          averageRevenuePerUser: 0,
          conversionRate: 0,
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
    });
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

