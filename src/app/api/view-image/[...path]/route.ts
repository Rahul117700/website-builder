import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { readFile } from 'fs/promises';

/**
 * Dynamic Image Server API
 * Serves images from the public/uploads folder without requiring a server restart.
 * This bypasses Next.js's static file serving limitations in production.
 */

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    try {
        const pathParts = params.path || [];
        const filePath = join(process.cwd(), 'public', 'uploads', ...pathParts);

        // Security check: ensure the path is within the uploads directory
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        if (!filePath.startsWith(uploadsDir)) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        if (!existsSync(filePath)) {
            return new NextResponse('Image not found', { status: 404 });
        }

        // Determine content type based on extension
        const ext = filePath.split('.').pop()?.toLowerCase();
        const contentTypeMap: Record<string, string> = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'svg': 'image/svg+xml',
        };
        const contentType = contentTypeMap[ext || ''] || 'application/octet-stream';

        const fileBuffer = await readFile(filePath);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('Error serving image:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
