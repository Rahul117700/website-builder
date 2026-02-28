'use client';

import React from 'react';
import { RocketLaunchIcon } from '@heroicons/react/24/outline';
import { ProductCardData } from '@/app/actions/homepage';
import TrendingCarousel from '@/components/home/TrendingCarousel';

interface MobileTrendingWidgetProps {
    items: ProductCardData[];
}

export default function MobileTrendingWidget({ items }: MobileTrendingWidgetProps) {
    if (!items.length) return null;

    return (
        <div className="md:hidden col-span-2 sm:col-span-2 mt-2 mb-4 w-full bg-[#1a1a1a] rounded-2xl p-0 shadow-sm border border-[#333] flex flex-col h-full overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-[#333] flex-shrink-0">
                <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">
                    Trending Now
                </h3>
            </div>
            <div className="flex-1 min-h-0 relative">
                <TrendingCarousel items={items} className='aspect-video sm:aspect-[21/9] w-full' />
            </div>
        </div>
    );
}
