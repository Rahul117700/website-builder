import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payouts = await (prisma as any).payout.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(payouts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { amount } = await req.json();
  if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  const payout = await (prisma as any).payout.create({ data: { userId: session.user.id, amount } });
  return NextResponse.json(payout);
}

