import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST /api/channels/[channelId]/products/[productId]/like - Toggle like
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

    // Check if ProductLike model exists in Prisma client
    if (!prisma.productLike) {
      console.error('ProductLike model not found in Prisma client');
      return NextResponse.json(
        { 
          error: 'Database model not available',
          details: 'ProductLike model not found. Please restart your development server after running: npx prisma generate',
        },
        { status: 500 }
      );
    }

    // Check if like already exists
    let existingLike = null;
    try {
      existingLike = await prisma.productLike.findUnique({
        where: {
          productId_userId: {
            productId,
            userId: session.user.id,
          },
        },
      });
    } catch (error: any) {
      console.error('Error checking existing like:', error);
      if (error?.message?.includes('not found') || error?.message?.includes('undefined')) {
        return NextResponse.json(
          { 
            error: 'Database model not available',
            details: 'ProductLike model not found. Please restart your development server after running: npx prisma generate',
          },
          { status: 500 }
        );
      }
      throw error;
    }

    try {
      if (existingLike) {
        // Unlike - remove the like
        await prisma.productLike.delete({
          where: { id: existingLike.id },
        });

        // Decrement like count
        await prisma.channelProduct.update({
          where: { id: productId },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
        });

        return NextResponse.json({
          success: true,
          liked: false,
          message: 'Product unliked',
        });
      } else {
        // Like - create the like
        await prisma.productLike.create({
          data: {
            productId,
            userId: session.user.id,
          },
        });

        // Increment like count
        const updatedProduct = await prisma.channelProduct.update({
          where: { id: productId },
          data: {
            likeCount: {
              increment: 1,
            },
          },
          include: {
            channel: true,
          }
        });

        // Create Notification for the channel owner
        if (updatedProduct.channel.userId !== session.user.id) {
          try {
            await prisma.userNotification.create({
              data: {
                userId: updatedProduct.channel.userId,
                title: '❤️ New Like!',
                message: `${session.user.name || 'Someone'} liked your product "${updatedProduct.title}"`,
                type: 'INFO',
                category: 'COMMUNITY',
                read: false,
                metadata: {
                  productId: updatedProduct.id,
                  channelId: updatedProduct.channelId,
                  actorId: session.user.id,
                  actorName: session.user.name
                }
              }
            });
          } catch (notifErr) {
            console.error('Failed to create like notification:', notifErr);
          }
        }

        return NextResponse.json({
          success: true,
          liked: true,
          message: 'Product liked',
        });
      }
    } catch (createError: any) {
      console.error('Error creating/deleting like:', createError);
      if (createError?.message?.includes('not found') || createError?.message?.includes('undefined') || createError?.code === 'P2001') {
        return NextResponse.json(
          { 
            error: 'Database model not available',
            details: 'ProductLike model not found. Please restart your development server after running: npx prisma generate',
          },
          { status: 500 }
        );
      }
      throw createError;
    }
  } catch (error: any) {
    console.error('Error toggling like:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    });
    return NextResponse.json(
      { 
        error: 'Failed to toggle like',
        details: error?.message || 'Unknown error',
        code: error?.code,
      },
      { status: 500 }
    );
  }
}

// GET /api/channels/[channelId]/products/[productId]/like - Check if user liked
export async function GET(
  request: NextRequest,
  { params }: { params: { channelId: string; productId: string } | Promise<{ channelId: string; productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ liked: false });
    }

    const resolvedParams = await Promise.resolve(params);
    const { productId } = resolvedParams;

    const like = await prisma.productLike.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({ liked: !!like });
  } catch (error) {
    console.error('Error checking like:', error);
    return NextResponse.json({ liked: false });
  }
}

