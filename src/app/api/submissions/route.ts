import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';
import { validateFormData, sanitizeInput } from '@/lib/validation';

// GET /api/submissions?siteId=... - List all submissions for a site
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('siteId');

    if (!siteId) {
      return NextResponse.json({ error: 'Missing siteId' }, { status: 400 });
    }

    // Check if the user owns the site
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    if (site.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get submissions for the site
    const submissions = await prisma.submission.findMany({
      where: { siteId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

// POST /api/submissions - Create a new submission
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { siteId, formType, data } = await req.json();

    if (!siteId || !formType || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate form data
    const validation = validateFormData(data);
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Invalid form data', 
        details: validation.errors 
      }, { status: 400 });
    }

    // Sanitize form data
    const sanitizedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key, 
        typeof value === 'string' ? sanitizeInput(value) : value
      ])
    );

    // Check if the user owns the site
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    if (site.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create the submission
    const submission = await prisma.submission.create({
      data: {
        siteId,
        formType,
        data: sanitizedData as any, // Store sanitized form data as JSON
      },
    });

    // Create notification for form submission
    try {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'submission',
          message: `New ${formType} form submission received for your website "${site.name}"`,
        },
      });
    } catch (error) {
      console.error('Error creating submission notification:', error);
    }

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
  }
} 