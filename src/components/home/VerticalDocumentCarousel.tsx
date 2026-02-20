'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ProductCardData } from '@/app/actions/homepage';

interface VerticalDocumentCarouselProps {
    items: ProductCardData[];
}

export default function VerticalDocumentCarousel({ items }: VerticalDocumentCarouselProps) {
    const router = useRouter();
    // Use a window of 6 items for the carousel
    const WINDOW_SIZE = 6;
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-scroll logic
    useEffect(() => {
        if (items.length <= WINDOW_SIZE) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 2) % items.length);
        }, 3000); // Change every 3 seconds

        return () => clearInterval(timer);
    }, [items.length]);

    // Get visible items based on current index (circular)
    const visibleItems = [];
    for (let i = 0; i < Math.min(items.length, WINDOW_SIZE); i++) {
        const index = (currentIndex + i) % items.length;
        visibleItems.push({ ...items[index], uniqueKey: `${items[index].id}-${index}-${currentIndex}` });
    }

    // However, for a smooth "slide up" effect with AnimatePresence, 
    // we need a stable list where keys don't change unnecessarily, but items enter/leave.
    // A simpler approach for "ticker" style:
    // Just map visible items relative to currentIndex.

    // Better Approach for Marquee:
    // Display items from index [currentIndex] to [currentIndex + WINDOW_SIZE].
    // Key them by their actual ID to allow Framer Motion to track them.
    // We need to handle wrapping (show items from start if close to end of array).

    const getOrderedItems = () => {
        const result = [];
        for (let i = 0; i < WINDOW_SIZE; i++) {
            const itemIndex = (currentIndex + i) % items.length;
            result.push(items[itemIndex]);
        }
        return result;
    };

    const displayItems = items.length <= WINDOW_SIZE ? items : getOrderedItems();

    return (
        <div className="grid grid-cols-2 gap-3 overflow-hidden h-full relative content-start" style={{ minHeight: '400px' }}>
            {/* Gradient Overlay for "fading out" effect at top/bottom if desired */}
            {/* <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div> */}
            {/* <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div> */}

            <AnimatePresence initial={false} mode="popLayout">
                {displayItems.map((product) => (
                    <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 15 }}
                        className="group flex gap-3 p-2.5 rounded-none bg-transparent hover:bg-gray-50 transition-all cursor-pointer relative flex-shrink-0"
                        onClick={() => router.push(`/channel/${product.channelSlug}/products/${product.id}`)}
                    >
                        {/* Thumbnail */}
                        <div className="relative w-16 h-20 flex-shrink-0 rounded-none overflow-hidden bg-gray-100 shadow-sm group-hover:shadow transition-all">
                            <Image
                                src={product.thumbnail}
                                alt={product.title}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
                            <div>
                                <h4 className="font-bold text-gray-900 text-[13px] leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1">
                                    {product.title}
                                </h4>
                                <p className="text-[11px] text-gray-500 truncate mb-1.5">{product.channelName}</p>
                            </div>

                            <div className="flex items-center">
                                {product.isSubscriberOnly ? (
                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                        Subscriber Only
                                    </span>
                                ) : (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${product.price === 0 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-gray-700 bg-gray-50 border-gray-100'}`}>
                                        {product.price === 0 ? 'Free' : `₹${product.price}`}
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
