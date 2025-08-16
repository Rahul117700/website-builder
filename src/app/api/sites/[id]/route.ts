import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { TemplateType } from '@/types';

// GET /api/sites/[id] - Get a specific site
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const site = await prisma.site.findUnique({
      where: {
        id: params.id,
      },
      include: {
        pages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Check if the user owns the site
    if (site.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(site);
  } catch (error) {
    console.error('Error fetching site:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site' },
      { status: 500 }
    );
  }
}

// PUT /api/sites/[id] - Update a site
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the site to check ownership
    const existingSite = await prisma.site.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingSite) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Check if the user owns the site
    if (existingSite.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, customDomain, googleAnalyticsId, template } = await req.json();

    // Normalize customDomain if provided (lowercase, strip protocol, trim dots and trailing slash)
    const normalizedCustomDomain =
      customDomain === null
        ? null
        : (typeof customDomain === 'string' && customDomain.trim().length > 0)
          ? customDomain
              .trim()
              .replace(/^https?:\/\//i, '')
              .replace(/\/$/, '')
              .replace(/^www\./i, (m) => 'www.') // keep www. if user intends, but normalized case
              .toLowerCase()
          : undefined;

    // Update the site
    const updatedSite = await prisma.site.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        description,
        ...(normalizedCustomDomain !== undefined && { customDomain: normalizedCustomDomain }),
        googleAnalyticsId,
        ...(template !== undefined && { template }),
      },
    });

    return NextResponse.json(updatedSite);
  } catch (error) {
    console.error('Error updating site:', error);
    return NextResponse.json(
      { error: 'Failed to update site' },
      { status: 500 }
    );
  }
}

// DELETE /api/sites/[id] - Delete a site
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the site to check ownership
    const existingSite = await prisma.site.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingSite) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Check if the user owns the site
    if (existingSite.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all related data using a transaction
    await prisma.$transaction(async (tx: any) => {
      console.log(`Starting deletion of site ${params.id} and all related data`);
      
      // Delete analytics
      const analyticsDeleted = await tx.analytics.deleteMany({
        where: {
          siteId: params.id,
        },
      });
      console.log(`Deleted ${analyticsDeleted.count} analytics records`);

      // Delete bookings
      const bookingsDeleted = await tx.booking.deleteMany({
        where: {
          siteId: params.id,
        },
      });
      console.log(`Deleted ${bookingsDeleted.count} booking records`);

      // Delete pages
      const pagesDeleted = await tx.page.deleteMany({
        where: {
          siteId: params.id,
        },
      });
      console.log(`Deleted ${pagesDeleted.count} page records`);

      // Delete submissions
      const submissionsDeleted = await tx.submission.deleteMany({
        where: {
          siteId: params.id,
        },
      });
      console.log(`Deleted ${submissionsDeleted.count} submission records`);

      // Finally delete the site
      await tx.site.delete({
        where: {
          id: params.id,
        },
      });
      console.log(`Successfully deleted site ${params.id}`);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting site:', error);
    return NextResponse.json(
      { error: 'Failed to delete site' },
      { status: 500 }
    );
  }
}

// POST /api/sites/[id] - Handle site-level operations
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the site to check ownership
    const site = await prisma.site.findUnique({ where: { id: params.id } });
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }
    if (site.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Handle different POST operations based on the request body
    const body = await req.json();
    
    if (body.action === 'update-site') {
      // Update site information
      const { name, description } = body;
      const updatedSite = await prisma.site.update({
        where: { id: site.id },
        data: {
          name: name || site.name,
          description: description || site.description,
          updatedAt: new Date(),
        },
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Site updated successfully',
        site: updatedSite
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Error in site POST operation:', error);
    return NextResponse.json({ error: 'Failed to perform site operation' }, { status: 500 });
  }
}
