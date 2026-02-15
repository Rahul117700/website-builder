'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ChannelProductType, NotificationType } from '@prisma/client';

export type ProductCardData = {
    id: string;
    title: string;
    thumbnail: string;
    channelName: string;
    channelAvatar: string;
    views: string;
    postedAt: string;
    duration?: string;
    price: number;
    type: string;
    slug?: string;
    videoUrl?: string; // [NEW] Added for hover preview
    channelSlug?: string; // [NEW] Added for redirect logic
    hasAccess?: boolean; // [NEW] Check if user has access (subscribed)
    isSubscriberOnly?: boolean;
    isFree?: boolean;
    isPromoted?: boolean;
    isLiked?: boolean;
    isSaved?: boolean;
};

export type SubscriptionData = {
    channelId: string;
    channelName: string;
    channelAvatar: string;
    slug: string;
};

export type NotificationData = {
    id: string;
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
    type: NotificationType;
};

export async function getSubscribedProducts(userId: string): Promise<ProductCardData[]> {
    if (!userId) return [];

    try {
        const products = await prisma.channelProduct.findMany({
            where: {
                published: true,
                status: 'ACTIVE',
                channel: {
                    subscribers: {
                        some: {
                            userId: userId,
                            status: 'ACTIVE',
                        },
                    },
                },
            },
            include: {
                channel: {
                    include: {
                        user: { select: { image: true, name: true } }, // Fallback for avatar
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        return products.map(mapToCardData).map(p => ({ ...p, hasAccess: true }));
    } catch (error) {
        console.error('Error fetching subscribed products:', error);
        return [];
    }
}

export async function getRecommendedProducts(userId?: string): Promise<ProductCardData[]> {
    try {
        const products = await prisma.channelProduct.findMany({
            where: {
                published: true,
                status: 'ACTIVE',
            },
            include: {
                channel: {
                    include: {
                        user: { select: { image: true, name: true } },
                        subscribers: userId ? {
                            where: {
                                userId: userId,
                                status: 'ACTIVE'
                            },
                            take: 1
                        } : false
                    },
                },
            },
            orderBy: { viewCount: 'desc' }, // Simple recommendation: popularity
            take: 20,
        });

        return products.map(p => ({
            ...mapToCardData(p),
            hasAccess: p.channel.subscribers && p.channel.subscribers.length > 0
        }));
    } catch (error) {
        console.error('Error fetching recommended products:', error);
        return [];
    }
}

export async function getTrendingEbooks(): Promise<ProductCardData[]> {
    try {
        const products = await prisma.channelProduct.findMany({
            where: {
                published: true,
                status: 'ACTIVE',
                type: 'EBOOK',
            },
            include: {
                channel: {
                    include: {
                        user: { select: { image: true, name: true } },
                    },
                },
            },
            orderBy: { purchaseCount: 'desc' },
            take: 10,
        });

        return products.map(mapToCardData);
    } catch (error) {
        console.error('Error fetching trending ebooks:', error);
        return [];
    }
}

export async function getUserSubscriptions(userId: string): Promise<SubscriptionData[]> {
    if (!userId) return [];

    try {
        const subscriptions = await prisma.channelSubscription.findMany({
            where: {
                userId: userId,
                status: 'ACTIVE',
                endDate: {
                    gt: new Date()
                }
            },
            include: {
                channel: {
                    include: {
                        user: { select: { image: true, name: true } }
                    }
                }
            },
            take: 20
        });

        return subscriptions.map(sub => ({
            channelId: sub.channelId,
            channelName: sub.channel.name,
            channelAvatar: sub.channel.profileImage || sub.channel.user?.image || '',
            slug: sub.channel.slug,
        }));
    } catch (error) {
        console.error('Error fetching user subscriptions:', error);
        return [];
    }
}

export async function getUserNotifications(userId: string): Promise<NotificationData[]> {
    if (!userId) return [];

    try {
        const notifications = await prisma.userNotification.findMany({
            where: {
                userId: userId,
                // read: false, // Optional: show only unread? User probably wants to see recent list.
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        return notifications.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            createdAt: timeAgo(n.createdAt),
            read: n.read,
            type: n.type
        }));
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
}

export async function searchProducts(query: string, userId?: string): Promise<ProductCardData[]> {
    if (!query) return [];

    try {
        const products = await prisma.channelProduct.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { tags: { has: query.toUpperCase() } },
                    { channel: { name: { contains: query, mode: 'insensitive' } } }
                ],
                published: true,
                status: 'ACTIVE'
            },
            include: {
                channel: {
                    include: {
                        user: { select: { image: true, name: true } }
                    }
                },
                likes: userId ? { where: { userId: userId } } : false,
                saves: userId ? { where: { userId: userId } } : false,
            },
            orderBy: { viewCount: 'desc' },
            take: 40
        });

        return products.map(mapToCardData);
    } catch (error) {
        console.error('Error searching products:', error);
        return [];
    }
}

export async function searchChannels(query: string): Promise<any[]> {
    if (!query) return [];

    try {
        const channels = await prisma.channel.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { slug: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { tags: { has: query.toUpperCase() } }
                ],
                published: true,
                status: 'ACTIVE'
            },
            include: {
                user: { select: { image: true, name: true } },
                _count: {
                    select: {
                        subscribers: { where: { status: 'ACTIVE' } },
                        products: { where: { published: true, status: 'ACTIVE' } }
                    }
                }
            },
            orderBy: {
                subscribers: { _count: 'desc' }
            },
            take: 10
        });

        return channels.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            avatar: c.profileImage || c.user?.image || '',
            subscribers: c._count.subscribers,
            productsCount: c._count.products,
            description: c.description || '',
            tags: c.tags
        }));
    } catch (error) {
        console.error('Error searching channels:', error);
        return [];
    }
}

