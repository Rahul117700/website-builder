import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - Get a specific playlist
export async function GET(
  request: NextRequest,
  { params }: { params: { playlistId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const playlist = await prisma.playlist.findFirst({
      where: {
        id: params.playlistId,
        userId: user.id, // Ensure user owns the playlist
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                channel: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    user: {
                      select: {
                        name: true,
                        image: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    return NextResponse.json({ playlist });
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlist' },
      { status: 500 }
    );
  }
}

// PUT - Update a playlist
export async function PUT(
  request: NextRequest,
  { params }: { params: { playlistId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify ownership
    const existingPlaylist = await prisma.playlist.findFirst({
      where: {
        id: params.playlistId,
        userId: user.id,
      },
    });

    if (!existingPlaylist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, isPublic } = body;

    const playlist = await prisma.playlist.update({
      where: { id: params.playlistId },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(isPublic !== undefined && { isPublic }),
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                channel: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ playlist });
  } catch (error) {
    console.error('Error updating playlist:', error);
    return NextResponse.json(
      { error: 'Failed to update playlist' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a playlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { playlistId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify ownership
    const existingPlaylist = await prisma.playlist.findFirst({
      where: {
        id: params.playlistId,
        userId: user.id,
      },
    });

    if (!existingPlaylist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    await prisma.playlist.delete({
      where: { id: params.playlistId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return NextResponse.json(
      { error: 'Failed to delete playlist' },
      { status: 500 }
    );
  }
}

