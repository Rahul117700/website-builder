import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/instances/my-instances - Get current user's allocated instances
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const instances = await prisma.instance.findMany({
      where: {
        assignedUserId: session.user.id
      },
      include: {
        domains: {
          select: {
            id: true,
            domain: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(instances);
  } catch (error) {
    console.error('Error fetching user instances:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
