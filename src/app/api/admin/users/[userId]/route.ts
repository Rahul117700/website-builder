import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - Fetch user details with channels
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Super Admin access required' },
        { status: 401 }
      );
    }

    const userId = params.userId;

    // Fetch user with subscriptions, funnels, and products
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          include: {
            plan: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        funnels: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        products: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            channels: true,
            products: true,
            funnels: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch channels directly using userId to ensure we get all channels
    // This is more reliable than relying on the relation
    const channels = await prisma.channel.findMany({
      where: {
        userId: userId
      },
      include: {
        template: true,
        products: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            products: true,
            subscribers: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Debug logging
    console.log(`[Admin User API] User ${userId} - Direct query channels count: ${channels.length}`);
    console.log(`[Admin User API] User ${userId} - _count.channels: ${user._count?.channels || 0}`);
    if (channels.length > 0) {
      console.log(`[Admin User API] First channel:`, {
        id: channels[0].id,
        name: channels[0].name,
        slug: channels[0].slug,
        userId: channels[0].userId,
      });
    }

    // Serialize Decimal fields properly
    const serializedUser = {
      ...user,
      _count: {
        ...user._count,
        channels: channels.length, // Use actual channels count
      },
      channels: channels.map((channel: any) => ({
        ...channel,
        subscriptionPrice: channel.subscriptionPrice
          ? (typeof channel.subscriptionPrice === 'object' && 'toNumber' in channel.subscriptionPrice
            ? channel.subscriptionPrice.toNumber()
            : typeof channel.subscriptionPrice === 'string'
              ? parseFloat(channel.subscriptionPrice)
              : Number(channel.subscriptionPrice))
          : null,
        totalRevenue: channel.totalRevenue
          ? (typeof channel.totalRevenue === 'object' && 'toNumber' in channel.totalRevenue
            ? channel.totalRevenue.toNumber()
            : typeof channel.totalRevenue === 'string'
              ? parseFloat(channel.totalRevenue)
              : Number(channel.totalRevenue))
          : 0,
        products: (channel.products || []).map((product: any) => ({
          ...product,
          price: product.price
            ? (typeof product.price === 'object' && 'toNumber' in product.price
              ? product.price.toNumber()
              : typeof product.price === 'string'
                ? parseFloat(product.price)
                : Number(product.price))
            : null,
        })),
      })),
    };

    // Debug logging after serialization
    console.log(`[Admin User API] Serialized - channels array length: ${serializedUser.channels.length}`);
    console.log(`[Admin User API] Serialized - _count.channels: ${serializedUser._count?.channels}`);

    return NextResponse.json({ user: serializedUser });

  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

