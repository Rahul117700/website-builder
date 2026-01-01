import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
import { authOptions } from '../auth/[...nextauth]/route';
// import prisma from '@/lib/prisma';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all channel templates
    const templates = await prisma.channelTemplate.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching channel templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

