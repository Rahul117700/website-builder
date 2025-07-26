import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const sites = await prisma.site.findMany({
    where: userId ? { userId } : {},
    include: { user: true, pages: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(sites);
} 