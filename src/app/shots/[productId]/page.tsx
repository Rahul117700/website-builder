import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import ShotsReelClient from './ShotsReelClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ShotsPage({ params }: { params: { productId: string } }) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Fetch the specific 'shot' product
    const product = await prisma.channelProduct.findUnique({
        where: { id: params.productId },
        include: {
            channel: {
                include: {
                    user: { select: { name: true, image: true } },
                    subscribers: userId ? {
                        where: { userId, status: 'ACTIVE' },
                        take: 1
                    } : false,
                    followers: userId ? {
                        where: { userId },
                        take: 1
                    } : false
                }
            },
            likes: userId ? { where: { userId } } : false,
        }
    });

    if (!product || !product.videoUrl) {
        notFound();
    }

    // Any video product can be viewed in reel/shot mode

    const hasAccess = product.channel.subscribers ? product.channel.subscribers.length > 0 : false;
    const isFollowing = product.channel.followers ? product.channel.followers.length > 0 : false;
    const isLiked = product.likes ? product.likes.length > 0 : false;

    // Track a view (Optional: Could do this async without awaiting)
    prisma.channelProduct.update({
        where: { id: product.id },
        data: {
            viewCount: { increment: 1 },
            updatedAt: new Date()
        }
    }).catch(console.error);

    return (
        <ShotsReelClient 
            product={product} 
            hasAccess={hasAccess} 
            isLiked={isLiked} 
            isFollowing={isFollowing}
            userId={userId}
            userImage={session?.user?.image}
            userName={session?.user?.name}
            userEmail={session?.user?.email}
        />
    );
}
