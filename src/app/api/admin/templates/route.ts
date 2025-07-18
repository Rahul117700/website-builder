import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Helper: check super admin
async function requireSuperAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session;
}

// GET /api/admin/templates - List all templates
export async function GET(req: NextRequest) {
  const session = await requireSuperAdmin(req);
  if (!session.user) return session;
  const templates = await prisma.template.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(templates);
}

// POST /api/admin/templates - Create a new template
export async function POST(req: NextRequest) {
  const session = await requireSuperAdmin(req);
  if (!session.user) return session;
  const body = await req.json();
  const schema = z.object({
    name: z.string().min(2),
    html: z.string().optional(),
    css: z.string().optional(),
    js: z.string().optional(),
    category: z.string().optional(),
    description: z.string().optional(),
    preview: z.string().optional(),
    price: z.number().min(0),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const template = await prisma.template.create({
    data: {
      ...parsed.data,
      slug,
      createdBy: 'super_admin',
      approved: true,
    },
  });
  return NextResponse.json(template);
}

// PUT /api/admin/templates - Update a template
export async function PUT(req: NextRequest) {
  const session = await requireSuperAdmin(req);
  if (!session.user) return session;
  const body = await req.json();
  const schema = z.object({
    id: z.string(),
    name: z.string().min(2),
    html: z.string().optional(),
    css: z.string().optional(),
    js: z.string().optional(),
    category: z.string().optional(),
    description: z.string().optional(),
    preview: z.string().optional(),
    price: z.number().min(0),
    approved: z.boolean().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  const template = await prisma.template.update({
    where: { id: parsed.data.id },
    data: { ...parsed.data },
  });
  return NextResponse.json(template);
}

// POST /api/admin/templates/approve - Approve a template
export async function POST_APPROVE(req: NextRequest) {
  const session = await requireSuperAdmin(req);
  if (!session.user) return session;
  const { templateId } = await req.json();
  if (!templateId) return NextResponse.json({ error: 'templateId required' }, { status: 400 });
  const template = await prisma.template.update({ where: { id: templateId }, data: { approved: true } });
  return NextResponse.json(template);
}

// DELETE /api/admin/templates - Delete a template
export async function DELETE(req: NextRequest) {
  const session = await requireSuperAdmin(req);
  if (!session.user) return session;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.template.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 