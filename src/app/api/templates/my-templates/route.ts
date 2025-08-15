import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const myTemplates = await prisma.myTemplate.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      html: true,
      css: true,
      js: true,
      pages: true, // Add pages field for new template system
      reactCode: true,
      createdAt: true,
      updatedAt: true,
      templateId: true,
      template: {
        select: {
          preview: true,
          category: true,
          description: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });
  // Flatten the template fields to top-level for frontend compatibility
  const result = (myTemplates as any[]).map((t: any) => ({
    ...t,
    preview: t.template?.preview || null,
    category: t.template?.category || '',
    description: t.template?.description || '',
  }));
  return NextResponse.json(result);
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