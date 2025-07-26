import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET: Return the latest frontend content
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const content = await prisma.frontendContent.findFirst({
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json(content || { data: {} });
}

// PUT: Update or create the frontend content
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
  // Upsert: update if exists, else create
  const latest = await prisma.frontendContent.findFirst({ orderBy: { updatedAt: 'desc' } });
  let content;
  if (latest) {
    content = await prisma.frontendContent.update({
      where: { id: latest.id },
      data: { data: body },
    });
  } else {
    content = await prisma.frontendContent.create({
      data: { data: body },
    });
  }
  return NextResponse.json(content);
} 