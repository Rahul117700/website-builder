import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/navigation-settings - Get navigation settings (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.navigationSettings.findMany({
      orderBy: { itemName: 'asc' }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching navigation settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
