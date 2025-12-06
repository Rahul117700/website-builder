import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Assign subscription plan to user (Super Admin only)
export async function POST(request: NextRequest) {
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

    const { userId, planId, duration } = await request.json();

    if (!userId || !planId || !duration) {
      return NextResponse.json(
        { error: 'User ID, Plan ID, and duration are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if plan exists
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Check if user has an existing active subscription
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: userId,
        status: 'ACTIVE',
        endDate: {
          gte: new Date()
        }
      }
    });

    // Calculate subscription dates
    const startDate = new Date();
    let endDate: Date;
    
    if (existingSubscription) {
      // Extend from current end date
      endDate = new Date(existingSubscription.endDate);
      endDate.setDate(endDate.getDate() + duration);
      
      // Update existing subscription
      await prisma.userSubscription.update({
        where: { id: existingSubscription.id },
        data: {
          endDate,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new subscription
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + duration);
    }

    // Create subscription record
    const subscription = await prisma.userSubscription.create({
      data: {
        userId: userId,
        planId: planId,
        status: 'ACTIVE',
        startDate,
        endDate,
        amount: plan.price,
        currency: plan.currency
      },
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create notification for user
    await prisma.userNotification.create({
      data: {
        userId: userId,
        title: 'Subscription Assigned',
        message: `You have been assigned the ${plan.name} subscription by an administrator.`,
        type: 'SUCCESS',
        category: 'PAYMENT'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Plan assigned successfully',
      subscription
    });

  } catch (error) {
    console.error('Error assigning plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

