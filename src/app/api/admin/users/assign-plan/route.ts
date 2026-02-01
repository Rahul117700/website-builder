import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, planId, duration } = await request.json();

    if (!userId || !planId) {
      return NextResponse.json({ error: 'User ID and Plan ID are required' }, { status: 400 });
    }

    // Get the plan details
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (duration || 30));

    // Create the subscription
    const subscription = await prisma.userSubscription.create({
      data: {
        userId,
        planId,
        status: 'ACTIVE',
        startDate,
        endDate,
        amount: plan.price,
        currency: 'INR' // Default to INR as per system
      }
    });


    return NextResponse.json({
      message: 'Plan assigned successfully',
      subscription
    });

  } catch (error) {
    console.error('Error assigning plan:', error);
    return NextResponse.json(
      { error: 'Failed to assign plan', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
