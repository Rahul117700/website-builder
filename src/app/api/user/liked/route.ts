import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

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

    // Get products the user has liked
    const likedProducts = await prisma.productLike.findMany({
      where: {
        userId: user.id,
      },
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
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ 
      products: likedProducts.map(like => like.product).filter(Boolean)
    });
  } catch (error) {
    console.error('Error fetching liked products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch liked products' },
      { status: 500 }
    );
  }
}

