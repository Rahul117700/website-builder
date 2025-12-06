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

    // Get detailed user information
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
        emailVerified: true,
        // Include all related data
        funnels: {
          select: {
            id: true,
            name: true,
            published: true,
            revenue: true,
            visitors: true,
            conversions: true,
            createdAt: true,
            updatedAt: true,
            template: {
              select: {
                name: true,
                type: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            price: true,
            fileUrl: true,
            fileSize: true,
            fileType: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: { createdAt: 'desc' }
        },
        sites: {
          select: {
            id: true,
            name: true,
            domain: true,
            status: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: { createdAt: 'desc' }
        },
        transactions: {
          select: {
            id: true,
            amount: true,
            createdAt: true,
            currency: true,
            type: true,
            description: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        razorpayConfigs: {
          select: {
            id: true,
            keyId: true,
            keySecret: true,
            webhookSecret: true,
            isActive: true,
            createdAt: true
          }
        },
        apiKeys: {
          select: {
            id: true,
            name: true,
            key: true,
            isActive: true,
            lastUsed: true,
            createdAt: true
          }
        },
        domains: {
          select: {
            id: true,
            domain: true,
            createdAt: true
          }
        },
        notifications: {
          select: {
            id: true,
            title: true,
            message: true,
            type: true,
            read: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: {
          select: {
            funnels: true,
            products: true,
            sites: true,
            transactions: true,
            razorpayConfigs: true,
            apiKeys: true,
            domains: true,
            notifications: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate user metrics
    const totalRevenue = user.transactions.reduce((sum, transaction) => {
      return sum + transaction.amount;
    }, 0);

    const totalVisitors = user.funnels.reduce((sum, funnel) => sum + funnel.visitors, 0);
    const totalConversions = user.funnels.reduce((sum, funnel) => sum + funnel.conversions, 0);
    const conversionRate = totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;

    const publishedFunnels = user.funnels.filter(f => f.published).length;
    const draftFunnels = user.funnels.filter(f => !f.published).length;

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await prisma.funnelOrder.findMany({
      where: {
        funnel: {
          userId: userId
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
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

    const userWithMetrics = {
      ...user,
      metrics: {
        totalRevenue,
        totalVisitors,
        totalConversions,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        publishedFunnels,
        draftFunnels,
        totalTransactions: user.transactions.length,
        completedTransactions: user.transactions.length, // All transactions are considered completed for now
        recentActivity
      }
    };

    return NextResponse.json({ user: userWithMetrics });

  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}
