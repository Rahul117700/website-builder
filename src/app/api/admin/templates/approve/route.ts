import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Helper: check super admin
async function requireSuperAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session;
}

// POST /api/admin/templates/approve - Approve a template
export async function POST(req: NextRequest) {
  const session = await requireSuperAdmin(req);
  if (session instanceof NextResponse) return session;
  if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const { templateId } = await req.json();
    if (!templateId) return NextResponse.json({ error: 'templateId required' }, { status: 400 });
    
    const template = await prisma.template.update({ 
      where: { id: templateId }, 
      data: { approved: true } 
    });
    
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error approving template:', error);
    return NextResponse.json({ error: 'Failed to approve template' }, { status: 500 });
  }
} 