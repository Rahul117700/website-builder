import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
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