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

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch page analytics
    const analytics = await prisma.analytics.findMany({
      where: {
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: 'desc' },
    });

    // Group by page
    const pageStats = await prisma.analytics.groupBy({
      by: ['pageUrl'],
      _sum: {
        pageViews: true,
        visitors: true,
      },
      where: {
        date: {
          gte: startDate,
        },
        pageUrl: {
          not: null,
        },
      },
      orderBy: {
        _sum: {
          pageViews: 'desc',
        },
      },
    });

    // Total stats
    const totalVisits = pageStats.reduce((sum, stat) => sum + (stat._sum.pageViews || 0), 0);
    const totalUnique = pageStats.reduce((sum, stat) => sum + (stat._sum.visitors || 0), 0);

    // Calculate number of days in the range
    const daysInRange = Math.max(1, Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Popular pages with average per day
    const topPages = pageStats.slice(0, 10).map(stat => ({
      page: stat.pageUrl,
      visits: stat._sum.pageViews || 0,
      uniqueVisitors: stat._sum.visitors || 0,
      avgPerDay: daysInRange > 0 ? Math.round((stat._sum.pageViews || 0) / daysInRange) : 0,
    }));

    return NextResponse.json({
      totalVisits,
      totalUnique,
      topPages,
      daysInRange,
      pageStats: pageStats.map(stat => ({
        page: stat.pageUrl,
        visits: stat._sum.pageViews || 0,
        uniqueVisitors: stat._sum.visitors || 0,
        avgPerDay: daysInRange > 0 ? Math.round((stat._sum.pageViews || 0) / daysInRange) : 0,
      })),
      analytics,
    });
  } catch (error) {
    console.error('Error fetching page analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page analytics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

