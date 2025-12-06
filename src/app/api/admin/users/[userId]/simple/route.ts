import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is SUPER_ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Super Admin access required' }, { status: 403 });
    }

    const { userId } = params;

    // Get basic user information first
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        image: true,
        phone: true,
        website: true,
        emailVerified: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get counts separately to avoid complex queries
    const counts = await Promise.all([
      prisma.funnel.count({ where: { userId } }),
      prisma.digitalProduct.count({ where: { userId } }),
      prisma.site.count({ where: { userId } }),
      prisma.transaction.count({ where: { userId } }),
      prisma.razorpayConfig.count({ where: { userId } }),
      prisma.apiKey.count({ where: { userId } }),
      prisma.domain.count({ where: { userId } }),
      prisma.userNotification.count({ where: { userId } })
    ]);

    // Get recent funnels
    const recentFunnels = await prisma.funnel.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        published: true,
        revenue: true,
        visitors: true,
        conversions: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get recent products
    const recentProducts = await prisma.digitalProduct.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        type: true,
        price: true,
        description: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      select: {
        id: true,
        amount: true,
        currency: true,
        type: true,
        description: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get recent funnel orders for activity
    const recentActivity = await prisma.funnelOrder.findMany({
      where: {
        funnel: { userId }
      },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        customerEmail: true,
        funnel: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Calculate metrics
    const totalRevenue = recentFunnels.reduce((sum, funnel) => sum + (funnel.revenue || 0), 0) +
                       recentTransactions.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
    
    const totalVisitors = recentFunnels.reduce((sum, funnel) => sum + (funnel.visitors || 0), 0);
    const totalConversions = recentFunnels.reduce((sum, funnel) => sum + (funnel.conversions || 0), 0);
    const conversionRate = totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;
    const publishedFunnels = recentFunnels.filter(f => f.published).length;
    const draftFunnels = recentFunnels.filter(f => !f.published).length;

    const userWithDetails = {
      ...user,
      _count: {
        funnels: counts[0],
        products: counts[1],
        sites: counts[2],
        transactions: counts[3],
        razorpayConfigs: counts[4],
        apiKeys: counts[5],
        domains: counts[6],
        notifications: counts[7]
      },
      funnels: recentFunnels,
      products: recentProducts,
      transactions: recentTransactions,
      razorpayConfigs: [],
      apiKeys: [],
      domains: [],
      notifications: [],
      metrics: {
        totalRevenue,
        totalVisitors,
        totalConversions,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        publishedFunnels,
        draftFunnels,
        totalTransactions: counts[3],
        completedTransactions: counts[3], // All transactions are considered completed
        recentActivity
      }
    };

    return NextResponse.json({ user: userWithDetails });

  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}
