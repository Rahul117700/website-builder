import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is super admin
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ACTIVE';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Fetch subscribers
    const subscribers = await prisma.newsletterSubscription.findMany({
      where: status !== 'ALL' ? { status: status as any } : undefined,
      orderBy: { subscribedAt: 'desc' },
      skip,
      take: limit,
    });

    // Get total count
    const total = await prisma.newsletterSubscription.count({
      where: status !== 'ALL' ? { status: status as any } : undefined,
    });

    // Get stats
    const stats = await prisma.newsletterSubscription.groupBy({
      by: ['status'],
      _count: true,
    });

    return NextResponse.json({
      subscribers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

