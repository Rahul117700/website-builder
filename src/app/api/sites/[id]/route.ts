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

    // Update the site
    const updatedSite = await prisma.site.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        description,
        customDomain,
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

    // Delete all related data
    // First delete analytics
    await prisma.analytics.deleteMany({
      where: {
        siteId: params.id,
      },
    });

    // Delete bookings
    await prisma.booking.deleteMany({
      where: {
        siteId: params.id,
      },
    });

    // Delete pages
    await prisma.page.deleteMany({
      where: {
        siteId: params.id,
      },
    });

    // Finally delete the site
    await prisma.site.delete({
      where: {
        id: params.id,
      },
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

// POST /api/sites/[id]/apply-template - Apply a template to a site (replace all pages)
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
    const { templateId } = await req.json();
    if (!templateId) {
      return NextResponse.json({ error: 'templateId required' }, { status: 400 });
    }
    const template = await prisma.template.findUnique({ where: { id: templateId }, select: { pages: true } });
    if (!template || !template.pages) {
      return NextResponse.json({ error: 'Template or template pages not found' }, { status: 404 });
    }
    // Delete all existing pages for the site
    await prisma.page.deleteMany({ where: { siteId: site.id } });
    // Create new pages for the site from the template's pages object
    const pageTitles: Record<string, string> = { home: 'Home', about: 'About', contact: 'Contact', services: 'Services', product: 'Product' };
    for (const key of Object.keys(pageTitles)) {
      const pageData = (template.pages as Record<string, { html: string; css: string; js: string }>)[key];
      if (!pageData) continue;
      await prisma.page.create({
        data: {
          siteId: site.id,
          title: pageTitles[key],
          slug: key,
          content: { html: pageData.html, css: pageData.css, js: pageData.js },
          isPublished: true,
        },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error applying template:', error);
    return NextResponse.json({ error: 'Failed to apply template' }, { status: 500 });
  }
}
