'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/product/ProductCard';
import { ProductCardData, SubscriptionData, NotificationData } from '@/app/actions/homepage';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import MobileTrendingWidget from '@/components/trending/MobileTrendingWidget';

interface ExploreContentProps {
    tag: string;
    products: ProductCardData[];
    userSubscriptions?: SubscriptionData[];
    notifications?: NotificationData[];
}

export default function ExploreContent({
    tag,
    products = [],
    userSubscriptions = [],
    notifications = []
}: ExploreContentProps) {
    const displayTag = tag.charAt(0).toUpperCase() + tag.slice(1);

    return (
        <MainLayout
            userSubscriptions={userSubscriptions}
            notifications={notifications}
            isDarkTheme={true}
        >
            <div className="min-h-screen bg-[#141414]">
                <div className="max-w-[1800px] mx-auto p-4 md:p-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            {displayTag}
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Explore the best {tag} products from our top creators.
                        </p>
                    </div>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 sm:gap-2">
                            {products.map((product, index) => (
                                <React.Fragment key={product.id}>
                                    <ProductCard {...product} isDarkTheme={true} />
                                    {index === 1 && <MobileTrendingWidget items={products.slice(0, 5)} />}
                                </React.Fragment>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-[#1a1a1a] rounded-2xl border border-[#333]">
                            <MagnifyingGlassIcon className="w-16 h-16 text-[#444] mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
                            <p className="text-gray-400">
                                We couldn't find any products with the tag "{displayTag}" yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
