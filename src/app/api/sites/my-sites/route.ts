import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/sites/my-sites - Get user's sites
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const sites = await prisma.site.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        subdomain: true,
        domain: true,
        type: true,
        template: {
          select: {
            name: true,
            thumbnail: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(sites);
  } catch (error) {
    console.error('Error fetching user sites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
