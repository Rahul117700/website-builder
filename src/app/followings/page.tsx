import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserFollows, getUserSubscriptions } from '@/app/actions/homepage';
import HomeContent from '@/components/home/HomeContent';
import FollowingsGrid from '@/components/home/FollowingsGrid';
import Link from 'next/link';

export default async function FollowingsPage() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
        return (
            <HomeContent>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Sign in to see your followings</h2>
                    <p className="text-gray-400 mb-6">You need to sign in to see the channels you follow.</p>
                    <Link href="/auth/signin" className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                        Sign In
                    </Link>
                </div>
            </HomeContent>
        );
    }

    const [follows, userSubscriptions] = await Promise.all([
        getUserFollows(userId),
        getUserSubscriptions(userId),
    ]);

    return (
        <HomeContent userSubscriptions={userSubscriptions} userFollows={follows}>
            <div className="p-4 sm:p-6 pt-20 sm:pt-20 min-h-screen bg-[#141414]">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-3 mb-8 pt-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">My Followings</h1>
                            <p className="text-gray-400 text-sm">{follows.length} channel{follows.length !== 1 ? 's' : ''} followed</p>
                        </div>
                    </div>
                    <FollowingsGrid follows={follows} />
                </div>
            </div>
        </HomeContent>
    );
}
