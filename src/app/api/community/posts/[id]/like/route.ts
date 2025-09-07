import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST /api/community/posts/[id]/like - Like/unlike a community post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;
    const userId = session.user.id;

    // Check if user already liked this post
    const existingLike = await prisma.communityPostLike.findFirst({
      where: {
        postId,
        userId
      }
    });

    if (existingLike) {
      // Unlike the post
      await prisma.communityPostLike.delete({
        where: {
          id: existingLike.id
        }
      });

      return NextResponse.json({ liked: false });
    } else {
      // Like the post
      await prisma.communityPostLike.create({
        data: {
          postId,
          userId
        }
      });

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Error toggling post like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
