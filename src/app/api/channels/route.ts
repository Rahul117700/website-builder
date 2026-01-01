import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Helper function to generate unique slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, templateId } = body;

    if (!name || !templateId) {
      return NextResponse.json(
        { error: 'Name and template are required' },
        { status: 400 }
      );
    }

    // Check if user has an active subscription or is within trial period
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE',
            endDate: {
              gte: new Date(),
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check trial status (7 days from account creation)
    const { TRIAL_DAYS } = await import('@/lib/trial');
    const trialEnd = new Date(user.createdAt);
    trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
    const isInTrial = new Date() < trialEnd;
    const hasActiveSubscription = user.subscriptions.length > 0;

    if (!isInTrial && !hasActiveSubscription) {
      return NextResponse.json(
        {
          error: 'Trial expired. Please subscribe to create channels.',
          requiresUpgrade: true,
        },
        { status: 403 }
      );
    }

    // Verify template exists
    const template = await prisma.channelTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Generate unique slug
    let slug = generateSlug(name);
    let slugExists = await prisma.channel.findUnique({
      where: { slug },
    });
    
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(name)}-${counter}`;
      slugExists = await prisma.channel.findUnique({
        where: { slug },
      });
      counter++;
    }

    // Create channel
    const channel = await prisma.channel.create({
      data: {
        name,
        slug,
        description: description || null,
        userId: session.user.id,
        templateId,
        status: 'DRAFT',
        published: false,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            previewImage: true,
          },
        },
        _count: {
          select: {
            products: true,
            subscribers: true,
          },
        },
      },
    });

    return NextResponse.json(channel);
  } catch (error) {
    console.error('Error creating channel:', error);
    return NextResponse.json(
      { error: 'Failed to create channel' },
      { status: 500 }
    );
  }
}

