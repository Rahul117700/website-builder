import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
// import prisma from '@/lib/prisma';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's channels with template info and counts
    const channels = await prisma.channel.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            previewImage: true,
          },
        },
        _count: {
          select: {
            products: true,
            subscribers: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform channels to include analytics - calculate subscription revenue and total views
    const channelsWithAnalytics = await Promise.all(channels.map(async (channel) => {
      // Calculate revenue from active subscriptions only
      let subscriptionRevenue = 0;
      const activeSubscriptions = await prisma.channelSubscription.findMany({
        where: {
          channelId: channel.id,
          status: 'ACTIVE',
          endDate: {
            gt: new Date(), // Not expired
          },
        },
      });

      activeSubscriptions.forEach(subscription => {
        const subAmount = typeof subscription.amount === 'object' && subscription.amount !== null
          ? Number(subscription.amount.toString())
          : Number(subscription.amount || 0);
        subscriptionRevenue += subAmount;
      });

      // Calculate total views from all products in the channel
      const products = await prisma.channelProduct.findMany({
        where: {
          channelId: channel.id,
        },
        select: {
          viewCount: true,
        },
      });

      const totalViews = products.reduce((sum, product) => sum + (product.viewCount || 0), 0);

      console.log(`[Channels API] Channel ${channel.name}: totalViews=${totalViews} (from ${products.length} products)`);

      return {
        ...channel,
        analytics: {
          totalViews: totalViews,
          totalRevenue: subscriptionRevenue, // SUBSCRIPTIONS ONLY
        },
      };
    }));

    return NextResponse.json(channelsWithAnalytics);
  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    );
  }
}

