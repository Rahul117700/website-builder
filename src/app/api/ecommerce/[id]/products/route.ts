import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../../../lib/prisma';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the site belongs to the user
    const site = await prisma.site.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // For now, return mock data
    // In the future, this would query the actual products from the database
    const mockProducts = [
      {
        id: '1',
        name: 'Premium T-Shirt',
        description: 'High-quality cotton t-shirt with custom design',
        price: 29.99,
        comparePrice: 39.99,
        images: ['/images/product1.jpg', '/images/product1-2.jpg'],
        category: 'Clothing',
        tags: ['fashion', 'casual', 'cotton'],
        status: 'ACTIVE',
        inventory: 150,
        sku: 'TSH-001',
        weight: 0.2,
        dimensions: { length: 20, width: 15, height: 2 },
        siteId: params.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Wireless Headphones',
        description: 'Bluetooth headphones with noise cancellation',
        price: 89.99,
        comparePrice: 129.99,
        images: ['/images/product2.jpg'],
        category: 'Electronics',
        tags: ['audio', 'wireless', 'bluetooth'],
        status: 'ACTIVE',
        inventory: 75,
        sku: 'WH-002',
        weight: 0.3,
        dimensions: { length: 18, width: 12, height: 8 },
        siteId: params.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return NextResponse.json(mockProducts);

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the site belongs to the user
    const site = await prisma.site.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, description, price, category, inventory } = body;

    if (!name || !price || !category || inventory === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // For now, return success message
    // In the future, this would create the actual product
    return NextResponse.json({ 
      message: 'Product created successfully',
      id: 'new-product-id'
    });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
