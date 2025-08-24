import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

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
    
    // Create a zip file using system zip command
    const zipFileName = `${slug}-template.zip`;
    const zipFilePath = path.join(process.cwd(), 'temp', zipFileName);
    
    // Ensure temp directory exists
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    try {
      // Use system zip command (works on Linux/Mac, for Windows we'll need a different approach)
      if (process.platform === 'win32') {
        // For Windows, we'll just return the template directory path for now
        // In production, you might want to use a Windows-compatible zip library
        return NextResponse.json(
          { error: 'Download functionality not yet implemented for Windows' },
          { status: 501 }
        );
      } else {
        // For Linux/Mac, use zip command
        execSync(`zip -r "${zipFilePath}" .`, { cwd: templateDir });
        
        // Read the zip file and return it
        const zipBuffer = fs.readFileSync(zipFilePath);
        
        // Clean up the temporary zip file
        fs.unlinkSync(zipFilePath);
        
        return new NextResponse(zipBuffer, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${zipFileName}"`,
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });
      }
    } catch (zipError) {
      console.error('Error creating zip file:', zipError);
      return NextResponse.json(
        { error: 'Failed to create template archive' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error downloading template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
