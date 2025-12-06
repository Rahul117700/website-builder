import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST /api/instances/deallocate - Deallocate an instance from a user (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { instanceId } = body;

    if (!instanceId) {
      return NextResponse.json({ error: 'Instance ID is required' }, { status: 400 });
    }

    // Check if instance exists
    const instance = await prisma.instance.findUnique({
      where: { id: instanceId }
    });

    if (!instance) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    if (!instance.assignedUserId) {
      return NextResponse.json({ error: 'Instance is not allocated to any user' }, { status: 400 });
    }

    // Deallocate the instance
    const updatedInstance = await prisma.instance.update({
      where: { id: instanceId },
      data: {
        assignedUserId: null,
        status: 'AVAILABLE'
      }
    });

    return NextResponse.json({ 
      message: 'Instance deallocated successfully',
      instance: updatedInstance
    });
  } catch (error) {
    console.error('Error deallocating instance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
