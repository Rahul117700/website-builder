'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    BellIcon,
    CheckCircleIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    UserPlusIcon
} from '@heroicons/react/24/solid';
import { SubscriptionData } from '@/app/actions/homepage';

export default function SubscriptionsGrid({ initialSubscriptions }: { initialSubscriptions: SubscriptionData[] }) {
    const [filter, setFilter] = useState('');

    const filteredSubs = initialSubscriptions.filter(sub =>
        sub.channelName.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div>
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="relative group w-full max-w-md">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Filter"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-[#333] rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full bg-[#1a1a1a] text-white placeholder-gray-500 shadow-sm transition-all"
                    />
                </div>
            </div>

            {filteredSubs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                    {filteredSubs.map((sub) => (
                        <Link key={sub.channelId} href={`/channel/${sub.slug}`} className="group relative block">
                            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#333] hover:border-[#555] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center h-full relative overflow-hidden">

                                {/* Decorative Background Blur */}
                                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-indigo-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                {/* Avatar */}
                                <div className="relative mb-4 z-10">
                                    <div className="p-1 rounded-full border-2 border-[#333] group-hover:border-indigo-500/50 transition-colors bg-[#1a1a1a]">
                                        <div className="relative w-24 h-24 rounded-full overflow-hidden">
                                            <Image
                                                src={sub.channelAvatar || '/placeholder-avatar.jpg'}
                                                alt={sub.channelName}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-1 right-1 bg-[#2a2a2a] rounded-full p-1 shadow-md border border-[#444]" title="Notifications on">
                                        <BellIcon className="w-4 h-4 text-white" />
                                    </div>
                                </div>

                                {/* Info */}
                                <h3 className="font-bold text-lg text-white mb-1 group-hover:text-indigo-400 transition-colors z-10 line-clamp-1">{sub.channelName}</h3>

                                {/* Action Button */}
                                <div className="mt-auto pt-6 w-full z-10">
                                    <div className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#2a2a2a] group-hover:bg-indigo-900/30 text-gray-300 group-hover:text-indigo-400 font-medium rounded-full text-sm transition-colors border border-transparent group-hover:border-indigo-500/30">
                                        <CheckCircleIcon className="w-5 h-5" />
                                        <span>Subscribed</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-indigo-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">No subscriptions found</h2>
                    <p className="text-gray-400 text-sm mb-6 max-w-xs">
                        Subscribe to a channel to unlock premium content and see it here.
                    </p>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors"
                    >
                        Explore Channels
                    </Link>
                </div>
            )}
        </div>
    );
}
