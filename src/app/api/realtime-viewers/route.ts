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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's funnels
    const funnels = await prisma.funnel.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, published: true }
    });

    // Get recent analytics (within last 5 minutes to simulate "currently viewing")
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    const recentViews = await prisma.funnelAnalytics.findMany({
      where: {
        funnel: { userId: user.id },
        event: 'VIEW',
        createdAt: {
          gte: fiveMinutesAgo
        }
      },
      select: {
        funnelId: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true
      }
    });

    // Count unique viewers (by IP + UserAgent combination) in the last 5 minutes
    const uniqueViewers = new Set();
    recentViews.forEach(view => {
      const viewerKey = `${view.ipAddress}-${view.userAgent}`;
      uniqueViewers.add(viewerKey);
    });

    // Calculate viewer distribution by funnel
    const viewersByFunnel: { [key: string]: number } = {};
    const funnelViewers = new Map();

    recentViews.forEach(view => {
      const viewerKey = `${view.ipAddress}-${view.userAgent}`;
      if (!funnelViewers.has(viewerKey)) {
        funnelViewers.set(viewerKey, new Set());
      }
      funnelViewers.get(viewerKey).add(view.funnelId);
    });

    // Count unique viewers per funnel
    funnels.forEach(funnel => {
      let count = 0;
      funnelViewers.forEach(viewers => {
        if (viewers.has(funnel.id)) {
          count++;
        }
      });
      viewersByFunnel[funnel.id] = count;
    });

    // Get top viewed funnel
    const topViewedFunnel = funnels.reduce((top, funnel) => {
      const currentViews = viewersByFunnel[funnel.id] || 0;
      const topViews = viewersByFunnel[top.id] || 0;
      return currentViews > topViews ? funnel : top;
    }, funnels[0]);

    return NextResponse.json({
      totalCurrentViewers: uniqueViewers.size,
      viewersByFunnel,
      topViewedFunnel: topViewedFunnel ? {
        id: topViewedFunnel.id,
        name: topViewedFunnel.name,
        viewers: viewersByFunnel[topViewedFunnel.id] || 0
      } : null,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching real-time viewers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
