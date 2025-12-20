import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch a specific funnel
export async function GET(
  request: NextRequest,
  { params }: { params: { funnelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { funnelId } = params;

    const funnel = await prisma.funnel.findFirst({
      where: {
        id: funnelId,
        userId: session.user.id
      },
      include: {
        template: true,
        product: true
      }
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    return NextResponse.json(funnel);
  } catch (error) {
    console.error('Error fetching funnel:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update funnel
export async function PUT(
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
    const { customizations, sellerInfo, name, description } = body;

    // Verify funnel exists and belongs to user
    const existingFunnel = await prisma.funnel.findFirst({
      where: {
        id: funnelId,
        userId: session.user.id
      }
    });

    if (!existingFunnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // Update funnel
    const updatedFunnel = await prisma.funnel.update({
      where: { id: funnelId },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(customizations && { customizations }),
        ...(sellerInfo && { sellerInfo }),
        updatedAt: new Date()
      },
      include: {
        template: true,
        product: true
      }
    });

    return NextResponse.json(updatedFunnel);
  } catch (error) {
    console.error('Error updating funnel:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete funnel
export async function DELETE(
  request: NextRequest,
  { params }: { params: { funnelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { funnelId } = params;

    // Verify funnel exists and belongs to user
    const funnel = await prisma.funnel.findFirst({
      where: {
        id: funnelId,
        userId: session.user.id
      }
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // Delete funnel
    await prisma.funnel.delete({
      where: { id: funnelId }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Funnel deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting funnel:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

