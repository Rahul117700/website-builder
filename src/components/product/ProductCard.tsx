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
            {/* Clickable Area */}
            <Link href={targetHref} className="absolute inset-0 z-0 opacity-0">
                <span className="sr-only">View {title}</span>
            </Link>

            {/* Thumbnail Container - Cinematic Aspect Ratio */}
            <div className={`relative w-full aspect-video bg-gray-100 rounded-none overflow-hidden mb-4 isolate shadow-sm transition-all duration-500 ring-1 ring-black/5 group-hover:shadow-2xl group-hover:ring-black/10 group-hover:-translate-y-1`}>

                {/* Image / Video Layer */}
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                    <Image
                        src={thumbnail}
                        alt={title}
                        fill
                        className={`object-cover ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
                        unoptimized
                    />
                    {videoUrl && isHovered && (
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            muted
                            playsInline
                            loop
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
                        />
                    )}
                </div>

                {/* Overlay Gradient - Subtle cinematic fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex gap-2 z-10">
                    {/* Media Type Icon */}
                    <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-sm">
                        {type === 'VIDEO' || type === 'VIDEOS' || type === 'COURSE' ? (
                            <VideoCameraIcon className="w-4 h-4" />
                        ) : type === 'EBOOK' ? (
                            <BookOpenIcon className="w-4 h-4" />
                        ) : (
                            <PhotoIcon className="w-4 h-4" />
                        )}
                    </div>
                </div>

                <div className="absolute top-3 right-3 flex flex-col items-end gap-2 z-10 transition-transform duration-300 group-hover:-translate-y-1">
                    {/* Price / Status Badge */}
                    {isSubscriberOnly ? (
                        <div className="px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg border border-indigo-500/50 backdrop-blur-md">
                            Exclusive
                        </div>
                    ) : (isFree || price === 0) ? (
                        <div className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg border border-emerald-400/50 backdrop-blur-md">
                            Free
                        </div>
                    ) : (
                        <div className="px-2.5 py-1 bg-white/95 backdrop-blur text-gray-900 text-[10px] font-bold rounded-lg shadow-lg border border-gray-100 uppercase tracking-wider">
                            ₹{price}
                        </div>
                    )}
                </div>

                {/* Bottom Actions - Appear on Hover */}
                <div className="absolute bottom-3 right-3 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                    <button
                        onClick={handleLike}
                        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 border border-white/10 backdrop-blur-sm ${isLiked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-900 hover:bg-white'}`}
                    >
                        {isLiked ? <HeartIconSolid className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={handleSave}
                        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 border border-white/10 backdrop-blur-sm ${isSaved ? 'bg-indigo-600 text-white' : 'bg-white/90 text-gray-900 hover:bg-white'}`}
                    >
                        {isSaved ? <BookmarkIconSolid className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
                    </button>
                </div>

                {/* Duration Badge */}
                {duration && (
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur text-white text-[10px] font-bold rounded-md overflow-hidden border border-white/10">
                        {duration}
                    </div>
                )}
            </div>

            {/* Info Section - Clean & Minimal */}
            <div className="flex gap-3.5 px-1">
                {/* Avatar */}
                <div className="flex-shrink-0 relative z-10 pt-0.5">
                    <Link href={`/channel/${channelSlug}`} onClick={(e) => e.stopPropagation()}>
                        <div className="w-9 h-9 rounded-full bg-gray-100 ring-2 ring-transparent group-hover:ring-indigo-500/20 overflow-hidden relative shadow-sm transition-all">
                            {channelAvatar ? (
                                <Image src={channelAvatar} alt={channelName} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600 text-xs font-bold">
                                    {channelName.charAt(0)}
                                </div>
                            )}
                        </div>
                    </Link>
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 font-bold text-base leading-tight line-clamp-2 mb-1.5 group-hover:text-indigo-600 transition-colors">
                        {title}
                    </h3>
                    <div className="flex flex-col gap-0.5">
                        <Link href={`/channel/${channelSlug}`} className="text-sm text-gray-500 font-medium hover:text-gray-900 transition-colors truncate w-full" onClick={(e) => e.stopPropagation()}>
                            {channelName}
                        </Link>
                        <div className="flex items-center text-xs text-gray-400 font-medium whitespace-nowrap overflow-hidden gap-2">
                            <span>{views} views</span>
                            <span className="w-0.5 h-0.5 rounded-full bg-gray-300"></span>
                            <span>{postedAt}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
