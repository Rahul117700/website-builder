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

    // For now, return mock data since we don't have the Order table yet
    // In the future, this would query the actual orders from the database
    const mockOrders = [
      {
        id: '1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        total: 3498,
        status: 'delivered',
        items: [
          { productId: '1', name: 'Premium T-Shirt', quantity: 2, price: 999 },
          { productId: '4', name: 'Coffee Mug Set', quantity: 1, price: 799 }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        total: 5999,
        status: 'shipped',
        items: [
          { productId: '3', name: 'Designer Watch', quantity: 1, price: 5999 }
        ],
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '3',
        customerName: 'Mike Johnson',
        customerEmail: 'mike@example.com',
        total: 2499,
        status: 'processing',
        items: [
          { productId: '2', name: 'Wireless Headphones', quantity: 1, price: 2499 }
        ],
        createdAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: '4',
        customerName: 'Sarah Wilson',
        customerEmail: 'sarah@example.com',
        total: 1499,
        status: 'pending',
        items: [
          { productId: '5', name: 'Yoga Mat', quantity: 1, price: 1499 }
        ],
        createdAt: new Date(Date.now() - 259200000).toISOString()
      },
      {
        id: '5',
        customerName: 'David Brown',
        customerEmail: 'david@example.com',
        total: 1798,
        status: 'delivered',
        items: [
          { productId: '1', name: 'Premium T-Shirt', quantity: 1, price: 999 },
          { productId: '4', name: 'Coffee Mug Set', quantity: 1, price: 799 }
        ],
        createdAt: new Date(Date.now() - 345600000).toISOString()
      }
    ];

    return NextResponse.json(mockOrders);

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
