import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { funnelId, amount, paymentId, customerEmail } = body;

    if (!funnelId || !amount || !paymentId || !customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure user exists in database
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the funnel and product
    const funnel = await prisma.funnel.findUnique({
      where: { id: funnelId },
      include: {
        product: true
      }
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    if (!funnel.product) {
      return NextResponse.json({ error: 'No product found for this funnel' }, { status: 400 });
    }

    // Create order
    const order = await prisma.funnelOrder.create({
      data: {
        funnelId: funnelId,
        customerEmail: customerEmail,
        amount: amount,
        currency: 'INR',
        status: 'COMPLETED',
        paymentId: paymentId,
        paymentMethod: 'RAZORPAY',
        metadata: {
          funnelName: funnel.name,
          productName: funnel.product.name,
          productType: funnel.product.type
        }
      }
    });

    // Update product sales count
    await prisma.digitalProduct.update({
      where: { id: funnel.product.id },
      data: {
        sales: {
          increment: 1
        }
      }
    });

    // Create analytics event
    await prisma.funnelAnalytics.create({
      data: {
        funnelId: funnelId,
        event: 'PURCHASE',
        metadata: {
          orderId: order.id,
          amount: amount,
          customerEmail: customerEmail
        },
        userAgent: request.headers.get('user-agent') || '',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      }
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        downloadUrl: `/download/${order.id}`
      }
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
