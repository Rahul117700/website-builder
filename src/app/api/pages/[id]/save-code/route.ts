import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../../auth/[...nextauth]/route';

// POST /api/pages/[id]/save-code - Save htmlCode, cssCode, jsCode for a page
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const existingPage = await prisma.page.findUnique({
      where: { id: params.id },
      include: { site: true },
    });
    if (!existingPage) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    if (existingPage.site.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Read all possible fields from the request
    const body = await req.json();
    console.log('Request body:', body);
    const { htmlCode, cssCode, jsCode, reactCode, renderMode } = body;
    const updatedPage = await prisma.page.update({
      where: { id: params.id },
      data: { htmlCode, cssCode, jsCode, reactCode, renderMode },
    });
    console.log('Updated page:', updatedPage);
    return NextResponse.json(updatedPage);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save code' }, { status: 500 });
  }
} 