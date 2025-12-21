import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { funnelId: string } | Promise<{ funnelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const { name, description, price } = await request.json();

    // Verify funnel ownership
    const funnel = await prisma.funnel.findFirst({
      where: {
        id: resolvedParams.funnelId,
        userId: session.user.id,
      },
      include: {
        product: true,
      },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // Update or create product
    let product;
    if (funnel.product) {
      // Update existing product
      product = await prisma.digitalProduct.update({
        where: { id: funnel.product.id },
        data: {
          name,
          description,
          price: parseFloat(price),
        },
      });
    } else {
      // Create new product
      product = await prisma.digitalProduct.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          userId: session.user.id,
          type: 'EBOOK', // Default, will be updated on file upload
        },
      });

      // Link product to funnel
      await prisma.funnel.update({
        where: { id: resolvedParams.funnelId },
        data: {
          productId: product.id,
        },
      });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error saving product:', error);
    return NextResponse.json(
      { error: 'Failed to save product details' },
      { status: 500 }
    );
  }
}

