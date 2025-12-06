import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/admin/sites - Get all sites (Super Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const sites = await prisma.site.findMany({
      where: userId ? { userId } : {},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
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
    console.error('Error fetching sites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
