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
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { ProductCardData } from '@/app/actions/homepage';

export default function ProductCard({ id, title, thumbnail, channelName, channelAvatar, views, postedAt, duration, price, type, videoUrl, slug, channelSlug, hasAccess, isSubscriberOnly, isFree }: ProductCardData) {
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
            setLiking(false); // [FIX] This was setLiking(false) instead of setSaving(false) in original code
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
                {isSubscriberOnly ? (
                    <div className="absolute top-2 right-2 bg-indigo-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm backdrop-blur-md flex items-center gap-1">
                        Sub
                    </div>
                ) : isFree || price === 0 ? (
                    <div className="absolute top-2 right-2 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm backdrop-blur-md">
                        Free
                    </div>
                ) : (
                    <div className="absolute top-2 right-2 bg-amber-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm backdrop-blur-md">
                        ₹{price}
                    </div>
                )}

                {/* Type Icon Overlay (Only show when not playing) */}
                {!isPlaying && (
                    <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm p-1.5 rounded-lg text-white">
                        {type === 'VIDEO' && <VideoCameraIcon className="w-3 h-3" />}
                        {type === 'VIDEOS' && <VideoCameraIcon className="w-3 h-3" />}
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
