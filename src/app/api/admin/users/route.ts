import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - Fetch all users (Super Admin only)
export async function GET(request: NextRequest) {
  try {
    console.log('=== API /admin/users called ===');
    const session = await getServerSession(authOptions);
    console.log('Session in API:', session);

    if (!session?.user?.email) {
      console.log('No session or email found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is SUPER_ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    console.log('Current user found:', currentUser);

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      console.log('User not found or not super admin:', { currentUser, role: currentUser?.role });
      return NextResponse.json({ error: 'Forbidden - Super Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const role = searchParams.get('role') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      NOT: { email: { startsWith: 'fake_' } }
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (role) {
      where.role = role;
    }

    // Get users with pagination and stats
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          image: true,
          phone: true,
          website: true,
          // Include counts
          _count: {
            select: {
              channels: true,
              products: true,
              transactions: true
            }
          },
          // Include active subscription
          subscriptions: {
            where: {
              status: 'ACTIVE',
              endDate: {
                gte: new Date()
              }
            },
            include: {
              plan: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  duration: true
                }
              }
            },
            orderBy: {
              endDate: 'desc'
            },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    // Get stats without status field
    const stats = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    });

    // Calculate additional stats
    const totalUsers = await prisma.user.count({
      where: { NOT: { email: { startsWith: 'fake_' } } }
    });
    const activeUsers = totalUsers; // For now, treat all users as active
    const disabledUsers = 0; // No disabled users yet
    const superAdmins = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });

    const result = {
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      stats: {
        total: totalUsers,
        active: activeUsers,
        disabled: disabledUsers,
        superAdmins,
        breakdown: stats
      }
    };

    console.log('Returning users data:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user status or role
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

    const { userId, role, status } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Build update data
    const updateData: any = {
      updatedAt: new Date()
    };

    if (role && ['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
      updateData.role = role;
    }

    if (status && ['ACTIVE', 'DISABLED'].includes(status)) {
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 1) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// DELETE - Remove user permanently
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
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent deleting self
    if (userId === currentUser.id) {
      return NextResponse.json({ error: 'Cannot delete own account' }, { status: 400 });
    }

    // Delete user (Prisma will handle cascading deletes if configured in schema)
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({
      success: true,
      message: 'User permanently removed from registry'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
