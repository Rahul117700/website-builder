import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';

// POST /api/payment/create-order - Create a Razorpay order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'INR', receipt, notes, funnelId } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    if (!funnelId) {
      return NextResponse.json({ error: 'Funnel ID is required' }, { status: 400 });
    }

    // Get the funnel to find the owner
    const funnel = await prisma.funnel.findUnique({
      where: { id: funnelId },
      include: {
        user: {
          include: {
            razorpayConfigs: {
              where: {
                isActive: true
              },
              take: 1
            }
          }
        }
      }
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // Check if user has Razorpay credentials configured
    const razorpayConfig = funnel.user.razorpayConfigs[0];
    
    if (!razorpayConfig) {
      return NextResponse.json({ 
        error: 'Payment gateway not configured. Please contact the seller.' 
      }, { status: 400 });
    }

    // Initialize Razorpay with user's credentials
    const razorpay = new Razorpay({
      key_id: razorpayConfig.keyId,
      key_secret: razorpayConfig.keySecret
    });

    // Create order configuration
    const orderConfig = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        ...notes,
        funnelId,
        userId: funnel.userId
      }
    };

    const order = await razorpay.orders.create(orderConfig);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayConfig.keyId
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    return NextResponse.json({ 
      error: 'Failed to create payment order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
