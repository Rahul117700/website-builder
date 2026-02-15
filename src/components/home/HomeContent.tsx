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
    children?: React.ReactNode;
}

export default function HomeContent({
    subscribedProducts = [],
    recommendedProducts = [],
    trendingEbooks = [],
    userSubscriptions = [],
    notifications = [],
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
                        <div className="flex flex-col xl:flex-row gap-8">
                            {/* Main Content Column */}
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
                                        {/* Sleek Header - Only show if user has no subscriptions */}
                                        {subscribedProducts.length === 0 && (
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

                            {/* Right Sidebar Column */}
                            <div className="hidden xl:block w-[350px] flex-shrink-0">
                                <div className="sticky top-24 space-y-6">
                                    {/* Trending Widget */}
                                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                            </span>
                                            Trending Now
                                        </h3>

                                        {(() => {
                                            // Get top 5 trending products (prefer videos)
                                            const trendingItems = [...recommendedProducts, ...subscribedProducts]
                                                .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) // Unique
                                                .sort((a, b) => {
                                                    // Prefer videos, then by views
                                                    const aVal = (a.type === 'VIDEO' || a.type === 'VIDEOS') ? 10 : 0;
                                                    const bVal = (b.type === 'VIDEO' || b.type === 'VIDEOS') ? 10 : 0;
                                                    return bVal - aVal || (parseInt(b.views) || 0) - (parseInt(a.views) || 0);
                                                })
                                                .slice(0, 5);

                                            if (trendingItems.length === 0) return (
                                                <div className="aspect-[4/5] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                                    No content trending
                                                </div>
                                            );

                                            return <TrendingCarousel items={trendingItems} />;
                                        })()}
                                    </div>

                                    {/* Mini Suggestions */}
                                    <div
                                        className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group cursor-pointer active:scale-95 transition-transform"
                                        onClick={() => router.push('/auth/dashboard/my-channel')}
                                    >
                                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

                                        <h3 className="font-black text-lg mb-1 relative z-10">Creator Fund</h3>
                                        <p className="text-indigo-100 text-xs font-medium mb-4 relative z-10 leading-relaxed">Join our creator program, add products, and start earning today.</p>
                                        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest relative z-10">
                                            <span>Get Started</span>
                                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </>
            )}
        </MainLayout>
    );
}
