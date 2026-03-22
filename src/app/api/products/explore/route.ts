import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products/explore?excludeChannelId=xxx&limit=8
// Returns published products from other channels for cross-channel exploration
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const excludeChannelId = searchParams.get('excludeChannelId');
        const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 20);

        const products = await prisma.channelProduct.findMany({
            where: {
                published: true,
                status: 'ACTIVE',
                ...(excludeChannelId ? { channelId: { not: excludeChannelId } } : {}),
            },
            include: {
                channel: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        profileImage: true,
                    }
                },
                reviews: { select: { rating: true } }
            },
            orderBy: [
                { viewCount: 'desc' },
                { createdAt: 'desc' }
            ],
            take: limit,
        });

        const mapped = products.map(p => ({
            id: p.id,
            title: p.title,
            previewImage: p.previewImage,
            type: p.type,
            viewCount: p.viewCount,
            isFree: p.isFree,
            isSubscriberOnly: p.isSubscriberOnly,
            price: p.price ? Number(p.price) : 0,
            currency: p.currency,
            channelId: p.channelId,
            channelName: p.channel.name,
            channelSlug: p.channel.slug,
            channelAvatar: p.channel.profileImage,
            avgRating: p.reviews.length > 0
                ? (p.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / p.reviews.length).toFixed(1)
                : null,
        }));

        return NextResponse.json({ products: mapped });
    } catch (error) {
        console.error('Error fetching explore products:', error);
        return NextResponse.json({ products: [] }, { status: 500 });
    }
}
