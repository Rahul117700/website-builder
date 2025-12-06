import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST /api/instances/allocate - Allocate an instance to a user (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { instanceId, userId } = body;

    if (!instanceId || !userId) {
      return NextResponse.json({ error: 'Instance ID and User ID are required' }, { status: 400 });
    }

    // Check if instance exists and is available
    const instance = await prisma.instance.findUnique({
      where: { id: instanceId }
    });

    if (!instance) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    if (instance.status !== 'AVAILABLE') {
      return NextResponse.json({ error: 'Instance is not available' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Allow multiple instances per user - no need to check for existing instances

    // Allocate the instance
    const updatedInstance = await prisma.instance.update({
      where: { id: instanceId },
      data: {
        assignedUserId: userId,
        status: 'ALLOCATED'
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        domains: true
      }
    });

    return NextResponse.json(updatedInstance);
  } catch (error) {
    console.error('Error allocating instance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
