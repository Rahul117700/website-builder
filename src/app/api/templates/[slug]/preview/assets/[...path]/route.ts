import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; path: string[] } }
) {
  try {
    const { slug, path: assetPath } = params;
    
    if (!assetPath || assetPath.length === 0) {
      return NextResponse.json({ error: 'Asset path required' }, { status: 400 });
    }
    
    // Construct the path to the template asset
    const assetFilePath = path.join(
      process.cwd(), 
      'templates_start_bootstrap', 
      `startbootstrap-${slug}`,
      ...assetPath
    );
    
    // Check if the asset file exists
    if (!fs.existsSync(assetFilePath)) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    
    // Get file stats
    const stats = fs.statSync(assetFilePath);
    
    // Check if it's a file
    if (!stats.isFile()) {
      return NextResponse.json({ error: 'Not a file' }, { status: 400 });
    }
    
    // Read the file
    const fileBuffer = fs.readFileSync(assetFilePath);
    
    // Determine content type based on file extension
    const ext = path.extname(assetFilePath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.css':
        contentType = 'text/css';
        break;
      case '.js':
        contentType = 'application/javascript';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
      case '.woff':
        contentType = 'font/woff';
        break;
      case '.woff2':
        contentType = 'font/woff2';
        break;
      case '.ttf':
        contentType = 'font/ttf';
        break;
      case '.eot':
        contentType = 'application/vnd.ms-fontobject';
        break;
    }
    
    // Create response with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache assets for 1 hour
        'Content-Length': stats.size.toString()
      }
    });
  } catch (error) {
    console.error('Error serving template asset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

