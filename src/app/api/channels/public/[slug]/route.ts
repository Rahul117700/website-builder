import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Check if this is a preview request
    const { searchParams } = new URL(request.url);
    const isPreview = searchParams.get('preview') === 'true';

    // Fetch channel by slug (public access, no auth required)
    const channel = await prisma.channel.findUnique({
      where: {
        slug: params.slug,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        template: true,
        products: {
          where: {
            published: true,
          },
          orderBy: {
            createdAt: 'desc',
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

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    // Log image URLs for debugging (only in development or when needed)
    if (process.env.NODE_ENV === 'development') {
      console.log('Channel image URLs:', {
        slug: channel.slug,
        profileImage: channel.profileImage,
        coverImage: channel.coverImage,
        userImage: channel.user?.image,
      });
    }

    // Check if channel is published (skip check for preview mode)
    if (!isPreview && !channel.published) {
      return NextResponse.json(
        { error: 'This channel is not currently available' },
        { status: 403 }
      );
    }

    // Serialize Decimal fields properly
    const serializedChannel = {
      ...channel,
      subscriptionPrice: channel.subscriptionPrice
        ? (typeof channel.subscriptionPrice === 'object' && 'toNumber' in channel.subscriptionPrice
          ? channel.subscriptionPrice.toNumber()
          : typeof channel.subscriptionPrice === 'string'
            ? parseFloat(channel.subscriptionPrice)
            : Number(channel.subscriptionPrice))
        : null,
      totalRevenue: channel.totalRevenue
        ? (typeof channel.totalRevenue === 'object' && 'toNumber' in channel.totalRevenue
          ? channel.totalRevenue.toNumber()
          : typeof channel.totalRevenue === 'string'
            ? parseFloat(channel.totalRevenue)
            : Number(channel.totalRevenue))
        : 0,
    };

    return NextResponse.json(serializedChannel);
  } catch (error) {
    console.error('Error fetching public channel:', error);
    return NextResponse.json(
      { error: 'Failed to load channel' },
      { status: 500 }
    );
  }
}

