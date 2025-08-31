import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../../lib/prisma';
// import { authOptions } from '../../../../auth/[...nextauth]/route';
// import { authOptions } from '../auth/[...nextauth]/route';
import { authOptions } from '../../auth/[...nextauth]/route';


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's sites
    const userSites = await prisma.site.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        status: true,
        type: true
      }
    });

    const totalSites = userSites.length;
    const activeSites = userSites.filter(site => site.status === 'ACTIVE').length;

    // Calculate total revenue from all user's sites
    const totalRevenue = await prisma.payment.aggregate({
      where: {
        userId: session.user.id,
        status: 'SUCCESS'
      },
      _sum: {
        amount: true
      }
    });

    // Get total monthly visitors across all user sites
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyVisitors = await prisma.analytics.count({
      where: {
        site: {
          userId: session.user.id
        },
        createdAt: {
          gte: currentMonth
        }
      }
    });

    return NextResponse.json({
      totalSites,
      activeSites,
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyVisitors
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
