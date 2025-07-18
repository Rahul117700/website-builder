import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';
import crypto from 'crypto';
import Razorpay from 'razorpay';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// POST /api/payments/create-order - Create a new payment order
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, currency = 'INR', receipt, notes, planId, templateId } = await req.json();

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }
    if (!planId && !templateId) {
      return NextResponse.json(
        { error: 'Plan ID or Template ID is required' },
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
        planId: planId || undefined,
        templateId: templateId || undefined,
        userId: session.user.id,
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
      include: { user: true, plan: true },
    });

    // If payment is for a subscription plan, create a new subscription for the user
    if (payment.planId && payment.userId) {
      // Cancel any existing active subscriptions for this user and plan
      await prisma.subscription.updateMany({
        where: { userId: payment.userId, planId: payment.planId, status: 'active' },
        data: { status: 'cancelled' },
      });
      // Calculate subscription dates
      const now = new Date();
      let endDate;
      const interval = payment.plan.interval;
      if (interval === 'monthly' || interval === 'month') {
        endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (interval === 'yearly' || interval === 'year') {
        endDate = new Date(now);
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate = new Date(now);
      }
      const renewalDate = new Date(endDate);
      // Create new subscription
      await prisma.subscription.create({
        data: {
          userId: payment.userId,
          planId: payment.planId,
          status: 'active',
          startDate: now,
          endDate,
          renewalDate,
        },
      });
      // Increment Revenue table
      const revenueRows = await prisma.revenue.findMany();
      if (revenueRows.length === 0) {
        await prisma.revenue.create({ data: { total: payment.amount } });
      } else {
        await prisma.revenue.update({
          where: { id: revenueRows[0].id },
          data: { total: { increment: payment.amount } },
        });
      }
    }

    // If payment is for a template, add to PurchasedTemplate and MyTemplate
    if (payment.templateId && payment.userId) {
      // Check if already purchased
      const already = await prisma.purchasedTemplate.findUnique({ where: { userId_templateId: { userId: payment.userId, templateId: payment.templateId } } });
      if (!already) {
        await prisma.purchasedTemplate.create({ data: { userId: payment.userId, templateId: payment.templateId } });
        // Copy template code to MyTemplate for the user
        const template = await prisma.template.findUnique({ where: { id: payment.templateId } });
        if (template) {
          await prisma.myTemplate.upsert({
            where: { userId_templateId: { userId: payment.userId, templateId: payment.templateId } },
            update: {},
            create: {
              userId: payment.userId,
              templateId: payment.templateId,
              name: template.name,
              html: template.html,
              css: template.css,
              js: template.js,
              reactCode: template.reactCode,
            },
          });
        }
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

// POST /api/payments - Create a Razorpay order
export async function POSTRazorpayOrder(req: NextRequest) {
  try {
    const { amount, plan } = await req.json();
    if (!amount || !plan) {
      return NextResponse.json({ error: 'Missing amount or plan' }, { status: 400 });
    }
    const order = await razorpay.orders.create({
      amount: amount * 100, // amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { plan },
    });
    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
