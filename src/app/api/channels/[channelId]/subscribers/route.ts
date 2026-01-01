import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/channels/[channelId]/subscribers - Get all subscribers for a channel (owner only)
export async function GET(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns the channel
    const channel = await prisma.channel.findUnique({
      where: {
        id: params.channelId,
        userId: session.user.id,
      },
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found or unauthorized' }, { status: 404 });
    }

    // Get all subscriptions with user details
    const subscriptions = await prisma.channelSubscription.findMany({
      where: {
        channelId: params.channelId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate stats
    const activeSubscriptions = subscriptions.filter(
      (sub) => sub.status === 'ACTIVE' && new Date(sub.endDate) > new Date()
    );
    const totalRevenue = subscriptions.reduce(
      (sum, sub) => sum + Number(sub.amount),
      0
    );

    return NextResponse.json({
      subscriptions,
      stats: {
        total: subscriptions.length,
        active: activeSubscriptions.length,
        expired: subscriptions.length - activeSubscriptions.length,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

