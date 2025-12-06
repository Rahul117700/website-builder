import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/orders/[orderId] - Get order details for download page
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const order = await prisma.funnelOrder.findUnique({
      where: { id: params.orderId },
      include: {
        funnel: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
