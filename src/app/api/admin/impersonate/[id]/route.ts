import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { encode } from 'next-auth/jwt';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const targetUser = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, email: true, name: true, image: true, role: true },
  });
  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  // Log activity
  await prisma.activity.create({
    data: {
      type: 'impersonate',
      userId: session.user.id,
      targetId: targetUser.id,
      description: `Impersonated user ${targetUser.email}`,
    },
  });
  // Create a JWT for the target user
  const token = await encode({
    token: {
      id: targetUser.id,
      email: targetUser.email,
      name: targetUser.name,
      image: targetUser.image,
      role: targetUser.role,
    },
    secret: process.env.NEXTAUTH_SECRET!,
  });
  // Set the session cookie
  const res = NextResponse.json({ success: true, redirect: '/auth/dashboard' });
  res.cookies.set('next-auth.session-token', token, { path: '/', httpOnly: true });
  return res;
} 