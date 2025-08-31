import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../../lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's sites with analytics
    const sites = await prisma.site.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        status: true,
        subdomain: true,
        customDomain: true,
        port: true,
        ipAddress: true,
        price: true,
        createdAt: true,
        updatedAt: true,
        analytics: {
          select: {
            id: true,
            visitorId: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate views for each site
    const sitesWithViews = sites.map(site => ({
      ...site,
      views: site.analytics.length,
      uniqueVisitors: new Set(site.analytics.map(a => a.visitorId)).size
    }));

    return NextResponse.json(sitesWithViews);

  } catch (error) {
    console.error('Error fetching user sites:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
