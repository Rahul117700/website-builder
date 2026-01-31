'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBagIcon, UserGroupIcon, CubeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { SubscriptionData, NotificationData } from '@/app/actions/homepage';

interface ChannelData {
    id: string;
    name: string;
    slug: string;
    avatar: string;
    subscribers: number;
    productsCount: number;
    description: string;
}

interface MarketplaceContentProps {
    channels: ChannelData[];
    userSubscriptions?: SubscriptionData[];
    notifications?: NotificationData[];
}

export default function MarketplaceContent({
    channels = [],
    userSubscriptions = [],
    notifications = []
}: MarketplaceContentProps) {
    return (
        <MainLayout
            userSubscriptions={userSubscriptions}
            notifications={notifications}
        >
            <div className="max-w-[1800px] mx-auto p-4 md:p-6 text-gray-900">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ShoppingBagIcon className="w-8 h-8 text-indigo-600" />
                        Marketplace
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Discover and connect with top creators and their premium content.
                    </p>
                </div>

                {channels.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {channels.map((channel) => (
                            <Link
                                key={channel.id}
                                href={`/channel/${channel.slug}`}
                                className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center"
                            >
                                <div className="relative w-24 h-24 mb-4">
                                    <div className="absolute inset-0 bg-indigo-100 rounded-full animate-pulse group-hover:animate-none opacity-50"></div>
                                    <Image
                                        src={channel.avatar || '/placeholder-user.jpg'}
                                        alt={channel.name}
                                        fill
                                        className="rounded-full object-cover border-4 border-white shadow-md relative z-10"
                                        unoptimized
                                    />
                                </div>

                                <h3 className="text-lg font-bold group-hover:text-indigo-600 transition-colors mb-2">
                                    {channel.name}
                                </h3>

                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                                    {channel.description || 'No bio available.'}
                                </p>

                                <div className="flex items-center gap-4 w-full pt-4 border-t border-gray-50 mt-auto">
                                    <div className="flex-1 text-center">
                                        <div className="flex items-center justify-center gap-1 text-gray-900 font-bold mb-0.5">
                                            <UserGroupIcon className="w-4 h-4 text-indigo-500" />
                                            {formatNumber(channel.subscribers)}
                                        </div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Subscribers</div>
                                    </div>
                                    <div className="w-px h-8 bg-gray-100"></div>
                                    <div className="flex-1 text-center">
                                        <div className="flex items-center justify-center gap-1 text-gray-900 font-bold mb-0.5">
                                            <CubeIcon className="w-4 h-4 text-purple-500" />
                                            {channel.productsCount}
                                        </div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Products</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <UserGroupIcon className="w-20 h-20 text-gray-300 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Finding Channels...</h3>
                        <p className="text-gray-500">Wait a moment while we fetch the best creators for you.</p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}
