'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BookmarkIcon } from '@heroicons/react/24/solid';
import { SparklesIcon } from '@heroicons/react/24/outline';
import MainLayout from '@/components/layout/MainLayout';

interface SavedProduct {
    id: string;
    productId: string;
    createdAt: string;
    product: {
        id: string;
        title: string;
        description: string | null;
        price: number;
        previewImage: string | null;
        slug: string | null;
        channel: {
            id: string;
            name: string;
            slug: string;
        };
    };
}

export default function SavedProductsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }

        if (status === 'authenticated') {
            fetchSavedProducts();
        }
    }, [status, router]);

    const fetchSavedProducts = async () => {
        try {
            const response = await fetch('/api/saved');
            if (response.ok) {
                const data = await response.json();
                setSavedProducts(data);
            } else {
                console.error('Failed to fetch saved products');
            }
        } catch (error) {
            console.error('Error fetching saved products:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || status === 'loading') {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <BookmarkIcon className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Saved Products</h1>
                    </div>
                    <p className="text-gray-600">
                        Products you've bookmarked from across all channels
                    </p>
                </div>

                {/* Content */}
                {savedProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="bg-gray-100 rounded-full p-6 mb-6">
                            <BookmarkIcon className="w-16 h-16 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            No saved products yet
                        </h2>
                        <p className="text-gray-600 text-center mb-8 max-w-md">
                            Start bookmarking products you want to check out later. Click the bookmark icon on any product card.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            Explore Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {savedProducts.map((saved) => (
                            <Link
                                key={saved.id}
                                href={`/channel/${saved.product.channel.slug}/products/${saved.product.id}`}
                                className="group block"
                            >
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                                    {/* Product Image */}
                                    <div className="relative aspect-video bg-gray-100">
                                        {saved.product.previewImage ? (
                                            <Image
                                                src={saved.product.previewImage}
                                                alt={saved.product.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <BookmarkIcon className="w-12 h-12 text-gray-300" />
                                            </div>
                                        )}
                                        {/* Saved Badge */}
                                        <div className="absolute top-2 right-2 bg-blue-600 text-white p-1.5 rounded-full shadow-lg">
                                            <BookmarkIcon className="w-4 h-4" />
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                                            {saved.product.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {saved.product.channel.name}
                                        </p>
                                        {saved.product.price > 0 && (
                                            <p className="text-sm font-semibold text-gray-900">
                                                ₹{saved.product.price.toLocaleString()}
                                            </p>
                                        )}
                                        {saved.product.price === 0 && (
                                            <p className="text-sm font-semibold text-green-600">
                                                Free
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
