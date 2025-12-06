import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Public endpoint - no authentication required
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const funnel = await prisma.funnel.findUnique({
      where: {
        id: params.id,
      },
      include: {
        template: true,
        product: true,
      },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // Only return published and active funnels
    if (!funnel.published || funnel.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Funnel not available' },
        { status: 403 }
      );
    }

    return NextResponse.json(funnel);
  } catch (error) {
    console.error('Error fetching public funnel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
