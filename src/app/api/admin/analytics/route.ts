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
    const analytics = await prisma.pageAnalytics.findMany({
      where: {
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: 'desc' },
    });

    // Group by page
    const pageStats = await prisma.pageAnalytics.groupBy({
      by: ['page'],
      _sum: {
        visits: true,
        uniqueVisitors: true,
      },
      where: {
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        _sum: {
          visits: 'desc',
        },
      },
    });

    // Total stats
    const totalVisits = pageStats.reduce((sum, stat) => sum + (stat._sum.visits || 0), 0);
    const totalUnique = pageStats.reduce((sum, stat) => sum + (stat._sum.uniqueVisitors || 0), 0);

    // Popular pages
    const topPages = pageStats.slice(0, 10).map(stat => ({
      page: stat.page,
      visits: stat._sum.visits || 0,
      uniqueVisitors: stat._sum.uniqueVisitors || 0,
    }));

    return NextResponse.json({
      totalVisits,
      totalUnique,
      topPages,
      pageStats: pageStats.map(stat => ({
        page: stat.page,
        visits: stat._sum.visits || 0,
        uniqueVisitors: stat._sum.uniqueVisitors || 0,
      })),
      analytics,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
