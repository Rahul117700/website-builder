'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBagIcon, UserGroupIcon, CubeIcon, MagnifyingGlassIcon, SparklesIcon, TicketIcon } from '@heroicons/react/24/outline';
import { SubscriptionData, NotificationData } from '@/app/actions/homepage';

interface ChannelData {
    id: string;
    name: string;
    slug: string;
    avatar: string;
    subscribers: number;
    productsCount: number;
    freeProductsCount: number;
    subscriberProductsCount: number;
    subscriptionEnabled: boolean;
    subscriptionPrice: number | null;
    subscriptionCurrency: string;
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
            isDarkTheme={true}
        >
            <div className="max-w-[1800px] mx-auto p-3 sm:p-4 md:p-6 bg-[#141414] min-h-screen text-white">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-3xl font-black flex items-center gap-2 sm:gap-3 tracking-tight text-white">
                        <ShoppingBagIcon className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500" />
                        Marketplace
                    </h1>
                    <p className="text-xs sm:text-base text-gray-400 mt-1 sm:mt-2 font-medium">
                        Discover and connect with top creators and their premium content.
                    </p>
                </div>

                {channels.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 sm:gap-2">
                        {channels.map((channel) => (
                            <Link
                                key={channel.id}
                                href={`/channel/${channel.slug}`}
                                className="group bg-[#1a1a1a] rounded-2xl p-4 sm:p-6 border border-[#333] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-row items-center sm:flex-col sm:items-center text-left sm:text-center gap-4 sm:gap-0 hover:border-[#444] hover:-translate-y-1"
                            >
                                <div className="relative w-16 h-16 sm:w-24 sm:h-24 sm:mb-4 flex-shrink-0">
                                    <div className="absolute inset-0 bg-indigo-100 rounded-full opacity-50"></div>
                                    {channel.avatar ? (
                                        <Image
                                            src={channel.avatar}
                                            alt={channel.name}
                                            fill
                                            className="rounded-full object-cover border-2 sm:border-4 border-white shadow-md relative z-10"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 sm:border-4 border-white shadow-md flex items-center justify-center text-white font-black text-xl sm:text-3xl relative z-10">
                                            {channel.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:items-center">
                                        <h3 className="text-base sm:text-lg font-bold group-hover:text-indigo-400 text-white transition-colors mb-0.5 sm:mb-2 truncate w-full">
                                            {channel.name}
                                        </h3>

                                        <p className="text-[11px] sm:text-sm text-gray-400 line-clamp-1 sm:line-clamp-2 mb-2 sm:mb-4 h-auto sm:h-10 leading-tight">
                                            {channel.description || 'No bio available.'}
                                        </p>

                                        {channel.subscriptionEnabled && channel.subscriptionPrice && (
                                            <div className="mb-3 sm:mb-4 px-2 sm:px-3 py-0.5 sm:py-1 bg-indigo-900/30 text-indigo-300 rounded-full text-[10px] sm:text-xs font-bold border border-indigo-500/30 w-fit">
                                                Sub: {channel.subscriptionCurrency} {channel.subscriptionPrice}/mo
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:gap-2 w-full pt-2 sm:pt-4 border-t border-[#333] mt-auto">
                                            <div className="flex items-center gap-1.5 sm:justify-center">
                                                <UserGroupIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                                <div className="flex flex-col sm:items-center">
                                                    <span className="text-[11px] sm:text-xs font-bold text-gray-200 leading-none">{formatNumber(channel.subscribers)}</span>
                                                    <span className="text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase tracking-tighter sm:tracking-wider">Subs</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 sm:justify-center">
                                                <CubeIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                <div className="flex flex-col sm:items-center">
                                                    <span className="text-[11px] sm:text-xs font-bold text-gray-200 leading-none">{channel.productsCount}</span>
                                                    <span className="text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase tracking-tighter sm:tracking-wider">Assets</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 sm:justify-center">
                                                <TicketIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                <div className="flex flex-col sm:items-center">
                                                    <span className="text-[11px] sm:text-xs font-bold text-gray-200 leading-none">{channel.freeProductsCount}</span>
                                                    <span className="text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase tracking-tighter sm:tracking-wider">Free</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 sm:justify-center">
                                                <SparklesIcon className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                                <div className="flex flex-col sm:items-center">
                                                    <span className="text-[11px] sm:text-xs font-bold text-gray-200 leading-none">{channel.subscriberProductsCount}</span>
                                                    <span className="text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase tracking-tighter sm:tracking-wider">Premium</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-[#1a1a1a] rounded-3xl border-2 border-dashed border-[#333]">
                        <UserGroupIcon className="w-20 h-20 text-[#444] mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Finding Channels...</h3>
                        <p className="text-gray-400">Wait a moment while we fetch the best creators for you.</p>
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
