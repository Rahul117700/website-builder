import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST - Add a product to a playlist
export async function POST(
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

    // Verify playlist ownership
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: params.playlistId,
        userId: user.id,
      },
    });

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.channelProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if product is already in playlist
    const existingItem = await prisma.playlistItem.findUnique({
      where: {
        playlistId_productId: {
          playlistId: params.playlistId,
          productId: productId,
        },
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: 'Product already in playlist' },
        { status: 400 }
      );
    }

    // Get current max order
    const maxOrder = await prisma.playlistItem.findFirst({
      where: { playlistId: params.playlistId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    // Add product to playlist
    const playlistItem = await prisma.playlistItem.create({
      data: {
        playlistId: params.playlistId,
        productId: productId,
        order: (maxOrder?.order || 0) + 1,
      },
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
    });

    return NextResponse.json({ item: playlistItem });
  } catch (error) {
    console.error('Error adding product to playlist:', error);
    return NextResponse.json(
      { error: 'Failed to add product to playlist' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a product from a playlist
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

    // Verify playlist ownership
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: params.playlistId,
        userId: user.id,
      },
    });

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Remove product from playlist
    await prisma.playlistItem.delete({
      where: {
        playlistId_productId: {
          playlistId: params.playlistId,
          productId: productId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing product from playlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove product from playlist' },
      { status: 500 }
    );
  }
}

