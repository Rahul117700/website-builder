import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, source } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      // If already subscribed and active, return success
      if (existing.status === 'ACTIVE') {
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed to our newsletter!',
          alreadySubscribed: true,
        });
      }

      // If unsubscribed, reactivate
      if (existing.status === 'UNSUBSCRIBED') {
        await prisma.newsletterSubscription.update({
          where: { email: email.toLowerCase().trim() },
          data: {
            status: 'ACTIVE',
            subscribedAt: new Date(),
            unsubscribedAt: null,
            source: source || 'newsletter-popup',
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Welcome back! You have been resubscribed.',
          reactivated: true,
        });
      }
    }

    // Get metadata (IP, user agent, etc.)
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create new subscription
    const subscription = await prisma.newsletterSubscription.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name || null,
        source: source || 'newsletter-popup',
        status: 'ACTIVE',
        metadata: {
          ipAddress,
          userAgent,
          subscribedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to our newsletter!',
      subscription: {
        id: subscription.id,
        email: subscription.email,
      },
    });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    
    // Handle unique constraint violation (duplicate email)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    );
  }
}

// GET endpoint to check subscription status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const subscription = await prisma.newsletterSubscription.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!subscription) {
      return NextResponse.json({
        subscribed: false,
        message: 'Email not found in our newsletter list',
      });
    }

    return NextResponse.json({
      subscribed: subscription.status === 'ACTIVE',
      status: subscription.status,
      subscribedAt: subscription.subscribedAt,
    });
  } catch (error) {
    console.error('Error checking newsletter subscription:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    );
  }
}