export async function getProductsByTag(tag: string, userId?: string): Promise<ProductCardData[]> {
    if (!tag) return [];

    try {
        const products = await prisma.channelProduct.findMany({
            where: {
                tags: {
                    has: tag.toUpperCase()
                },
                published: true,
                status: 'ACTIVE'
            },
            include: {
                channel: {
                    include: {
                        user: { select: { image: true, name: true } },
                        subscribers: userId ? {
                            where: {
                                userId: userId,
                                status: 'ACTIVE'
                            },
                            take: 1
                        } : false
                    },
                },
                likes: userId ? { where: { userId: userId } } : false,
                saves: userId ? { where: { userId: userId } } : false,
            },
            orderBy: { createdAt: 'desc' },
            take: 40,
        });

        return products.map(p => ({
            ...mapToCardData(p),
            hasAccess: p.channel.subscribers && p.channel.subscribers.length > 0
        }));
    } catch (error) {
        console.error('Error fetching products by tag:', error);
        return [];
    }
}

export async function getTrendingProducts(tag?: string, userId?: string): Promise<ProductCardData[]> {
    try {
        const whereClause: any = {
            published: true,
            status: 'ACTIVE'
        };

        if (tag) {
            whereClause.tags = {
                has: tag.toUpperCase()
            };
        }

        const products = await prisma.channelProduct.findMany({
            where: whereClause,
            include: {
                channel: {
                    include: {
                        user: { select: { image: true, name: true } },
                        subscribers: userId ? {
                            where: {
                                userId: userId,
                                status: 'ACTIVE'
                            },
                            take: 1
                        } : false
                    },
                },
                likes: userId ? { where: { userId: userId } } : false,
                saves: userId ? { where: { userId: userId } } : false,
            },
            orderBy: [
                { viewCount: 'desc' }
            ],
            take: 20,
        });

        return products.map(p => ({
            ...mapToCardData(p),
            hasAccess: p.channel.subscribers && p.channel.subscribers.length > 0,
            isPromoted: p.channel.isPromoted
        }));
    } catch (error) {
        console.error('Error fetching trending products:', error);
        return [];
    }
}

export async function getMarketplaceChannels(): Promise<any[]> {
    try {
        const channels = await prisma.channel.findMany({
            where: {
                status: 'ACTIVE',
                published: true,
                products: {
                    some: {
                        published: true,
                        status: 'ACTIVE'
                    }
                }
            },
            include: {
                user: { select: { image: true, name: true } },
                _count: {
                    select: {
                        subscribers: { where: { status: 'ACTIVE' } },
                        products: { where: { published: true, status: 'ACTIVE' } }
                    }
                },
                products: {
                    where: { published: true, status: 'ACTIVE' },
                    select: { isSubscriberOnly: true, isFree: true }
                }
            },
            orderBy: [
                { isPromoted: 'desc' },
                { subscribers: { _count: 'desc' } }
            ],
            take: 50
        });

        return channels.map(c => {
            const freeProducts = c.products.filter(p => !p.isSubscriberOnly).length;
            const subscriberProducts = c.products.filter(p => p.isSubscriberOnly).length;

            return {
                id: c.id,
                name: c.name,
                slug: c.slug,
                avatar: c.profileImage || c.user?.image || '',
                subscribers: c._count.subscribers,
                productsCount: c._count.products,
                freeProductsCount: freeProducts,
                subscriberProductsCount: subscriberProducts,
                subscriptionEnabled: c.subscriptionEnabled,
                subscriptionPrice: c.subscriptionPrice ? Number(c.subscriptionPrice) : null,
                subscriptionCurrency: c.subscriptionCurrency,
                description: c.description || '',
                isPromoted: c.isPromoted
            };
        });
    } catch (error) {
        console.error('Error fetching marketplace channels:', error);
        return [];
    }
}

function mapToCardData(product: any): ProductCardData {
    return {
        id: product.id,
        title: product.title,
        thumbnail: product.previewImage || '/placeholder-product.jpg', // Fallback
        channelName: product.channel.name,
        channelAvatar: product.channel.profileImage || product.channel.user?.image || '',
        views: `${formatNumber(product.viewCount)} views`,
        postedAt: timeAgo(product.createdAt),
        duration: product.videoDuration ? formatDuration(product.videoDuration) : undefined,
        price: Number(product.price),
        type: product.type,
        slug: product.slug || '',
        videoUrl: product.videoUrl || undefined, // [NEW] Map video URL
        channelSlug: product.channel.slug, // [NEW] Map channel slug
        isSubscriberOnly: product.isSubscriberOnly,
        isFree: product.isFree,
        isLiked: product.likes && product.likes.length > 0,
        isSaved: product.saves && product.saves.length > 0,
    };
}

function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function timeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
    return `${m}:${pad(s)}`;
}

function pad(n: number) {
    return n < 10 ? '0' + n : n;
}

export async function getUserChannelInfo(userId: string): Promise<{ hasChannel: boolean; productCount: number } | null> {
    if (!userId) return null;

    try {
        const channel = await prisma.channel.findFirst({
            where: {
                userId: userId,
            },
            include: {
                _count: {
                    select: {
                        products: {
                            where: {
                                published: true,
                                status: 'ACTIVE'
                            }
                        }
                    }
                }
            }
        });

        if (!channel) {
            return { hasChannel: false, productCount: 0 };
        }

        return {
            hasChannel: true,
            productCount: channel._count.products
        };
    } catch (error) {
        console.error('Error fetching user channel info:', error);
        return null;
    }
}
