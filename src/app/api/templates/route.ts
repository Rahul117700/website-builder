import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// GET /api/templates - List all templates
export async function GET(req: NextRequest) {
  const templates = await prisma.template.findMany({
    select: { id: true, name: true, slug: true, price: true, html: true, css: true, js: true, category: true, description: true, preview: true, createdBy: true, approved: true, createdAt: true },
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

// GET /api/templates/marketplace - List all approved templates (optionally filter by category/search)
export async function GET_MARKETPLACE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const where: any = { approved: true };
  if (category) where.category = category;
  if (search) where.name = { contains: search, mode: 'insensitive' };
  const templates = await prisma.template.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, slug: true, price: true, category: true, description: true, preview: true, createdBy: true, createdAt: true
    }
  });
  return NextResponse.json(templates);
}

// GET /api/templates/my - List all templates owned by the user (purchased or created)
export async function GET_MY(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Purchased
  const purchased = await prisma.purchasedTemplate.findMany({
    where: { userId: session.user.id },
    include: { template: true },
  });
  // Created by user
  const created = await prisma.template.findMany({
    where: { createdBy: session.user.id },
    select: { id: true, name: true, slug: true, price: true, html: true, css: true, js: true, category: true, description: true, preview: true, createdBy: true, approved: true, createdAt: true },
  });
  // Merge and dedupe by id
  const all = [...created, ...purchased.map(p => p.template)];
  const unique = Array.from(new Map(all.map(t => [t.id, t])).values());
  return NextResponse.json(unique);
}

// GET /api/templates/my-templates - List all templates in MyTemplate for the current user
export async function GET_MY_TEMPLATES(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(myTemplates);
}

// POST /api/templates/save - Save current code as a template (user or admin)
export async function POST_SAVE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const schema = z.object({
    name: z.string().min(2),
    html: z.string().optional(),
    css: z.string().optional(),
    js: z.string().optional(),
    category: z.string().optional(),
    description: z.string().optional(),
    preview: z.string().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const template = await prisma.template.create({
    data: {
      ...parsed.data,
      slug,
      price: 0,
      createdBy: session.user.id,
      approved: false, // Needs admin approval
    },
    select: { id: true, name: true, slug: true, price: true, html: true, css: true, js: true, category: true, description: true, preview: true, createdBy: true, approved: true, createdAt: true },
  });
  return NextResponse.json(template);
}

// POST /api/templates/apply - Return html/css/js for a template
export async function POST_APPLY(req: NextRequest) {
  const { templateId } = await req.json();
  if (!templateId) return NextResponse.json({ error: 'templateId required' }, { status: 400 });
  const template = await prisma.template.findUnique({ where: { id: templateId }, select: { html: true, css: true, js: true } });
  if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(template);
}

// POST /api/templates/buy - Create Razorpay order for template purchase
export async function POST_BUY(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { templateId } = await req.json();
  if (!templateId) return NextResponse.json({ error: 'templateId required' }, { status: 400 });
  const template = await prisma.template.findUnique({ where: { id: templateId } });
  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  // Check if already purchased
  const already = await prisma.purchasedTemplate.findUnique({ where: { userId_templateId: { userId: session.user.id, templateId } } });
  if (already) return NextResponse.json({ error: 'Already purchased' }, { status: 400 });
  // Create Razorpay order
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
  const order = await razorpay.orders.create({
    amount: Math.round(template.price * 100), // in paise
    currency: 'INR',
    receipt: `template_${template.id}_${Date.now()}`,
    notes: { templateId: template.id, userId: session.user.id },
  });
  return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID, template });
}

// POST /api/templates/buy/verify - Verify Razorpay payment and add to PurchasedTemplate
export async function POST_BUY_VERIFY(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { templateId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = await req.json();
  if (!templateId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  // Verify signature
  const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(razorpayOrderId + '|' + razorpayPaymentId)
    .digest('hex');
  if (generatedSignature !== razorpaySignature) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  // Check if already purchased
  const already = await prisma.purchasedTemplate.findUnique({ where: { userId_templateId: { userId: session.user.id, templateId } } });
  if (already) return NextResponse.json({ error: 'Already purchased' }, { status: 400 });
  // Add to PurchasedTemplate
  const purchase = await prisma.purchasedTemplate.create({ data: { userId: session.user.id, templateId } });
  // Copy template code to MyTemplate for the user
  const template = await prisma.template.findUnique({ where: { id: templateId } });
  if (template) {
    await prisma.myTemplate.upsert({
      where: { userId_templateId: { userId: session.user.id, templateId } },
      update: {}, // No update, just ensure exists
      create: {
        userId: session.user.id,
        templateId,
        name: template.name,
        html: template.html,
        css: template.css,
        js: template.js,
        reactCode: template.reactCode,
      },
    });
  }
  return NextResponse.json({ success: true, purchase });
}

// GET /api/templates/super-admin - List all approved templates created by super_admin
export async function GET_SUPER_ADMIN(req: NextRequest) {
  const templates = await prisma.template.findMany({
    where: { approved: true, createdBy: 'super_admin' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, slug: true, price: true, html: true, css: true, js: true, category: true, description: true, preview: true, createdBy: true, approved: true, createdAt: true }
  });
  return NextResponse.json(templates);
} 