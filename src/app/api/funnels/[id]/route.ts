import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in database
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const funnel = await prisma.funnel.findFirst({
      where: {
        id: params.id,
        userId: user.id, // Use the database user ID
      },
      include: {
        template: true,
        product: true,
      } as any,
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    return NextResponse.json(funnel);
  } catch (error) {
    console.error('Error fetching funnel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in database
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();

    const funnel = await prisma.funnel.findFirst({
      where: {
        id: params.id,
        userId: user.id, // Use the database user ID
      },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // Prepare funnel update data
    const funnelUpdateData: any = {
      updatedAt: new Date(),
    };

    // Handle customizations and sellerInfo
    if (body.customizations) {
      funnelUpdateData.customizations = body.customizations;
    }
    if (body.sellerInfo) {
      funnelUpdateData.sellerInfo = body.sellerInfo;
    }
    
    // Handle status change
    if (body.status) {
      funnelUpdateData.status = body.status;
    }
    
    // Handle name and description
    if (body.name) {
      funnelUpdateData.name = body.name;
    }
    if (body.description !== undefined) {
      funnelUpdateData.description = body.description;
    }

    // Handle product data
    let productId = funnel.productId;
    if (body.productDetails || body.productFile) {
      if (productId) {
        // Update existing product
        await prisma.digitalProduct.update({
          where: { id: productId },
          data: {
            name: body.productDetails?.name || undefined,
            description: body.productDetails?.description || undefined,
            type: body.productDetails?.type || undefined,
            price: body.productDetails?.price ? parseFloat(body.productDetails.price) : undefined,
            fileUrl: body.productFile?.url || undefined,
            fileSize: body.productFile?.size || undefined,
            fileType: body.productFile?.type || undefined,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new product
        const newProduct = await prisma.digitalProduct.create({
          data: {
            name: body.productDetails?.name || 'Untitled Product',
            description: body.productDetails?.description || '',
            type: body.productDetails?.type || 'OTHER',
            price: body.productDetails?.price ? parseFloat(body.productDetails.price) : 0,
            fileUrl: body.productFile?.url || '',
            fileSize: body.productFile?.size || 0,
            fileType: body.productFile?.type || '',
            userId: user.id,
          },
        });
        productId = newProduct.id;
        funnelUpdateData.productId = productId;
      }
    }

    const updatedFunnel = await prisma.funnel.update({
      where: { id: params.id },
      data: funnelUpdateData,
      include: {
        template: true,
        product: true,
      } as any,
    });

    return NextResponse.json(updatedFunnel);
  } catch (error) {
    console.error('Error updating funnel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const funnel = await prisma.funnel.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // Delete associated analytics first
    await prisma.funnelAnalytics.deleteMany({
      where: { funnelId: params.id },
    });

    // Delete associated orders
    await prisma.funnelOrder.deleteMany({
      where: { funnelId: params.id },
    });

    // Delete the funnel
    await prisma.funnel.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Funnel deleted successfully' });
  } catch (error) {
    console.error('Error deleting funnel:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
