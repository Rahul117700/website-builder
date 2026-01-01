import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch the channel to verify ownership
    const channel = await prisma.channel.findUnique({
      where: {
        id: params.channelId,
      },
    });

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (channel.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to publish this channel' },
        { status: 403 }
      );
    }

    // Validation
    if (!channel.name || channel.name.trim().length < 3) {
      return NextResponse.json(
        { 
          error: 'Channel name is required (minimum 3 characters)',
          field: 'name'
        },
        { status: 400 }
      );
    }

    // Update channel to published
    const updatedChannel = await prisma.channel.update({
      where: {
        id: params.channelId,
      },
      data: {
        published: true,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      channel: updatedChannel,
      message: 'Channel published successfully!',
    });
  } catch (error) {
    console.error('Error publishing channel:', error);
    return NextResponse.json(
      { error: 'Failed to publish channel' },
      { status: 500 }
    );
  }
}

