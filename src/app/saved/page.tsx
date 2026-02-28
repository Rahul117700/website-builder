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
            <MainLayout isDarkTheme={true}>
                <div className="flex items-center justify-center min-h-screen bg-[#141414]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout isDarkTheme={true}>
            <div className="min-h-screen bg-[#141414] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8 border-b border-[#333] pb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <BookmarkIcon className="w-8 h-8 text-indigo-500" />
                            <h1 className="text-3xl font-bold text-white">Saved Products</h1>
                        </div>
                        <p className="text-gray-400 font-medium">
                            Products you've bookmarked from across all channels
                        </p>
                    </div>

                    {/* Content */}
                    {savedProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <div className="bg-[#1a1a1a] rounded-full p-6 mb-6 inline-flex shadow-sm">
                                <BookmarkIcon className="w-16 h-16 text-[#444]" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                No saved products yet
                            </h2>
                            <p className="text-gray-400 text-center mb-8 max-w-md">
                                Start bookmarking products you want to check out later. Click the bookmark icon on any product card.
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-500/20"
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
                                    <div className="bg-[#1a1a1a] rounded-2xl shadow-sm border border-[#333] hover:border-[#444] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all">
                                        {/* Product Image */}
                                        <div className="relative aspect-video bg-[#2a2a2a]">
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
                                                    <BookmarkIcon className="w-12 h-12 text-[#444]" />
                                                </div>
                                            )}
                                            {/* Saved Badge */}
                                            <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg border border-indigo-500">
                                                <BookmarkIcon className="w-4 h-4" />
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-5">
                                            <h3 className="font-bold text-lg text-white line-clamp-2 mb-2 group-hover:text-indigo-400 transition-colors">
                                                {saved.product.title}
                                            </h3>
                                            <p className="text-sm font-medium text-gray-400 mb-4 tracking-wide">
                                                {saved.product.channel.name}
                                            </p>

                                            <div className="pt-4 border-t border-[#333] flex justify-between items-center">
                                                {saved.product.price > 0 ? (
                                                    <p className="text-lg font-black text-white">
                                                        ₹{saved.product.price.toLocaleString()}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm font-black text-emerald-400 px-3 py-1 bg-emerald-900/20 rounded-lg inline-block uppercase tracking-wider">
                                                        Free
                                                    </p>
                                                )}

                                                <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center group-hover:bg-indigo-900/30 group-hover:text-indigo-400 transition-colors">
                                                    <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
