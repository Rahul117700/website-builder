import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { ChannelProductType } from '@prisma/client';

// PUT /api/channels/[channelId]/products/[productId] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: { channelId: string; productId: string } }
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
      return NextResponse.json({ error: 'Channel not found or unauthorized' }, { status: 404 });
    }

    // Verify product belongs to channel
    const product = await prisma.channelProduct.findFirst({
      where: {
        id: params.productId,
        channelId: params.channelId,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      tags = [],
      isSubscriberOnly = false,
    } = body;

    if (!title || !type) {
      return NextResponse.json({
        error: 'Title and type are required',
      }, { status: 400 });
    }

    // Update the product
    const updatedProduct = await prisma.channelProduct.update({
      where: { id: params.productId },
      data: {
        title,
        description: description || null,
        type: type as ChannelProductType,
        tags: Array.isArray(tags) ? tags : [],
        isSubscriberOnly,
      },
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/channels/[channelId]/products/[productId] - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { channelId: string; productId: string } }
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
      return NextResponse.json({ error: 'Channel not found or unauthorized' }, { status: 404 });
    }

    // Verify product belongs to channel
    const product = await prisma.channelProduct.findFirst({
      where: {
        id: params.productId,
        channelId: params.channelId,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete the product
    await prisma.channelProduct.delete({
      where: { id: params.productId },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

// POST /api/channels/[channelId]/products/[productId] - Track product view
export async function POST(
  request: NextRequest,
  { params }: { params: { channelId: string; productId: string } | Promise<{ channelId: string; productId: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { productId } = resolvedParams;

    // Verify product exists
    const product = await prisma.channelProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Increment view count and update updatedAt to track recent views
    const updatedProduct = await prisma.channelProduct.update({
      where: { id: productId },
      data: {
        viewCount: {
          increment: 1,
        },
        updatedAt: new Date(), // Update timestamp so it appears in recent activity
      },
    });

    console.log(`[Product View] Tracked view for product ${productId}, new viewCount: ${updatedProduct.viewCount}, updatedAt: ${updatedProduct.updatedAt}`);

    return NextResponse.json({
      success: true,
      message: 'View tracked successfully',
      viewCount: updatedProduct.viewCount,
    });
  } catch (error) {
    console.error('Error tracking product view:', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
}
