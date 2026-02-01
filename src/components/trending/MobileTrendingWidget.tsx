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
        <div className="md:hidden row-span-2 col-start-2 bg-white rounded-2xl p-0 shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-50 flex-shrink-0">
                <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">
                    Trending Now
                </h3>
            </div>
            <div className="flex-1 min-h-0 relative">
                <TrendingCarousel items={items} isCompact={true} />
            </div>
        </div>
    );
}
