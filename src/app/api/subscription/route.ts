import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/subscription - Get current user's active subscription and plan
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
      },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ plan: subscription?.plan || null });
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