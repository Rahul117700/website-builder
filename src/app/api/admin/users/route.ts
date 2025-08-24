import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // If ?count=1, return user count
  const { searchParams } = new URL(req.url);
  if (searchParams.get('count') === '1') {
    const count = await prisma.user.count();
    return NextResponse.json({ total: count });
  }
  const users = await prisma.user.findMany({
    include: {
      sites: true,
      // subscriptions: { include: { plan: true } }, // DISABLED - No longer using subscription model
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { name, email, role, enabled } = await req.json();
  if (!email || !name) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }
  const user = await prisma.user.create({
    data: { name, email, role: role || 'USER', enabled: enabled !== undefined ? Boolean(enabled) : true },
  });
  return NextResponse.json(user);
}

 