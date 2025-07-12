import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/templates - List all templates
export async function GET(req: NextRequest) {
  const templates = await prisma.template.findMany({
    select: { id: true, name: true, slug: true, price: true, code: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(templates);
}

// GET /api/templates/purchased - List purchased templates for current user
export async function GET_PURCHASED(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const purchased = await prisma.purchasedTemplate.findMany({
    where: { userId: session.user.id },
    include: { template: true },
    orderBy: { purchasedAt: 'desc' },
  });
  return NextResponse.json(purchased.map(p => p.template));
}

// POST /api/templates/purchase - Purchase a template
export async function POST_PURCHASE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { templateId } = await req.json();
  if (!templateId) return NextResponse.json({ error: 'templateId required' }, { status: 400 });
  // Check if already purchased
  const already = await prisma.purchasedTemplate.findUnique({
    where: { userId_templateId: { userId: session.user.id, templateId } },
  });
  if (already) return NextResponse.json({ error: 'Already purchased' }, { status: 400 });
  // Create purchase
  const purchase = await prisma.purchasedTemplate.create({
    data: { userId: session.user.id, templateId },
  });
  return NextResponse.json(purchase);
}

// GET /api/templates/:id - Get a single template
export async function GET_TEMPLATE(req: NextRequest, { params }: { params: { id: string } }) {
  const template = await prisma.template.findUnique({
    where: { id: params.id },
  });
  if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(template);
} 