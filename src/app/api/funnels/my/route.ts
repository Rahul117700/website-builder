import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in database
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const funnels = await prisma.funnel.findMany({
      where: {
        userId: user.id, // Use the database user ID
      },
      include: {
        template: true,
        product: true,
        orders: {
          where: {
            status: 'COMPLETED'
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate accurate metrics for each funnel
    const funnelsWithMetrics = await Promise.all(funnels.map(async (funnel) => {
      // Get accurate visitor count from analytics
      const viewCount = await prisma.funnelAnalytics.count({
        where: {
          funnelId: funnel.id,
          event: 'VIEW'
        }
      });

      // Get completed orders count and revenue
      const completedOrders = funnel.orders;
      const conversions = completedOrders.length;
      const revenue = completedOrders.reduce((sum, order) => sum + order.amount, 0);
      
      const visitors = viewCount || funnel.visitors || 0;
      const conversionRate = visitors > 0 ? (conversions / visitors) * 100 : 0;

      return {
        ...funnel,
        visitors,
        conversions,
        revenue,
        conversionRate: Math.round(conversionRate * 10) / 10,
        url: `/f/${funnel.id}`,
        // Remove orders from response to keep it clean
        orders: undefined
      };
    }));

    return NextResponse.json(funnelsWithMetrics);
  } catch (error) {
    console.error('Error fetching user funnels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
