import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
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

    // Validate file type (video formats)
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload MP4, WebM, OGG, or MOV video files.' 
      }, { status: 400 });
    }

    // Validate file size (max 500MB for videos)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File size must be less than 500MB' 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create videos directory if it doesn't exist
    const videosDir = join(process.cwd(), 'public', 'uploads', 'videos');
    if (!existsSync(videosDir)) {
      await mkdir(videosDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = funnelId 
      ? `video-funnel-${funnelId}-${Date.now()}.${fileExtension}`
      : `video-${Date.now()}.${fileExtension}`;
    
    const filePath = join(videosDir, fileName);

    // Write file to disk
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/videos/${fileName}`;

    // Create product record in database
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

    // If funnelId is provided, link product to funnel
    if (funnelId) {
      await prisma.funnel.update({
        where: { id: funnelId },
        data: { productId: product.id }
      });
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: fileName,
      size: file.size,
      type: file.type,
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

