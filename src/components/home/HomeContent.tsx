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
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                                            {subscribedProducts.map((product) => (
                                                <ProductCard key={product.id} {...product} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Section: Recommended */}
                                {others.length > 0 ? (
                                    <section>
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <FireIcon className="w-6 h-6 text-orange-500" />
                                            Recommended for You
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                                            {others.map((product) => (
                                                <ProductCard key={product.id} {...product} />
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
                                                    <div className="aspect-[3/4] bg-gray-200 rounded-lg shadow-md mb-3 overflow-hidden transition-transform hover:-translate-y-1 relative group">
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
                                                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">{product.title}</h3>
                                                    <p className="text-xs text-gray-500">{product.channelName}</p>
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
                                                    <Link href={`/product/${product.slug}`}>
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
                                            // Find a video to feature
                                            const featureVideo = [...recommendedProducts, ...subscribedProducts]
                                                .find(p => (p.type === 'VIDEO' || p.type === 'VIDEOS') && p.videoUrl);

                                            // Fallback to first product if no video
                                            const item = featureVideo || recommendedProducts[0] || subscribedProducts[0];

                                            if (!item) return (
                                                <div className="aspect-[4/5] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                                    No content trending
                                                </div>
                                            );

                                            return (
                                                <div className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-900 shadow-md">
                                                    {/* Video or Image */}
                                                    {(item.type === 'VIDEO' || item.type === 'VIDEOS') && item.videoUrl ? (
                                                        <video
                                                            src={item.videoUrl}
                                                            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                                            autoPlay
                                                            muted
                                                            loop
                                                            playsInline
                                                        />
                                                    ) : (
                                                        <img
                                                            src={item.thumbnail}
                                                            alt={item.title}
                                                            className="absolute inset-0 w-full h-full object-cover"
                                                        />
                                                    )}

                                                    {/* Gradient Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

                                                    {/* Content */}
                                                    <div className="absolute bottom-0 left-0 right-0 p-5">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/10">
                                                                Spotlight
                                                            </span>
                                                        </div>
                                                        <h4 className="text-white font-bold text-lg leading-tight line-clamp-2 mb-2 drop-shadow-md">
                                                            {item.title}
                                                        </h4>
                                                        <div className="flex items-center gap-2">
                                                            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/50">
                                                                <img src={item.channelAvatar || '/placeholder-user.jpg'} alt={item.channelName} className="w-full h-full object-cover" />
                                                            </div>
                                                            <span className="text-gray-200 text-xs font-medium">{item.channelName}</span>
                                                        </div>

                                                        <button
                                                            className="mt-4 w-full py-2.5 bg-white text-gray-900 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg active:scale-95"
                                                            onClick={() => router.push(`/channel/${item.channelSlug}/products/${item.id}`)}
                                                        >
                                                            Watch Now
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Mini Suggestions */}
                                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group cursor-pointer">
                                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

                                        <h3 className="font-bold text-lg mb-1 relative z-10">Creator Fund</h3>
                                        <p className="text-indigo-100 text-sm mb-4 relative z-10">Join our creator program and start monetizing today.</p>
                                        <div className="flex items-center gap-2 font-bold text-sm relative z-10">
                                            <span>Learn more</span>
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



