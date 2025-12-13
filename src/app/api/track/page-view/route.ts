import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { page, referrer } = await request.json();

    if (!page) {
      return NextResponse.json({ error: 'Page is required' }, { status: 400 });
    }

    // Get user agent and IP
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Create or update analytics for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if analytics record exists for this page today
    const existing = await prisma.pageAnalytics.findFirst({
      where: {
        page,
        date: {
          gte: today,
        },
      },
    });

    if (existing) {
      // Update existing record
      await prisma.pageAnalytics.update({
        where: { id: existing.id },
        data: {
          visits: {
            increment: 1,
          },
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new record
      await prisma.pageAnalytics.create({
        data: {
          page,
          visits: 1,
          uniqueVisitors: 1,
          date: today,
          metadata: {
            referrer,
            userAgent,
            ip: ip.split(',')[0], // Take first IP if multiple
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking page view:', error);
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

