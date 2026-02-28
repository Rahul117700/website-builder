'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/product/ProductCard';
import { ProductCardData, SubscriptionData, NotificationData } from '@/app/actions/homepage';
import { FireIcon, MusicalNoteIcon, TrophyIcon, VideoCameraIcon, NewspaperIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import MobileTrendingWidget from '@/components/trending/MobileTrendingWidget';

interface TrendingContentProps {
    overallTrending: ProductCardData[];
    musicTrending: ProductCardData[];
    sportsTrending: ProductCardData[];
    gamingTrending: ProductCardData[];
    newsTrending: ProductCardData[];
    learningTrending: ProductCardData[];
    userSubscriptions?: SubscriptionData[];
    notifications?: NotificationData[];
}

export default function TrendingContent({
    overallTrending = [],
    musicTrending = [],
    sportsTrending = [],
    gamingTrending = [],
    newsTrending = [],
    learningTrending = [],
    userSubscriptions = [],
    notifications = []
}: TrendingContentProps) {
    const [activeTab, setActiveTab] = useState('overall');

    const tabs = [
        { id: 'overall', label: 'Overall', icon: FireIcon, color: 'text-orange-500', data: overallTrending },
        { id: 'music', label: 'Music', icon: MusicalNoteIcon, color: 'text-purple-500', data: musicTrending },
        { id: 'sports', label: 'Sports', icon: TrophyIcon, color: 'text-blue-500', data: sportsTrending },
        { id: 'gaming', label: 'Gaming', icon: VideoCameraIcon, color: 'text-emerald-500', data: gamingTrending },
        { id: 'news', label: 'News', icon: NewspaperIcon, color: 'text-red-500', data: newsTrending },
        { id: 'learning', label: 'Learning', icon: LightBulbIcon, color: 'text-yellow-500', data: learningTrending },
    ];

    const activeTabData = tabs.find(t => t.id === activeTab)?.data || [];

    return (
        <MainLayout
            userSubscriptions={userSubscriptions}
            notifications={notifications}
            isDarkTheme={true}
        >
            <div className="max-w-[1800px] mx-auto p-4 md:p-6 bg-[#141414] min-h-screen text-white">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FireIcon className="w-8 h-8 text-orange-500" />
                        Trending
                    </h1>
                    <p className="text-gray-400 mt-2">
                        The most popular products and videos across SellEarnDirect right now.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar border-b border-[#333]">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap ${isActive
                                    ? 'bg-white text-black shadow-lg scale-105'
                                    : 'bg-[#1a1a1a] text-gray-400 border border-[#333] hover:bg-[#2a2a2a]'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-black' : tab.color}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {activeTabData.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                        {activeTabData.map((product, index) => (
                            <React.Fragment key={product.id}>
                                <div className="w-full">
                                    <ProductCard {...product} isDarkTheme={true} />
                                </div>
                                {index === 1 && <MobileTrendingWidget items={activeTabData.slice(0, 5)} />}
                            </React.Fragment>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-[#1a1a1a] rounded-2xl border-2 border-dashed border-[#333]">
                        <FireIcon className="w-16 h-16 text-[#444] mb-4" />
                        <h3 className="text-xl font-bold text-gray-200 mb-2">No trending {activeTab} yet</h3>
                        <p className="text-gray-500 text-center max-w-md">
                            We're still gathering data for this category. Check back soon for the most popular content!
                        </p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
