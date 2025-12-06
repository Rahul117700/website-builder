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
      where: { email: session.user.email }
    });

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Super Admin access required' }, { status: 403 });
    }

    // Get real-time funnel monitoring data
    const now = new Date();
    const last24Hours = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const lastHour = new Date(now.getTime() - (60 * 60 * 1000));

    // Live funnel activity
    const liveFunnels = await prisma.funnel.findMany({
      where: { published: true },
      select: {
        id: true,
        name: true,
        status: true,
        visitors: true,
        conversions: true,
        revenue: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 20
    });

    // Recent activity (last 24 hours)
    const recentActivity = await prisma.funnelAnalytics.findMany({
      where: {
        createdAt: { gte: last24Hours }
      },
      select: {
        id: true,
        event: true,
        createdAt: true,
        funnel: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Recent orders (last 24 hours)
    const recentOrders = await prisma.funnelOrder.findMany({
      where: {
        createdAt: { gte: last24Hours }
      },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        customerEmail: true,
        funnel: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // Platform-wide metrics
    const platformMetrics = {
      totalActiveFunnels: await prisma.funnel.count({ where: { published: true } }),
      totalActiveUsers: await prisma.user.count({ where: { status: 'ACTIVE' } }),
      viewsLast24h: await prisma.funnelAnalytics.count({
        where: {
          event: 'view',
          createdAt: { gte: last24Hours }
        }
      }),
      conversionsLast24h: await prisma.funnelAnalytics.count({
        where: {
          event: 'conversion',
          createdAt: { gte: last24Hours }
        }
      }),
      revenueLast24h: await prisma.funnelOrder.aggregate({
        _sum: { amount: true },
        where: {
          status: 'COMPLETED',
          createdAt: { gte: last24Hours }
        }
      }),
      revenueLastHour: await prisma.funnelOrder.aggregate({
        _sum: { amount: true },
        where: {
          status: 'COMPLETED',
          createdAt: { gte: lastHour }
        }
      })
    };

    // Top performing funnels (last 24h)
    const topFunnels24h = await prisma.funnel.findMany({
      where: { published: true },
      select: {
        id: true,
        name: true,
        visitors: true,
        conversions: true,
        revenue: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { revenue: 'desc' },
      take: 10
    });

    // Activity timeline (last 24 hours by hour)
    const activityTimeline = [];
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(now.getTime() - (i * 60 * 60 * 1000));
      const hourEnd = new Date(now.getTime() - ((i - 1) * 60 * 60 * 1000));
      
      const [views, conversions, revenue] = await Promise.all([
        prisma.funnelAnalytics.count({
          where: {
            event: 'view',
            createdAt: { gte: hourStart, lt: hourEnd }
          }
        }),
        prisma.funnelAnalytics.count({
          where: {
            event: 'conversion',
            createdAt: { gte: hourStart, lt: hourEnd }
          }
        }),
        prisma.funnelOrder.aggregate({
          _sum: { amount: true },
          where: {
            status: 'COMPLETED',
            createdAt: { gte: hourStart, lt: hourEnd }
          }
        })
      ]);

      activityTimeline.push({
        hour: hourStart.getHours(),
        time: hourStart.toISOString(),
        views,
        conversions,
        revenue: revenue._sum.amount || 0
      });
    }

    // Geographic distribution (mock data for now)
    const geographicData = [
      { country: 'India', users: 45, revenue: 125000 },
      { country: 'United States', users: 23, revenue: 89000 },
      { country: 'United Kingdom', users: 12, revenue: 45000 },
      { country: 'Canada', users: 8, revenue: 32000 },
      { country: 'Australia', users: 6, revenue: 28000 }
    ];

    // System alerts and notifications
    const alerts = [];
    
    // Check for high error rates
    const errorCount = await prisma.funnelOrder.count({
      where: {
        status: 'FAILED',
        createdAt: { gte: lastHour }
      }
    });

    if (errorCount > 10) {
      alerts.push({
        type: 'warning',
        message: `High error rate detected: ${errorCount} failed transactions in the last hour`,
        timestamp: now.toISOString()
      });
    }

    // Check for unusual traffic spikes
    const currentHourViews = await prisma.funnelAnalytics.count({
      where: {
        event: 'view',
        createdAt: { gte: lastHour }
      }
    });

    const previousHourViews = await prisma.funnelAnalytics.count({
      where: {
        event: 'view',
        createdAt: { 
          gte: new Date(now.getTime() - (2 * 60 * 60 * 1000)),
          lt: lastHour
        }
      }
    });

    if (currentHourViews > previousHourViews * 3) {
      alerts.push({
        type: 'info',
        message: `Traffic spike detected: ${currentHourViews} views in current hour vs ${previousHourViews} in previous hour`,
        timestamp: now.toISOString()
      });
    }

    return NextResponse.json({
      liveFunnels,
      recentActivity,
      recentOrders,
      platformMetrics,
      topFunnels24h,
      activityTimeline,
      geographicData,
      alerts,
      generatedAt: now.toISOString()
    });

  } catch (error) {
    console.error('Error fetching live monitoring data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
