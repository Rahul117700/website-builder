import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/funnels/[slug] - get funnel by slug and track visit
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    console.log('Fetching funnel with slug:', params.slug);
    
    // First check if any funnels exist
    const totalFunnels = await (prisma as any).funnel.count();
    console.log('Total funnels in database:', totalFunnels);
    
    const funnel = await (prisma as any).funnel.findUnique({
      where: { slug: params.slug },
      include: { 
        template: true,
        user: true
      }
    });
    
    console.log('Funnel found:', funnel);
    
    if (!funnel) {
      console.log('No funnel found with slug:', params.slug);
      // List all available funnel slugs for debugging
      const allFunnelSlugs = await (prisma as any).funnel.findMany({
        select: { slug: true, name: true }
      });
      console.log('Available funnel slugs:', allFunnelSlugs);
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }
    
    if (!funnel.template) {
      console.log('No template found for funnel, templateId:', funnel.templateId);
      // Check if template exists
      const template = await prisma.template.findUnique({
        where: { id: funnel.templateId }
      });
      console.log('Template lookup result:', template);
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    console.log('Template found:', funnel.template);
    
    // Get the site data through SiteSale (optional)
    let siteSale = null;
    try {
      siteSale = await (prisma as any).siteSale.findFirst({
        where: { templateId: funnel.templateId },
        include: { site: true }
      });
    } catch (error) {
      console.log('SiteSale lookup failed, continuing without site data:', error);
    }
    
    console.log('SiteSale found:', siteSale);
    
    // Combine the data - make site optional
    const funnelWithSite = {
      ...funnel,
      template: {
        ...funnel.template,
        site: siteSale?.site || {
          name: funnel.template.name || 'Template',
          description: funnel.template.description || 'Professional website template',
          template: funnel.template.template || 'default'
        }
      }
    };
    
    console.log('Final funnel data:', funnelWithSite);
    
    // Increment visits count
    await (prisma as any).funnel.update({
      where: { id: funnel.id },
      data: { totalVisits: { increment: 1 } }
    });
    
    // Create visit record
    await (prisma as any).funnelVisit.create({
      data: {
        funnelId: funnel.id,
        event: 'visit',
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        ua: req.headers.get('user-agent') || 'unknown'
      }
    });
    
    return NextResponse.json(funnelWithSite);
  } catch (error) {
    console.error('Error fetching funnel:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/funnels/[slug] - mark conversion
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { isConversion } = await req.json();
    
    const funnel = await (prisma as any).funnel.findUnique({
      where: { slug: params.slug }
    });
    
    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }
    
    if (isConversion) {
      // Increment conversions count
      await (prisma as any).funnel.update({
        where: { id: funnel.id },
        data: { conversions: { increment: 1 } }
      });
      
      // Create conversion visit record
      await (prisma as any).funnelVisit.create({
        data: {
          funnelId: funnel.id,
          event: 'conversion',
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          ua: req.headers.get('user-agent') || 'unknown'
        }
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking conversion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/funnels/[slug] - delete funnel
export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const funnel = await (prisma as any).funnel.findUnique({
      where: { slug: params.slug },
      include: { user: true }
    });
    
    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }
    
    // Check if user owns this funnel
    if (funnel.user.id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Delete funnel visits first
    await (prisma as any).funnelVisit.deleteMany({
      where: { funnelId: funnel.id }
    });
    
    // Delete the funnel
    await (prisma as any).funnel.delete({
      where: { id: funnel.id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting funnel:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

