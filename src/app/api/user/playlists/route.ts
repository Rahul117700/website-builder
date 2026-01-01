import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - Get user's playlists
export async function GET(request: NextRequest) {
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

    // Get all user's playlists with items
    const playlists = await prisma.playlist.findMany({
      where: {
        userId: user.id,
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
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ playlists });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
}

// POST - Create a new playlist
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, description, isPublic } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Playlist name is required' },
        { status: 400 }
      );
    }

    // Create playlist
    try {
      const playlist = await prisma.playlist.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          isPublic: isPublic || false,
          userId: user.id,
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
    } catch (dbError: any) {
      console.error('Database error creating playlist:', dbError);
      // Check if it's a Prisma model not found error
      if (dbError?.code === 'P2001' || dbError?.message?.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Playlist model not found. Please restart the development server after running: npx prisma generate' },
          { status: 500 }
        );
      }
      throw dbError; // Re-throw to be caught by outer catch
    }
  } catch (error: any) {
    console.error('Error creating playlist:', error);
    // Provide more specific error message
    let errorMessage = 'Failed to create playlist';
    
    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.code) {
      errorMessage = `Database error (${error.code}): ${error.message || 'Unknown error'}`;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
