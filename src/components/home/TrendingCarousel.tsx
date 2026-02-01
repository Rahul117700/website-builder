'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { RocketLaunchIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ProductCardData } from '@/app/actions/homepage';

interface TrendingCarouselProps {
    items: ProductCardData[];
    isCompact?: boolean;
    isLoading?: boolean;
}

export default function TrendingCarousel({ items, isCompact = false, isLoading = false }: TrendingCarouselProps) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0); // -1 for left, 1 for right

    const slideNext = useCallback(() => {
        if (!items.length) return;
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % items.length);
    }, [items.length]);

    const slidePrev = useCallback(() => {
        if (!items.length) return;
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }, [items.length]);

    useEffect(() => {
        if (isLoading || !items.length) return;
        const timer = setInterval(slideNext, 5000);
        return () => clearInterval(timer);
    }, [slideNext, isLoading, items.length]);

    if (isLoading) {
        return (
            <div className={`relative ${isCompact ? 'aspect-[3/5]' : 'aspect-[3/4]'} rounded-2xl overflow-hidden bg-gray-100 animate-pulse border border-gray-100`}>
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
        <div className={`relative ${isCompact ? 'aspect-[3/5]' : 'aspect-[3/4]'} rounded-2xl overflow-hidden bg-gray-900 shadow-2xl group`}>
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
                        {(currentItem.type === 'VIDEO' || currentItem.type === 'VIDEOS') && currentItem.videoUrl ? (
                            <video
                                src={currentItem.videoUrl}
                                className="absolute inset-0 w-full h-full object-cover opacity-90"
                                autoPlay
                                muted
                                loop
                                playsInline
                            />
                        ) : (
                            <img
                                src={currentItem.thumbnail}
                                alt={currentItem.title}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        )}
                    </div>

                    {/* Premium Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-40" />

                    {/* Content */}
                    <div className={`absolute inset-0 ${isCompact ? 'p-3' : 'p-6'} flex flex-col justify-end`}>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-3"
                        >
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xl text-white ${isCompact ? 'text-[8px]' : 'text-[10px]'} font-black uppercase tracking-[0.2em] border border-white/20 shadow-xl`}>
                                    Top Trending
                                </span>
                            </div>

                            <h4 className={`text-white font-black ${isCompact ? 'text-base' : 'text-2xl'} leading-tight line-clamp-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] tracking-tight`}>
                                {currentItem.title}
                            </h4>

                            <div className="flex items-center gap-2">
                                <div className={`relative ${isCompact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full overflow-hidden border-2 border-white/50 shadow-lg flex-shrink-0`}>
                                    {currentItem.channelAvatar ? (
                                        <img src={currentItem.channelAvatar} alt={currentItem.channelName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-[10px]">
                                            {currentItem.channelName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <span className={`text-gray-100 ${isCompact ? 'text-[10px]' : 'text-sm'} font-bold tracking-tight drop-shadow-md truncate`}>
                                    {currentItem.channelName}
                                </span>
                            </div>

                            <button
                                className={`mt-2 w-full ${isCompact ? 'py-2' : 'py-3.5'} bg-white text-gray-900 rounded-xl font-black ${isCompact ? 'text-[10px]' : 'text-sm'} uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.3)] active:scale-95 flex items-center justify-center gap-2 group/btn`}
                                onClick={() => router.push(`/channel/${currentItem.channelSlug}/products/${currentItem.id}`)}
                            >
                                {isCompact ? 'Watch' : 'Watch Now'}
                                <RocketLaunchIcon className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform`} />
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

            {/* Pagination Indicators */}
            <div className="absolute top-6 right-6 flex gap-1.5 z-20">
                {items.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-1 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-6 bg-white shadow-[0_0_10px_#fff]' : 'w-2 bg-white/30'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
