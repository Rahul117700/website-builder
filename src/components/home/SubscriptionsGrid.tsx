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
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full bg-white shadow-sm transition-all"
                    />
                </div>
            </div>

            {filteredSubs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredSubs.map((sub) => (
                        <Link key={sub.channelId} href={`/channel/${sub.slug}`} className="group relative block">
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-indigo-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center h-full relative overflow-hidden">

                                {/* Decorative Background Blur */}
                                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                {/* Avatar */}
                                <div className="relative mb-4 z-10">
                                    <div className="p-1 rounded-full border-2 border-indigo-100 group-hover:border-indigo-300 transition-colors bg-white">
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
                                    <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md border border-gray-100" title="Notifications on">
                                        <BellIcon className="w-4 h-4 text-gray-900" />
                                    </div>
                                </div>

                                {/* Info */}
                                <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors z-10 line-clamp-1">{sub.channelName}</h3>

                                {/* Action Button */}
                                <div className="mt-auto pt-6 w-full z-10">
                                    <div className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-100 group-hover:bg-indigo-50 text-gray-700 group-hover:text-indigo-700 font-medium rounded-full text-sm transition-colors">
                                        <CheckCircleIcon className="w-5 h-5" />
                                        <span>Subscribed</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-gray-100 text-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 text-indigo-500 shadow-sm">
                        <UserPlusIcon className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No subscriptions found</h2>
                    <p className="text-gray-500 max-w-md mb-8">
                        Try adjusting your filters or explore new channels.
                    </p>
                    <Link href="/" className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-full shadow-lg hover:bg-indigo-700 transition-all">
                        Explore Channels
                    </Link>
                </div>
            )}
        </div>
    );
}
