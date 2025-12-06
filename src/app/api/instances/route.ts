import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/instances - Get all instances (Super Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const instances = await prisma.instance.findMany({
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        domains: {
          select: {
            id: true,
            domain: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(instances);
  } catch (error) {
    console.error('Error fetching instances:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/instances - Create a new instance (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { port, url, status = 'AVAILABLE' } = body;

    if (!port || !url) {
      return NextResponse.json({ error: 'Port and URL are required' }, { status: 400 });
    }

    // Check if port or URL already exists
    const existingInstance = await prisma.instance.findFirst({
      where: {
        OR: [
          { port: parseInt(port) },
          { url: url }
        ]
      }
    });

    if (existingInstance) {
      return NextResponse.json({ error: 'Port or URL already exists' }, { status: 400 });
    }

    const instance = await prisma.instance.create({
      data: {
        port: parseInt(port),
        url,
        status: status as any
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

    return NextResponse.json(instance, { status: 201 });
  } catch (error) {
    console.error('Error creating instance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
