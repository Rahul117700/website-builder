import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get orders for a specific funnel
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify funnel belongs to user
    const funnel = await prisma.funnel.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    const orders = await prisma.funnelOrder.findMany({
      where: {
        funnelId: params.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new order for a funnel
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { customerEmail, amount, currency, paymentId, paymentMethod, metadata } = body;

    if (!customerEmail || !amount) {
      return NextResponse.json(
        { error: 'Customer email and amount are required' },
        { status: 400 }
      );
    }

    // Verify funnel exists
    const funnel = await prisma.funnel.findUnique({
      where: { id: params.id },
      include: {
        product: true,
      },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // Create order
    const order = await prisma.funnelOrder.create({
      data: {
        funnelId: params.id,
        customerEmail,
        amount,
        currency: currency || 'INR',
        status: paymentId ? 'COMPLETED' : 'PENDING',
        paymentId,
        paymentMethod: paymentMethod || 'RAZORPAY',
        metadata: metadata || {},
      },
    });

    // Update funnel revenue
    const allOrders = await prisma.funnelOrder.findMany({
      where: {
        funnelId: params.id,
        status: 'COMPLETED',
      },
    });

    const totalRevenue = allOrders.reduce((sum, order) => sum + order.amount, 0);

    await prisma.funnel.update({
      where: { id: params.id },
      data: {
        revenue: totalRevenue,
      },
    });

    // Track conversion analytics
    await prisma.funnelAnalytics.create({
      data: {
        funnelId: params.id,
        event: 'PURCHASE',
        metadata: {
          orderId: order.id,
          amount,
          currency,
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


