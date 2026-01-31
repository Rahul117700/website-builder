import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { ChannelProductType, ChannelProductStatus } from '@prisma/client';

// GET /api/channels/[channelId]/products - Get all products for a channel
export async function GET(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const channel = await prisma.channel.findUnique({
      where: { id: params.channelId },
      include: {
        products: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    return NextResponse.json(channel.products);
  } catch (error) {
    console.error('Error fetching channel products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/channels/[channelId]/products - Create a new channel product
export async function POST(
  request: NextRequest,
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
      return NextResponse.json({ error: 'Channel not found or unauthorized' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      price,
      currency = 'INR',
      fileUrl,
      fileType,
      fileSize,
      videoUrl,
      previewImage,
      previewText,
      tags = [],
      isSubscriberOnly = false,
      isFree = false,
      downloadLimit = null,
      published = false,
    } = body;

    if (!title || !type || (price === undefined && !isFree)) {
      return NextResponse.json({
        error: 'Title, type, and price (or isFree) are required',
      }, { status: 400 });
    }

    // Create the channel product
    const product = await prisma.channelProduct.create({
      data: {
        channelId: params.channelId,
        title,
        description: description || null,
        type: type as ChannelProductType,
        price: isFree ? 0 : parseFloat(price),
        currency,
        fileUrl: fileUrl || null,
        fileType: fileType || null,
        fileSize: fileSize || null,
        videoUrl: videoUrl || null,
        previewImage: previewImage || null,
        previewText: previewText || null,
        tags: tags || [],
        isSubscriberOnly,
        isFree,
        downloadLimit,
        published,
        status: 'ACTIVE',
      },
      include: {
        channel: true
      }
    });

    // Auto-publish channel if this is the first product
    if (product.channelId && !product.channel.published) {
      const productCount = await prisma.channelProduct.count({
        where: { channelId: params.channelId }
      });

      if (productCount === 1) {
        // First product created! Auto-publish channel.
        await prisma.channel.update({
          where: { id: params.channelId },
          data: {
            published: true,
            // Ensure slug exists if not already (though usually created on setup)
            slug: product.channel.slug || product.channel.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(7)
          }
        });
        console.log(`Auto-published channel ${params.channelId} after first product creation`);
      }
    }

    // Notify subscribers asynchronously
    // In a real app, this should be a background job (e.g., BullMQ, Inngest)
    if (published) {
      (async () => {
        try {
          const subscribers = await prisma.channelSubscription.findMany({
            where: {
              channelId: params.channelId,
              status: 'ACTIVE'
            },
            select: { userId: true }
          });

          if (subscribers.length > 0) {
            await prisma.userNotification.createMany({
              data: subscribers.map(sub => ({
                userId: sub.userId,
                title: `New from ${product.channel.name}`,
                message: `Check out "${product.title}"`,
                type: 'INFO',
                category: 'COMMUNITY',
                metadata: { productId: product.id, channelId: product.channelId }
              }))
            });
          }
        } catch (err) {
          console.error('Failed to send notifications', err);
        }
      })();
    }

    return NextResponse.json({
      success: true,
      product,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating channel product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

