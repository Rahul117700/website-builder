import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get products the user has viewed (based on viewCount updates)
    // We'll use products that have been recently updated as a proxy for viewed products
    // In production, you'd track individual view events
    const viewedProducts = await prisma.channelProduct.findMany({
      where: {
        viewCount: { gt: 0 },
      },
      include: {
        channel: {
          select: {
            id: true,
            name: true,
            slug: true,
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 50,
    });

    return NextResponse.json({ products: viewedProducts });
  } catch (error) {
    console.error('Error fetching user history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

