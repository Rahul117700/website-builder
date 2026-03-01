/**
 * Returns the path to the ffmpeg binary.
 * We resolve from node_modules at runtime (not bundled by webpack)
 * because Next.js can mess up the path when bundling ffmpeg-static.
 */
export function getFfmpegPath(): string {
    const { join } = require('path') as typeof import('path');
    const { existsSync } = require('fs') as typeof import('fs');

    const cwd = process.cwd();

    // Prioritize absolute path in node_modules to avoid Next.js bundling issues
    const candidates = [
        join(cwd, 'node_modules', 'ffmpeg-static', 'ffmpeg'),      // Linux (Production)
        join(cwd, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe'),  // Windows (Local)
    ];

    for (const candidate of candidates) {
        if (existsSync(candidate)) return candidate;
    }

    // Fallback if the above fails
    try {
        const p = require('ffmpeg-static') as string;
        if (p && existsSync(p)) return p;
    } catch { /* ignore */ }

    throw new Error('ffmpeg binary not found at ' + candidates.join(' OR '));
}
