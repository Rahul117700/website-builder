import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST /api/products - Create a new digital product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      name, 
      description, 
      type, 
      price, 
      currency, 
      fileUrl, 
      fileSize, 
      fileType,
      previewUrl,
      funnelId 
    } = body;

    if (!name || !type || !price) {
      return NextResponse.json({ 
        error: 'Name, type, and price are required' 
      }, { status: 400 });
    }

    // Create the digital product
    const product = await prisma.digitalProduct.create({
      data: {
        name,
        description: description || '',
        type: type,
        price: parseFloat(price),
        currency: currency || 'INR',
        fileUrl: fileUrl || '',
        fileSize: fileSize || null,
        fileType: fileType || null,
        previewUrl: previewUrl || null,
        userId: user.id,
        status: 'ACTIVE'
      }
    });

    // If funnelId is provided, link the product to the funnel
    if (funnelId) {
      await prisma.funnel.update({
        where: { id: funnelId },
        data: {
          productId: product.id
        }
      });
    }

    return NextResponse.json({
      success: true,
      product: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ 
      error: 'Failed to create product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

