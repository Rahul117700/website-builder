import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const postId = params.id;

    // Check if post exists
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user already liked the post
    const existingLike = await prisma.communityPostLike.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId,
        },
      },
    });

    if (existingLike) {
      // Unlike the post
      await prisma.communityPostLike.delete({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: postId,
          },
        },
      });

      // Decrease like count
      await prisma.communityPost.update({
        where: { id: postId },
        data: { likes: { decrement: 1 } },
      });

      return NextResponse.json({ liked: false });
    } else {
      // Like the post
      await prisma.communityPostLike.create({
        data: {
          userId: session.user.id,
          postId: postId,
        },
      });

      // Increase like count
      await prisma.communityPost.update({
        where: { id: postId },
        data: { likes: { increment: 1 } },
      });

      // Create notification for post author (if liker is not the post author)
      if (post.authorId !== session.user.id) {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            type: 'like',
            message: `${session.user.name || 'Someone'} liked your post "${post.title}"`,
          },
        });
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Error toggling post like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
} 