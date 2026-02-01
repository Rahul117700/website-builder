'use client';

import React from 'react';
import ProductCardSkeleton from '@/components/product/ProductCardSkeleton';

export default function HomeSkeleton() {
    return (
        <div className="max-w-[1800px] mx-auto p-4 md:p-6">
            <div className="flex flex-col xl:flex-row gap-8">
                {/* Main Content Column */}
                <div className="flex-1 min-w-0 space-y-10">

                    {/* Section: Recommended Skeleton */}
                    <section>
                        <div className="h-7 w-48 bg-gray-200 rounded mb-6 animate-pulse"></div>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 sm:gap-x-4 gap-y-6 sm:gap-y-8">
                            {[...Array(8)].map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                    </section>

                    {/* Section: Trending Reads Skeleton */}
                    <section className="bg-gray-50 -mx-4 md:-mx-6 px-4 md:px-6 py-8 border-y border-gray-100">
                        <div className="h-7 w-40 bg-gray-200 rounded mb-6 animate-pulse"></div>
                        <div className="flex gap-4 overflow-hidden">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="min-w-[200px] w-[200px] flex-shrink-0">
                                    <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Sidebar Column Skeleton */}
                <div className="hidden xl:block w-[350px] flex-shrink-0 space-y-6">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-[500px] animate-pulse">
                        <div className="h-6 w-32 bg-gray-200 rounded mb-6"></div>
                        <div className="aspect-[4/5] bg-gray-100 rounded-xl mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>

                    <div className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}
