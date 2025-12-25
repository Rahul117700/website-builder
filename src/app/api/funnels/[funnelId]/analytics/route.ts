import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Track funnel events (VIEW, CHECKOUT_STARTED, PURCHASE)
export async function POST(
  request: NextRequest,
  { params }: { params: { funnelId: string } | Promise<{ funnelId: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { funnelId } = resolvedParams;
    const body = await request.json();
    const { event, metadata } = body;

    // Verify funnel exists
    const funnel = await prisma.funnel.findUnique({
      where: { id: funnelId },
      include: {
        user: {
          include: {
            subscriptions: true
          }
        }
      }
    });

    if (!funnel) {
      return NextResponse.json(
        { error: 'Funnel not found' },
        { status: 404 }
      );
    }

    // No visitor limits - free tier users can get unlimited visitors
    // (This was removed to allow free tier users to test their funnels properly)

    // Create analytics entry
    const analyticsEntry = await prisma.funnelAnalytics.create({
      data: {
        funnelId: funnelId,
        event: event,
        metadata: metadata || {},
        createdAt: new Date()
      }
    });

    // Update funnel counters based on event type
    if (event === 'VIEW') {
      await prisma.funnel.update({
        where: { id: funnelId },
        data: {
          visitors: {
            increment: 1
          }
        }
      });
    } else if (event === 'PURCHASE') {
      await prisma.funnel.update({
        where: { id: funnelId },
        data: {
          conversions: {
            increment: 1
          },
          revenue: {
            increment: metadata?.amount || 0
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      analyticsId: analyticsEntry.id
    });
  } catch (error) {
    console.error('Error tracking funnel analytics:', error);
    return NextResponse.json(
      { 
        error: 'Failed to track analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET - Fetch funnel analytics
export async function GET(
  request: NextRequest,
  { params }: { params: { funnelId: string } | Promise<{ funnelId: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { funnelId } = resolvedParams;

    // Get analytics summary
    const [totalViews, totalCheckouts, totalPurchases] = await Promise.all([
      prisma.funnelAnalytics.count({
        where: { funnelId, event: 'VIEW' }
      }),
      prisma.funnelAnalytics.count({
        where: { funnelId, event: 'CHECKOUT_STARTED' }
      }),
      prisma.funnelAnalytics.count({
        where: { funnelId, event: 'PURCHASE' }
      })
    ]);

    const conversionRate = totalViews > 0 
      ? ((totalPurchases / totalViews) * 100).toFixed(2)
      : '0.00';

    return NextResponse.json({
      totalViews,
      totalCheckouts,
      totalPurchases,
      conversionRate: parseFloat(conversionRate)
    });
  } catch (error) {
    console.error('Error fetching funnel analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

