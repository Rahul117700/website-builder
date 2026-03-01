import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { readdirSync, statSync, existsSync, renameSync } from 'fs';
import { join } from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { getFfmpegPath } from '@/lib/ffmpeg-path';

export const runtime = 'nodejs';
export const maxDuration = 600;

try {
    ffmpeg.setFfmpegPath(getFfmpegPath());
} catch (e) {
    console.warn('Could not set ffmpeg path:', e);
}

function applyFaststart(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions(['-c copy', '-movflags +faststart'])
            .output(outputPath)
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .run();
    });
}

/**
 * GET /api/admin/fix-videos
 * Re-muxes all existing videos in /public/uploads/videos/ to add faststart.
 * Run this once to fix all already-uploaded videos so they stream instantly.
 */
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cwd = process.cwd();

    // Try multiple possible video directory locations
    const candidatePaths = [
        join(cwd, 'public', 'uploads', 'videos'),
        join(cwd, '.next', 'static', 'uploads', 'videos'),
        '/home/rahul/apps/website-builder/public/uploads/videos',
        '/var/www/html/public/uploads/videos',
        join(cwd, '..', 'public', 'uploads', 'videos'),
    ];

    const videosDir = candidatePaths.find(p => existsSync(p));

    if (!videosDir) {
        return NextResponse.json({
            message: 'No videos directory found',
            searched: candidatePaths,
            cwd,
            processed: 0
        });
    }

    const files = readdirSync(videosDir).filter(f =>
        /\.(mp4|mov|mkv)$/i.test(f) && !f.startsWith('tmp-')
    );

    const results: { file: string; status: string; error?: string }[] = [];

    for (const file of files) {
        const inputPath = join(videosDir, file);
        const tempPath = join(videosDir, `tmp-faststart-${file}`);

        try {
            // Skip tiny files (likely already processed or corrupted)
            const stat = statSync(inputPath);
            if (stat.size < 1024) {
                results.push({ file, status: 'skipped (too small)' });
                continue;
            }

            await applyFaststart(inputPath, tempPath);
            // Replace original with faststart version
            renameSync(tempPath, inputPath);
            results.push({ file, status: 'done' });
        } catch (err) {
            // Clean up temp if it exists
            try { if (existsSync(tempPath)) renameSync(tempPath, tempPath + '.err'); } catch { /* ignore */ }
            results.push({ file, status: 'failed', error: err instanceof Error ? err.message : String(err) });
        }
    }

    const done = results.filter(r => r.status === 'done').length;
    const failed = results.filter(r => r.status === 'failed').length;

    return NextResponse.json({
        message: `Processed ${done} videos. ${failed} failed.`,
        total: files.length,
        done,
        failed,
        results,
    });
}
