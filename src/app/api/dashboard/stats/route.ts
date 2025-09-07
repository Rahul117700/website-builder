import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's sites
    const sites = await prisma.site.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        createdAt: true
      }
    });

    // Calculate stats
    const totalSites = sites.length;
    const activeSites = sites.filter(site => site.status === 'ACTIVE').length;

    // Get user's current plan
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      },
      include: {
        plan: {
          select: {
            name: true,
            price: true,
            billingCycle: true,
            description: true,
            features: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get user's revenue (if any)
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        status: 'COMPLETED'
      },
      select: {
        amount: true
      }
    });

    const totalRevenue = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

    const stats = {
      totalSites,
      activeSites,
      totalRevenue,
      monthlyVisitors: 0, // This would need to be calculated from analytics
      currentPlan: subscription?.plan || null
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
