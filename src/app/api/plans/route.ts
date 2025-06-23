import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/plans - Get all available plans
export async function GET(req: NextRequest) {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { price: 'asc' },
    });
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
} 