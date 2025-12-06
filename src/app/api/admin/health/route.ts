import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is SUPER_ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Super Admin access required' }, { status: 403 });
    }

    // Get basic platform stats
    const [totalUsers, totalFunnels, totalRevenue] = await Promise.all([
      prisma.user.count(),
      prisma.funnel.count(),
      prisma.funnelOrder.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
      })
    ]);

    return NextResponse.json({
      status: 'healthy',
      message: 'Super Admin API is working',
      user: currentUser,
      platform: {
        totalUsers,
        totalFunnels,
        totalRevenue: totalRevenue._sum.amount || 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in admin health check:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
