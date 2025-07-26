import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Prisma } from '@prisma/client';
import { bundleReactFiles } from '@/utils/bundleReact';

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
    const { htmlCode, cssCode, jsCode, reactCode, renderMode } = await req.json();
    // Save multi-file reactCode as JSON string if it's an object
    let reactCodeToSave = reactCode;
    let reactBundle = null;
    if (reactCode && typeof reactCode === 'string') {
      try {
        reactCodeToSave = JSON.parse(reactCode);
      } catch {}
    }
    if (reactCode && typeof reactCode === 'object' && !Array.isArray(reactCode)) {
      reactCodeToSave = reactCode;
    }
    // Bundle React files if present
    if (reactCodeToSave && typeof reactCodeToSave === 'object' && reactCodeToSave['/App.js']) {
      try {
        reactBundle = await bundleReactFiles(reactCodeToSave);
      } catch (e) {
        console.error('Failed to bundle React files:', e);
      }
    }
    const updatedPage = await prisma.page.update({
      where: { id: params.id },
      data: {
        htmlCode,
        cssCode,
        jsCode,
        reactCode: reactCodeToSave || null,
        renderMode,
        reactBundle, // TODO: Ensure this field exists in your Page model
      },
    });

    // Create notification for page update/publishing
    try {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'publish',
          message: `Your page "${existingPage.title}" has been updated successfully! Changes are now live on your website.`,
        },
      });
    } catch (error) {
      console.error('Error creating page update notification:', error);
    }

    return NextResponse.json(updatedPage);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save code' }, { status: 500 });
  }
} 