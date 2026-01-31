import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getMarketplaceChannels, getUserSubscriptions, getUserNotifications } from '@/app/actions/homepage';
import MarketplaceContent from '@/components/marketplace/MarketplaceContent';

export const dynamic = 'force-dynamic';

export default async function MarketplacePage() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const [channels, userSubscriptions, notifications] = await Promise.all([
        getMarketplaceChannels(),
        userId ? getUserSubscriptions(userId) : [],
        userId ? getUserNotifications(userId) : []
    ]);

    return (
        <MarketplaceContent
            channels={channels}
            userSubscriptions={userSubscriptions}
            notifications={notifications}
        />
    );
}
