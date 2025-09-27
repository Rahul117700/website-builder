import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../../../lib/prisma';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function GET(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the site belongs to the user
    const site = await prisma.site.findFirst({
      where: {
        id: params.siteId,
        userId: session.user.id
      }
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // For now, return mock data since we don't have the Product table yet
    // In the future, this would query the actual products from the database
    const mockProducts = [
      {
        id: '1',
        name: 'Premium T-Shirt',
        description: 'High-quality cotton t-shirt with custom design',
        price: 999,
        stock: 50,
        category: 'Clothing',
        image: '/images/product1.jpg',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Wireless Headphones',
        description: 'Bluetooth headphones with noise cancellation',
        price: 2499,
        stock: 25,
        category: 'Electronics',
        image: '/images/product2.jpg',
        status: 'active',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '3',
        name: 'Designer Watch',
        description: 'Elegant watch with leather strap',
        price: 5999,
        stock: 8,
        category: 'Accessories',
        image: '/images/product3.jpg',
        status: 'active',
        createdAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: '4',
        name: 'Coffee Mug Set',
        description: 'Set of 4 ceramic coffee mugs',
        price: 799,
        stock: 100,
        category: 'Home & Kitchen',
        image: '/images/product4.jpg',
        status: 'active',
        createdAt: new Date(Date.now() - 259200000).toISOString()
      },
      {
        id: '5',
        name: 'Yoga Mat',
        description: 'Non-slip yoga mat for home workouts',
        price: 1499,
        stock: 5,
        category: 'Sports',
        image: '/images/product5.jpg',
        status: 'active',
        createdAt: new Date(Date.now() - 345600000).toISOString()
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
