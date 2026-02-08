import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { getUserTier, FREE_TIER_LIMITS } from '@/lib/features';

const prisma = new PrismaClient();

// GET - Get user's subscription status
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

    // Get active subscription - Get the highest priority active plan
    const activeSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
        endDate: {
          gte: new Date()
        }
      },
      include: {
        plan: true
      },
      orderBy: [
        { plan: { priority: 'desc' } },
        { endDate: 'desc' }
      ]
    });

    // Get all subscriptions history
    const subscriptionHistory = await prisma.userSubscription.findMany({
      where: {
        userId: user.id
      },
      include: {
        plan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate usage statistics
    const [funnelCount, digitalProductCount, channelProductCount] = await Promise.all([
      prisma.funnel.count({ where: { userId: user.id } }),
      prisma.digitalProduct.count({ where: { userId: user.id } }),
      prisma.channelProduct.count({
        where: {
          channel: {
            userId: user.id
          }
        }
      })
    ]);

    const productCount = digitalProductCount + channelProductCount;

    const hasActivePlan = activeSubscription !== null;
    const daysRemaining = activeSubscription
      ? Math.ceil((activeSubscription.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Get user tier (freemium model)
    const userTier = getUserTier(subscriptionHistory);
    const isFree = userTier.tier === 'free';

    return NextResponse.json({
      hasActivePlan,
      activeSubscription,
      subscriptionHistory,
      tier: {
        name: userTier.tier,
        planName: userTier.planName,
        isFree: isFree,
        limits: userTier.limits
      },
      usage: {
        funnels: funnelCount,
        products: productCount,
        maxFunnels: hasActivePlan ? (activeSubscription?.plan.maxFunnels ?? -1) : FREE_TIER_LIMITS.maxFunnels,
        maxProducts: hasActivePlan ? (activeSubscription?.plan.maxProducts ?? -1) : FREE_TIER_LIMITS.maxProducts,
        daysRemaining
      }
    });

  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

