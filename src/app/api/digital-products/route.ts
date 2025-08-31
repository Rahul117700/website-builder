import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return mock digital products data
    // In the future, this would query actual digital products from the database
    const mockDigitalProducts = [
      {
        id: '1',
        name: 'Complete Web Development Course',
        description: 'Learn web development from scratch with HTML, CSS, JavaScript, and React',
        type: 'course' as const,
        price: 4999,
        status: 'active' as const,
        downloads: 1250,
        revenue: 6248750,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        name: 'Business Plan Template Pack',
        description: 'Professional business plan templates for startups and established businesses',
        type: 'template' as const,
        price: 999,
        status: 'active' as const,
        downloads: 3200,
        revenue: 3196800,
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        name: 'Marketing Strategy Guide',
        description: 'Comprehensive guide to digital marketing strategies and implementation',
        type: 'pdf' as const,
        price: 799,
        status: 'active' as const,
        downloads: 890,
        revenue: 711110,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        name: 'E-commerce Website Builder',
        description: 'Drag-and-drop website builder specifically designed for online stores',
        type: 'software' as const,
        price: 2999,
        status: 'active' as const,
        downloads: 450,
        revenue: 1349550,
        createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        name: 'Social Media Content Calendar',
        description: 'Monthly content calendar templates for social media marketing',
        type: 'template' as const,
        price: 499,
        status: 'inactive' as const,
        downloads: 1200,
        revenue: 598800,
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    return NextResponse.json(mockDigitalProducts);

  } catch (error) {
    console.error('Error fetching digital products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
