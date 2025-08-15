import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templateId = params.id;

    // First check if the user has purchased this template
    const purchasedTemplate = await prisma.purchasedTemplate.findFirst({
      where: {
        templateId: templateId,
        userId: session.user.id,
      },
      include: {
        template: true,
      },
    });

    if (!purchasedTemplate) {
      return NextResponse.json({ error: 'Template not found or not purchased' }, { status: 404 });
    }

    // Return the template data
    const templateData = {
      id: purchasedTemplate.template.id,
      name: purchasedTemplate.template.name,
      slug: purchasedTemplate.template.slug,
      category: purchasedTemplate.template.category,
      description: purchasedTemplate.template.description,
      preview: purchasedTemplate.template.preview,
      pages: purchasedTemplate.template.pages,
      price: purchasedTemplate.template.price,
      createdBy: purchasedTemplate.template.createdBy,
      approved: purchasedTemplate.template.approved,
      createdAt: purchasedTemplate.template.createdAt,
      updatedAt: purchasedTemplate.template.updatedAt,
      purchasedAt: purchasedTemplate.purchasedAt,
    };

    console.log('Template data being returned:', {
      id: templateData.id,
      name: templateData.name,
      pagesType: typeof templateData.pages,
      pagesKeys: templateData.pages ? Object.keys(templateData.pages) : 'No pages',
      samplePage: templateData.pages ? Object.values(templateData.pages)[0] : 'No pages'
    });

    return NextResponse.json(templateData);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 