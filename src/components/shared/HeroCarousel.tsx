'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ProductCardData } from '@/app/actions/homepage';
import { SparklesIcon, VideoCameraIcon, UserIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface HeroCarouselProps {
    items: ProductCardData[];
}

const AUTOPLAY_INTERVAL = 30000; // 30 seconds per slide

/** Route local /uploads/ videos through the streaming API for instant playback */
const toStreamSrc = (url: string | undefined | null): string => {
    if (!url) return '';
    try {
        const path = url.startsWith('http') ? new URL(url).pathname : url;
        if (path.startsWith('/uploads/')) {
            return `/api/video-stream?path=${encodeURIComponent(path)}`;
        }
    } catch { /* ignore */ }
    return url;
};

export default function HeroCarousel({ items }: HeroCarouselProps) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [progress, setProgress] = useState(0);
    const [videoReady, setVideoReady] = useState(false);  // true once onCanPlay fires
    const progressRef = useRef<NodeJS.Timeout | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);


    const goTo = useCallback((idx: number, dir: number) => {
        setDirection(dir);
        setCurrentIndex(idx);
        setProgress(0);
        setVideoReady(false);
    }, []);

    const slideNext = useCallback(() => {
        if (!items.length) return;
        goTo((currentIndex + 1) % items.length, 1);
    }, [items.length, currentIndex, goTo]);

    const slidePrev = useCallback(() => {
        if (!items.length) return;
        goTo((currentIndex - 1 + items.length) % items.length, -1);
    }, [items.length, currentIndex, goTo]);

    // Slide autoplay timer
    useEffect(() => {
        if (!items.length) return;
        const timer = setInterval(slideNext, AUTOPLAY_INTERVAL);
        return () => clearInterval(timer);
    }, [slideNext, items.length]);

    // Progress bar (smooth 60fps fill over 30s)
    useEffect(() => {
        if (!items.length) return;
        setProgress(0);
        const startTime = Date.now();
        const tick = () => {
            const elapsed = Date.now() - startTime;
            const pct = Math.min((elapsed / AUTOPLAY_INTERVAL) * 100, 100);
            setProgress(pct);
            if (pct < 100) {
                progressRef.current = setTimeout(tick, 16);
            }
        };
        progressRef.current = setTimeout(tick, 16);
        return () => { if (progressRef.current) clearTimeout(progressRef.current); };
    }, [currentIndex, items.length]);

    // When video element is available, start playing immediately
    useEffect(() => {
        const vid = videoRef.current;
        if (!vid) return;

        // Reset to beginning so we don't wait for previous position
        vid.currentTime = 0;
        // Load immediately (triggers network fetch from pos 0)
        vid.load();

        // As soon as first frames are available, play — don't wait for full buffer
        const onCanPlay = () => {
            vid.play().catch(() => { /* blocked by browser policy */ });
            setVideoReady(true);
        };

        vid.addEventListener('canplay', onCanPlay);
        return () => vid.removeEventListener('canplay', onCanPlay);
    }, [currentIndex]);

    if (!items.length) {
        return <div className="w-full h-24 sm:h-32 mb-8 bg-gradient-to-b from-[#1a1a1a] to-[#141414]" />;
    }

    const spotlightItem = items[currentIndex];
    const isVideo = (spotlightItem.type === 'VIDEO' || spotlightItem.type === 'VIDEOS' || spotlightItem.type === 'COURSE') && !!spotlightItem.videoUrl;


    const variants = {
        enter: () => ({ opacity: 0, scale: 1.05 }),
        center: { zIndex: 1, opacity: 1, scale: 1 },
        exit: () => ({ zIndex: 0, opacity: 0 }),
    };

    return (
        <div className="w-full relative h-[65vh] lg:h-[85vh] min-h-[500px] flex flex-col justify-end pb-28 sm:pb-40 lg:pb-48 z-10 isolate mt-[-56px] lg:mt-0 group overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="sync">
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        opacity: { duration: 0.8 },
                        scale: { duration: 0.9, ease: 'easeOut' }
                    }}
                    className="absolute inset-0 z-[-2]"
                >
                    <div className="absolute inset-0 bg-[#141414]">
                        {/* Thumbnail — always shown, fades out when video is ready */}
                        <Image
                            src={spotlightItem.thumbnail}
                            alt={spotlightItem.title}
                            fill
                            className={`object-cover transition-opacity duration-700 ${isVideo && videoReady ? 'opacity-0' : 'opacity-100'}`}
                            unoptimized
                            priority
                        />

                        {/* Video — shown on top of thumbnail once ready */}
                        {isVideo && (
                            <video
                                ref={videoRef}
                                key={spotlightItem.videoUrl} // remount on slide change for clean load
                                src={toStreamSrc(spotlightItem.videoUrl)}
                                loop
                                muted
                                playsInline
                                preload="auto"
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
                            />
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Gradient overlays */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-[#141414] via-[#141414]/10 to-transparent lg:bg-gradient-to-r lg:from-[#141414] lg:via-[#141414]/20 lg:to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-48 sm:h-64 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent z-10 pointer-events-none" />

            {/* Content */}
            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="max-w-3xl space-y-4"
                    >
                        <span className="px-3 sm:px-4 py-1.5 bg-white/10 backdrop-blur-xl text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg border border-white/20 inline-flex items-center gap-2 shadow-xl drop-shadow-lg">
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
                                onClick={() => router.push(spotlightItem.price === 0 || spotlightItem.hasAccess
                                    ? `/channel/${spotlightItem.channelSlug}/products/${spotlightItem.id}`
                                    : `/channel/${spotlightItem.channelSlug}`)}
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
                    </motion.div>
                </AnimatePresence>
            </div>


            {/* Hover nav arrows */}
            {items.length > 1 && (
                <div className="absolute top-1/2 -translate-y-1/2 inset-x-4 flex justify-between pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={(e) => { e.preventDefault(); slidePrev(); }}
                        className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 pointer-events-auto hover:bg-white/20 hover:scale-110 transition-all shadow-xl"
                    >
                        <ChevronLeftIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); slideNext(); }}
                        className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 pointer-events-auto hover:bg-white/20 hover:scale-110 transition-all shadow-xl"
                    >
                        <ChevronRightIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                    </button>
                </div>
            )}

            {/* Progress dot indicators */}
            {items.length > 1 && (
                <div className="absolute bottom-6 right-6 sm:right-8 flex items-center gap-2 z-30">
                    {items.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => goTo(idx, idx > currentIndex ? 1 : -1)}
                            className="relative h-1.5 rounded-full overflow-hidden hover:opacity-80 transition-opacity"
                            style={{ width: idx === currentIndex ? 48 : 8 }}
                        >
                            <span className="absolute inset-0 bg-white/30 rounded-full" />
                            {idx === currentIndex && (
                                <span
                                    className="absolute inset-y-0 left-0 rounded-full bg-white shadow-[0_0_10px_#fff]"
                                    style={{ width: `${progress}%`, transition: 'none' }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
