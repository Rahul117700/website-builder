import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * Diagnostic endpoint to check channel image URLs
 * This helps debug image visibility issues in production
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { channelId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const channel = await prisma.channel.findUnique({
            where: {
                id: params.channelId,
            },
            select: {
                id: true,
                name: true,
                slug: true,
                profileImage: true,
                coverImage: true,
                userId: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        if (!channel) {
            return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
        }

        // Check if user owns the channel or is admin
        if (channel.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Diagnostic information
        const diagnostics = {
            channel: {
                id: channel.id,
                name: channel.name,
                slug: channel.slug,
                profileImage: channel.profileImage,
                coverImage: channel.coverImage,
            },
            user: {
                id: channel.user.id,
                name: channel.user.name,
                image: channel.user.image,
            },
            imageStatus: {
                hasProfileImage: !!channel.profileImage,
                hasCoverImage: !!channel.coverImage,
                hasUserImage: !!channel.user.image,
                profileImageType: channel.profileImage
                    ? channel.profileImage.startsWith('http')
                        ? 'absolute'
                        : 'relative'
                    : 'none',
                coverImageType: channel.coverImage
                    ? channel.coverImage.startsWith('http')
                        ? 'absolute'
                        : 'relative'
                    : 'none',
            },
            urls: {
                profileImageUrl: channel.profileImage || null,
                coverImageUrl: channel.coverImage || null,
                userImageUrl: channel.user.image || null,
            },
        };

        return NextResponse.json(diagnostics);
    } catch (error) {
        console.error('Error in diagnostics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch diagnostics', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
