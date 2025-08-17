import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

function startOfDay(d: Date): Date { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function addDays(d: Date, n: number): Date { const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function fmtDate(d: Date): string { return d.toISOString().slice(0,10); }

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const days = Number(url.searchParams.get('days') || 90);
  const today = startOfDay(new Date());
  const since = addDays(today, -Math.max(7, Math.min(365, days)));

  // Users
  const [totalUsers, usersRange] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
  ]);

  const usersByDay: Record<string, number> = {};
  for (let d = new Date(since); d <= today; d = addDays(d, 1)) usersByDay[fmtDate(d)] = 0;
  usersRange.forEach((u) => { const k = fmtDate(startOfDay(new Date(u.createdAt))); usersByDay[k] = (usersByDay[k] || 0) + 1; });

  // Payments: separate plan revenue vs template gross
  const successfulStatuses = ['paid','captured','succeeded','success','completed'];
  const payments = await prisma.payment.findMany({
    where: {
      createdAt: { gte: since },
      NOT: { status: { in: ['failed','pending','cancelled'] } },
    },
    select: { amount: true, createdAt: true, planId: true, templateId: true, status: true },
    orderBy: { createdAt: 'asc' },
  });

  const plansRevenueByDay: Record<string, number> = {};
  const templateGrossByDay: Record<string, number> = {};
  for (let d = new Date(since); d <= today; d = addDays(d, 1)) {
    const k = fmtDate(d); plansRevenueByDay[k] = 0; templateGrossByDay[k] = 0;
  }
  for (const p of payments) {
    const k = fmtDate(startOfDay(new Date(p.createdAt)));
    if (p.planId) plansRevenueByDay[k] += Number(p.amount || 0);
    if (p.templateId) templateGrossByDay[k] += Number(p.amount || 0);
  }

  // Template commission (platform revenue) via SellerEarning.commissionAmount
  const earnings = await prisma.sellerEarning.findMany({
    where: { createdAt: { gte: since } },
    select: { commissionAmount: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  const templateCommissionByDay: Record<string, number> = {};
  for (let d = new Date(since); d <= today; d = addDays(d, 1)) {
    const k = fmtDate(d); templateCommissionByDay[k] = 0;
  }
  for (const e of earnings) {
    const k = fmtDate(startOfDay(new Date(e.createdAt)));
    templateCommissionByDay[k] += Number(e.commissionAmount || 0);
  }

  // Compose time series
  const series: Array<{ date: string; users: number; plansRevenue: number; templateCommission: number; totalRevenue: number; templateGross: number }>
    = Object.keys(usersByDay).sort().map((date) => ({
      date,
      users: usersByDay[date] || 0,
      plansRevenue: plansRevenueByDay[date] || 0,
      templateCommission: templateCommissionByDay[date] || 0,
      totalRevenue: (plansRevenueByDay[date] || 0) + (templateCommissionByDay[date] || 0),
      templateGross: templateGrossByDay[date] || 0,
    }));

  const totals = series.reduce(
    (acc, d) => {
      acc.users += d.users;
      acc.plansRevenue += d.plansRevenue;
      acc.templateCommission += d.templateCommission;
      acc.templateGross += d.templateGross;
      acc.totalRevenue += d.totalRevenue;
      return acc;
    },
    { users: 0, plansRevenue: 0, templateCommission: 0, templateGross: 0, totalRevenue: 0 }
  );

  return NextResponse.json({
    summary: {
      totalUsers,
      revenue: {
        total: totals.totalRevenue,
        plans: totals.plansRevenue,
        templateCommission: totals.templateCommission,
        templateGross: totals.templateGross,
      },
    },
    series,
    range: { since: fmtDate(since), until: fmtDate(today) },
  });
}


