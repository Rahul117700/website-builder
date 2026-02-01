import React from 'react';
import SearchResultsContent from '@/components/search/SearchResultsContent';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
    getRecommendedProducts,
    getUserSubscriptions,
    getUserNotifications,
    searchProducts,
    searchChannels
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
        products,
        channels,
        recommendedProducts,
        userSubscriptions,
        notifications
    ] = await Promise.all([
        searchProducts(query),
        searchChannels(query),
        getRecommendedProducts(),
        userId ? getUserSubscriptions(userId) : [],
        userId ? getUserNotifications(userId) : []
    ]);

    return (
        <SearchResultsContent
            query={query}
            products={products}
            channels={channels}
            recommendedProducts={recommendedProducts}
            userSubscriptions={userSubscriptions}
            notifications={notifications}
        />
    );
}
