import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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

// Update zod schema for POST and PUT to require 'pages' as an object with required keys
const pageCodeSchema = z.object({ html: z.string(), css: z.string(), js: z.string() });
const pagesSchema = z.object({
  home: pageCodeSchema,
  about: pageCodeSchema,
  contact: pageCodeSchema,
  services: pageCodeSchema,
  product: pageCodeSchema,
});

// GET /api/admin/templates - List all templates
export async function GET(req: NextRequest) {
  try {
    const session = await requireSuperAdmin(req);
    if (session instanceof NextResponse) return session;
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const templates = await prisma.template.findMany({ 
      orderBy: { createdAt: 'desc' } 
    });
    
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

// POST /api/admin/templates - Create a new template
export async function POST(req: NextRequest) {
  const session = await requireSuperAdmin(req);
  if (session instanceof NextResponse) return session;
  if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const schema = z.object({
    name: z.string().min(2),
    category: z.string().optional(),
    description: z.string().optional(),
    preview: z.string().optional(),
    price: z.number().min(0),
    pages: pagesSchema,
  });
  // For backward compatibility: if html/css/js are present but pages is not, map them to 'home'
  if (!body.pages && (body.html || body.css || body.js)) {
    body.pages = {
      home: { html: body.html || '', css: body.css || '', js: body.js || '' },
      about: { html: '', css: '', js: '' },
      contact: { html: '', css: '', js: '' },
      services: { html: '', css: '', js: '' },
      product: { html: '', css: '', js: '' },
    };
  }
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
  if (session instanceof NextResponse) return session;
  if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const schema = z.object({
    id: z.string(),
    name: z.string().min(2),
    category: z.string().optional(),
    description: z.string().optional(),
    preview: z.string().optional(),
    price: z.number().min(0),
    approved: z.boolean().optional(),
    pages: pagesSchema,
  });
  // For backward compatibility: if html/css/js are present but pages is not, map them to 'home'
  if (!body.pages && (body.html || body.css || body.js)) {
    body.pages = {
      home: { html: body.html || '', css: body.css || '', js: body.js || '' },
      about: { html: '', css: '', js: '' },
      contact: { html: '', css: '', js: '' },
      services: { html: '', css: '', js: '' },
      product: { html: '', css: '', js: '' },
    };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  const template = await prisma.template.update({
    where: { id: parsed.data.id },
    data: { ...parsed.data },
  });
  return NextResponse.json(template);
}



// DELETE /api/admin/templates - Delete a template
export async function DELETE(req: NextRequest) {
  const session = await requireSuperAdmin(req);
  if (session instanceof NextResponse) return session;
  if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.template.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 