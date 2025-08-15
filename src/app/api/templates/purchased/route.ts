import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('=== Purchased Templates API ===');
    console.log('Session user ID:', session?.user?.id);
    console.log('Session user email:', session?.user?.email);
    
    if (!session?.user?.id) {
      console.log('No session or user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch purchased templates for the user
    console.log('Fetching purchased templates for user:', session.user.id);
    const purchasedTemplates = await prisma.purchasedTemplate.findMany({
      where: { userId: session.user.id },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            slug: true,
            html: true,
            css: true,
            js: true,
            pages: true,
            category: true,
            description: true,
            preview: true,
            price: true,
            createdBy: true,
            approved: true,
            createdAt: true,
            updatedAt: true,
            siteSales: { select: { id: true, status: true } }
          }
        }
      },
      orderBy: { purchasedAt: 'desc' },
    });
    
    console.log('Found purchased templates:', purchasedTemplates.length);
    console.log('Purchased templates data:', purchasedTemplates);

    // Transform the data to match what the frontend expects
    const result = purchasedTemplates.map(pt => ({
      id: pt.template.id,
      name: pt.template.name,
      slug: pt.template.slug,
      html: pt.template.html,
      css: pt.template.css,
      js: pt.template.js,
      pages: pt.template.pages,
      category: pt.template.category,
      description: pt.template.description,
      preview: pt.template.preview,
      price: pt.template.price,
      createdBy: pt.template.createdBy,
      approved: pt.template.approved,
      createdAt: pt.template.createdAt,
      updatedAt: pt.template.updatedAt,
      purchasedAt: pt.purchasedAt
    }));

    console.log('Transformed result:', result);
    console.log('Returning result with', result.length, 'templates');
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching purchased templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchased templates' }, 
      { status: 500 }
    );
  }
} 