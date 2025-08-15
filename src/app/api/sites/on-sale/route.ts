import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST /api/sites/on-sale - list a site as template for sale
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { siteId, price, preview, description } = await req.json();
    if (!siteId || !price || price <= 0) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    const site = await prisma.site.findUnique({ where: { id: siteId }, include: { pages: true } });
    if (!site || site.userId !== session.user.id) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    // Create or reuse template from site content
    const templateName = site.name;
    const existingTemplate = await prisma.template.findFirst({ where: { name: templateName, createdBy: session.user.id } });

    // Build a minimal pages structure from first three pages that have htmlCode/cssCode/jsCode
    const pages: any = {};
    for (const p of site.pages) {
      const key = p.slug as string;
      pages[key] = { html: p.htmlCode || '', css: p.cssCode || '', js: p.jsCode || '' };
    }

    let template;
    if (existingTemplate) {
      template = await prisma.template.update({
        where: { id: existingTemplate.id },
        data: {
          price,
          pages, // keep pages in sync with latest site content
          ...(preview ? { preview } : {}),
          ...(description ? { description } : {}),
        },
      });
    } else {
      template = await prisma.template.create({
        data: {
          name: templateName,
          slug: `${site.subdomain}-${Date.now()}`,
          price,
          pages,
          preview: preview || undefined,
          description: description || undefined,
          createdBy: session.user.id,
          approved: true,
        },
      });
    }

    // Upsert SiteSale
    const sale = await (prisma as any).siteSale.upsert({
      where: { siteId: site.id },
      update: { price, status: 'active', templateId: template.id },
      create: { siteId: site.id, userId: session.user.id, templateId: template.id, price },
    });

    return NextResponse.json({ success: true, sale });
  } catch (e) {
    console.error('Error creating sale:', e);
    return NextResponse.json({ error: 'Failed to list site for sale' }, { status: 500 });
  }
}

// GET /api/sites/on-sale - current user's sales
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('siteId');
    const where: any = { userId: session.user.id };
    if (siteId) where.siteId = siteId;
    const sales = await (prisma as any).siteSale.findMany({ where, include: { template: true, site: true } });
    return NextResponse.json(sales);
  } catch (e) {
    return NextResponse.json([], { status: 200 });
  }
}

// DELETE /api/sites/on-sale - remove listing for a site
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { siteId } = await req.json();
    if (!siteId) return NextResponse.json({ error: 'Missing siteId' }, { status: 400 });
    const sale = await (prisma as any).siteSale.findUnique({ where: { siteId } });
    if (!sale || sale.userId !== session.user.id) return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    await (prisma as any).siteSale.update({ where: { siteId }, data: { status: 'inactive' } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error removing sale:', e);
    return NextResponse.json({ error: 'Failed to remove sale' }, { status: 500 });
  }
}

