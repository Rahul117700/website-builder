import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // Try multiple possible locations for the HTML file
    const possiblePaths = [
      path.join(process.cwd(), 'templates_start_bootstrap', `startbootstrap-${slug}`, 'dist', 'index.html'),
      path.join(process.cwd(), 'templates_start_bootstrap', `startbootstrap-${slug}`, 'index.html'),
      path.join(process.cwd(), 'templates_start_bootstrap', `startbootstrap-${slug}`, 'src', 'index.html'),
      path.join(process.cwd(), 'templates_start_bootstrap', `startbootstrap-${slug}`, 'app', 'index.html')
    ];
    
    let templatePath = null;
    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        templatePath = path;
        break;
      }
    }
    
    // Check if the template file exists
    if (!templatePath) {
      return NextResponse.json(
        { error: 'Template HTML file not found' },
        { status: 404 }
      );
    }
    
    // Read the HTML file
    let htmlContent = fs.readFileSync(templatePath, 'utf8');
    
    // Get the template directory for relative paths
    const templateDir = path.dirname(templatePath);
    
    // Fix relative paths in the HTML content to point to our asset route
    htmlContent = htmlContent.replace(
      /(src|href)=["'](?!https?:\/\/|data:|#)([^"']*)/g,
      (match, attr, assetPath) => {
        // Convert relative paths to our asset route
        const cleanPath = assetPath.replace(/^\.\//, ''); // Remove leading ./
        return `${attr}="/api/templates/${slug}/preview/assets/${cleanPath}"`;
      }
    );
    
    // Also fix CSS imports and other relative references
    htmlContent = htmlContent.replace(
      /url\(['"]?(?!https?:\/\/|data:|#)([^'")\s]+)['"]?\)/g,
      (match, assetPath) => {
        const cleanPath = assetPath.replace(/^\.\//, '');
        return `url("/api/templates/${slug}/preview/assets/${cleanPath}")`;
      }
    );
    
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
