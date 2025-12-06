import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/domains - Get user's domains
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const domains = await prisma.domain.findMany({
      where: { userId: session.user.id },
      include: {
        instance: {
          select: {
            id: true,
            port: true,
            url: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(domains);
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/domains - Create a new domain connection
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { domain, instanceId } = body;

    if (!domain || !instanceId) {
      return NextResponse.json({ error: 'Domain and Instance ID are required' }, { status: 400 });
    }

    // Check if user has access to this instance
    const instance = await prisma.instance.findUnique({
      where: { id: instanceId },
      include: {
        assignedUser: true
      }
    });

    if (!instance) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    if (instance.assignedUserId !== session.user.id) {
      return NextResponse.json({ error: 'You do not have access to this instance' }, { status: 403 });
    }

    // Check if domain already exists
    const existingDomain = await prisma.domain.findUnique({
      where: { domain }
    });

    if (existingDomain) {
      return NextResponse.json({ error: 'Domain already exists' }, { status: 400 });
    }

    // Create the domain connection
    const newDomain = await prisma.domain.create({
      data: {
        domain,
        instanceId,
        userId: session.user.id
      },
      include: {
        instance: {
          select: {
            id: true,
            port: true,
            url: true,
            status: true
          }
        }
      }
    });

    return NextResponse.json(newDomain, { status: 201 });
  } catch (error) {
    console.error('Error creating domain:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
