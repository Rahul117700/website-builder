import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/admin/users/[id]/analytics - Get analytics for all sites owned by the user
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = params.id;
  // Get all site IDs owned by the user
  const sites = await prisma.site.findMany({ where: { userId }, select: { id: true } });
  const siteIds = sites.map(s => s.id);
  if (siteIds.length === 0) {
    return NextResponse.json({ visits: [], pageViews: [] });
  }
  // Get analytics for the last 6 months, grouped by month
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  // For each month, count analytics
  const visits: number[] = [];
  const pageViews: number[] = [];
  for (const m of months) {
    const start = new Date(m.year, m.month - 1, 1);
    const end = new Date(m.year, m.month, 1);
    // Count analytics records for this month
    const count = await prisma.analytics.count({
      where: {
        siteId: { in: siteIds },
        createdAt: { gte: start, lt: end },
      },
    });
    visits.push(count);
    // For page views, count all analytics (assuming each record is a page view)
    pageViews.push(count);
  }
  return NextResponse.json({
    months: months.map(m => `${m.year}-${String(m.month).padStart(2, '0')}`),
    visits,
    pageViews,
  });
} 