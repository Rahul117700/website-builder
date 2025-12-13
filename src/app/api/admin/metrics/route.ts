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

    // Get total funnels
    const totalFunnels = await prisma.funnel.count();
    
    // Get active funnels
    const activeFunnels = await prisma.funnel.count({
      where: {
        status: 'ACTIVE'
      }
    });

    // Get total products
    const totalProducts = await prisma.digitalProduct.count();
    
    // Get newsletter subscribers
    const totalSubscribers = await prisma.newsletterSubscription.count({
      where: {
        status: 'ACTIVE'
      }
    });

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

    // Get recent funnels (last 30 days)
    const recentFunnels = await prisma.funnel.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    const summary = {
      totalUsers,
      totalFunnels,
      totalProducts,
      activeFunnels,
      totalSubscribers,
      recentUsers,
      recentFunnels,
      totalRevenue: 0, // Placeholder - add order tracking later
      conversionRate: totalUsers > 0 ? Math.round((recentUsers / totalUsers) * 100 * 10) / 10 : 0
    };

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
