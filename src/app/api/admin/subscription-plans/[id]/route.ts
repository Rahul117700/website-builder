import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch specific subscription plan
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is SUPER_ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Super Admin access required' }, { status: 403 });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            subscriptions: true
          }
        }
      }
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({ plan });

  } catch (error) {
    console.error('Error fetching subscription plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update specific subscription plan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is SUPER_ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Super Admin access required' }, { status: 403 });
    }

    const {
      name,
      description,
      price,
      currency,
      duration,
      features,
      maxFunnels,
      maxProducts,
      maxCustomDomains,
      priority,
      isActive
    } = await request.json();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (currency !== undefined) updateData.currency = currency;
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (features !== undefined) updateData.features = features;
    if (maxFunnels !== undefined) updateData.maxFunnels = parseInt(maxFunnels);
    if (maxProducts !== undefined) updateData.maxProducts = parseInt(maxProducts);
    if (maxCustomDomains !== undefined) updateData.maxCustomDomains = parseInt(maxCustomDomains);
    if (priority !== undefined) updateData.priority = parseInt(priority);
    if (isActive !== undefined) updateData.isActive = isActive;

    const plan = await prisma.subscriptionPlan.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription plan updated successfully',
      plan
    });

  } catch (error) {
    console.error('Error updating subscription plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete specific subscription plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is SUPER_ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Super Admin access required' }, { status: 403 });
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = await prisma.userSubscription.count({
      where: {
        planId: params.id,
        status: 'ACTIVE'
      }
    });

    if (activeSubscriptions > 0) {
      return NextResponse.json(
        { error: 'Cannot delete plan with active subscriptions. Deactivate it instead.' },
        { status: 400 }
      );
    }

    await prisma.subscriptionPlan.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription plan deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
