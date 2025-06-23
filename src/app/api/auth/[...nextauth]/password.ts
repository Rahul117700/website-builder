import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './route';
import { prisma } from '@/lib/prisma';
import { compare, hash } from 'bcryptjs';

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.password) {
    return NextResponse.json({ error: 'User not found or no password set' }, { status: 404 });
  }
  const isValid = await compare(currentPassword, user.password);
  if (!isValid) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
  }
  const hashed = await hash(newPassword, 10);
  await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } });
  return NextResponse.json({ success: true });
} 