import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  console.log('--- /api/admin/users/[id]/subscriptions GET handler called ---');
  const session = await getServerSession(authOptions);
  console.log('Session:', session);
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    console.log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = context.params.id;
  console.log('User ID param:', userId);
  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
    include: { plan: true },
    orderBy: { startDate: 'desc' },
  });
  console.log('Fetched subscriptions:', subscriptions);
  return NextResponse.json(subscriptions);
} 