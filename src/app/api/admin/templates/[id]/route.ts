import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// DELETE /api/admin/templates/[id] - Delete funnel template (Super Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Check if template exists
    const template = await prisma.funnelTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check if template is being used by any funnels
    const funnelsUsingTemplate = await prisma.funnel.count({
      where: { templateId: id }
    });

    if (funnelsUsingTemplate > 0) {
      return NextResponse.json(
        { error: 'Cannot delete template that is being used by existing funnels' },
        { status: 400 }
      );
    }

    await prisma.funnelTemplate.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/templates/[id] - Update funnel template (Super Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name, type, description, previewUrl, htmlSchema, isActive } = body;

    // Check if template exists
    const existingTemplate = await prisma.funnelTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const template = await prisma.funnelTemplate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(description && { description }),
        ...(previewUrl && { previewUrl }),
        ...(htmlSchema && { htmlSchema }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}
