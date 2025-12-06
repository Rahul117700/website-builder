import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all subscription plans (Super Admin only)
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const plans = await prisma.subscriptionPlan.findMany({
      where: activeOnly ? { isActive: true } : {},
      include: {
        _count: {
          select: {
            subscriptions: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { price: 'asc' }
      ]
    });

    return NextResponse.json({ plans });

  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create new subscription plan (Super Admin only)
export async function POST(request: NextRequest) {
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

    // Validation
    if (!name || !price || !duration) {
      return NextResponse.json(
        { error: 'Name, price, and duration are required' },
        { status: 400 }
      );
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        currency: currency || 'INR',
        duration: parseInt(duration),
        features: features || [],
        maxFunnels: maxFunnels !== undefined ? parseInt(maxFunnels) : -1,
        maxProducts: maxProducts !== undefined ? parseInt(maxProducts) : -1,
        maxCustomDomains: maxCustomDomains !== undefined ? parseInt(maxCustomDomains) : 0,
        priority: priority !== undefined ? parseInt(priority) : 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription plan created successfully',
      plan
    });

  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update subscription plan (Super Admin only)
export async function PUT(request: NextRequest) {
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
      id,
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

    if (!id) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

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
      where: { id },
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

// DELETE - Delete subscription plan (Super Admin only)
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = await prisma.userSubscription.count({
      where: {
        planId: id,
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
      where: { id }
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

