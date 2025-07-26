import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's current subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // If user has no active subscription, return free plan structure
    if (!subscription) {
      return NextResponse.json({
        plan: {
          id: 'free',
          name: 'Free',
          price: 0,
          numberOfWebsites: 1,
          unlimitedWebsites: false,
          supportLevel: 'Basic',
          customDomain: true,
          advancedAnalytics: false,
          customIntegrations: false,
          teamManagement: false,
          communityAccess: true,
        },
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: null,
      });
    }

    // Check if subscription is expired
    const isExpired = subscription.endDate && new Date() > subscription.endDate;
    
    return NextResponse.json({
      plan: subscription.plan,
      status: isExpired ? 'expired' : subscription.status,
      startDate: subscription.startDate.toISOString(),
      endDate: subscription.endDate.toISOString(),
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}

// POST /api/subscription - Set user's subscription to a free plan
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { planId } = await req.json();
    if (!planId) {
      return NextResponse.json({ error: 'Missing planId' }, { status: 400 });
    }
    // Get the plan
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    if (plan.price > 0) {
      return NextResponse.json({ error: 'This endpoint is only for free plans' }, { status: 400 });
    }
    // Cancel any existing active subscription
    await prisma.subscription.updateMany({
      where: { userId: session.user.id, status: 'active' },
      data: { status: 'cancelled' },
    });
    // Create new subscription
    const now = new Date();
    const endDate = new Date(now);
    if (plan.interval === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.interval === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        planId: plan.id,
        status: 'active',
        startDate: now,
        endDate,
      },
    });
    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error('Error setting free subscription:', error);
    return NextResponse.json({ error: 'Failed to set subscription' }, { status: 500 });
  }
} 