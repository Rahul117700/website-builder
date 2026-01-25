'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/outline';

interface LikedProduct {
    id: string;
    createdAt: string;
    product: {
        id: string;
        title: string;
        description: string;
        previewImage: string;
        price: number;
        type: string;
        channel: {
            id: string;
            name: string;
            slug: string;
            user: {
                name: string;
                image: string;
            };
        };
    };
}

export default function LikedProductsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [likedProducts, setLikedProducts] = useState<LikedProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }

        if (status === 'authenticated') {
            fetchLikedProducts();
        }
    }, [status, router]);

    const fetchLikedProducts = async () => {
        try {
            const response = await fetch('/api/liked');
            if (response.ok) {
                const data = await response.json();
                setLikedProducts(data);
            }
        } catch (error) {
            console.error('Error fetching liked products:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || status === 'loading') {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading liked products...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Liked Products</h1>
                    <p className="text-gray-600">Products you've liked from across all channels</p>
                </div>

                {likedProducts.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                            <HeartIcon className="w-16 h-16 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">No liked products yet</h2>
                        <p className="text-gray-600 mb-6">Start exploring and like products you're interested in!</p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black transition-colors"
                        >
                            Explore Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {likedProducts.map((item) => (
                            <Link
                                key={item.id}
                                href={`/channel/${item.product.channel.slug}/products/${item.product.id}`}
                                className="group"
                            >
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                                    {/* Product Image */}
                                    <div className="relative aspect-video bg-gray-100">
                                        <Image
                                            src={item.product.previewImage || '/placeholder-product.jpg'}
                                            alt={item.product.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform"
                                            unoptimized
                                        />
                                        {item.product.price === 0 && (
                                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                Free
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                                            {item.product.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="relative w-6 h-6 flex-shrink-0">
                                                <Image
                                                    src={item.product.channel.user.image || '/default-avatar.png'}
                                                    alt={item.product.channel.name}
                                                    fill
                                                    className="rounded-full object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">{item.product.channel.name}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">{item.product.type}</span>
                                            <HeartIcon className="w-5 h-5 text-red-500 fill-current" />
                                        </div>
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
