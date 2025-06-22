import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';
import crypto from 'crypto';
import Razorpay from 'razorpay';

const prisma = new PrismaClient();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// POST /api/payments/create-order - Create a new payment order
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, currency = 'INR', receipt, notes, planId } = await req.json();

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // Create order in Razorpay
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
      notes,
    });

    // Save order in database
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount,
        currency,
        status: 'created',
        plan: {
          connect: {
            id: planId,
          },
        },
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      paymentId: payment.id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}

// POST /api/payments/verify - Verify payment signature
export async function PUT(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = await req.json();

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update payment status in database
    const payment = await prisma.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: 'completed',
        paymentId: razorpay_payment_id,
        updatedAt: new Date(),
      },
    });

    // If payment is for a subscription plan, update user's subscription
    if (payment.planId) {
      // Get plan details
      const plan = await prisma.plan.findUnique({
        where: {
          id: payment.planId,
        },
      });

      if (plan) {
        // Calculate expiry date based on plan interval
        const expiryDate = new Date();
        if (plan.interval === 'monthly') {
          expiryDate.setMonth(expiryDate.getMonth() + 1);
        } else if (plan.interval === 'yearly') {
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        }

        // You may want to handle subscription logic here, but User model does not have planId or planExpiryDate fields.
        // If you want to store subscription info, add those fields to the User model and migrate the database.
      }
    }

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
