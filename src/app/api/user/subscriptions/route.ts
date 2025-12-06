import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

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

    // Get active subscription
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
      orderBy: {
        endDate: 'desc'
      }
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
    const [funnelCount, productCount] = await Promise.all([
      prisma.funnel.count({ where: { userId: user.id } }),
      prisma.digitalProduct.count({ where: { userId: user.id } })
    ]);

    const hasActivePlan = activeSubscription !== null;
    const daysRemaining = activeSubscription 
      ? Math.ceil((activeSubscription.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return NextResponse.json({
      hasActivePlan,
      activeSubscription,
      subscriptionHistory,
      usage: {
        funnels: funnelCount,
        products: productCount,
        maxFunnels: activeSubscription?.plan.maxFunnels || 0,
        maxProducts: activeSubscription?.plan.maxProducts || 0,
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

