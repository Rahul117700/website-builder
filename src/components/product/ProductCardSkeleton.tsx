'use client';

import React from 'react';

export default function ProductCardSkeleton({ isVideo = true }: { isVideo?: boolean }) {
    return (
        <div className="flex flex-col h-full animate-pulse">
            {/* Thumbnail Skeleton */}
            <div className={`relative ${isVideo ? 'aspect-video' : 'aspect-[4/3]'} rounded-xl bg-gray-200 mb-3 shadow-sm border border-gray-100`}>
                {/* Badges/Icons placeholders if needed */}
                <div className="absolute top-2 right-2 w-10 h-4 bg-gray-300 rounded"></div>
                <div className="absolute top-2 left-2 w-6 h-6 bg-gray-300 rounded-lg"></div>
            </div>

            {/* Info Skeleton */}
            <div className="flex gap-3 items-start flex-1">
                {/* Avatar Skeleton */}
                <div className="w-9 h-9 flex-shrink-0 bg-gray-200 rounded-full"></div>

                <div className="flex-1 min-w-0 space-y-2">
                    {/* Title Line 1 */}
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    {/* Title Line 2 (optional) */}
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>

                    <div className="flex flex-col gap-1">
                        {/* Channel Name */}
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        {/* Views/Date */}
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
