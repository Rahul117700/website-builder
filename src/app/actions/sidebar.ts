import { prisma as db } from '@/lib/prisma';

export async function getSidebarData(userId?: string) {
    try {
        // 1. Trending Clubs (Channels with most followers/subscribers)
        const trendingClubsRaw = await db.channel.findMany({
            where: { published: true },
            orderBy: [{ totalSubscribers: 'desc' }, { totalFollowers: 'desc' }],
            take: 4,
            select: {
                id: true,
                name: true,
                slug: true,
                profileImage: true,
                totalSubscribers: true,
                totalFollowers: true,
            }
        });

        // 2. Upcoming Drops / Premieres
        // Assuming products created recently but perhaps NOT published or DRAFT
        const upcomingDropsRaw = await db.channelProduct.findMany({
            where: {
                published: false,
                status: 'DRAFT',
                type: 'VIDEO'
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
                channel: {
                    select: { name: true }
                }
            }
        });

        // 3. Top Creators Leaderboard
        const topCreatorsRaw = await db.channel.findMany({
            where: { published: true },
            orderBy: { totalRevenue: 'desc' },
            take: 5,
            select: {
                id: true,
                name: true,
                slug: true,
                profileImage: true,
                totalRevenue: true,
            }
        });

        // 4. Continue Watching
        let continueWatchingRaw: any = [];
        if (userId) {
            const recentVideos = await db.channelProduct.findMany({
                where: {
                    type: { in: ['VIDEO', 'COURSE'] },
                    published: true
                },
                take: 6,
                orderBy: { createdAt: 'desc' },
                include: {
                    channel: {
                        select: { name: true, slug: true }
                    }
                }
            });
            continueWatchingRaw = recentVideos;
        }

        const topCreators = topCreatorsRaw.map(c => ({
            ...c,
            totalRevenue: c.totalRevenue ? Number(c.totalRevenue.toString()) : 0
        }));

        return {
            trendingClubs: trendingClubsRaw,
            upcomingDrops: upcomingDropsRaw.length > 0 ? upcomingDropsRaw[0] : null,
            topCreators: topCreators,
            continueWatching: continueWatchingRaw
        };
    } catch (error) {
        console.error('Error fetching sidebar data:', error);
        return {
            trendingClubs: [],
            upcomingDrops: null,
            topCreators: [],
            continueWatching: []
        };
    }
}
