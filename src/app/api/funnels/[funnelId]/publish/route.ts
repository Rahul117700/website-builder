import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { funnelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { funnelId } = params;
    const body = await request.json();
    const { publish } = body;

    // Verify funnel exists and belongs to user
    const funnel = await prisma.funnel.findFirst({
      where: {
        id: funnelId,
        userId: session.user.id
      },
      include: {
        product: true,
        template: true
      }
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // Validate required fields before publishing
    if (publish) {
      const errors = [];

      // Check if product exists and has required fields
      if (!funnel.product) {
        errors.push('Product not found');
      } else {
        if (!funnel.product.name) errors.push('Product name is required');
        if (!funnel.product.price) errors.push('Product price is required');
        if (!funnel.product.fileUrl) errors.push('Product file is required');
      }

      // Check seller info
      if (!funnel.sellerInfo || typeof funnel.sellerInfo !== 'object') {
        errors.push('Seller information is required');
      } else {
        const sellerInfo = funnel.sellerInfo as any;
        if (!sellerInfo.name) errors.push('Seller name is required');
        if (!sellerInfo.email) errors.push('Seller email is required');
      }

      if (errors.length > 0) {
        return NextResponse.json({ 
          error: 'Validation failed',
          message: 'Please complete all required fields',
          details: errors
        }, { status: 400 });
      }
    }

    // Generate URL slug from funnel name
    const slug = funnel.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Update funnel status
    const updatedFunnel = await prisma.funnel.update({
      where: { id: funnelId },
      data: {
        status: publish ? 'ACTIVE' : 'DRAFT',
        published: publish,
        url: publish ? `/f/${funnelId}/${slug}` : null
      },
      include: {
        template: true,
        product: true
      }
    });

    // Create notification for user
    if (publish) {
      await prisma.userNotification.create({
        data: {
          userId: session.user.id,
          type: 'SUCCESS',
          title: 'Funnel Published Successfully! 🎉',
          message: `Your funnel "${funnel.name}" is now live and ready to accept payments.`,
          metadata: {
            funnelId: funnel.id,
            funnelName: funnel.name,
            funnelUrl: updatedFunnel.url
          }
        }
      });
    }

    return NextResponse.json(updatedFunnel);
  } catch (error) {
    console.error('Error publishing funnel:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

