import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../../lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's templates (templates created by the user)
    const templates = await prisma.template.findMany({
      where: {
        createdBy: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        approved: true,
        createdAt: true,
        updatedAt: true,
        payments: {
          where: {
            status: 'completed'
          }
        }
      }
    });

    // Get analytics data for each template
    const templatesWithAnalytics = await Promise.all(
      templates.map(async (template) => {
        // Get total views for this template (sites using this template)
        const totalViews = await prisma.site.count({
          where: {
            template: template.name as any // Cast to TemplateType enum
          }
        });

        // Get total revenue for this template
        const totalRevenue = await prisma.payment.aggregate({
          where: {
            templateId: template.id,
            status: 'completed'
          },
          _sum: {
            amount: true
          }
        });

        return {
          id: template.id,
          name: template.name,
          description: template.description,
          price: template.price,
          status: template.approved ? 'published' : 'draft',
          views: totalViews,
          sales: template.payments.length,
          revenue: totalRevenue._sum.amount || 0,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt
        };
      })
    );

    return NextResponse.json(templatesWithAnalytics);

  } catch (error) {
    console.error('Error fetching user templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/templates/my-templates - Add a template to user's My Templates
export async function POST(req: NextRequest) {
  try {
    console.log('=== My Templates POST API Called ===');
    const session = await getServerSession(authOptions);
    console.log('Session user ID:', session?.user?.id);
    console.log('Session user email:', session?.user?.email);

    if (!session?.user?.id) {
      console.log('No session or user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId, name, html, css, js, pages, preview, category, description } = await req.json();
    console.log('Received template data:', { templateId, name, category, hasPages: !!pages });

    // Check if template exists
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });
    console.log('Template found:', { templateId: template?.id, templateName: template?.name });

    if (!template) {
      console.log('Template not found');
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check if user already has this template
    const existing = await prisma.myTemplate.findUnique({
      where: { userId_templateId: { userId: session.user.id, templateId } },
    });
    console.log('Existing MyTemplate check:', { existing });

    if (existing) {
      console.log('Template already exists for user');
      return NextResponse.json({ error: 'Template already exists' }, { status: 400 });
    }

    // Create MyTemplate record
    console.log('Creating MyTemplate record...');
    const myTemplate = await prisma.myTemplate.create({
      data: {
        userId: session.user.id,
        templateId,
        name,
        html,
        css,
        js,
        pages,
      },
    });
    console.log('MyTemplate created:', { id: myTemplate.id, name: myTemplate.name });

    // Also create PurchasedTemplate record for free templates
    console.log('Creating PurchasedTemplate record for free template...');
    const purchasedTemplate = await prisma.purchasedTemplate.create({
      data: {
        userId: session.user.id,
        templateId,
      },
    });
    console.log('PurchasedTemplate created:', { id: purchasedTemplate.id });

    console.log('Free template added successfully');
    return NextResponse.json({ success: true, template: myTemplate });
  } catch (error) {
    console.error('Error adding template to My Templates:', error);
    return NextResponse.json(
      { error: 'Failed to add template' },
      { status: 500 }
    );
  }
} 