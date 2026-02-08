import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { join } from 'path';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { uploadFileWithFallback, getUploadStatusMessage } from '@/lib/s3';
import { compressImage } from '@/lib/compression';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type (images only)
    const fileType = file.type;
    if (!fileType.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'File too large',
        message: 'Image must be less than 50MB'
      }, { status: 400 });
    }

    // Prepare file for upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename components
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const originalExtension = file.name.split('.').pop() || 'jpg';
    const tempFilename = `image-${timestamp}-${randomString}.${originalExtension}`;

    // Compress and convert to WebP
    const compressionResult = await compressImage(buffer);
    const compressedBuffer = Buffer.from(compressionResult.buffer);
    const { contentType: newContentType, extension: newExtension } = compressionResult;

    // Final filename with .webp
    const finalFilename = `image-${timestamp}-${randomString}.${newExtension}`;

    // Create uploads directory for fallback
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'images');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    const finalFilepath = join(uploadsDir, finalFilename);

    // Upload using fallback mechanism (S3 preferred, local as fallback)
    const uploadResult = await uploadFileWithFallback(
      compressedBuffer,
      finalFilename,
      newContentType,
      finalFilepath,
      'images'
    );

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.message || 'Failed to upload image' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      filename: finalFilename,
      size: compressedBuffer.length,
      type: newContentType,
      storageType: uploadResult.storageType,
      message: getUploadStatusMessage(uploadResult.storageType)
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

