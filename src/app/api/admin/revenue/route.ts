import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
      if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  const revenue = await prisma.revenue.findFirst();
  const commission = await prisma.commissionSetting.findFirst();
  return NextResponse.json({ total: revenue?.total || 0, commissionRate: commission?.rate ?? 0.07 });
} 

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { rate } = await req.json();
  if (rate == null || rate < 0 || rate > 1) return NextResponse.json({ error: 'Invalid rate' }, { status: 400 });
  const record = await prisma.commissionSetting.upsert({ where: { id: (await prisma.commissionSetting.findFirst())?.id || '' }, update: { rate }, create: { rate } });
  return NextResponse.json({ success: true, commissionRate: record.rate });
}