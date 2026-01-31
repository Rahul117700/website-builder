import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getTrendingProducts, getUserSubscriptions, getUserNotifications } from '@/app/actions/homepage';
import TrendingContent from '@/components/trending/TrendingContent';

export const dynamic = 'force-dynamic';

export default async function TrendingPage() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const [
        overallTrending,
        musicTrending,
        sportsTrending,
        gamingTrending,
        newsTrending,
        learningTrending,
        userSubscriptions,
        notifications
    ] = await Promise.all([
        getTrendingProducts(undefined, userId),
        getTrendingProducts('music', userId),
        getTrendingProducts('sports', userId),
        getTrendingProducts('gaming', userId),
        getTrendingProducts('news', userId),
        getTrendingProducts('learning', userId),
        userId ? getUserSubscriptions(userId) : [],
        userId ? getUserNotifications(userId) : []
    ]);

    return (
        <TrendingContent
            overallTrending={overallTrending}
            musicTrending={musicTrending}
            sportsTrending={sportsTrending}
            gamingTrending={gamingTrending}
            newsTrending={newsTrending}
            learningTrending={learningTrending}
            userSubscriptions={userSubscriptions}
            notifications={notifications}
        />
    );
}
