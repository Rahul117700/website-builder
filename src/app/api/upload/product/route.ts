import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { uploadFileWithFallback, hasS3Credentials, getUploadStatusMessage } from '@/lib/s3';

export const runtime = 'nodejs';
export const maxDuration = 600; // 10 minutes for large file uploads

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in database
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    let user = await prisma.user.findUnique({
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

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `product-${user.id}-${Date.now()}.${fileExtension}`;

    // Create products directory for fallback
    const productsDir = join(process.cwd(), 'public', 'uploads', 'products');
    if (!existsSync(productsDir)) {
      await mkdir(productsDir, { recursive: true });
    }
    const filePath = join(productsDir, fileName);

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

    // Create product record in database
    const product = await prisma.digitalProduct.create({
      data: {
        name: productName,
        description: productDescription || '',
        type: productType,
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

    await prisma.$disconnect();

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
