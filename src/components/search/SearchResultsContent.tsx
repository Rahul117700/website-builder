'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/product/ProductCard';
import { ProductCardData, SubscriptionData, NotificationData } from '@/app/actions/homepage';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AdjustmentsHorizontalIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon,
    UsersIcon,
    VideoCameraIcon,
    InboxIcon,
    AcademicCapIcon,
    BookOpenIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import MobileTrendingWidget from '@/components/trending/MobileTrendingWidget';

interface SearchResultsContentProps {
    query: string;
    products: ProductCardData[];
    channels: any[];
    recommendedProducts: ProductCardData[];
    userSubscriptions: SubscriptionData[];
    notifications: NotificationData[];
}

export default function SearchResultsContent({
    query,
    products,
    channels,
    recommendedProducts,
    userSubscriptions,
    notifications
}: SearchResultsContentProps) {
    const [activeTab, setActiveTab] = useState('all');
    const [sortBy, setSortBy] = useState('relevance');
    const [priceFilter, setPriceFilter] = useState('all'); // all, free, premium

    const filteredProducts = products.filter(p => {
        // Tab filtering
        const typeMatch = activeTab === 'all' ||
            (activeTab === 'videos' && (p.type === 'VIDEO' || p.type === 'VIDEOS')) ||
            (activeTab === 'ebooks' && p.type === 'EBOOK') ||
            (activeTab === 'courses' && p.type === 'COURSE');

        if (!typeMatch) return false;

        // Price filtering
        if (priceFilter === 'free' && !p.isFree && p.price > 0) return false;
        if (priceFilter === 'premium' && (p.isFree || p.price === 0)) return false;

        return true;
    }).sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        // relevance is default from API (viewCount desc)
        return 0;
    });

    const displayChannels = (activeTab === 'all' || activeTab === 'channels') ? [...channels].sort((a, b) => {
        if (sortBy === 'subs') return b.subscribers - a.subscribers;
        return 0;
    }) : [];

    const displayProducts = activeTab === 'all' || activeTab !== 'channels' ? filteredProducts : [];

    const tabs = [
        { id: 'all', label: 'All Results', icon: MagnifyingGlassIcon },
        { id: 'channels', label: 'Channels', icon: UsersIcon },
        { id: 'videos', label: 'Videos', icon: VideoCameraIcon },
        { id: 'ebooks', label: 'E-Books', icon: BookOpenIcon },
        { id: 'courses', label: 'Courses', icon: AcademicCapIcon },
    ];

    const hasResults = displayChannels.length > 0 || displayProducts.length > 0;

    return (
        <MainLayout
            userSubscriptions={userSubscriptions}
            notifications={notifications}
            isDarkTheme={true}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#141414] min-h-screen text-white">
                {/* Search Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-[#333] pb-8">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm uppercase tracking-widest mb-2">
                            <MagnifyingGlassIcon className="w-4 h-4" />
                            <span>Search Results</span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">
                            Results for &quot;<span className="text-indigo-400">{query || 'Everything'}</span>&quot;
                        </h1>
                        <p className="mt-2 text-gray-400 font-medium">
                            Found {displayChannels.length} channels and {displayProducts.length} products
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={priceFilter}
                            onChange={(e) => setPriceFilter(e.target.value)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-xl text-sm font-bold text-gray-200 hover:bg-[#2a2a2a] transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="all">All Items</option>
                            <option value="free">Free Only</option>
                            <option value="premium">Premium Only</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-xl text-sm font-bold text-gray-200 hover:bg-[#2a2a2a] transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="relevance">Sort by: Relevance</option>
                            <option value="subs">Sort by: Subscribers</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Search Tabs */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white text-black shadow-xl scale-105'
                                : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a] border border-[#333]'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    {!hasResults ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-16"
                        >
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-24 h-24 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6">
                                    <MagnifyingGlassIcon className="w-12 h-12 text-[#444]" />
                                </div>
                                <h2 className="text-2xl font-black text-white mb-2">No matching results for &quot;{query}&quot;</h2>
                                <p className="text-gray-400 max-w-md mx-auto">
                                    We couldn&apos;t find anything matching your search. Try checking for typos or using broader keywords.
                                </p>
                            </div>

                            {recommendedProducts.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="h-px flex-1 bg-[#333]" />
                                        <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">
                                            Trending Content You Might Like
                                        </h3>
                                        <div className="h-px flex-1 bg-[#333]" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 sm:gap-2">
                                        {recommendedProducts.slice(0, 8).map((product, idx) => (
                                            <motion.div
                                                key={product.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                            >
                                                <ProductCard {...product} isDarkTheme={true} />
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-12"
                        >
                            {/* Channels Section */}
                            {displayChannels.length > 0 && (
                                <section>
                                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                                        <UsersIcon className="w-5 h-5 text-indigo-500" />
                                        Channels
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2">
                                        {displayChannels.map((channel, idx) => (
                                            <motion.div
                                                key={channel.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                            >
                                                <Link
                                                    href={`/channel/${channel.slug}`}
                                                    className="group bg-[#1a1a1a] p-5 rounded-2xl border border-[#333] shadow-sm hover:shadow-xl hover:border-[#444] transition-all flex items-center gap-5"
                                                >
                                                    <div className="relative w-16 h-16 flex-shrink-0">
                                                        {channel.avatar ? (
                                                            <Image
                                                                src={channel.avatar}
                                                                alt={channel.name}
                                                                fill
                                                                className="rounded-2xl object-cover ring-2 ring-[#333] group-hover:ring-[#555] transition-all"
                                                            />
                                                        ) : (
                                                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-inner">
                                                                {channel.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-[#1a1a1a] rounded-full flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                                        </div>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="font-black text-white group-hover:text-indigo-400 transition-colors truncate">
                                                            {channel.name}
                                                        </h4>
                                                        <p className="text-xs font-bold text-gray-400 mt-0.5">
                                                            @{channel.slug}
                                                        </p>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-indigo-900/30 text-indigo-400 rounded-lg">
                                                                {channel.subscribers} Subs
                                                            </span>
                                                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-[#2a2a2a] text-gray-400 rounded-lg">
                                                                {channel.productsCount} items
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Products Section */}
                            {displayProducts.length > 0 && (
                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                                            <InboxIcon className="w-5 h-5 text-indigo-500" />
                                            {activeTab === 'all' ? 'Marketplace Items' : tabs.find(t => t.id === activeTab)?.label}
                                        </h3>
                                        <span className="text-xs font-bold text-gray-400">
                                            Showing {displayProducts.length} items
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 sm:gap-2">
                                        {displayProducts.map((product, idx) => (
                                            <React.Fragment key={product.id}>
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: idx * 0.03 }}
                                                >
                                                    <div className="w-full">
                                                        <ProductCard {...product} isDarkTheme={true} />
                                                    </div>
                                                </motion.div>
                                                {idx === 1 && <MobileTrendingWidget items={recommendedProducts} />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </MainLayout>
    );
}
