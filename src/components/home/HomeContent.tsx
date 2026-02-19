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
    ArrowRightIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import { ProductCardData, SubscriptionData, NotificationData } from '@/app/actions/homepage';
import ProductCard from '@/components/product/ProductCard';
import TrendingCarousel from '@/components/home/TrendingCarousel';
import VerticalDocumentCarousel from '@/components/home/VerticalDocumentCarousel';
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

    // Filter Logic
    const others = recommendedProducts.filter(p => p.type !== 'EBOOK' && p.type !== 'DOCUMENT');
    const documents = recommendedProducts.filter(p => p.type === 'DOCUMENT');
    const videos = others.filter(p => p.type === 'VIDEO' || p.type === 'VIDEOS' || p.type === 'COURSE');

    // Trending Logic
    const trendingItems = [...recommendedProducts, ...subscribedProducts]
        .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) // Unique
        .sort((a, b) => {
            const aVal = (a.type === 'VIDEO' || a.type === 'VIDEOS') ? 10 : 0;
            const bVal = (b.type === 'VIDEO' || b.type === 'VIDEOS') ? 10 : 0;
            return bVal - aVal || (parseInt(b.views) || 0) - (parseInt(a.views) || 0);
        })
        .slice(0, 5);

    const spotlightItem = trendingItems[0];
    const upNextItems = trendingItems.slice(1, 4);

    return (
        <MainLayout
            userSubscriptions={userSubscriptions}
            notifications={notifications}
        >
            {children ? (
                children
            ) : (
                <div className="min-h-screen bg-[#F9FAFB] pb-20">

                    {/* Live Activity Feed - Sleek Bar */}
                    <div className="bg-white border-b border-gray-100 overflow-hidden relative h-10 flex items-center z-20">
                        <div className="absolute left-0 z-10 h-full bg-gradient-to-r from-white via-white to-transparent px-4 flex items-center">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold border border-red-100 shadow-sm">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                </span>
                                LIVE
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden relative h-full flex items-center">
                            <div className="animate-marquee whitespace-nowrap flex gap-8 items-center text-xs text-gray-500 absolute pl-24">
                                {recommendedProducts.slice(0, 8).map((p, i) => (
                                    <span key={`ticker-${i}`} className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-gray-200 relative overflow-hidden">
                                            <Image src={p.channelAvatar} alt="" fill className="object-cover" />
                                        </div>
                                        <span className="font-semibold text-gray-700">{p.channelName}</span>
                                        <span>posted</span>
                                        <span className="font-medium text-indigo-600">{p.title}</span>
                                        <span className="text-gray-300">•</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 1. Hero Spotlight Section - Dark Theme Row */}
                    {spotlightItem && (
                        <div className="w-full bg-[#050505] py-6 sm:py-10 mb-2 border-b border-gray-900 shadow-2xl relative z-10">
                            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                            Featured <span className="text-gray-600 font-normal">&</span> Trending
                                        </h2>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-500 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                        <SparklesIcon className="w-4 h-4 text-yellow-500" />
                                        <span>Curated for you</span>
                                    </div>
                                </div>

                                <section className="grid grid-cols-12 gap-3 sm:gap-6 lg:gap-8 items-stretch">
                                    {/* Main Hero Card - 70% width on all screens */}
                                    <div className="col-span-8 group cursor-pointer relative rounded-2xl overflow-hidden aspect-square lg:aspect-[4/1] shadow-2xl ring-1 ring-white/10" onClick={() => router.push(spotlightItem.price === 0 || spotlightItem.hasAccess ? `/channel/${spotlightItem.channelSlug}/products/${spotlightItem.id}` : `/channel/${spotlightItem.channelSlug}`)}>
                                        {(spotlightItem.type === 'VIDEO' || spotlightItem.type === 'VIDEOS') && spotlightItem.videoUrl ? (
                                            <video
                                                src={spotlightItem.videoUrl}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                            />
                                        ) : (
                                            <Image src={spotlightItem.thumbnail} alt={spotlightItem.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-8 flex flex-col items-start gap-2 sm:gap-4">
                                            <span className="px-2 sm:px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full border border-white/10 flex items-center gap-2">
                                                <SparklesIcon className="w-3 h-3 text-yellow-300" />
                                                Featured
                                            </span>
                                            <h1 className="text-sm sm:text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-sm max-w-2xl text-balance line-clamp-2 sm:line-clamp-none">
                                                {spotlightItem.title}
                                            </h1>
                                            <div className="hidden sm:flex items-center gap-3 text-white/90 text-sm font-medium">
                                                <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden relative ring-2 ring-white/20">
                                                    <Image src={spotlightItem.channelAvatar} alt="" fill className="object-cover" />
                                                </div>
                                                <span className="text-white font-bold">{spotlightItem.channelName}</span>
                                                <span className="opacity-50">•</span>
                                                <span>{spotlightItem.views} views</span>
                                            </div>
                                        </div>
                                        {/* Play Button Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
                                                <VideoCameraIcon className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Up Next List / Trending Carousel - 30% width on all screens */}
                                    <div className="col-span-4 h-full">
                                        <TrendingCarousel items={upNextItems} isCompact={false} className="h-full w-full shadow-none ring-1 ring-white/10" />
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

                        {/* 2. From Subscriptions (if any) */}
                        {session && subscribedProducts.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 tracking-tight">
                                        <UserIcon className="w-6 h-6 text-indigo-600" />
                                        From Your Subscriptions
                                    </h2>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6">
                                    {subscribedProducts.map((product) => (
                                        <ProductCard key={product.id} {...product} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* CTA Banner - Separator */}
                        {subscribedProducts.length === 0 && (!userChannelInfo?.hasChannel || userChannelInfo?.productCount === 0) && (
                            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-6 sm:p-10 relative overflow-hidden shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-8 isolate ring-1 ring-white/10">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[150%] bg-indigo-500/30 blur-[100px] rounded-full pointer-events-none"></div>

                                <div className="relative z-10 text-center sm:text-left">
                                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Start Your Creator Journey</h2>
                                    <p className="text-indigo-200 text-sm sm:text-base max-w-xl">
                                        Create your own store in minutes. Sell courses, PDFs, and videos. <strong className="text-white">Keep 100% of your earnings.</strong>
                                    </p>
                                </div>
                                <Link
                                    href="/auth/dashboard/my-channel"
                                    className="relative z-10 px-8 py-3.5 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
                                >
                                    Create Channel
                                </Link>
                            </div>
                        )}

                        {/* 3. Recommended Grid (Main) */}
                        <section>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 tracking-tight">
                                    <LightBulbIcon className="w-6 h-6 text-amber-500" />
                                    Recommended for You
                                </h2>
                                <div className="flex gap-2 bg-white rounded-full p-1 border border-gray-200 shadow-sm self-start sm:self-auto">
                                    {['All', 'Videos', 'Docs'].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${activeCategory === cat ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {activeCategory === 'All' ? (
                                <div className="flex flex-col xl:flex-row gap-8">
                                    {/* 70% Column - Videos */}
                                    <div className="w-full xl:w-[70%] space-y-6">
                                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <VideoCameraIcon className="w-5 h-5 text-gray-400" />
                                                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Videos</h3>
                                            </div>
                                            <button
                                                onClick={() => setActiveCategory('Videos')}
                                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                            >
                                                View All
                                            </button>
                                        </div>
                                        {videos.length > 0 ? (
                                            <>
                                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                                    {videos.slice(0, 50).map((product) => (
                                                        <ProductCard key={product.id} {...product} />
                                                    ))}
                                                </div>
                                                {videos.length > 50 && (
                                                    <div className="flex justify-center pt-2">
                                                        <button
                                                            onClick={() => setActiveCategory('Videos')}
                                                            className="px-6 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                                                        >
                                                            Show All Videos ({videos.length})
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                <p className="text-gray-400 text-sm">No videos available</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* 30% Column - Documents (Compact & Sticky) */}
                                    <div className="w-full xl:w-[30%] flex flex-col h-[500px] sticky top-24 self-start">
                                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 bg-[#F9FAFB] z-10">
                                            <div className="flex items-center gap-2">
                                                <FolderIcon className="w-5 h-5 text-gray-400" />
                                                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Documents</h3>
                                            </div>
                                            <button
                                                onClick={() => setActiveCategory('Docs')}
                                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                            >
                                                View All
                                            </button>
                                        </div>

                                        {documents.length > 0 ? (
                                            <VerticalDocumentCarousel items={documents} />
                                        ) : (
                                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                <p className="text-gray-400 text-sm">No documents available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* Filtered View */
                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6">
                                    {(activeCategory === 'Videos' ? videos : documents).length > 0 ? (
                                        (activeCategory === 'Videos' ? videos : documents).map((product) => (
                                            <ProductCard key={product.id} {...product} />
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                                {activeCategory === 'Videos' ? <VideoCameraIcon className="w-8 h-8" /> : <FolderIcon className="w-8 h-8" />}
                                            </div>
                                            <p className="text-gray-500 font-medium">No {activeCategory.toLowerCase()} found.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* 4. Trending Videos - Section Removed per user request */}

                        {/* 5. Resources / Ebooks Grid */}
                        {trendingEbooks.length > 0 && (
                            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Ebooks */}
                                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/50">
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <BookOpenIcon className="w-6 h-6 text-emerald-600" />
                                        Popular Reads
                                    </h3>
                                    <div className="flex flex-col gap-5">
                                        {trendingEbooks.slice(0, 3).map(book => (
                                            <div key={book.id} className="flex gap-4 group cursor-pointer" onClick={() => router.push(`/channel/${book.channelSlug}/products/${book.id}`)}>
                                                <div className="w-20 h-28 bg-gray-100 rounded-lg shadow-md border border-gray-200 relative flex-shrink-0 overflow-hidden group-hover:-translate-y-1 transition-transform">
                                                    <Image src={book.thumbnail} alt="" fill className="object-cover" unoptimized />
                                                </div>
                                                <div className="flex-1 py-1">
                                                    <h4 className="font-bold text-base text-gray-900 leading-tight group-hover:text-emerald-600 transition-colors mb-2">{book.title}</h4>
                                                    <p className="text-xs text-gray-500 mb-2">{book.channelName}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                                                            {book.price === 0 ? 'Free' : `₹${book.price}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                    </div>
                </div>
            )}
        </MainLayout>
    );
}
