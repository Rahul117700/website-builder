import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserSubscriptions } from '@/app/actions/homepage';
import HomeContent from '@/components/home/HomeContent';
import SubscriptionsGrid from '@/components/home/SubscriptionsGrid'; // We will create this client component

export default async function SubscriptionsPage() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
        // Redirect or show empty
        return (
            <HomeContent>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to see your subscriptions</h2>
                    <p className="text-gray-500 mb-6">You need to sign in to access your subscribed channels.</p>
                </div>
            </HomeContent>
        );
    }

    const subscriptions = await getUserSubscriptions(userId);

    // Fetch other data needed for HomeContent shell (notifications, userSubs for sidebar)
    // We reuse getUserSubscriptions for the sidebar list
    const sidebarSubscriptions = subscriptions;

    return (
        <HomeContent userSubscriptions={sidebarSubscriptions}>
            <div className="p-6">
                {subscriptions.length > 0 ? (
                    <>
                        <h1 className="text-2xl font-bold mb-6">All Subscriptions</h1>
                        <SubscriptionsGrid initialSubscriptions={subscriptions} />
                    </>
                ) : (
                    <SubscriptionsGrid initialSubscriptions={subscriptions} />
                )}
            </div>
        </HomeContent>
    );
}
