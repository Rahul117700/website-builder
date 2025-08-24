import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // Construct the path to the template's dist/index.html
    const templatePath = path.join(process.cwd(), 'templates_start_bootstrap', `startbootstrap-${slug}`, 'dist', 'index.html');
    
    // Check if the template file exists
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    // Read the HTML file
    const htmlContent = fs.readFileSync(templatePath, 'utf8');
    
    // Create a response with the HTML content
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error serving template preview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
