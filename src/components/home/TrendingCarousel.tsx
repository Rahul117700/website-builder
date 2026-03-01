'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { RocketLaunchIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ProductCardData } from '@/app/actions/homepage';

interface TrendingCarouselProps {
    items: ProductCardData[];
    isCompact?: boolean;
    isLoading?: boolean;
    className?: string;
}

export default function TrendingCarousel({ items, isCompact = false, isLoading = false, className }: TrendingCarouselProps) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const progressRef = useRef<NodeJS.Timeout | null>(null);
    const INTERVAL = 5000;

    // Determine sizing class: use override if provided, else default to fixed aspect ratios
    const sizingClass = className || (isCompact ? 'aspect-[3/5]' : 'aspect-[3/4]');

    const slideNext = useCallback(() => {
        if (!items.length) return;
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % items.length);
        setProgress(0);
    }, [items.length]);

    const slidePrev = useCallback(() => {
        if (!items.length) return;
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
        setProgress(0);
    }, [items.length]);

    useEffect(() => {
        if (isLoading || !items.length || isPaused) return;
        const timer = setInterval(slideNext, INTERVAL);
        return () => clearInterval(timer);
    }, [slideNext, isLoading, items.length, isPaused]);

    // Progress bar
    useEffect(() => {
        if (isLoading || !items.length || isPaused) return;
        setProgress(0);
        const startTime = Date.now();
        const tick = () => {
            const elapsed = Date.now() - startTime;
            const pct = Math.min((elapsed / INTERVAL) * 100, 100);
            setProgress(pct);
            if (pct < 100) {
                progressRef.current = setTimeout(tick, 16);
            }
        };
        progressRef.current = setTimeout(tick, 16);
        return () => { if (progressRef.current) clearTimeout(progressRef.current); };
    }, [currentIndex, isPaused, isLoading, items.length]);

    if (isLoading) {
        return (
            <div className={`relative ${sizingClass} rounded-2xl overflow-hidden bg-gray-100 animate-pulse border border-gray-100`}>
                <div className="absolute inset-0 flex flex-col justify-end p-6 space-y-3">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-8 w-full bg-gray-200 rounded"></div>
                    <div className="h-8 w-2/3 bg-gray-200 rounded"></div>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                        <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!items.length) return null;

    const currentItem = items[currentIndex];

    // Animation variants
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
            scale: 0.9,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0,
            scale: 0.9,
        }),
    };

    return (
        <div
            className={`relative ${sizingClass} rounded-2xl overflow-hidden bg-gray-900 shadow-2xl group`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.4 },
                        scale: { duration: 0.4 }
                    }}
                    className="absolute inset-0"
                >
                    {/* Media content */}
                    <div
                        className="absolute inset-0 cursor-pointer"
                        onClick={() => router.push(`/channel/${currentItem.channelSlug}/products/${currentItem.id}`)}
                    >
                        <img
                            src={currentItem.thumbnail}
                            alt={currentItem.title}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>

                    {/* Premium Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-40" />

                    {/* Content */}
                    <div className={`absolute inset-0 ${isCompact ? 'p-2 sm:p-3' : 'p-3 sm:p-6'} flex flex-col justify-between`}>
                        {/* Top Badge */}
                        <div className="flex justify-start">
                            <span className={`px-2 py-1 rounded-md bg-black/40 backdrop-blur-md text-white ${isCompact ? 'text-[8px]' : 'text-[10px]'} font-bold uppercase tracking-wider border border-white/10`}>
                                Trending
                            </span>
                        </div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-1.5 sm:space-y-3"
                        >
                            <h4 className={`text-white font-black ${isCompact ? 'text-xs leading-snug' : 'text-sm sm:text-2xl'} leading-tight line-clamp-2 drop-shadow-md`}>
                                {currentItem.title}
                            </h4>

                            <div className="flex items-center gap-2">
                                <div className={`relative ${isCompact ? 'w-4 h-4' : 'w-5 h-5 sm:w-8 sm:h-8'} rounded-full overflow-hidden border border-white/50 shadow-sm flex-shrink-0`}>
                                    {currentItem.channelAvatar ? (
                                        <img src={currentItem.channelAvatar} alt={currentItem.channelName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-[8px]">
                                            {currentItem.channelName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <span className={`text-gray-200 ${isCompact ? 'text-[9px]' : 'text-[10px] sm:text-sm'} font-medium truncate max-w-[80px] sm:max-w-none`}>
                                    {currentItem.channelName}
                                </span>
                            </div>

                            <button
                                className={`mt-1 w-full ${isCompact ? 'py-1.5' : 'py-1.5 sm:py-3.5'} bg-white text-gray-900 rounded-lg sm:rounded-xl font-bold ${isCompact ? 'text-[10px]' : 'text-[10px] sm:text-sm'} uppercase tracking-wide hover:bg-gray-50 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5 group/btn`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/channel/${currentItem.channelSlug}/products/${currentItem.id}`);
                                }}
                            >
                                {isCompact ? 'Watch' : (
                                    <>
                                        Watch <span className="hidden sm:inline">Now</span>
                                    </>
                                )}
                                <RocketLaunchIcon className={`${isCompact ? 'w-3 h-3' : 'w-3 h-3 sm:w-4 sm:h-4'} group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform`} />
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 px-2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={(e) => { e.preventDefault(); slidePrev(); }}
                    className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 pointer-events-auto hover:bg-white/20 transition-all hover:scale-110"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={(e) => { e.preventDefault(); slideNext(); }}
                    className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 pointer-events-auto hover:bg-white/20 transition-all hover:scale-110"
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Pagination Indicators with progress fill */}
            <div className="absolute top-6 right-6 flex gap-1.5 z-20">
                {items.map((_, idx) => (
                    <div
                        key={idx}
                        className="relative h-1 rounded-full overflow-hidden"
                        style={{ width: idx === currentIndex ? 24 : 8, transition: 'width 0.4s' }}
                    >
                        <span className="absolute inset-0 bg-white/30 rounded-full" />
                        {idx === currentIndex && (
                            <span
                                className="absolute inset-y-0 left-0 rounded-full bg-white shadow-[0_0_6px_#fff]"
                                style={{ width: `${progress}%`, transition: 'none' }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
