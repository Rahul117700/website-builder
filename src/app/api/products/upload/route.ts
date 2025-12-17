import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { DigitalProductType } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { uploadFileWithFallback, hasS3Credentials, getUploadStatusMessage } from '@/lib/s3';

// Configure route for large file uploads
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

// POST /api/products/upload - Upload digital product file
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Upload request starting... Content-Length:', request.headers.get('content-length'));

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const currency = formData.get('currency') as string || 'INR';

    if (!file || !name || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/quicktime',
      'video/x-msvideo',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/json',
      'text/javascript',
      'text/css',
      'text/html'
    ];

    // Check file type and extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['zip', 'pdf', 'jpg', 'jpeg', 'png', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'json', 'js', 'css', 'html'];

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
      return NextResponse.json(
        { error: `File type not allowed. Received: ${file.type} (${fileExtension}). Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 500MB' },
        { status: 400 }
      );
    }

    // Prepare file for upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${session.user.id}_${timestamp}${fileExtension ? '.' + fileExtension : ''}`;

    // Create uploads directory for fallback (use public/uploads so files are served)
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    const filePath = join(uploadsDir, fileName);

    // Upload to S3 with fallback to local
    const uploadResult = await uploadFileWithFallback(
      buffer,
      fileName,
      file.type,
      filePath,
      'products'
    );

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.message || 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Determine product type based on file type
    let productType: DigitalProductType = DigitalProductType.DOCUMENTS;
    if (file.type.startsWith('video/')) {
      productType = DigitalProductType.VIDEOS;
    } else if (file.type.startsWith('image/')) {
      productType = DigitalProductType.IMAGES;
    } else if (file.type.includes('zip') || file.type.includes('application/x-zip')) {
      productType = DigitalProductType.SOFTWARE;
    } else if (file.type.includes('text') || file.type.includes('javascript') || file.type.includes('code')) {
      productType = DigitalProductType.CODE;
    }

    // Create product record
    const product = await prisma.digitalProduct.create({
      data: {
        name,
        description,
        price,
        currency,
        type: productType,
        fileUrl: uploadResult.url,
        fileSize: file.size,
        fileType: file.type,
        userId: session.user.id
      }
    });

    return NextResponse.json({
      ...product,
      storageType: uploadResult.storageType,
      uploadMessage: getUploadStatusMessage(uploadResult.storageType),
      s3Configured: hasS3Credentials()
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading product:', error);
    return NextResponse.json(
      { error: 'Failed to upload product' },
      { status: 500 }
    );
  }
}
