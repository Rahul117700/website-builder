import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserSubscriptions } from '@/app/actions/homepage';
import HomeContent from '@/components/home/HomeContent';
import SubscriptionsGrid from '@/components/home/SubscriptionsGrid';
import Link from 'next/link';

export default async function SubscriptionsPage() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
        return (
            <HomeContent>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Sign in to see your subscriptions</h2>
                    <p className="text-gray-400 mb-6">You need to sign in to access your subscribed channels.</p>
                    <Link href="/auth/signin" className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                        Sign In
                    </Link>
                </div>
            </HomeContent>
        );
    }

    const subscriptions = await getUserSubscriptions(userId);

    return (
        <HomeContent userSubscriptions={subscriptions}>
            <div className="p-4 sm:p-6 pt-20 sm:pt-20 min-h-screen bg-[#141414]">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-3 mb-8 pt-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">My Subscriptions</h1>
                            <p className="text-gray-400 text-sm">{subscriptions.length} active subscription{subscriptions.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <SubscriptionsGrid initialSubscriptions={subscriptions} />
                </div>
            </div>
        </HomeContent>
    );
}
