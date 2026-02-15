import React from 'react';
import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import HomeContent from '@/components/home/HomeContent';
import {
    getSubscribedProducts,
    getRecommendedProducts,
    getTrendingEbooks,
    getUserSubscriptions,
    getUserNotifications,
    getUserChannelInfo
} from '@/app/actions/homepage';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const [
        subscribedProducts,
        recommendedProducts,
        trendingEbooks,
        userSubscriptions,
        notifications,
        userChannelInfo
    ] = await Promise.all([
        userId ? getSubscribedProducts(userId) : [],
        getRecommendedProducts(userId),
        getTrendingEbooks(),
        userId ? getUserSubscriptions(userId) : [],
        userId ? getUserNotifications(userId) : [],
        userId ? getUserChannelInfo(userId) : null
    ]);

    return (
        <HomeContent
            subscribedProducts={subscribedProducts}
            recommendedProducts={recommendedProducts}
            trendingEbooks={trendingEbooks}
            userSubscriptions={userSubscriptions}
            notifications={notifications}
            userChannelInfo={userChannelInfo}
        />
    );
}
