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
        >
            <div className="max-w-[1800px] mx-auto p-4 md:p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        {displayTag}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Explore the best {tag} products from our top creators.
                    </p>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 sm:gap-2">
                        {products.map((product, index) => (
                            <React.Fragment key={product.id}>
                                <ProductCard {...product} />
                                {index === 0 && <MobileTrendingWidget items={products.slice(0, 5)} />}
                            </React.Fragment>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-500">
                            We couldn't find any products with the tag "{displayTag}" yet.
                        </p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
