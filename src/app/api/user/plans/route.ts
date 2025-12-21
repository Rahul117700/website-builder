import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { convertPlanForDisplay, getPriceForCurrency } from '@/lib/geo-pricing';

const prisma = new PrismaClient();

// GET - Fetch all active subscription plans for users
export async function GET(request: NextRequest) {
  try {
    // Get currency from query params (optional)
    const { searchParams } = new URL(request.url);
    const requestedCurrency = searchParams.get('currency');

    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { priority: 'desc' },
        { price: 'asc' }
      ]
    });

    // Convert plans to display format with requested currency
    const convertedPlans = requestedCurrency
      ? plans.map(plan => convertPlanForDisplay(plan, requestedCurrency))
      : plans; // If no currency requested, return raw plans

    return NextResponse.json({ 
      plans: convertedPlans,
      detectedCurrency: requestedCurrency || null
    });

  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

