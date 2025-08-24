import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const purchasedTemplates = await prisma.purchasedTemplate.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            category: true,
            description: true,
            preview: true
          }
        }
      },
      orderBy: {
        purchasedAt: 'desc'
      }
    });
    
    return NextResponse.json({
      templates: purchasedTemplates
    });
  } catch (error) {
    console.error('Error fetching purchased templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 