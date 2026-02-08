import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

// Setup ffmpeg paths if available
try {
    // Only attempt to set paths if we're not in a limited environment
    const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
    const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
    ffmpeg.setFfprobePath(ffprobeInstaller.path);
} catch (e) {
    console.warn('FFmpeg installer not found, relying on system ffmpeg');
}

/**
 * Compresses an image using sharp
 * @param buffer - The original image buffer
 * @param options - Compression options
 * @returns Compressed buffer and new mime type
 */
export async function compressImage(
    buffer: Buffer,
    options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<{ buffer: Buffer; contentType: string; extension: string }> {
    const { maxWidth = 1920, maxHeight = 1080, quality = 80 } = options;

    const pipeline = sharp(buffer)
        .resize({
            width: maxWidth,
            height: maxHeight,
            fit: 'inside',
            withoutEnlargement: true
        })
        .webp({ quality }); // Convert to WebP for best compression

    const compressedBuffer = await pipeline.toBuffer();

    return {
        buffer: compressedBuffer,
        contentType: 'image/webp',
        extension: 'webp'
    };
}

/**
 * Compresses a video using ffmpeg
 * Note: This is a heavy operation and should be handled with care
 */
export async function compressVideo(
    inputPath: string,
    outputPath: string
): Promise<void> {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions([
                '-vcodec libx264',
                '-crf 28',         // 18-28 is a good range, higher is more compression
                '-preset faster',   // faster encoding
                '-movflags +faststart', // For web streaming
                '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2' // Ensure even dimensions for x264
            ])
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .save(outputPath);
    });
}
