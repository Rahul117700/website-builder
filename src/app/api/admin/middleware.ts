import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function verifySuperAdmin(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return { error: 'Unauthorized', status: 401 };
    }

    // Check if user is SUPER_ADMIN
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, status: true }
    });

    if (!user || user.role !== 'SUPER_ADMIN') {
      return { error: 'Forbidden - Super Admin access required', status: 403 };
    }

    if (user.status !== 'ACTIVE') {
      return { error: 'Account disabled', status: 403 };
    }

    return { success: true };
  } catch (error) {
    console.error('Error verifying super admin:', error);
    return { error: 'Internal server error', status: 500 };
  } finally {
    await prisma.$disconnect();
  }
}
