import React from 'react';
import HomeContent from '@/components/home/HomeContent';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
    getSubscribedProducts,
    getRecommendedProducts,
    getTrendingEbooks,
    getUserSubscriptions,
    getUserNotifications,
    searchProducts
} from '@/app/actions/homepage';

export default async function SearchPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const query = typeof searchParams.q === 'string' ? searchParams.q : '';

    const [
        searchResults,
        recommendedProducts,
        trendingEbooks,
        userSubscriptions,
        notifications
    ] = await Promise.all([
        searchProducts(query),
        getRecommendedProducts(),
        getTrendingEbooks(),
        userId ? getUserSubscriptions(userId) : [],
        userId ? getUserNotifications(userId) : []
    ]);

    return (
        <HomeContent
            subscribedProducts={searchResults}
            recommendedProducts={recommendedProducts}
            trendingEbooks={trendingEbooks}
            userSubscriptions={userSubscriptions}
            notifications={notifications}
            feedTitle={`Search Results for "${query}"`}
        />
    );
}
