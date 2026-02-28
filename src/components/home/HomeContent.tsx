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
    SparklesIcon,
    ChevronLeftIcon,
    ChevronRightIcon
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
    userChannelInfo?: { hasChannel: boolean; productCount: number; totalEarnings?: number } | null;
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
    const [activeCategory, setActiveCategory] = useState('Videos');

    // Slider ref
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = current.clientWidth * 0.8;
            current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    // Filter Logic - Memoized for performance
    const { others, documents, videos, trendingItems } = React.useMemo(() => {
        const others = recommendedProducts.filter(p => p.type !== 'EBOOK' && p.type !== 'DOCUMENT');
        const documents = recommendedProducts.filter(p => p.type === 'DOCUMENT');
        const videos = others.filter(p => p.type === 'VIDEO' || p.type === 'VIDEOS' || p.type === 'COURSE');

        const trendingItems = [...recommendedProducts, ...subscribedProducts]
            .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) // Unique
            .sort((a, b) => {
                if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
                const aVal = (a.type === 'VIDEO' || a.type === 'VIDEOS') ? 10 : 0;
                const bVal = (b.type === 'VIDEO' || b.type === 'VIDEOS') ? 10 : 0;
                return bVal - aVal || (parseInt(b.views) || 0) - (parseInt(a.views) || 0);
            })
            .slice(0, 15);

        return { others, documents, videos, trendingItems };
    }, [recommendedProducts, subscribedProducts]);

    const spotlightItem = trendingItems[0];
    const upNextItems = trendingItems.slice(1, 11);

    return (
        <MainLayout
            userSubscriptions={userSubscriptions}
            notifications={notifications}
            isDarkTheme={true}
            noPaddingTop={true}
        >
            {children ? (
                children
            ) : (
                <div className="min-h-screen bg-[#141414] pb-20">

                    {/* 1. Hero Spotlight Section - Netflix Style */}
                    {spotlightItem && (
                        <div className="w-full relative h-[65vh] lg:h-[85vh] min-h-[500px] flex flex-col justify-end pb-12 sm:pb-24 z-10 isolate mt-[-56px] lg:mt-0">
                            {/* Absolute Background Image/Video */}
                            <div className="absolute inset-0 z-[-2] bg-[#141414]">
                                <Image
                                    src={spotlightItem.thumbnail}
                                    alt={spotlightItem.title}
                                    fill
                                    className="object-cover opacity-100"
                                    unoptimized
                                    priority
                                />
                                {(spotlightItem.type === 'VIDEO' || spotlightItem.type === 'VIDEOS' || spotlightItem.type === 'COURSE') && spotlightItem.videoUrl && (
                                    <video
                                        src={spotlightItem.videoUrl}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="absolute inset-0 w-full h-full object-cover opacity-100"
                                    />
                                )}
                            </div>

                            {/* Gradient Overlay left and bottom */}
                            <div className="absolute inset-0 z-[-1] bg-gradient-to-t from-[#141414] via-[#141414]/10 to-transparent lg:bg-gradient-to-r lg:from-[#141414] lg:via-[#141414]/10 lg:to-transparent"></div>

                            {/* Added bottom fade so it blends perfectly into bg-[#141414] */}
                            <div className="absolute inset-x-0 bottom-[-1px] h-32 bg-gradient-to-t from-[#141414] to-transparent z-[-1]"></div>

                            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                                <div className="max-w-3xl space-y-4">
                                    <span className="px-2 sm:px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md border border-white/20 inline-flex items-center gap-2">
                                        <SparklesIcon className="w-3 h-3 text-white" />
                                        Featured Spotlight
                                    </span>

                                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight drop-shadow-2xl text-balance">
                                        {spotlightItem.title}
                                    </h1>

                                    <div className="flex items-center gap-3 text-white/90 text-sm font-medium pt-2 pb-2">
                                        <div className="w-10 h-10 rounded-full overflow-hidden relative border border-white/30 shadow-lg flex-shrink-0">
                                            {spotlightItem.channelAvatar ? (
                                                <Image src={spotlightItem.channelAvatar} alt="" fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                                                    {spotlightItem.channelName.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-white font-bold block">{spotlightItem.channelName}</span>
                                            <span className="text-gray-400 text-xs">{spotlightItem.views} views</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 sm:gap-4 pt-4">
                                        <button
                                            onClick={() => router.push(spotlightItem.price === 0 || spotlightItem.hasAccess ? `/channel/${spotlightItem.channelSlug}/products/${spotlightItem.id}` : `/channel/${spotlightItem.channelSlug}`)}
                                            className="px-6 py-2.5 sm:py-3 bg-white text-black rounded-lg font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors shadow-lg active:scale-95 text-sm sm:text-base"
                                        >
                                            <VideoCameraIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                            Play Now
                                        </button>
                                        <button
                                            onClick={() => router.push(`/channel/${spotlightItem.channelSlug}`)}
                                            className="px-6 py-2.5 sm:py-3 bg-gray-500/40 hover:bg-gray-500/60 text-white rounded-lg font-bold flex items-center gap-2 transition-colors backdrop-blur-sm shadow-lg border border-white/10 active:scale-95 text-sm sm:text-base flex-shrink-0"
                                        >
                                            <UserIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                            Visit Channel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 space-y-12 relative z-20">
                        {/* Trending Next row */}
                        {upNextItems.length > 0 && (
                            <section className="-mt-10 sm:-mt-20 relative z-30 mb-8 sm:mb-12">
                                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 tracking-tight mb-3 sm:mb-4 drop-shadow-md">
                                    <FireIcon className="w-5 h-5 text-indigo-400" />
                                    Trending Now
                                </h2>
                                <div className="relative group">
                                    <button
                                        onClick={() => scroll('left')}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 z-40 bg-black/50 text-white p-2 rounded-r-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-black/70 hidden sm:block h-[80%]"
                                    >
                                        <ChevronLeftIcon className="w-8 h-8" />
                                    </button>
                                    <div
                                        ref={scrollContainerRef}
                                        className="flex overflow-x-auto gap-3 sm:gap-4 pb-6 pt-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
                                    >
                                        {upNextItems.map((product) => (
                                            <div key={product.id} className="min-w-[85vw] sm:min-w-[45vw] md:min-w-[32vw] lg:min-w-[26vw] xl:min-w-[21vw] snap-center shrink-0 flex">
                                                <div className="w-full">
                                                    <ProductCard {...product} isDarkTheme={true} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => scroll('right')}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 z-40 bg-black/50 text-white p-2 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-black/70 hidden sm:block h-[80%]"
                                    >
                                        <ChevronRightIcon className="w-8 h-8" />
                                    </button>
                                </div>
                            </section>
                        )}


                        {/* 2. From Subscriptions (if any) */}
                        {session && subscribedProducts.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
                                        <UserIcon className="w-6 h-6 text-indigo-400" />
                                        From Your Subscriptions
                                    </h2>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                                    {subscribedProducts.map((product) => (
                                        <ProductCard key={product.id} {...product} isDarkTheme={true} />
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
                                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
                                    <LightBulbIcon className="w-6 h-6 text-amber-400" />
                                    Recommended for You
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start sm:self-auto w-full sm:w-auto">
                                    {/* Earnings Badge */}
                                    <Link
                                        href="/auth/dashboard/my-channel"
                                        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-[#1a1a1a] border border-[#333] rounded-full hover:bg-[#2a2a2a] transition-all shadow-sm group whitespace-nowrap"
                                    >
                                        <span className="text-emerald-400 font-bold text-[11px] sm:text-xs">
                                            Earnings: <span className={userChannelInfo?.hasChannel ? "text-emerald-300" : "text-emerald-500"}>₹{userChannelInfo?.totalEarnings || 0}</span>
                                        </span>

                                        {!userChannelInfo?.hasChannel && (
                                            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold group-hover:bg-emerald-500 animate-pulse">
                                                Start earning now?
                                            </span>
                                        )}

                                        <ArrowRightIcon className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>

                                    {/* Category Filter */}
                                    <div className="flex gap-2 bg-[#1a1a1a] rounded-full p-1 border border-[#333] shadow-sm">
                                        {['All', 'Videos', 'Docs'].map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setActiveCategory(cat)}
                                                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${activeCategory === cat ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {activeCategory === 'All' ? (
                                <div className="flex flex-col xl:flex-row gap-8">
                                    {/* 70% Column - Videos */}
                                    <div className="w-full xl:w-[70%] space-y-4">
                                        <div className="flex items-center justify-between pb-2 border-b border-[#333]">
                                            <div className="flex items-center gap-2">
                                                <VideoCameraIcon className="w-5 h-5 text-gray-400" />
                                                <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wider">Videos</h3>
                                            </div>
                                            <button
                                                onClick={() => setActiveCategory('Videos')}
                                                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                                            >
                                                View All
                                            </button>
                                        </div>
                                        {videos.length > 0 ? (
                                            <>
                                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                                                    {videos.slice(0, 50).map((product) => (
                                                        <ProductCard key={product.id} {...product} isDarkTheme={true} />
                                                    ))}
                                                </div>
                                                {videos.length > 50 && (
                                                    <div className="flex justify-center pt-2">
                                                        <button
                                                            onClick={() => setActiveCategory('Videos')}
                                                            className="px-6 py-2 bg-[#1a1a1a] border border-[#333] text-gray-300 text-sm font-bold rounded-full hover:bg-[#2a2a2a] hover:text-white transition-all shadow-sm"
                                                        >
                                                            Show All Videos ({videos.length})
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-12 bg-[#1a1a1a] rounded-xl border border-dashed border-[#333]">
                                                <p className="text-gray-500 text-sm">No videos available</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* 30% Column - Documents (Compact & Sticky) */}
                                    <div className="w-full xl:w-[30%] flex flex-col h-[500px] sticky top-24 self-start">
                                        <div className="flex items-center justify-between pb-3 border-b border-[#333] mb-4 bg-[#141414] z-10">
                                            <div className="flex items-center gap-2">
                                                <FolderIcon className="w-5 h-5 text-gray-400" />
                                                <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wider">Documents</h3>
                                            </div>
                                            <button
                                                onClick={() => setActiveCategory('Docs')}
                                                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                                            >
                                                View All
                                            </button>
                                        </div>

                                        {documents.length > 0 ? (
                                            <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-[#333]">
                                                <VerticalDocumentCarousel items={documents} isDarkTheme={true} />
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-[#1a1a1a] rounded-xl border border-dashed border-[#333]">
                                                <p className="text-gray-500 text-sm">No documents available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* Filtered View */
                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                                    {(activeCategory === 'Videos' ? videos : documents).length > 0 ? (
                                        (activeCategory === 'Videos' ? videos : documents).map((product) => (
                                            <ProductCard key={product.id} {...product} isDarkTheme={true} />
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-20 bg-[#1a1a1a] rounded-2xl border border-dashed border-[#333] shadow-sm">
                                            <div className="w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                                                {activeCategory === 'Videos' ? <VideoCameraIcon className="w-8 h-8" /> : <FolderIcon className="w-8 h-8" />}
                                            </div>
                                            <p className="text-gray-400 font-medium">No {activeCategory.toLowerCase()} found.</p>
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
                                <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-[#333] shadow-2xl">
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                                        <BookOpenIcon className="w-6 h-6 text-emerald-400" />
                                        Popular Reads
                                    </h3>
                                    <div className="flex flex-col gap-5">
                                        {trendingEbooks.slice(0, 3).map(book => (
                                            <div key={book.id} className="flex gap-4 group cursor-pointer" onClick={() => router.push(`/channel/${book.channelSlug}/products/${book.id}`)}>
                                                <div className="w-20 h-28 bg-[#2a2a2a] rounded-lg shadow-md border border-[#444] relative flex-shrink-0 overflow-hidden group-hover:-translate-y-1 transition-transform">
                                                    <Image src={book.thumbnail} alt="" fill className="object-cover" unoptimized />
                                                </div>
                                                <div className="flex-1 py-1">
                                                    <h4 className="font-bold text-base text-gray-200 leading-tight group-hover:text-emerald-400 transition-colors mb-2">{book.title}</h4>
                                                    <p className="text-xs text-gray-400 mb-2">{book.channelName}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-emerald-300 bg-emerald-900/30 px-2 py-1 rounded-md border border-emerald-800/50">
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
