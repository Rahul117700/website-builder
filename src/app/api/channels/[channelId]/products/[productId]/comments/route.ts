import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/channels/[channelId]/products/[productId]/comments - Get all comments
export async function GET(
  request: NextRequest,
  { params }: { params: { channelId: string; productId: string } | Promise<{ channelId: string; productId: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { productId } = resolvedParams;

    const comments = await prisma.productComment.findMany({
      where: {
        productId,
        parentId: null, // Only top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/channels/[channelId]/products/[productId]/comments - Create comment
export async function POST(
  request: NextRequest,
  { params }: { params: { channelId: string; productId: string } | Promise<{ channelId: string; productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const { productId } = resolvedParams;

    const body = await request.json();
    const { content, parentId } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    const comment = await prisma.productComment.create({
      data: {
        productId,
        userId: session.user.id,
        content: content.trim(),
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Notify channel owner
    try {
      const product = await prisma.channelProduct.findUnique({
        where: { id: productId },
        include: { channel: true }
      });
      if (product && product.channel.userId !== session.user.id) {
        await prisma.userNotification.create({
          data: {
            userId: product.channel.userId,
            title: '💬 New Comment!',
            message: `${session.user.name || 'Someone'} commented on your product "${product.title}"`,
            type: 'INFO',
            category: 'COMMUNITY',
            read: false,
            metadata: { productId: product.id, channelId: product.channelId, actorId: session.user.id, actorName: session.user.name }
          }
        });
      }
    } catch (notifErr) {
      console.error('Failed to create comment notification:', notifErr);
    }

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

