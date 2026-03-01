import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, statSync, existsSync } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';

export const runtime = 'nodejs';

/**
 * /api/video-stream?path=/uploads/videos/filename.mp4
 *
 * Serves video files with proper HTTP Range Request support (206 Partial Content).
 * This is the key to instant video playback — the browser can request only the
 * chunk it needs right now, without waiting for the entire file.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const videoPath = searchParams.get('path');

    if (!videoPath) {
        return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
    }

    // Security: only allow paths inside /uploads/ (whether in public or root)
    if (!videoPath.includes('/uploads/')) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
    }

    const cwd = process.cwd();
    // Try both /public/uploads/ and /uploads/ (outside public)
    const candidatePaths = [
        join(cwd, 'public', videoPath),
        join(cwd, videoPath), // For cases where it's stored in /uploads/ at root
        join(cwd, videoPath.replace(/^\/public/, '')) // Fallback
    ];

    const absolutePath = candidatePaths.find(p => existsSync(p));

    if (!absolutePath) {
        return NextResponse.json({
            error: 'File not found',
            searched: candidatePaths,
            status: 404
        }, { status: 404 });
    }

    let stat;
    try {
        stat = statSync(absolutePath);
    } catch {
        return NextResponse.json({ error: 'Cannot read file' }, { status: 500 });
    }

    const fileSize = stat.size;
    const rangeHeader = request.headers.get('range');

    // Determine MIME type from extension
    const ext = absolutePath.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
        mp4: 'video/mp4',
        webm: 'video/webm',
        ogg: 'video/ogg',
        mov: 'video/quicktime',
        mkv: 'video/x-matroska',
        avi: 'video/x-msvideo',
    };
    const contentType = mimeTypes[ext || ''] || 'video/mp4';

    if (rangeHeader) {
        // ── Partial content (Range request) ──────────────────────────────────
        // Browser sends e.g. "bytes=0-1048575" — we respond with just that chunk.
        // This is how instant streaming works.
        const parts = rangeHeader.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 10 * 1024 * 1024 - 1, fileSize - 1); // 10MB chunks max
        const chunkSize = end - start + 1;

        const fileStream = createReadStream(absolutePath, { start, end });

        // Convert Node.js Readable stream → Web ReadableStream
        const webStream = new ReadableStream({
            start(controller) {
                fileStream.on('data', (chunk) => controller.enqueue(chunk));
                fileStream.on('end', () => controller.close());
                fileStream.on('error', (err) => controller.error(err));
            },
            cancel() {
                fileStream.destroy();
            }
        });

        return new Response(webStream, {
            status: 206, // Partial Content
            headers: {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize.toString(),
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } else {
        // ── Full file request ─────────────────────────────────────────────────
        // Respond with Accept-Ranges header so browser knows it CAN send range requests next time
        const fileStream = createReadStream(absolutePath);
        const webStream = new ReadableStream({
            start(controller) {
                fileStream.on('data', (chunk) => controller.enqueue(chunk));
                fileStream.on('end', () => controller.close());
                fileStream.on('error', (err) => controller.error(err));
            },
            cancel() {
                fileStream.destroy();
            }
        });

        return new Response(webStream, {
            status: 200,
            headers: {
                'Content-Length': fileSize.toString(),
                'Content-Type': contentType,
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    }
}
