import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { ChannelSubscriptionStatus } from '@prisma/client';
import Razorpay from 'razorpay';

// POST /api/channels/[channelId]/subscribe - Create subscription order
export async function POST(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only monthly subscription is allowed
    const duration = '1month';

    // Get channel
    const channel = await prisma.channel.findUnique({
      where: { id: params.channelId },
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    if (!channel.subscriptionEnabled) {
      return NextResponse.json({ error: 'Subscriptions are not enabled for this channel' }, { status: 400 });
    }

    // Convert subscription price to a normal number safely
    let basePrice = 0;
    if (channel.subscriptionPrice !== null && channel.subscriptionPrice !== undefined) {
      if (typeof channel.subscriptionPrice === 'object' && 'toNumber' in channel.subscriptionPrice) {
        basePrice = (channel.subscriptionPrice as any).toNumber();
      } else if (typeof channel.subscriptionPrice === 'string') {
        basePrice = parseFloat(channel.subscriptionPrice);
      } else {
        basePrice = Number(channel.subscriptionPrice);
      }
    }

    if (basePrice <= 0) {
      return NextResponse.json({ error: 'Subscription price is not set' }, { status: 400 });
    }

    // Monthly subscription - 30 days
    const durationConfig = { days: 30, multiplier: 1 };
    const subscriptionPrice = basePrice; // Monthly price
    const currency = channel.subscriptionCurrency || 'INR';

    // Check if user already has an active subscription
    const existingSubscription = await prisma.channelSubscription.findFirst({
      where: {
        channelId: params.channelId,
        userId: session.user.id,
        status: 'ACTIVE',
        endDate: {
          gt: new Date(),
        },
      },
    });

    if (existingSubscription) {
      return NextResponse.json({
        error: 'You already have an active subscription',
        existingSubscription,
      }, { status: 400 });
    }

    // Get platform Razorpay config
    let platformConfig = await prisma.platformRazorpayConfig.findFirst({
      where: { isActive: true },
    });

    if (!platformConfig) {
      // Fallback to environment variables
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
    if (!platformConfig || !platformConfig.keyId || !platformConfig.keySecret) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Create Razorpay order
    const razorpay = new Razorpay({
      key_id: platformConfig.keyId,
      key_secret: platformConfig.keySecret,
    });

    // Validate amount
    if (!subscriptionPrice || subscriptionPrice <= 0) {
      return NextResponse.json(
        { error: 'Invalid subscription price. Please set a valid price for your channel.' },
        { status: 400 }
      );
    }

    const orderAmount = Math.round(subscriptionPrice * 100); // Convert to paise

    // Validate order amount (minimum 1 INR = 100 paise)
    if (orderAmount < 100) {
      return NextResponse.json(
        { error: 'Subscription price must be at least ₹1.00' },
        { status: 400 }
      );
    }

    try {
      // Generate a short receipt (max 40 chars for Razorpay)
      // Format: ch_sub_<timestamp> (keeping it under 40 chars)
      const timestamp = Date.now().toString().slice(-10); // Last 10 digits of timestamp
      const receipt = `ch_sub_${timestamp}`; // Max 18 chars, well under 40 limit

      const order = await razorpay.orders.create({
        amount: orderAmount,
        currency: currency,
        receipt: receipt,
        notes: {
          channelId: params.channelId,
          userId: session.user.id,
          duration,
          type: 'channel_subscription',
        },
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        amount: subscriptionPrice,
        currency,
        duration,
        days: durationConfig.days,
        keyId: platformConfig.keyId, // Return key ID for frontend
      });
    } catch (razorpayError: any) {
      console.error('Razorpay API Error:', razorpayError);

      // Provide more specific error messages
      if (razorpayError.error) {
        const errorDescription = razorpayError.error.description || razorpayError.error.reason || 'Unknown Razorpay error';
        return NextResponse.json(
          {
            error: `Payment gateway error: ${errorDescription}`,
            details: razorpayError.error
          },
          { status: 500 }
        );
      }

      throw razorpayError; // Re-throw to be caught by outer catch
    }
  } catch (error: any) {
    console.error('Error creating subscription order:', error);

    // Provide more detailed error information
    const errorMessage = error?.message || error?.error?.description || 'Failed to create subscription order';

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

