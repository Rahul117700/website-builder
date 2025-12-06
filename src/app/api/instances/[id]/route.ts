import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/instances/[id] - Get a specific instance
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const instance = await prisma.instance.findUnique({
      where: { id: params.id },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        domains: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!instance) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    // Check if user is Super Admin or the assigned user
    if (session.user.role !== 'SUPER_ADMIN' && 
        session.user.email !== 'i.am.rahul4550@gmail.com' && 
        instance.assignedUserId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(instance);
  } catch (error) {
    console.error('Error fetching instance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/instances/[id] - Update an instance (Super Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { port, url, status, assignedUserId } = body;

    const instance = await prisma.instance.findUnique({
      where: { id: params.id }
    });

    if (!instance) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    // Check if port or URL already exists (excluding current instance)
    if (port || url) {
      const existingInstance = await prisma.instance.findFirst({
        where: {
          AND: [
            { id: { not: params.id } },
            {
              OR: [
                ...(port ? [{ port: parseInt(port) }] : []),
                ...(url ? [{ url: url }] : [])
              ]
            }
          ]
        }
      });

      if (existingInstance) {
        return NextResponse.json({ error: 'Port or URL already exists' }, { status: 400 });
      }
    }

    // If assigning to a user, check if user exists and doesn't already have an instance
    if (assignedUserId) {
      const user = await prisma.user.findUnique({
        where: { id: assignedUserId }
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 400 });
      }

      const existingUserInstance = await prisma.instance.findFirst({
        where: {
          assignedUserId: assignedUserId,
          id: { not: params.id }
        }
      });

      if (existingUserInstance) {
        return NextResponse.json({ error: 'User already has an assigned instance' }, { status: 400 });
      }
    }

    const updatedInstance = await prisma.instance.update({
      where: { id: params.id },
      data: {
        ...(port && { port: parseInt(port) }),
        ...(url && { url }),
        ...(status && { status: status as any }),
        ...(assignedUserId !== undefined && { assignedUserId: assignedUserId || null })
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        domains: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedInstance);
  } catch (error) {
    console.error('Error updating instance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/instances/[id] - Delete an instance (Super Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const instance = await prisma.instance.findUnique({
      where: { id: params.id }
    });

    if (!instance) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    await prisma.instance.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Instance deleted successfully' });
  } catch (error) {
    console.error('Error deleting instance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
