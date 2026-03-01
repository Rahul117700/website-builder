import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { readdirSync, statSync, existsSync, renameSync, unlinkSync } from 'fs';
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
    const results: { file: string; status: string; error?: string }[] = [];

    // All folders to search for videos
    const rootSearchPaths = [
        join(cwd, 'public', 'uploads'),
        join(cwd, 'uploads')
    ];

    function findVideos(dir: string, fileList: string[] = []) {
        if (!existsSync(dir)) return fileList;
        const files = readdirSync(dir);
        files.forEach(file => {
            const filePath = join(dir, file);
            if (statSync(filePath).isDirectory()) {
                findVideos(filePath, fileList);
            } else if (/\.(mp4|mov|mkv)$/i.test(file) && !file.startsWith('tmp-')) {
                fileList.push(filePath);
            }
        });
        return fileList;
    }

    const allVideoPaths = rootSearchPaths.flatMap(path => findVideos(path));

    for (const inputPath of allVideoPaths) {
        const file = inputPath.replace(cwd, '');
        const tempPath = inputPath + '.tmp-faststart';

        try {
            const stat = statSync(inputPath);
            if (stat.size < 1024) continue;

            await applyFaststart(inputPath, tempPath);
            renameSync(tempPath, inputPath);
            results.push({ file, status: 'done' });
        } catch (err) {
            if (existsSync(tempPath)) unlinkSync(tempPath);
            results.push({ file, status: 'failed', error: err instanceof Error ? err.message : String(err) });
        }
    }

    const done = results.filter(r => r.status === 'done').length;
    return NextResponse.json({
        message: `Processed ${done} videos recursively.`,
        total: allVideoPaths.length,
        results
    });
}
