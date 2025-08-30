import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../../lib/prisma';
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
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    const siteIds = userSites.map(site => site.id);

    if (siteIds.length === 0) {
      return NextResponse.json({
        totalRevenue: 0,
        activeUsers: 0,
        pageViews: 0,
        conversionRate: 0
      });
    }

    // Calculate total revenue from payments (since templates don't have direct userId)
    const totalRevenue = await prisma.payment.aggregate({
      where: {
        userId: session.user.id,
        status: 'completed'
      },
      _sum: {
        amount: true
      }
    });

    // Get total page views across all user sites
    const totalPageViews = await prisma.analytics.count({
      where: {
        siteId: {
          in: siteIds
        }
      }
    });

    // Get unique visitors across all user sites
    const uniqueVisitors = await prisma.analytics.groupBy({
      by: ['visitorId'],
      where: {
        siteId: {
          in: siteIds
        },
        visitorId: {
          not: null
        }
      }
    });

    // Calculate conversion rate (payments vs views)
    const totalTemplatesSold = await prisma.payment.count({
      where: {
        userId: session.user.id,
        status: 'completed'
      }
    });

    const conversionRate = totalPageViews > 0 ? (totalTemplatesSold / totalPageViews) * 100 : 0;

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      activeUsers: uniqueVisitors.length,
      pageViews: totalPageViews,
      conversionRate: Math.round(conversionRate * 100) / 100 // Round to 2 decimal places
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
