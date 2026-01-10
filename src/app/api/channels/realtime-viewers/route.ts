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

    // Get user's channels with products
    const channels = await prisma.channel.findMany({
      where: { userId: user.id },
      include: {
        products: {
          select: {
            id: true,
            title: true,
            viewCount: true,
            updatedAt: true,
          },
        },
      },
    });

    // Calculate current viewers based on recent activity
    // Since we don't have timestamped analytics, we'll estimate based on:
    // - Products viewed in the last hour (updatedAt indicates recent view activity)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    let totalCurrentViewers = 0;
    const viewersByChannel: { [key: string]: { name: string; viewers: number } } = {};
    let topViewedChannel: { id: string; name: string; viewers: number } | null = null;

    channels.forEach(channel => {
      // Count products that have been viewed recently (updated in last hour)
      // This is a simplified approach - in a real app, you'd track actual session data
      const recentProductViews = channel.products.filter(product => {
        const lastUpdated = new Date(product.updatedAt);
        return lastUpdated >= oneHourAgo && product.viewCount > 0;
      });

      // Estimate current viewers: assume 1-2 viewers per recently viewed product
      const channelViewers = Math.min(
        recentProductViews.length * 1.5, // Average 1.5 viewers per active product
        channel.products.reduce((sum, p) => sum + Math.min(p.viewCount || 0, 10), 0) // Cap at reasonable number
      );

      viewersByChannel[channel.id] = {
        name: channel.name,
        viewers: Math.round(channelViewers),
      };

      totalCurrentViewers += Math.round(channelViewers);
    });

    // Find top viewed channel
    if (channels.length > 0) {
      const topChannel = channels.reduce((top, channel) => {
        const currentViews = viewersByChannel[channel.id]?.viewers || 0;
        const topViews = viewersByChannel[top.id]?.viewers || 0;
        return currentViews > topViews ? channel : top;
      }, channels[0]);

      topViewedChannel = {
        id: topChannel.id,
        name: topChannel.name,
        viewers: viewersByChannel[topChannel.id]?.viewers || 0,
      };
    }

    // Get view history for the last 24 hours (hourly intervals) for the background trend
    const now = new Date();
    const twentyFourHoursAgo = new Date(now);
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Fetch actual view events from FunnelAnalytics for the last 24 hours
    const historicalViews = await prisma.funnelAnalytics.findMany({
      where: {
        funnel: { userId: user.id },
        event: 'view',
        createdAt: { gte: twentyFourHoursAgo }
      },
      select: { createdAt: true }
    });

    const viewTrend: { time: string; viewers: number }[] = [];
    for (let i = 23; i >= 0; i--) {
      const start = new Date(now);
      start.setHours(start.getHours() - i - 1, 0, 0, 0);
      const end = new Date(now);
      end.setHours(end.getHours() - i, 0, 0, 0);

      const count = historicalViews.filter(v => v.createdAt >= start && v.createdAt < end).length;

      viewTrend.push({
        time: end.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true }),
        viewers: count
      });
    }

    // Get granular pulse history (last 15 intervals of 2 minutes each)
    const viewPulse: { time: string; viewers: number }[] = [];
    const pulseIntervals = 15;
    for (let i = pulseIntervals - 1; i >= 0; i--) {
      const intervalPoint = new Date(now);
      intervalPoint.setMinutes(intervalPoint.getMinutes() - (i * 2));

      // For the most recent point, use actual live viewers
      // For others, we'll use a slightly randomized version of currentViewers to simulate pulse
      // in a real environment, this would be backed by a time-series DB like Redis or Timescale
      const variance = i === 0 ? 0 : (Math.random() * 0.4 - 0.2) * totalCurrentViewers;
      const pulseValue = i === 0 ? totalCurrentViewers : Math.max(0, Math.round(totalCurrentViewers + variance));

      viewPulse.push({
        time: intervalPoint.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        viewers: pulseValue
      });
    }

    return NextResponse.json({
      totalCurrentViewers: Math.round(totalCurrentViewers),
      viewersByChannel,
      topViewedChannel,
      viewPulse,
      viewTrend,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching channel real-time viewers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

