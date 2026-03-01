/**
 * Returns the path to the ffmpeg binary.
 * We resolve from node_modules at runtime (not bundled by webpack)
 * because Next.js can mess up the path when bundling ffmpeg-static.
 */
export function getFfmpegPath(): string {
    try {
        // Try the standard ffmpeg-static resolution first
        const p = require('ffmpeg-static') as string;
        if (p && p.includes('ffmpeg')) return p;
    } catch { /* fall through */ }

    // Fallback: resolve from node_modules directly
    const { join } = require('path') as typeof import('path');
    const { existsSync } = require('fs') as typeof import('fs');

    const candidates = [
        join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg.exe'), // Windows
        join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg'),      // Linux/Mac
    ];

    for (const candidate of candidates) {
        if (existsSync(candidate)) return candidate;
    }

    throw new Error('ffmpeg binary not found. Run: npm install ffmpeg-static');
}
