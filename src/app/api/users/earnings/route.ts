import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const total = await prisma.sellerEarning.aggregate({ _sum: { netAmount: true }, where: { sellerId: session.user.id } });
  return NextResponse.json({ total: total._sum.netAmount || 0 });
}

