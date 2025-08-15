import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/funnels - list funnels for current user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const funnels = await (prisma as any).funnel.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(funnels);
}

// POST /api/funnels - create/update funnel
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, templateId, saleId, name, slug, landingHtml, landingCss, landingJs, thankHtml, thankCss, thankJs, status } = await req.json();
  if (!templateId || !(name || slug)) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  if (id) {
    const updated = await (prisma as any).funnel.update({ where: { id }, data: { name, slug, landingHtml, landingCss, landingJs, thankHtml, thankCss, thankJs, status } });
    return NextResponse.json(updated);
  }
  // Ensure slug uniqueness by appending counter if needed
  let finalSlug = slug || name?.toLowerCase().replace(/\s+/g, '-') || `funnel-${Date.now()}`;
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (await (prisma as any).funnel.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${suffix++}`;
  }
  const created = await (prisma as any).funnel.create({ data: { userId: session.user.id, templateId, saleId, name, slug: finalSlug, landingHtml, landingCss, landingJs, thankHtml, thankCss, thankJs } });
  return NextResponse.json(created);
}

