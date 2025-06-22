import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../../lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET /api/pages/[id] - Get a specific page
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = await prisma.page.findUnique({
      where: {
        id: params.id,
      },
      include: {
        site: true,
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Check if the user owns the site
    if (page.site.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

// PUT /api/pages/[id] - Update a page
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the page to check ownership
    const existingPage = await prisma.page.findUnique({
      where: {
        id: params.id,
      },
      include: {
        site: true,
      },
    });

    if (!existingPage) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Check if the user owns the site
    if (existingPage.site.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, slug, content, isPublished } = await req.json();

    // If slug is being changed, check if it's already taken
    if (slug !== existingPage.slug) {
      const slugExists = await prisma.page.findFirst({
        where: {
          siteId: existingPage.siteId,
          slug,
          id: {
            not: params.id,
          },
        },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'A page with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update the page
    const updatedPage = await prisma.page.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        slug,
        content,
        isPublished,
      },
    });

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
  }
}

// DELETE /api/pages/[id] - Delete a page
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the page to check ownership
    const existingPage = await prisma.page.findUnique({
      where: {
        id: params.id,
      },
      include: {
        site: true,
      },
    });

    if (!existingPage) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Check if the user owns the site
    if (existingPage.site.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the page
    await prisma.page.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}
