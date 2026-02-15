'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
    VideoCameraIcon,
    LightBulbIcon,
    BookOpenIcon,
    CodeBracketIcon,
    PhotoIcon,
    UserIcon,
    FireIcon,
    FolderIcon,
    HeartIcon,
    BookmarkIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import { ProductCardData, SubscriptionData, NotificationData } from '@/app/actions/homepage';
import ProductCard from '@/components/product/ProductCard';
import TrendingCarousel from '@/components/home/TrendingCarousel';
import MobileTrendingWidget from '@/components/trending/MobileTrendingWidget';

// Props Interface
interface HomeContentProps {
    subscribedProducts?: ProductCardData[];
    recommendedProducts?: ProductCardData[];
    trendingEbooks?: ProductCardData[];
    userSubscriptions?: SubscriptionData[];
    notifications?: NotificationData[];
    userChannelInfo?: { hasChannel: boolean; productCount: number } | null;
    children?: React.ReactNode;
}

export default function HomeContent({
    subscribedProducts = [],
    recommendedProducts = [],
    trendingEbooks = [],
    userSubscriptions = [],
    notifications = [],
    userChannelInfo = null,
    children
}: HomeContentProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState('All');

    const others = recommendedProducts.filter(p => p.type !== 'EBOOK' && p.type !== 'DOCUMENT');
    const documents = recommendedProducts.filter(p => p.type === 'DOCUMENT');

    const trendingItems = [...recommendedProducts, ...subscribedProducts]
        .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) // Unique
        .sort((a, b) => {
            // Prefer videos, then by views
            const aVal = (a.type === 'VIDEO' || a.type === 'VIDEOS') ? 10 : 0;
            const bVal = (b.type === 'VIDEO' || b.type === 'VIDEOS') ? 10 : 0;
            return bVal - aVal || (parseInt(b.views) || 0) - (parseInt(a.views) || 0);
        })
        .slice(0, 5);

    return (
        <MainLayout
            userSubscriptions={userSubscriptions}
            notifications={notifications}
        >
            {children ? (
                children
            ) : (
                <>

                    <div className="max-w-[1800px] mx-auto p-4 md:p-6">
                        {/* Live Activity Feed */}
                        <div className="mb-8 bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex items-center gap-4 overflow-hidden">
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold whitespace-nowrap">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                LIVE
                            </div>
                            <div className="flex-1 overflow-hidden relative h-6">
                                <div className="animate-marquee whitespace-nowrap flex gap-8 items-center text-sm text-gray-600 absolute top-0">
                                    {recommendedProducts.slice(0, 5).map((p, i) => (
                                        <span key={`ticker-${i}`} className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-gray-100 relative overflow-hidden">
                                                <Image src={p.channelAvatar} alt="" fill className="object-cover" />
                                            </span>
                                            <span className="font-medium text-gray-900">{p.channelName}</span>
                                            <span>just uploaded</span>
                                            <span className="font-medium text-indigo-600">{p.title}</span>
                                            <span className="text-gray-300">•</span>
                                        </span>
                                    ))}
                                    {/* Duplicate for infinite scroll effect */}
                                    {recommendedProducts.slice(0, 5).map((p, i) => (
                                        <span key={`ticker-dup-${i}`} className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-gray-100 relative overflow-hidden">
                                                <Image src={p.channelAvatar} alt="" fill className="object-cover" />
                                            </span>
                                            <span className="font-medium text-gray-900">{p.channelName}</span>
                                            <span>just uploaded</span>
                                            <span className="font-medium text-indigo-600">{p.title}</span>
                                            <span className="text-gray-300">•</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-8">
                            {/* Main Content Column - Full Width */}
                            <div className="flex-1 min-w-0 space-y-10">


                                {/* Section: From Your Subscriptions */}
                                {session && subscribedProducts.length > 0 && (
                                    <section>
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <UserIcon className="w-6 h-6 text-indigo-600" />
                                            From Your Subscriptions
                                        </h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 sm:gap-x-4 gap-y-6 sm:gap-y-8">
                                            {subscribedProducts.map((product, index) => (
                                                <React.Fragment key={product.id}>
                                                    <ProductCard {...product} />
                                                    {index === 0 && <MobileTrendingWidget items={trendingItems} />}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Section: Recommended */}
                                {others.length > 0 ? (
                                    <section>
                                        {/* Conditional Banner - Only show if user has NO channel/products */}
                                        {subscribedProducts.length === 0 && (!userChannelInfo?.hasChannel || userChannelInfo?.productCount === 0) && (
                                            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100">
                                                <div className="flex-1">
                                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                                                        Want to earn money? <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Start selling your skills!</span>
                                                    </h2>
                                                    <p className="text-sm text-gray-600">
                                                        Sell courses, PDFs, videos. <span className="font-semibold text-indigo-600">100% money is yours - zero fees!</span>
                                                    </p>
                                                </div>
                                                <Link
                                                    href="/auth/dashboard/my-channel"
                                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm whitespace-nowrap"
                                                >
                                                    <span>Start Selling - Free!</span>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        )}

                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <FireIcon className="w-6 h-6 text-orange-500" />
                                            Recommended for You
                                        </h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 sm:gap-x-4 gap-y-6 sm:gap-y-8">
                                            {others.map((product, index) => (
                                                <React.Fragment key={product.id}>
                                                    <ProductCard {...product} />
                                                    {subscribedProducts.length === 0 && index === 0 && <MobileTrendingWidget items={trendingItems} />}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </section>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                                        <p className="text-gray-500">No products found yet. Check back later!</p>
                                    </div>
                                )}

                                {/* Section: Popular Ebooks (Side Scroll) */}
                                {trendingEbooks.length > 0 && (
                                    <section className="bg-gray-50 -mx-4 md:-mx-6 px-4 md:px-6 py-8 border-y border-gray-100">
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <BookOpenIcon className="w-6 h-6 text-emerald-600" />
                                            Trending Reads
                                        </h2>
                                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                            {trendingEbooks.map((product) => (
                                                <div key={product.id} className="min-w-[200px] w-[200px] flex-shrink-0">
                                                    <Link href={`/channel/${product.channelSlug}/products/${product.id}`} className="block group">
                                                        <div className="aspect-[3/4] bg-gray-200 rounded-lg shadow-md mb-3 overflow-hidden transition-transform hover:-translate-y-1 relative cursor-pointer">
                                                            <Image
                                                                src={product.thumbnail}
                                                                alt={product.title}
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                            {product.isSubscriberOnly ? (
                                                                <div className="absolute top-2 right-2 bg-indigo-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm backdrop-blur-md">
                                                                    Sub
                                                                </div>
                                                            ) : (product.isFree || product.price === 0) && (
                                                                <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                                                    Free
                                                                </div>
                                                            )}
                                                        </div>
                                                        <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-emerald-600 transition-colors">{product.title}</h3>
                                                        <p className="text-xs text-gray-500">{product.channelName}</p>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Section: Documents (Side Scroll) */}
                                {documents.length > 0 && (
                                    <section className="bg-white -mx-4 md:-mx-6 px-4 md:px-6 py-8 border-t border-gray-100">
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <FolderIcon className="w-6 h-6 text-blue-600" />
                                            Documents & Resources
                                        </h2>
                                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                            {documents.map((product) => (
                                                <div key={product.id} className="min-w-[200px] w-[200px] flex-shrink-0">
                                                    <Link href={`/channel/${product.channelSlug}/products/${product.id}`}>
                                                        <div className="aspect-[3/4] bg-gray-100 rounded-xl shadow-sm border border-gray-200 mb-3 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md relative group flex flex-col items-center justify-center">
                                                            {/* Document Preview/Icon */}
                                                            {product.thumbnail && product.thumbnail !== '/placeholder-product.jpg' ? (
                                                                <Image
                                                                    src={product.thumbnail}
                                                                    alt={product.title}
                                                                    fill
                                                                    className="object-cover"
                                                                    unoptimized
                                                                />
                                                            ) : (
                                                                <div className="p-4 text-gray-400">
                                                                    <FolderIcon className="w-16 h-16" />
                                                                </div>
                                                            )}

                                                            {product.isSubscriberOnly ? (
                                                                <div className="absolute top-2 right-2 bg-indigo-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm backdrop-blur-md">
                                                                    Sub
                                                                </div>
                                                            ) : (product.isFree || product.price === 0) && (
                                                                <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                                                    Free
                                                                </div>
                                                            )}
                                                        </div>
                                                        <h3 className="font-semibold text-sm line-clamp-2 mb-1 text-gray-900 group-hover:text-blue-600 transition-colors">{product.title}</h3>
                                                        <p className="text-xs text-gray-500">{product.channelName}</p>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>

                    </div>
                </>
            )}
        </MainLayout>
    );
}
