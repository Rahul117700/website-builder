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
                    {/* Categories - Separate Scrollable Div with Simplified Styling */}
                    <div className="sticky top-16 z-30 bg-white border-b border-gray-200 py-3 mb-6">
                        <div className="max-w-full overflow-x-auto no-scrollbar px-6 flex gap-2">
                            {['All', 'Live', 'Music', 'Gaming', 'Programming', 'News', 'Software', 'Ebooks', 'Art'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeCategory === cat
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 md:p-6 space-y-10">

                        {/* Section: From Your Subscriptions */}
                        {session && subscribedProducts.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <UserIcon className="w-6 h-6 text-indigo-600" />
                                    From Your Subscriptions
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
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
                                                {product.price === 0 && (
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

                                                    {product.price === 0 && (
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
                </>
            )}
        </MainLayout>
    );
}



function ProductCard({ id, title, thumbnail, channelName, channelAvatar, views, postedAt, duration, price, type, videoUrl, slug, channelSlug, hasAccess }: ProductCardData) {
    const { data: session } = useSession();
    const router = useRouter();
    const isVideo = type === 'VIDEO' || type === 'COURSE';
    const [isHovered, setIsHovered] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [liking, setLiking] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    // Handle like/unlike
    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            router.push('/auth/signin');
            return;
        }

        if (liking) return;

        // Optimistic update
        const previousState = isLiked;
        setIsLiked(!isLiked);
        setLiking(true);

        try {
            const response = await fetch(`/api/liked/${id}`, {
                method: isLiked ? 'DELETE' : 'POST',
            });

            if (!response.ok) {
                // Revert on error
                setIsLiked(previousState);
            }
        } catch (error) {
            // Revert on error
            setIsLiked(previousState);
            console.error('Error toggling like:', error);
        } finally {
            setLiking(false);
        }
    };

    // Handle save/unsave
    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            router.push('/auth/signin');
            return;
        }

        if (saving) return;

        // Optimistic update
        const previousState = isSaved;
        setIsSaved(!isSaved);
        setSaving(true);

        try {
            const response = await fetch(`/api/saved/${id}`, {
                method: isSaved ? 'DELETE' : 'POST',
            });

            if (!response.ok) {
                // Revert on error
                setIsSaved(previousState);
            }
        } catch (error) {
            // Revert on error
            setIsSaved(previousState);
            console.error('Error toggling save:', error);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (isHovered && videoUrl) {
            timeout = setTimeout(() => {
                setIsPlaying(true);
                videoRef.current?.play().catch(e => console.log("Autoplay prevented", e));
            }, 500); // 500ms delay before playing
        } else {
            setIsPlaying(false);
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        }
        return () => clearTimeout(timeout);
    }, [isHovered, videoUrl]);

    // Redirect Logic: Free or Subscribed -> Product Player Page, Paid & Not Subscribed -> Channel Page
    const targetHref = (price === 0 || hasAccess) ? `/channel/${channelSlug}/products/${id}` : `/channel/${channelSlug}`;

    return (
        <div
            className="group cursor-pointer flex flex-col h-full relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Main Card Link (Stretched) */}
            <Link href={targetHref} className="absolute inset-0 z-0">
                <span className="sr-only">View Product</span>
            </Link>

            {/* Thumbnail / Video Container */}
            <div className={`relative ${isVideo ? 'aspect-video' : 'aspect-[4/3]'} rounded-xl overflow-hidden bg-gray-100 mb-3 shadow-sm border border-gray-100 group-hover:shadow-md transition-all`}>

                {/* Main Image */}
                <Image
                    src={thumbnail}
                    alt={title}
                    fill
                    className={`object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100 group-hover:scale-105'}`}
                    unoptimized
                />

                {/* Video Preview */}
                {videoUrl && (
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        muted
                        playsInline
                        loop
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
                    />
                )}

                {/* Duration Badge (Only show when not playing) */}
                {duration && !isPlaying && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {duration}
                    </div>
                )}

                {/* Price Badge */}
                {price === 0 ? (
                    <div className="absolute top-2 right-2 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm backdrop-blur-md">
                        Free
                    </div>
                ) : (
                    <div className="absolute top-2 right-2 bg-indigo-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm backdrop-blur-md flex items-center gap-1">
                        Sub
                    </div>
                )}

                {/* Type Icon Overlay (Only show when not playing) */}
                {!isPlaying && (
                    <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm p-1.5 rounded-lg text-white">
                        {type === 'VIDEO' && <VideoCameraIcon className="w-3 h-3" />}
                        {type === 'COURSE' && <LightBulbIcon className="w-3 h-3" />}
                        {type === 'EBOOK' && <BookOpenIcon className="w-3 h-3" />}
                        {type === 'CODE' && <CodeBracketIcon className="w-3 h-3" />}
                        {type === 'SOFTWARE' && <CodeBracketIcon className="w-3 h-3" />}
                        {type === 'IMAGE' && <PhotoIcon className="w-3 h-3" />}
                    </div>
                )}

                {/* Action Buttons - Raised Index */}
                <div className="absolute bottom-2 right-2 flex gap-2 z-10">
                    {/* Like Button */}
                    <button
                        onClick={handleLike}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all hover:scale-110 shadow-sm relative"
                        disabled={liking}
                    >
                        {isLiked ? (
                            <HeartIconSolid className="w-5 h-5 text-red-500" />
                        ) : (
                            <HeartIcon className="w-5 h-5 text-gray-600 hover:text-red-500" />
                        )}
                    </button>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all hover:scale-110 shadow-sm relative"
                        disabled={saving}
                    >
                        {isSaved ? (
                            <BookmarkIconSolid className="w-5 h-5 text-blue-600" />
                        ) : (
                            <BookmarkIcon className="w-5 h-5 text-gray-600 hover:text-blue-600" />
                        )}
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="flex gap-3 items-start flex-1 pointer-events-none">
                <div className="relative w-9 h-9 flex-shrink-0">
                    <Image
                        src={channelAvatar}
                        alt={channelName}
                        fill
                        className="rounded-full object-cover border border-gray-100"
                        unoptimized
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 font-bold text-sm leading-tight line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
                        {title}
                    </h3>
                    <div className="text-gray-500 text-xs">
                        <Link
                            href={`/channel/${channelSlug}`}
                            className="hover:text-gray-900 transition-colors flex items-center gap-1 mb-0.5 relative z-10 pointer-events-auto inline-flex"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {channelName}
                            <div className="w-0.5 h-0.5 bg-gray-400 rounded-full"></div>
                        </Link>
                        <div className="flex items-center">
                            <span>{views}</span>
                            <span className="mx-1 text-gray-300">•</span>
                            <span>{postedAt}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
