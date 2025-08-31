import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../../../lib/prisma';
import { authOptions } from '../../../../auth/[...nextauth]/route';

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

    // Get table name from query params
    const { searchParams } = new URL(req.url);
    const tableName = searchParams.get('table');

    if (!tableName) {
      return NextResponse.json({ error: 'Table name is required' }, { status: 400 });
    }

    // For now, return mock data
    // In the future, this would query the actual database entries
    const mockEntries = [
      {
        id: '1',
        tableName: 'portfolio_projects',
        data: {
          title: 'E-commerce Website',
          description: 'Modern e-commerce platform built with Next.js',
          image: '/images/project1.jpg',
          technologies: ['Next.js', 'TypeScript', 'Tailwind CSS'],
          link: 'https://example.com'
        },
        siteId: params.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        tableName: 'portfolio_projects',
        data: {
          title: 'Portfolio Website',
          description: 'Personal portfolio showcasing my work',
          image: '/images/project2.jpg',
          technologies: ['React', 'CSS3', 'JavaScript'],
          link: 'https://portfolio.example.com'
        },
        siteId: params.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return NextResponse.json(mockEntries);

  } catch (error) {
    console.error('Error fetching database entries:', error);
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
    const { tableName, data } = body;

    if (!tableName || !data) {
      return NextResponse.json({ error: 'Table name and data are required' }, { status: 400 });
    }

    // For now, return success message
    // In the future, this would create the actual database entry
    return NextResponse.json({ 
      message: 'Entry created successfully',
      id: 'new-entry-id'
    });

  } catch (error) {
    console.error('Error creating database entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
