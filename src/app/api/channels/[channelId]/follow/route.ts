import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: { channelId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ isFollowing: false });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ isFollowing: false });
        }

        const follow = await prisma.channelFollow.findUnique({
            where: {
                channelId_userId: {
                    channelId: params.channelId,
                    userId: user.id
                }
            }
        });

        return NextResponse.json({ isFollowing: !!follow });
    } catch (error) {
        console.error('Error checking follow status:', error);
        return NextResponse.json({ isFollowing: false });
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { channelId: string } }
) {
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

        const channel = await prisma.channel.findUnique({
            where: { id: params.channelId }
        });

        if (!channel) {
            return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
        }

        // Check if already following
        const existingFollow = await prisma.channelFollow.findUnique({
            where: {
                channelId_userId: {
                    channelId: params.channelId,
                    userId: user.id
                }
            }
        });

        if (existingFollow) {
            // Unfollow
            await prisma.$transaction([
                prisma.channelFollow.delete({
                    where: { id: existingFollow.id }
                }),
                prisma.channel.update({
                    where: { id: params.channelId },
                    data: { totalFollowers: { decrement: 1 } }
                })
            ]);

            return NextResponse.json({ isFollowing: false, success: true });
        } else {
            // Follow
            await prisma.$transaction([
                prisma.channelFollow.create({
                    data: {
                        channelId: params.channelId,
                        userId: user.id
                    }
                }),
                prisma.channel.update({
                    where: { id: params.channelId },
                    data: { totalFollowers: { increment: 1 } }
                })
            ]);

            // Notify channel owner
            if (channel.userId !== user.id) {
                try {
                    await prisma.userNotification.create({
                        data: {
                            userId: channel.userId,
                            title: '✨ New Follower!',
                            message: `${user.name || 'Someone'} is now following your channel "${channel.name}"`,
                            type: 'INFO',
                            category: 'COMMUNITY',
                            read: false,
                            metadata: {
                                channelId: channel.id,
                                actorId: user.id,
                                actorName: user.name,
                                url: `/channel/${channel.slug}`
                            }
                        }
                    });
                } catch (notifErr) {
                    console.error('Failed to create follow notification:', notifErr);
                }
            }

            return NextResponse.json({ isFollowing: true, success: true });
        }
    } catch (error) {
        console.error('Error toggling follow status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
