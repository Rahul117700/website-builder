import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/community/posts - Get all community posts
export async function GET(request: NextRequest) {
  try {
    // TODO: Community models need to be added to schema
    // const posts = await prisma.communityPost.findMany({
    const posts: any[] = []; // Placeholder until model is added
    /* await prisma.communityPost.findMany({
      include: {
        _count: {
          select: {
            comments: true,
            postLikes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }); */

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/community/posts - Create a new community post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, tags, category } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // TODO: Community models need to be added to schema
    // const post = await prisma.communityPost.create({
    const post = {
      id: 'temp-' + Date.now(),
      title,
      content,
      tags: tags || [],
      category: category || 'GENERAL',
      authorName: session.user.name || session.user.email?.split('@')[0] || 'Anonymous',
      authorEmail: session.user.email || '',
      authorId: session.user.id,
      createdAt: new Date(),
      _count: { comments: 0, postLikes: 0 }
    };
    /* await prisma.communityPost.create({
      data: {
        title,
        content,
        tags: tags || [],
        category: category || 'GENERAL',
        authorName: session.user.name || session.user.email?.split('@')[0] || 'Anonymous',
        authorEmail: session.user.email || '',
        authorId: session.user.id
      },
      include: {
        _count: {
          select: {
            comments: true,
            postLikes: true
          }
        }
      }
    }); */

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating community post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}