import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Increment the view count
    await prisma.communityPost.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ message: 'View tracked successfully' });
  } catch (error) {
    console.error('Error tracking post view:', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
} 