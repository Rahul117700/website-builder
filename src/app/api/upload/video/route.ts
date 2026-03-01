import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/lib/prisma';
import ffmpeg from 'fluent-ffmpeg';
import { getFfmpegPath } from '@/lib/ffmpeg-path';

export const runtime = 'nodejs';
export const maxDuration = 600; // 10 minutes for large video uploads

// Point fluent-ffmpeg to the bundled binary (resolved at runtime to avoid Next.js bundling issues)
try {
  ffmpeg.setFfmpegPath(getFfmpegPath());
} catch (e) {
  console.warn('Could not set ffmpeg path:', e);
}

/**
 * Re-mux a video file to move the moov atom to the front of the file.
 * This is the "-movflags +faststart" trick — essential for instant streaming.
 * Without this, browsers must download the ENTIRE file before they can play 1 second.
 */
function applyFaststart(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-c copy',           // Copy all streams — no re-encoding (fast!)
        '-movflags +faststart', // Move moov atom to the front
      ])
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const funnelId = data.get('funnelId') as string;
    const productName = data.get('productName') as string;
    const productDescription = data.get('productDescription') as string;
    const productPrice = parseFloat(data.get('productPrice') as string);

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Please upload MP4, WebM, OGG, or MOV video files.'
      }, { status: 400 });
    }

    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'File size must be less than 500MB'
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const videosDir = join(process.cwd(), 'public', 'uploads', 'videos');
    if (!existsSync(videosDir)) {
      await mkdir(videosDir, { recursive: true });
    }

    const fileExtension = file.name.split('.').pop() || 'mp4';
    const baseName = funnelId
      ? `video-funnel-${funnelId}-${Date.now()}`
      : `video-${Date.now()}`;

    // Write original upload to a temp file first
    const tempPath = join(videosDir, `tmp-${baseName}.${fileExtension}`);
    const finalFileName = `${baseName}.${fileExtension}`;
    const finalPath = join(videosDir, finalFileName);

    await writeFile(tempPath, buffer);

    // Apply faststart (move moov atom to front) — no re-encoding, just remux
    // This is what makes the video start playing immediately like YouTube
    try {
      await applyFaststart(tempPath, finalPath);
      // Remove temp file after successful remux
      await unlink(tempPath).catch(() => { });
    } catch (ffmpegError) {
      console.warn('FFmpeg faststart failed, falling back to original file:', ffmpegError);
      // Fallback: just rename temp file to final (video works, just slower to start)
      await writeFile(finalPath, buffer);
      await unlink(tempPath).catch(() => { });
    }

    const publicUrl = `/uploads/videos/${finalFileName}`;

    const product = await prisma.digitalProduct.create({
      data: {
        name: productName,
        description: productDescription || '',
        type: 'VIDEOS',
        price: productPrice,
        currency: 'INR',
        fileUrl: publicUrl,
        fileSize: file.size,
        fileType: file.type,
        userId: user.id
      }
    });

    if (funnelId) {
      await prisma.funnel.update({
        where: { id: funnelId },
        data: { productId: product.id }
      });
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: finalFileName,
      size: file.size,
      type: file.type,
      faststart: true,
      product: {
        id: product.id,
        name: product.name,
        price: product.price
      }
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    return NextResponse.json({
      error: 'Failed to upload video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
