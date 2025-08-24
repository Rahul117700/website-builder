import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { slug } = params;
    
    // Check if user has purchased this template
    const purchase = await prisma.purchasedTemplate.findUnique({
      where: {
        userId_templateId: {
          userId: session.user.id,
          templateId: slug
        }
      },
      include: {
        template: true
      }
    });
    
    if (!purchase) {
      return NextResponse.json(
        { error: 'Template not purchased' },
        { status: 403 }
      );
    }
    
    // Construct the path to the template directory
    const templateDir = path.join(process.cwd(), 'templates_start_bootstrap', `startbootstrap-${slug}`);
    
    // Check if the template directory exists
    if (!fs.existsSync(templateDir)) {
      return NextResponse.json(
        { error: 'Template files not found' },
        { status: 404 }
      );
    }
    
    // Create a zip file containing the template
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level
    });
    
    // Set response headers for file download
    const response = new NextResponse(archive as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${slug}-template.zip"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
    // Add the template files to the archive
    archive.directory(templateDir, slug);
    
    // Finalize the archive
    await archive.finalize();
    
    return response;
  } catch (error) {
    console.error('Error downloading template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
