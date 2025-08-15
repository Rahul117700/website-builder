import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    console.log('Fetching super admin templates...');
    
    const templates = await prisma.template.findMany({
      where: { approved: true, createdBy: 'super_admin' },
      orderBy: { createdAt: 'desc' },
      select: { 
        id: true, 
        name: true, 
        slug: true, 
        price: true, 
        html: true, 
        css: true, 
        js: true, 
        pages: true, 
        category: true, 
        description: true, 
        preview: true, 
        createdBy: true, 
        approved: true, 
        createdAt: true 
      }
    });
    
    console.log(`Found ${templates.length} super admin templates`);
    
    // Ensure we return valid JSON
    return NextResponse.json(templates || []);
    
  } catch (error) {
    console.error('Error fetching super admin templates:', error);
    
    // Return empty array instead of failing
    return NextResponse.json([], { status: 200 });
  }
} 