import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { uploadFileWithFallback, hasS3Credentials, getUploadStatusMessage } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type - only images
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 5MB for profile images)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Prepare file for upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const fileName = `profile-${user.id}-${Date.now()}${fileExtension ? '.' + fileExtension : ''}`;

    // Create uploads directory for fallback
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profile-images');
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
      'profile-images'
    );

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.message || 'Failed to upload profile image' },
        { status: 500 }
      );
    }

    // Update user's profile image URL in the database
    await prisma.user.update({
      where: { id: user.id },
      data: { image: uploadResult.url },
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      storageType: uploadResult.storageType,
      message: getUploadStatusMessage(uploadResult.storageType),
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return NextResponse.json(
      { error: 'Failed to upload profile image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current image URL
    const currentImageUrl = user.image;

    // Delete file from local storage if it exists
    if (currentImageUrl && currentImageUrl.startsWith('/uploads/profile-images/')) {
      try {
        const filePath = join(process.cwd(), 'public', currentImageUrl);
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch (deleteError) {
        console.error('Error deleting file:', deleteError);
        // Continue even if file deletion fails
      }
    }

    // Update user's profile image URL to null in the database
    await prisma.user.update({
      where: { id: user.id },
      data: { image: null },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile image removed successfully',
    });
  } catch (error) {
    console.error('Error removing profile image:', error);
    return NextResponse.json(
      { error: 'Failed to remove profile image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

