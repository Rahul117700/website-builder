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

    // Get view history for the last 14 time intervals (every 30 minutes) - longer graph
    // Use REAL data based on product updatedAt timestamps (when products were viewed)
    const viewHistory: { time: string; viewers: number }[] = [];
    const now = new Date();
    const intervals = 14; // Show 14 data points (7 hours of history)

    // Collect all product view timestamps (using updatedAt as proxy for view time)
    const allViewTimestamps: Date[] = [];
    channels.forEach(channel => {
      channel.products.forEach(product => {
        if (product.viewCount > 0 && product.updatedAt) {
          // For products with multiple views, estimate distribution
          // Assume views are distributed over the time since product creation
          const viewTime = new Date(product.updatedAt);
          // Only include if viewed in last 7 hours (within our graph range)
          const sevenHoursAgo = new Date(now);
          sevenHoursAgo.setHours(sevenHoursAgo.getHours() - 7);
          if (viewTime >= sevenHoursAgo) {
            allViewTimestamps.push(viewTime);
          }
        }
      });
    });

    // Calculate viewers for each 30-minute interval based on actual view timestamps
    for (let i = intervals - 1; i >= 0; i--) {
      const intervalStart = new Date(now);
      intervalStart.setMinutes(intervalStart.getMinutes() - ((i + 1) * 30));
      const intervalEnd = new Date(now);
      intervalEnd.setMinutes(intervalEnd.getMinutes() - (i * 30));

      // Count views that occurred in this interval
      const viewsInInterval = allViewTimestamps.filter(timestamp => {
        return timestamp >= intervalStart && timestamp < intervalEnd;
      }).length;

      // Estimate concurrent viewers: if there were views in this interval, 
      // assume some viewers are still active (decay over time)
      let intervalViewers = 0;
      if (i === 0) {
        // Current interval - use current viewers count
        intervalViewers = totalCurrentViewers;
      } else {
        // Past intervals - estimate based on views in that period
        // Each view represents potential concurrent viewers (with decay)
        const hoursAgo = (intervals - i) * 0.5; // 0.5 hours per interval
        const decayFactor = Math.max(0, 1 - (hoursAgo / 2)); // Decay over 2 hours
        intervalViewers = Math.round(viewsInInterval * decayFactor);
        
        // Ensure it's not higher than current viewers (unless there was more activity)
        if (viewsInInterval > 0) {
          intervalViewers = Math.max(intervalViewers, Math.min(viewsInInterval, totalCurrentViewers));
        }
      }

      const timeStr = intervalEnd.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      viewHistory.push({
        time: timeStr,
        viewers: Math.max(0, intervalViewers),
      });
    }

    return NextResponse.json({
      totalCurrentViewers: Math.round(totalCurrentViewers),
      viewersByChannel,
      topViewedChannel,
      viewHistory,
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

