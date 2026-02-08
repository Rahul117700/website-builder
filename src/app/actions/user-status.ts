'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export type UserEngagementStatus = {
    hasChannel: boolean;
    productCount: number;
    hasRazorpay: boolean;
};

export async function getUserEngagementStatus(): Promise<UserEngagementStatus | null> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                channels: {
                    select: {
                        id: true,
                        _count: {
                            select: { products: true }
                        }
                    }
                },
                razorpayConfigs: {
                    where: { isActive: true },
                    take: 1
                }
            }
        });

        if (!user) return null;

        const hasChannel = user.channels.length > 0;
        const totalProducts = user.channels.reduce((acc, channel) => acc + channel._count.products, 0);
        const hasRazorpay = user.razorpayConfigs.length > 0;

        return {
            hasChannel,
            productCount: totalProducts,
            hasRazorpay
        };
    } catch (error) {
        console.error('Error fetching user engagement status:', error);
        return null;
    }
}
