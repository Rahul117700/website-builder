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
        // orderId: order.id, // Payment model no longer has orderId field
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
    console.log('=== Payment Verification API Called ===');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = await req.json();
    console.log('Received data:', { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId });

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentId) {
      console.log('Missing required fields');
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

    console.log('Signature verification:', { generated_signature, razorpay_signature, matches: generated_signature === razorpay_signature });

    if (generated_signature !== razorpay_signature) {
      console.log('Invalid payment signature');
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    console.log('Signature verified successfully');

    // Update payment status in database
    const payment = await prisma.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: 'completed',
        // paymentId: razorpay_payment_id, // Payment model no longer has paymentId field
        updatedAt: new Date(),
      },
      include: { user: true, plan: true },
    });

    console.log('Payment updated:', { 
      paymentId: payment.id, 
      templateId: payment.templateId, 
      userId: payment.userId,
      amount: payment.amount,
      status: payment.status 
    });

    // SUBSCRIPTION CREATION DISABLED - No longer using subscription model
    // If payment is for a subscription plan, create a new subscription for the user
    /*
    if (payment.planId && payment.userId && payment.plan) {
      console.log('Processing plan payment...');
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
          currentPeriodStart: now,
          currentPeriodEnd: endDate,
          amount: payment.amount,
          currency: payment.currency,
        },
      });
      
      // Create notification for plan purchase
      try {
        if (payment.plan) {
          await prisma.notification.create({
            data: {
              userId: payment.userId,
              type: 'plan',
              message: `Congratulations! You've successfully upgraded to ${payment.plan.name} plan. Enjoy your new features!`,
            },
          });
        }
      } catch (error) {
        console.error('Error creating plan purchase notification:', error);
      }
      
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
    */

    // If payment is for a template, add to PurchasedTemplate and MyTemplate
    if (payment.templateId && payment.userId) {
      console.log('Processing template payment...');
      console.log('Template ID:', payment.templateId);
      console.log('User ID:', payment.userId);
      
      // Check if already purchased
      const already = await prisma.purchasedTemplate.findUnique({ 
        where: { userId_templateId: { userId: payment.userId, templateId: payment.templateId } } 
      });
      console.log('Already purchased check:', { already });
      
      if (!already) {
        console.log('Creating PurchasedTemplate record...');
        const purchasedTemplate = await prisma.purchasedTemplate.create({ 
          data: { userId: payment.userId, templateId: payment.templateId } 
        });
        console.log('PurchasedTemplate created:', purchasedTemplate);
        
        // Copy template code to MyTemplate for the user
        const template = await prisma.template.findUnique({ where: { id: payment.templateId } });
        console.log('Template found:', { templateId: template?.id, templateName: template?.name });
        
        if (template) {
          console.log('Creating MyTemplate record...');
          const myTemplate = await prisma.myTemplate.upsert({
            where: { userId_templateId: { userId: payment.userId, templateId: payment.templateId } },
            update: {},
            create: {
              userId: payment.userId,
              templateId: payment.templateId,
              name: template.name,
              html: template.html,
              css: template.css,
              js: template.js,
              // Add the pages structure for the new template system
              pages: template.pages as any,
            },
          });
          console.log('MyTemplate created/updated:', myTemplate);

          // If this template is part of a SiteSale listing, compute seller earning
          const sale = await (prisma as any).siteSale.findFirst({ where: { templateId: template.id, status: 'active' } });
          if (sale) {
            // Commission rate from settings (default 7%)
            const setting = await (prisma as any).commissionSetting.findFirst();
            const commissionRate = setting?.rate ?? 0.07;
            const gross = payment.amount;
            const commissionAmount = Math.round(gross * commissionRate * 100) / 100;
            const net = Math.max(0, Math.round((gross - commissionAmount) * 100) / 100);

            await (prisma as any).sellerEarning.create({
              data: {
                sellerId: sale.userId,
                templateId: template.id,
                paymentId: payment.id,
                grossAmount: gross,
                commissionRate,
                commissionAmount,
                netAmount: net,
              },
            });

            await (prisma as any).siteSale.update({
              where: { id: sale.id },
              data: { totalSales: { increment: 1 }, earnings: { increment: net } },
            });

            // Increase platform revenue by commission
            const revenueRows = await prisma.revenue.findMany();
            if (revenueRows.length === 0) {
              await prisma.revenue.create({ data: { total: commissionAmount } });
            } else {
              await prisma.revenue.update({ where: { id: revenueRows[0].id }, data: { total: { increment: commissionAmount } } });
            }
          }
          
          // Create notification for template purchase
          try {
            await prisma.notification.create({
              data: {
                userId: payment.userId,
                type: 'template',
                message: `Congratulations! You've successfully purchased the template "${template.name}". You can now use it to create your website.`,
              },
            });
            console.log('Template purchase notification created');
          } catch (error) {
            console.error('Error creating template purchase notification:', error);
          }
        } else {
          console.error('Template not found for ID:', payment.templateId);
        }
      } else {
        console.log('Template already purchased, skipping creation');
      }
    } else {
      console.log('No template ID or user ID in payment');
    }

    console.log('Payment verification completed successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in payment verification:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}



// GET /api/payments - Get all payments for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payments = await prisma.payment.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });
    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
