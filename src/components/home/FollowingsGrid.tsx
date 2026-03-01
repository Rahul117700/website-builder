'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { SubscriptionData } from '@/app/actions/homepage';

export default function FollowingsGrid({ follows }: { follows: SubscriptionData[] }) {
    const [filter, setFilter] = useState('');

    const filtered = follows.filter(f =>
        f.channelName.toLowerCase().includes(filter.toLowerCase())
    );

    if (follows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-emerald-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">No followings yet</h2>
                <p className="text-gray-400 text-sm mb-6 max-w-xs">
                    Follow channels to stay updated with their latest content and see it right here.
                </p>
                <Link
                    href="/"
                    className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition-colors"
                >
                    Explore Channels
                </Link>
            </div>
        );
    }

    return (
        <div>
            {/* Search */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="relative group w-full max-w-md">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Filter channels..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-[#333] rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full bg-[#1a1a1a] text-white placeholder-gray-500 shadow-sm transition-all"
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    No channels match &quot;{filter}&quot;
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filtered.map((follow) => (
                        <Link key={follow.channelId} href={`/channel/${follow.slug}`} className="group relative block">
                            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#333] hover:border-emerald-500/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center h-full relative overflow-hidden">
                                {/* Hover glow */}
                                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-emerald-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Avatar */}
                                <div className="relative mb-4 z-10">
                                    <div className="p-1 rounded-full border-2 border-[#333] group-hover:border-emerald-500/50 transition-colors bg-[#1a1a1a]">
                                        <div className="relative w-24 h-24 rounded-full overflow-hidden">
                                            {follow.channelAvatar ? (
                                                <Image
                                                    src={follow.channelAvatar}
                                                    alt={follow.channelName}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-3xl">
                                                    {follow.channelName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Channel Name */}
                                <h3 className="font-bold text-lg text-white mb-1 group-hover:text-emerald-400 transition-colors z-10 line-clamp-1">
                                    {follow.channelName}
                                </h3>

                                {/* Following badge */}
                                <div className="mt-auto pt-6 w-full z-10">
                                    <div className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#2a2a2a] group-hover:bg-emerald-900/30 text-gray-300 group-hover:text-emerald-400 font-medium rounded-full text-sm transition-colors border border-transparent group-hover:border-emerald-500/30">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Following</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
