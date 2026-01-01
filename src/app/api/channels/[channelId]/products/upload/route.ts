import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { ChannelProductType } from '@prisma/client';
import { uploadFileWithFallback, hasS3Credentials, getUploadStatusMessage } from '@/lib/s3';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';
export const maxDuration = 600; // 10 minutes

// POST /api/channels/[channelId]/products/upload - Upload product file
export async function POST(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns the channel
    const channel = await prisma.channel.findUnique({
      where: {
        id: params.channelId,
        userId: session.user.id,
      },
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found or unauthorized' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const price = formData.get('price') as string;
    const currency = formData.get('currency') as string || 'INR';
    const tags = formData.get('tags') as string;
    const isFree = formData.get('isFree') === 'true';
    const isSubscriberOnly = formData.get('isSubscriberOnly') === 'true';

    if (!title || !type || (!price && !isFree)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let fileUrl: string | null = null;
    let videoUrl: string | null = null;
    let fileType: string | null = null;
    let fileSize: number | null = null;
    let uploadResult: any = null;

    // Handle file upload if provided
    if (file) {
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
        'video/webm',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/json',
        'text/javascript',
        'text/css',
        'text/html',
      ];

      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const maxSize = 500 * 1024 * 1024; // 500MB

      if (file.size > maxSize) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 500MB' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const timestamp = Date.now();
      const fileName = `${session.user.id}_${timestamp}${fileExtension ? '.' + fileExtension : ''}`;

      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'channel-products');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }
      const filePath = join(uploadsDir, fileName);

      uploadResult = await uploadFileWithFallback(
        buffer,
        fileName,
        file.type,
        filePath,
        'channel-products'
      );

      if (!uploadResult.success) {
        return NextResponse.json(
          { error: uploadResult.message || 'Failed to upload file' },
          { status: 500 }
        );
      }

      fileUrl = uploadResult.url;
      fileType = file.type;
      fileSize = file.size;
      
      // For video files, also set videoUrl
      if (file.type.startsWith('video/')) {
        videoUrl = uploadResult.url;
      }
    }

    // Parse tags
    const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [];

    // Map form type to enum (handle plural forms)
    const typeMapping: { [key: string]: ChannelProductType } = {
      'DOCUMENTS': 'DOCUMENT',
      'VIDEOS': 'VIDEO',
      'IMAGES': 'OTHER', // IMAGES not in enum, use OTHER
      'SOFTWARE': 'SOFTWARE',
      'CODE': 'CODE',
      'COURSES': 'COURSE',
      'TEMPLATES': 'TEMPLATE',
      'OTHER': 'OTHER',
      // Also handle singular forms
      'DOCUMENT': 'DOCUMENT',
      'VIDEO': 'VIDEO',
      'COURSE': 'COURSE',
      'TEMPLATE': 'TEMPLATE',
      'EBOOK': 'EBOOK',
      'AUDIO': 'AUDIO',
      'BUNDLE': 'BUNDLE',
    };

    const mappedType = typeMapping[type.toUpperCase()] || 'OTHER';

    // Validate price if not free
    if (!isFree) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        return NextResponse.json(
          { error: 'Invalid price. Please enter a valid number.' },
          { status: 400 }
        );
      }
    }

    // Create product
    const product = await prisma.channelProduct.create({
      data: {
        channelId: params.channelId,
        title: title.trim(),
        description: description ? description.trim() : null,
        type: mappedType,
        price: isFree ? 0 : parseFloat(price),
        currency,
        fileUrl,
        videoUrl, // Set videoUrl for video files
        fileType,
        fileSize,
        tags: tagsArray,
        isSubscriberOnly,
        isFree,
        published: true,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      product,
      storageType: file ? uploadResult?.storageType : null,
      uploadMessage: file ? getUploadStatusMessage(uploadResult?.storageType) : null,
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading channel product:', error);
    return NextResponse.json(
      { error: 'Failed to upload product' },
      { status: 500 }
    );
  }
}

