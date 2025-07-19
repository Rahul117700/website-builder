import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(transactions);
} 