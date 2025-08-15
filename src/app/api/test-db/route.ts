import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Test database connection
    const templateCount = await prisma.template.count();
    const funnelCount = await (prisma as any).funnel.count();
    
    // Get sample data for debugging
    const sampleTemplates = await prisma.template.findMany({
      take: 3,
      select: { id: true, name: true, slug: true }
    });
    
    const sampleFunnels = await (prisma as any).funnel.findMany({
      take: 3,
      select: { id: true, name: true, slug: true, templateId: true }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      counts: {
        templates: templateCount,
        funnels: funnelCount
      },
      sampleTemplates,
      sampleFunnels,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 