import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { ChannelSubscriptionStatus } from '@prisma/client';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createNotification } from '@/lib/notificationService';

// POST /api/channels/[channelId]/subscribe/verify - Verify payment and create subscription
export async function POST(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment details' },
        { status: 400 }
      );
    }

    // Only monthly subscription is allowed
    const duration = '1month';

    // Get platform Razorpay config
    let platformConfig = await prisma.platformRazorpayConfig.findFirst({
      where: { isActive: true },
    });

    if (!platformConfig) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        return NextResponse.json(
          { error: 'Payment gateway not configured' },
          { status: 500 }
        );
      }

      platformConfig = {
        keyId,
        keySecret,
      } as any;
    }

    // Ensure platformConfig is not null (TypeScript guard)
    if (!platformConfig || !platformConfig.keySecret) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Verify payment signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', platformConfig.keySecret)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Get channel
    const channel = await prisma.channel.findUnique({
      where: { id: params.channelId },
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Monthly subscription - 30 days
    const durationConfig = { days: 30, multiplier: 1 };
    const basePrice = Number(channel.subscriptionPrice);
    const subscriptionPrice = basePrice; // Monthly price
    const currency = channel.subscriptionCurrency || 'INR';

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationConfig.days);

    // Check for existing subscription
    const existingSubscription = await prisma.channelSubscription.findFirst({
      where: {
        channelId: params.channelId,
        userId: session.user.id,
      },
    });

    let subscription;

    if (existingSubscription) {
      // Update existing subscription
      subscription = await prisma.channelSubscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: 'ACTIVE',
          startDate,
          endDate,
          amount: subscriptionPrice,
          currency,
          paymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          autoRenew: false, // Manual renewal for now
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });
    } else {
      // Create new subscription
      subscription = await prisma.channelSubscription.create({
        data: {
          channelId: params.channelId,
          userId: session.user.id,
          status: 'ACTIVE',
          startDate,
          endDate,
          amount: subscriptionPrice,
          currency,
          paymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          autoRenew: false,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });
    }

    // Update channel subscriber count
    await prisma.channel.update({
      where: { id: params.channelId },
      data: {
        totalSubscribers: {
          increment: existingSubscription ? 0 : 1,
        },
      },
    });

    // Create notification for channel owner about new subscription
    try {
      const subscriberName = subscription.user.name || subscription.user.email || 'Someone';
      await createNotification({
        userId: channel.userId,
        title: '🎉 New Subscription!',
        message: `${subscriberName} subscribed to your channel "${channel.name}" for ₹${subscriptionPrice}`,
        type: 'SUCCESS',
        category: 'SALE',
        metadata: {
          channelId: channel.id,
          channelName: channel.name,
          subscriptionId: subscription.id,
          subscriberId: subscription.user.id,
          subscriberName: subscriberName,
          subscriberEmail: subscription.user.email,
          amount: subscriptionPrice,
          currency: currency,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          timestamp: new Date().toISOString()
        }
      });
      console.log(`[Subscription] Created notification for channel owner ${channel.userId}`);
    } catch (notificationError) {
      console.error('Error creating subscription notification:', notificationError);
      // Don't fail the subscription if notification fails
    }

    return NextResponse.json({
      success: true,
      subscription,
      message: 'Subscription activated successfully',
    });
  } catch (error) {
    console.error('Error verifying subscription payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify subscription payment' },
      { status: 500 }
    );
  }
}

