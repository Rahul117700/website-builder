import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
// import { authOptions } from '../auth/[...nextauth]/route';
import { authOptions } from '../../auth/[...nextauth]/route';
// import prisma from '@/lib/prisma';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const channel = await prisma.channel.findUnique({
      where: {
        id: params.channelId,
        userId: session.user.id, // Ensure user owns the channel
      },
      include: {
        template: true,
        products: {
          orderBy: { createdAt: 'desc' },
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
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
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
    console.error('Error fetching channel:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channel' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, status, customizations, welcomePageContent, templateId, welcomeMessage, slug, theme, coverImage, profileImage, subscriptionEnabled, subscriptionPrice, subscriptionCurrency, tags, category } = body;

    // Verify user owns the channel
    const existingChannel = await prisma.channel.findUnique({
      where: {
        id: params.channelId,
        userId: session.user.id,
      },
    });

    if (!existingChannel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Update channel
    const channel = await prisma.channel.update({
      where: {
        id: params.channelId,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(customizations !== undefined && { customizations }),
        ...(welcomePageContent !== undefined && { welcomePageContent }),
        ...(templateId !== undefined && { templateId }),
        ...(welcomeMessage !== undefined && { welcomeMessage }),
        ...(slug !== undefined && { slug }),
        ...(theme !== undefined && { theme }),
        ...(coverImage !== undefined && { coverImage }),
        ...(profileImage !== undefined && { profileImage }),
        ...(subscriptionEnabled !== undefined && { subscriptionEnabled }),
        ...(subscriptionPrice !== undefined && { subscriptionPrice }),
        ...(subscriptionCurrency !== undefined && { subscriptionCurrency }),
        ...(tags !== undefined && { tags }),
        ...(category !== undefined && { category }),
        updatedAt: new Date(),
      },
      include: {
        template: true,
        products: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            products: true,
            subscribers: true,
          },
        },
      },
    });

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
    console.error('Error updating channel:', error);
    return NextResponse.json(
      { error: 'Failed to update channel' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns the channel
    const channel = await prisma.channel.findUnique({
      where: {
        id: params.channelId,
        userId: session.user.id,
      },
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Delete channel (cascade will handle related content, products, etc.)
    await prisma.channel.delete({
      where: {
        id: params.channelId,
      },
    });

    return NextResponse.json({ success: true, message: 'Channel deleted successfully' });
  } catch (error) {
    console.error('Error deleting channel:', error);
    return NextResponse.json(
      { error: 'Failed to delete channel' },
      { status: 500 }
    );
  }
}

