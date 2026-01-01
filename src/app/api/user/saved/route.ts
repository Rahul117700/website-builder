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

    // Fetch saved products
    const savedProducts = await prisma.productSave.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            channel: {
              select: {
                id: true,
                name: true,
                slug: true,
                profileImage: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map to return format
    const products = savedProducts.map(save => save.product);

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching saved products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved products' },
      { status: 500 }
    );
  }
}

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

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Check if product exists
    const product = await prisma.channelProduct.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if already saved
    const existingSave = await prisma.productSave.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId
        }
      }
    });

    if (existingSave) {
      return NextResponse.json({ message: 'Product already saved', saved: true });
    }

    // Save the product
    await prisma.productSave.create({
      data: {
        userId: user.id,
        productId: productId
      }
    });

    return NextResponse.json({ message: 'Product saved successfully', saved: true });
  } catch (error: any) {
    console.error('Error saving product:', error);
    // Handle unique constraint violation (already saved)
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Product already saved', saved: true });
    }
    return NextResponse.json(
      { error: 'Failed to save product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Remove the saved product
    await prisma.productSave.deleteMany({
      where: {
        userId: user.id,
        productId: productId
      }
    });

    return NextResponse.json({ message: 'Product removed from saved list', saved: false });
  } catch (error) {
    console.error('Error removing saved product:', error);
    return NextResponse.json(
      { error: 'Failed to remove saved product' },
      { status: 500 }
    );
  }
}

