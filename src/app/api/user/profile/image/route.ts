import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size too large' }, { status: 400 });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
        try {
            await mkdir(uploadsDir, { recursive: true });
        } catch (error) {
            // Directory might already exist, ignore error
        }

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const filename = `${user.id}-${timestamp}.${fileExtension}`;
        const filepath = path.join(uploadsDir, filename);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Update user profile with new image URL
        const imageUrl = `/uploads/profiles/${filename}`;

        // Update both User and their Channels
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { image: imageUrl },
            }),
            prisma.channel.updateMany({
                where: { userId: user.id },
                data: { profileImage: imageUrl },
            })
        ]);

        return NextResponse.json({
            imageUrl,
            message: 'Profile picture updated successfully'
        });
    } catch (error) {
        console.error('Error uploading profile image:', error);
        return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
        );
    }
}
