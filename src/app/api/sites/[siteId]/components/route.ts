import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../../../lib/prisma';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function PUT(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { components } = await req.json();

    // Verify the site belongs to the user
    const site = await prisma.site.findFirst({
      where: {
        id: params.siteId,
        userId: session.user.id
      }
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Update the site with new components
    const updatedSite = await prisma.site.update({
      where: {
        id: params.siteId
      },
      data: {
        components: components
      }
    });

    return NextResponse.json({
      message: 'Site components updated successfully',
      site: updatedSite
    });

  } catch (error) {
    console.error('Error updating site components:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
