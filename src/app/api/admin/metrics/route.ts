import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/admin/metrics - Get admin dashboard metrics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total users
    const totalUsers = await prisma.user.count();

    // Get total revenue from transactions
    const revenueData = await prisma.transaction.aggregate({
      where: {
        status: 'COMPLETED'
      },
      _sum: {
        amount: true
      }
    });

    // Get active sites
    const activeSites = await prisma.site.count({
      where: {
        status: 'ACTIVE'
      }
    });

    // Get total instances
    const totalInstances = await prisma.instance.count();

    // Get allocated instances
    const allocatedInstances = await prisma.instance.count({
      where: {
        status: 'ALLOCATED'
      }
    });

    // Get total domains
    const totalDomains = await prisma.domain.count();

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get recent revenue (last 30 days)
    const recentRevenue = await prisma.transaction.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _sum: {
        amount: true
      }
    });

    // Calculate conversion rate (simplified)
    const conversionRate = totalUsers > 0 ? (recentUsers / totalUsers) * 100 : 0;

    const summary = {
      totalUsers,
      totalRevenue: revenueData._sum.amount || 0,
      recentRevenue: recentRevenue._sum.amount || 0,
      activeSites,
      totalInstances,
      allocatedInstances,
      totalDomains,
      recentUsers,
      conversionRate: Math.round(conversionRate * 10) / 10
    };

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
