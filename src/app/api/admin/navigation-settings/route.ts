import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/admin/navigation-settings - Get all navigation settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.navigationSettings.findMany({
      orderBy: { itemName: 'asc' }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching navigation settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/navigation-settings - Create or update navigation settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { itemName, isHidden } = body;

    if (!itemName || typeof isHidden !== 'boolean') {
      return NextResponse.json({ error: 'Item name and isHidden status are required' }, { status: 400 });
    }

    // Upsert the navigation setting
    const setting = await prisma.navigationSettings.upsert({
      where: { itemName },
      update: { isHidden },
      create: { itemName, isHidden }
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error updating navigation setting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
