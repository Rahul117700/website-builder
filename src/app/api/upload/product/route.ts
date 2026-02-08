import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/lib/prisma';
import { uploadFileWithFallback, hasS3Credentials, getUploadStatusMessage } from '@/lib/s3';
import { compressImage, compressVideo } from '@/lib/compression';
import { readFile, unlink } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

export const runtime = 'nodejs';
export const maxDuration = 600; // 10 minutes for large file uploads

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
    const productType = data.get('productType') as string;
    const productName = data.get('productName') as string;
    const productDescription = data.get('productDescription') as string;
    const productPrice = parseFloat(data.get('productPrice') as string);

    if (!file || !productType || !productName || !productPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate file size (max 500MB for products)
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 500MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Compression logic
    let finalBuffer = buffer;
    let finalMimeType = file.type;
    let finalExtension = file.name.split('.').pop() || '';
    let tempFiles: string[] = [];

    try {
      if (file.type.startsWith('image/')) {
        // Compress image
        const compressionResult = await compressImage(buffer);
        finalBuffer = Buffer.from(compressionResult.buffer);
        finalMimeType = compressionResult.contentType;
        finalExtension = compressionResult.extension;
      } else if (file.type.startsWith('video/')) {
        // Compress video
        const tempId = uuidv4();
        const inputPath = join(os.tmpdir(), `${tempId}-input.${finalExtension}`);
        const outputPath = join(os.tmpdir(), `${tempId}-output.mp4`);
        tempFiles.push(inputPath, outputPath);

        await writeFile(inputPath, buffer);
        await compressVideo(inputPath, outputPath);

        finalBuffer = await readFile(outputPath);
        finalMimeType = 'video/mp4';
        finalExtension = 'mp4';
      }
    } catch (compressionError) {
      console.error('Compression failed, using original file:', compressionError);
      // Fallback to original buffer and types (already set)
    }

    // Generate unique filename with potentially new extension
    const fileName = `product-${user.id}-${Date.now()}.${finalExtension}`;

    // Create products directory for fallback
    const productsDir = join(process.cwd(), 'public', 'uploads', 'products');
    if (!existsSync(productsDir)) {
      await mkdir(productsDir, { recursive: true });
    }
    const filePath = join(productsDir, fileName);

    // Upload to S3 with fallback to local
    const uploadResult = await uploadFileWithFallback(
      finalBuffer,
      fileName,
      finalMimeType,
      filePath,
      'products'
    );

    // Cleanup temp files
    for (const tempFile of tempFiles) {
      try {
        if (existsSync(tempFile)) await unlink(tempFile);
      } catch (e) {
        console.warn('Failed to cleanup temp file:', tempFile, e);
      }
    }

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.message || 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Create product record in database
    const product = await prisma.digitalProduct.create({
      data: {
        name: productName,
        description: productDescription || '',
        type: productType as any,
        price: productPrice,
        currency: 'INR',
        fileUrl: uploadResult.url,
        previewUrl: null, // Can be added later
        userId: user.id
      }
    });

    // If funnelId is provided, link product to funnel
    const funnelId = data.get('funnelId') as string;
    if (funnelId) {
      await prisma.funnel.update({
        where: { id: funnelId },
        data: { productId: product.id }
      });
    }

    // Return the product data
    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        type: product.type,
        price: product.price,
        currency: product.currency,
        fileUrl: product.fileUrl
      },
      storageType: uploadResult.storageType,
      uploadMessage: getUploadStatusMessage(uploadResult.storageType),
      s3Configured: hasS3Credentials()
    });
  } catch (error) {
    console.error('Error uploading product:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
