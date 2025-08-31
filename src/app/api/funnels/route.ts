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

    // For now, return mock funnels data
    // In the future, this would query actual funnels from the database
    const mockFunnels = [
      {
        id: '1',
        name: 'Lead Generation Funnel',
        description: 'High-converting funnel for capturing leads and building email lists',
        status: 'active' as const,
        type: 'lead-generation' as const,
        steps: [
          { id: '1', name: 'Landing Page', type: 'landing', order: 1, status: 'active' },
          { id: '2', name: 'Thank You Page', type: 'thank-you', order: 2, status: 'active' }
        ],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        stats: {
          visitors: 12500,
          conversions: 1250,
          revenue: 0,
          conversionRate: 10.0
        }
      },
      {
        id: '2',
        name: 'Product Sales Funnel',
        description: 'Optimized funnel for selling digital products and courses',
        status: 'active' as const,
        type: 'sales' as const,
        steps: [
          { id: '3', name: 'Sales Page', type: 'landing', order: 1, status: 'active' },
          { id: '4', name: 'Checkout', type: 'checkout', order: 2, status: 'active' },
          { id: '5', name: 'Upsell', type: 'upsell', order: 3, status: 'active' },
          { id: '6', name: 'Thank You', type: 'thank-you', order: 4, status: 'active' }
        ],
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        stats: {
          visitors: 8900,
          conversions: 445,
          revenue: 44500,
          conversionRate: 5.0
        }
      },
      {
        id: '3',
        name: 'Webinar Registration',
        description: 'Funnel for promoting and registering attendees for webinars',
        status: 'paused' as const,
        type: 'webinar' as const,
        steps: [
          { id: '7', name: 'Registration Page', type: 'landing', order: 1, status: 'active' },
          { id: '8', name: 'Confirmation', type: 'thank-you', order: 2, status: 'active' }
        ],
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        stats: {
          visitors: 3200,
          conversions: 640,
          revenue: 0,
          conversionRate: 20.0
        }
      }
    ];

    return NextResponse.json(mockFunnels);

  } catch (error) {
    console.error('Error fetching funnels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

