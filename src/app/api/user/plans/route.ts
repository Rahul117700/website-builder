import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all active subscription plans for users
export async function GET(request: NextRequest) {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { priority: 'desc' },
        { price: 'asc' }
      ]
    });

    return NextResponse.json({ plans });

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

