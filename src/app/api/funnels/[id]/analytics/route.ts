import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Track funnel analytics (views, conversions, etc.)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { event, metadata, userAgent, ipAddress } = body;

    if (!event) {
      return NextResponse.json({ error: 'Event type is required' }, { status: 400 });
    }

    // Verify funnel exists
    const funnel = await prisma.funnel.findUnique({
      where: { id: params.id },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // Create analytics entry
    const analyticsEntry = await prisma.funnelAnalytics.create({
      data: {
        funnelId: params.id,
        event,
        metadata: metadata || {},
        userAgent: userAgent || request.headers.get('user-agent'),
        ipAddress: ipAddress || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      },
    });

    // Check user's subscription status for visitor limits
    const funnelWithUser = await prisma.funnel.findUnique({
      where: { id: params.id },
      include: {
        user: {
          include: {
            subscriptions: {
              where: {
                status: 'ACTIVE',
                endDate: {
                  gte: new Date()
                }
              },
              include: {
                plan: true
              },
              take: 1
            }
          }
        }
      }
    });

    if (!funnelWithUser) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    const hasActivePlan = funnelWithUser.user.subscriptions.length > 0;
    const FREE_TIER_VISITOR_LIMIT = 100;

    // Update funnel metrics based on event
    if (event === 'VIEW') {
      // Check visitor limit for free tier users
      if (!hasActivePlan && funnelWithUser.visitors >= FREE_TIER_VISITOR_LIMIT) {
        return NextResponse.json({ 
          error: 'Visitor limit reached',
          message: `You've reached the free tier limit of ${FREE_TIER_VISITOR_LIMIT} visitors. Upgrade to a plan for unlimited visitors!`,
          requiresUpgrade: true,
          upgradeUrl: '/auth/dashboard/plans',
          currentVisitors: funnelWithUser.visitors,
          limit: FREE_TIER_VISITOR_LIMIT
        }, { status: 403 });
      }

      await prisma.funnel.update({
        where: { id: params.id },
        data: {
          visitors: {
            increment: 1,
          },
        },
      });
    } else if (event === 'PURCHASE' || event === 'CONVERSION') {
      const analytics = await prisma.funnelAnalytics.findMany({
        where: {
          funnelId: params.id,
        },
      });

      const visitors = analytics.filter(a => a.event === 'VIEW').length;
      const conversions = analytics.filter(a => a.event === 'PURCHASE' || a.event === 'CONVERSION').length;
      const conversionRate = visitors > 0 ? (conversions / visitors) * 100 : 0;

      await prisma.funnel.update({
        where: { id: params.id },
        data: {
          conversions: conversions,
          conversionRate: Math.round(conversionRate * 10) / 10,
        },
      });
    }

    return NextResponse.json({ success: true, analytics: analyticsEntry });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get funnel analytics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const event = searchParams.get('event');
    const limit = parseInt(searchParams.get('limit') || '100');

    const whereClause: any = {
      funnelId: params.id,
    };

    if (event) {
      whereClause.event = event;
    }

    const analytics = await prisma.funnelAnalytics.findMany({
      where: whereClause,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


