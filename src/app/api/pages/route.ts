import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

// POST /api/pages - Create a new page
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, slug, content, siteId, isPublished = true } = await req.json();

    // Validate required fields
    if (!title || !slug || !siteId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the user owns the site
    const site = await prisma.site.findUnique({
      where: {
        id: siteId,
      },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    if (site.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if a page with the same slug already exists for this site
    const existingPage = await prisma.page.findFirst({
      where: {
        siteId,
        slug,
      },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 400 }
      );
    }

    // Create the page
    const page = await prisma.page.create({
      data: {
        title,
        slug,
        content: content || JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Start writing your content here...' }],
            },
          ],
        }),
        isPublished,
        site: {
          connect: {
            id: siteId,
          },
        },
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
}
