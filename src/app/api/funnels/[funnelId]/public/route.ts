import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTrialStatus, canAccessFeatures } from '@/lib/trial';

const prisma = new PrismaClient();

// GET - Fetch a published funnel (public access, no authentication required)
export async function GET(
  request: NextRequest,
  { params }: { params: { funnelId: string } | Promise<{ funnelId: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { funnelId } = resolvedParams;

    // Fetch the funnel with all necessary data
    const funnel = await prisma.funnel.findUnique({
      where: {
        id: funnelId,
      },
      include: {
        template: true,
        product: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
          include: {
            subscriptions: true,
          }
        }
      }
    });

    if (!funnel) {
      return NextResponse.json(
        { error: 'Funnel not found' },
        { status: 404 }
      );
    }

    // Check if funnel is published and active
    if (!funnel.published || funnel.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Funnel is not published or is inactive' },
        { status: 403 }
      );
    }

    // Check owner's trial status
    const trialStatus = getTrialStatus(funnel.user as any);
    const hasAccess = canAccessFeatures(trialStatus);

    if (!hasAccess) {
      return NextResponse.json(
        { 
          error: 'Trial expired',
          trialExpired: true,
          ownerName: funnel.user.name,
          message: 'The owner of this funnel needs to upgrade their plan'
        },
        { status: 403 }
      );
    }

    // Return funnel data including userId for related products
    return NextResponse.json({
      ...funnel,
      userId: funnel.user.id,
      user: undefined, // Remove full user object from response
    });
  } catch (error) {
    console.error('Error fetching public funnel:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load funnel',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

