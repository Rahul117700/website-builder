import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// POST - Verify subscription payment
export async function POST(request: NextRequest) {
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

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId
    } = await request.json();

    // Get platform Razorpay config
    const platformConfig = await prisma.platformRazorpayConfig.findFirst({
      where: { isActive: true }
    });

    if (!platformConfig) {
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', platformConfig.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Get plan details
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Check if user has an active subscription
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
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
      endDate.setDate(endDate.getDate() + plan.duration);
      
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
      endDate.setDate(endDate.getDate() + plan.duration);
    }

    // Create subscription record
    const subscription = await prisma.userSubscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: 'ACTIVE',
        startDate,
        endDate,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amount: plan.price,
        currency: plan.currency
      },
      include: {
        plan: true
      }
    });

    // Create notification for user
    await prisma.userNotification.create({
      data: {
        userId: user.id,
        title: 'Subscription Activated',
        message: `Your ${plan.name} subscription has been activated successfully!`,
        type: 'SUCCESS',
        category: 'PAYMENT'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
      subscription
    });

  } catch (error) {
    console.error('Error verifying subscription payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

