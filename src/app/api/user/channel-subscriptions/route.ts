import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - Get user's channel subscriptions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all channel subscriptions for the user
    const subscriptions = await prisma.channelSubscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        channel: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            profileImage: true,
            coverImage: true,
            subscriptionPrice: true,
            subscriptionCurrency: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Separate active and expired subscriptions
    const activeSubscriptions = subscriptions.filter(
      (sub) => sub.status === 'ACTIVE' && new Date(sub.endDate) > new Date()
    );
    const expiredSubscriptions = subscriptions.filter(
      (sub) => sub.status === 'EXPIRED' || new Date(sub.endDate) <= new Date()
    );

    return NextResponse.json({
      active: activeSubscriptions,
      expired: expiredSubscriptions,
      all: subscriptions,
    });
  } catch (error) {
    console.error('Error fetching channel subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

