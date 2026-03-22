import React from 'react';
import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import HomeContent from '@/components/home/HomeContent';
import {
    getSubscribedProducts,
    getFollowedProducts,
    getRecommendedProducts,
    getTrendingEbooks,
    getUserSubscriptions,
    getUserFollows,
    getUserNotifications,
    getUserChannelInfo,
    getTrendingShots
} from '@/app/actions/homepage';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const [
        subscribedProducts,
        followedProducts,
        recommendedProducts,
        trendingEbooks,
        userSubscriptions,
        userFollows,
        notifications,
        userChannelInfo,
        trendingShots
    ] = await Promise.all([
        userId ? getSubscribedProducts(userId) : [],
        userId ? getFollowedProducts(userId) : [],
        getRecommendedProducts(userId),
        getTrendingEbooks(),
        userId ? getUserSubscriptions(userId) : [],
        userId ? getUserFollows(userId) : [],
        userId ? getUserNotifications(userId) : [],
        userId ? getUserChannelInfo(userId) : null,
        getTrendingShots(userId)
    ]);

    return (
        <HomeContent
            subscribedProducts={subscribedProducts}
            followedProducts={followedProducts}
            recommendedProducts={recommendedProducts}
            trendingEbooks={trendingEbooks}
            userSubscriptions={userSubscriptions}
            userFollows={userFollows}
            notifications={notifications}
            userChannelInfo={userChannelInfo}
            trendingShots={trendingShots}
        />
    );
}
