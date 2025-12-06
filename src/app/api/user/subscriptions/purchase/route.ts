import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import Razorpay from 'razorpay';

const prisma = new PrismaClient();

// POST - Create order for subscription purchase
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

    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Get the plan details
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { error: 'Plan not found or inactive' },
        { status: 404 }
      );
    }

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

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: platformConfig.keyId,
      key_secret: platformConfig.keySecret
    });

    // Create Razorpay order
    const amount = Math.round(plan.price * 100); // Convert to paise
    
    // Generate a shorter receipt ID (max 40 chars for Razorpay)
    const receiptId = `sub_${user.id.slice(-8)}_${Date.now().toString().slice(-8)}`;
    
    const order = await razorpay.orders.create({
      amount,
      currency: plan.currency,
      receipt: receiptId,
      notes: {
        userId: user.id,
        planId: plan.id,
        planName: plan.name,
        type: 'subscription'
      }
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: platformConfig.keyId,
      planDetails: {
        id: plan.id,
        name: plan.name,
        duration: plan.duration,
        price: plan.price
      }
    });

  } catch (error) {
    console.error('Error creating subscription order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

