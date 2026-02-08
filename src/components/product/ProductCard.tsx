'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import {
    VideoCameraIcon,
    LightBulbIcon,
    BookOpenIcon,
    CodeBracketIcon,
    PhotoIcon,
    HeartIcon,
    BookmarkIcon,
    FireIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { ProductCardData } from '@/app/actions/homepage';

export default function ProductCard({ id, title, thumbnail, channelName, channelAvatar, views, postedAt, duration, price, type, videoUrl, slug, channelSlug, hasAccess, isSubscriberOnly, isFree, isPromoted }: ProductCardData & { isPromoted?: boolean }) {
    const { data: session } = useSession();
    const router = useRouter();
    const isVideo = type === 'VIDEO' || type === 'VIDEOS' || type === 'COURSE';
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
            onClick={() => router.push(targetHref)}
        >
            {/* Main Card Link (Stretched) - Fallback for SEO */}
            <Link href={targetHref} className="absolute inset-0 z-0">
                <span className="sr-only">View Product</span>
            </Link>

            {/* Thumbnail / Video Container */}
            <div className={`relative ${isVideo ? 'aspect-video' : 'aspect-[1.1] sm:aspect-[4/3]'} rounded-2xl overflow-hidden bg-gray-50 mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 group-hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.12)] group-hover:border-indigo-100/50 transition-all duration-500`}>

                {/* Main Image */}
                <Image
                    src={thumbnail}
                    alt={title}
                    fill
                    className={`object-cover transition-all duration-700 ${isPlaying ? 'opacity-0 scale-100' : 'opacity-100 group-hover:scale-105'}`}
                    unoptimized
                />

                {/* Video Preview */}
                {videoUrl && isHovered && (
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        muted
                        playsInline
                        loop
                        preload="none"
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                    />
                )}

                {/* Overlays / Badges */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Duration Badge */}
                {duration && !isPlaying && (
                    <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-lg shadow-lg">
                        {duration}
                    </div>
                )}

                {/* Status Badges */}
                <div className="absolute top-2.5 right-2.5 flex flex-col gap-2">
                    {isSubscriberOnly ? (
                        <div className="bg-indigo-600/95 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-xl shadow-xl backdrop-blur-md border border-white/20 flex items-center justify-center">
                            Exclusive
                        </div>
                    ) : (isFree || price === 0) ? (
                        <div className="bg-emerald-500/95 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-xl shadow-xl backdrop-blur-md border border-white/20 flex items-center justify-center">
                            Free
                        </div>
                    ) : (
                        <div className="bg-white/95 text-gray-900 text-[10px] sm:text-[12px] font-black px-3 py-1.5 rounded-xl shadow-xl backdrop-blur-md border border-gray-100 flex items-center justify-center">
                            ₹{price}
                        </div>
                    )}
                </div>

                {/* Type Icon */}
                {!isPlaying && (
                    <div className="absolute top-2.5 left-2.5 bg-black/30 backdrop-blur-md p-2 rounded-xl text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {type === 'VIDEO' && <VideoCameraIcon className="w-3.5 h-3.5" />}
                        {type === 'VIDEOS' && <VideoCameraIcon className="w-3.5 h-3.5" />}
                        {type === 'COURSE' && <LightBulbIcon className="w-3.5 h-3.5" />}
                        {type === 'EBOOK' && <BookOpenIcon className="w-3.5 h-3.5" />}
                        {type === 'CODE' && <CodeBracketIcon className="w-3.5 h-3.5" />}
                        {type === 'SOFTWARE' && <CodeBracketIcon className="w-3.5 h-3.5" />}
                        {type === 'IMAGE' && <PhotoIcon className="w-3.5 h-3.5" />}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="absolute bottom-2.5 left-2.5 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                    <button
                        onClick={handleLike}
                        className={`p-2 rounded-xl backdrop-blur-md transition-all hover:scale-110 shadow-lg border ${isLiked ? 'bg-red-500 border-red-400 text-white' : 'bg-white/90 border-white/50 text-gray-900 hover:bg-white'}`}
                        disabled={liking}
                    >
                        {isLiked ? <HeartIconSolid className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={handleSave}
                        className={`p-2 rounded-xl backdrop-blur-md transition-all hover:scale-110 shadow-lg border ${isSaved ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/90 border-white/50 text-gray-900 hover:bg-white'}`}
                        disabled={saving}
                    >
                        {isSaved ? <BookmarkIconSolid className="w-4 h-4" /> : <BookmarkIcon className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Info Container */}
            <div className="flex gap-2.5 items-start flex-1 pointer-events-none px-1">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                    {channelAvatar ? (
                        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
                            <Image
                                src={channelAvatar}
                                alt={channelName}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white shadow-sm flex items-center justify-center text-white font-black text-[11px] sm:text-xs">
                            {channelName.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 font-extrabold text-[13px] sm:text-[15px] leading-[1.3] tracking-tight line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors duration-300">
                        {title}
                    </h3>
                    <div className="text-gray-500 text-[10px] sm:text-[12px] font-bold">
                        <Link
                            href={`/channel/${channelSlug}`}
                            className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 mb-0.5 relative z-10 pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span className="truncate">{channelName}</span>
                            <span className="w-1 h-1 rounded-full bg-indigo-500/30"></span>
                        </Link>
                        <div className="flex items-center opacity-70">
                            <span>{views}</span>
                            <span className="mx-1.5">•</span>
                            <span>{postedAt}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
