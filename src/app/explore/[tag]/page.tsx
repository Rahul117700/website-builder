import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getProductsByTag, getUserSubscriptions, getUserNotifications } from '@/app/actions/homepage';
import ExploreContent from '@/components/explore/ExploreContent';

export const dynamic = 'force-dynamic';

export default async function ExploreTagPage({ params }: { params: { tag: string } }) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const tag = params.tag;

    const [products, userSubscriptions, notifications] = await Promise.all([
        getProductsByTag(tag, userId),
        userId ? getUserSubscriptions(userId) : [],
        userId ? getUserNotifications(userId) : []
    ]);

    return (
        <ExploreContent
            tag={tag}
            products={products}
            userSubscriptions={userSubscriptions}
            notifications={notifications}
        />
    );
}
