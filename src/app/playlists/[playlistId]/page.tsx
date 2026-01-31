'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    FolderIcon,
    TrashIcon,
    ClockIcon,
    GlobeAltIcon,
    LockClosedIcon,
    PlayIcon,
    EllipsisVerticalIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from 'react-hot-toast';

interface PlaylistItem {
    id: string;
    order: number;
    product: {
        id: string;
        title: string;
        type: string;
        previewImage: string | null;
        price: number;
        currency: string;
        channel: {
            id: string;
            name: string;
            slug: string;
            user: {
                name: string | null;
                image: string | null;
            };
        };
    };
}

interface Playlist {
    id: string;
    name: string;
    description: string | null;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
    items: PlaylistItem[];
}

export default function PlaylistPage() {
    const { data: session, status } = useSession();
    const params = useParams();
    const router = useRouter();
    const playlistId = params?.playlistId as string;

    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }

        if (status === 'authenticated' && playlistId) {
            fetchPlaylist();
        }
    }, [status, router, playlistId]);

    const fetchPlaylist = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/user/playlists/${playlistId}`);
            if (response.ok) {
                const data = await response.json();
                setPlaylist(data.playlist);
            } else {
                toast.error('Playlist not found');
                router.push('/');
            }
        } catch (error) {
            console.error('Error fetching playlist:', error);
            toast.error('Failed to load playlist');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItem = async (productId: string) => {
        try {
            setRemovingId(productId);
            const response = await fetch(`/api/user/playlists/${playlistId}/items?productId=${productId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast.success('Removed from playlist');
                // Refresh local state
                setPlaylist(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        items: prev.items.filter(item => item.product.id !== productId)
                    };
                });
            } else {
                toast.error('Failed to remove item');
            }
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('Something went wrong');
        } finally {
            setRemovingId(null);
        }
    };

    const handlePlayAll = () => {
        if (playlist && playlist.items.length > 0) {
            const firstItem = playlist.items[0];
            router.push(`/channel/${firstItem.product.channel.slug}/products/${firstItem.product.id}`);
        }
    };

    if (loading || status === 'loading') {
        return (
            <MainLayout>
                <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-500 font-medium">Loading your playlist...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!playlist) return null;

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                        {/* Sidebar / Header */}
                        <div className="lg:w-80 shrink-0">
                            <div className="relative aspect-video lg:aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-indigo-100 group">
                                {playlist.items[0]?.product.previewImage ? (
                                    <Image
                                        src={playlist.items[0].product.previewImage}
                                        alt={playlist.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <FolderIcon className="w-20 h-20 text-white/50" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={handlePlayAll}
                                        className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                                    >
                                        <PlayIcon className="w-8 h-8 text-indigo-600 ml-1" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 lg:mt-8 space-y-4">
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
                                    {playlist.name}
                                </h1>

                                {playlist.description && (
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {playlist.description}
                                    </p>
                                )}

                                <div className="flex items-center flex-wrap gap-4 py-4 border-y border-gray-100">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
                                        {playlist.isPublic ? (
                                            <GlobeAltIcon className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                            <LockClosedIcon className="w-4 h-4 text-amber-500" />
                                        )}
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            {playlist.isPublic ? 'Public' : 'Private'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
                                        <ClockIcon className="w-4 h-4 text-indigo-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            {playlist.items.length} Items
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePlayAll}
                                    disabled={playlist.items.length === 0}
                                    className="w-full h-12 flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <PlayIcon className="w-5 h-5 fill-current" />
                                    Play All
                                </button>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 min-w-0">
                            {playlist.items.length === 0 ? (
                                <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FolderIcon className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Your playlist is empty</h3>
                                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                                        Explore and add products you love to this playlist to keep them organized.
                                    </p>
                                    <Link
                                        href="/"
                                        className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl"
                                    >
                                        <SparklesIcon className="w-5 h-5" />
                                        Browse Products
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {playlist.items.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="group relative bg-white rounded-3xl p-4 flex gap-4 sm:gap-6 hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50 transition-all border border-transparent hover:border-indigo-100/50"
                                        >
                                            <div className="hidden sm:flex items-center justify-center w-6 text-sm font-bold text-gray-300 group-hover:text-indigo-400 transition-colors">
                                                {index + 1}
                                            </div>

                                            <Link
                                                href={`/channel/${item.product.channel.slug}/products/${item.product.id}`}
                                                className="relative w-32 sm:w-48 aspect-video rounded-2xl overflow-hidden shrink-0 shadow-sm"
                                            >
                                                {item.product.previewImage ? (
                                                    <Image
                                                        src={item.product.previewImage}
                                                        alt={item.product.title}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                        <PlayIcon className="w-8 h-8 text-gray-300" />
                                                    </div>
                                                )}
                                                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-widest">
                                                    {item.product.type}
                                                </div>
                                            </Link>

                                            <div className="flex-1 min-w-0 py-1">
                                                <Link
                                                    href={`/channel/${item.product.channel.slug}/products/${item.product.id}`}
                                                    className="inline-block"
                                                >
                                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors">
                                                        {item.product.title}
                                                    </h3>
                                                </Link>

                                                <div className="mt-2 flex items-center gap-2">
                                                    <Link
                                                        href={`/channel/${item.product.channel.slug}`}
                                                        className="relative w-5 h-5 rounded-full overflow-hidden shrink-0"
                                                    >
                                                        {item.product.channel.user.image ? (
                                                            <Image
                                                                src={item.product.channel.user.image}
                                                                alt={item.product.channel.name}
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                                                                {item.product.channel.name[0]}
                                                            </div>
                                                        )}
                                                    </Link>
                                                    <Link
                                                        href={`/channel/${item.product.channel.slug}`}
                                                        className="text-xs font-bold text-gray-500 hover:text-indigo-600 transition-colors"
                                                    >
                                                        {item.product.channel.name}
                                                    </Link>
                                                </div>

                                                <div className="mt-4 flex items-center justify-between">
                                                    <div className="text-sm font-black text-gray-900">
                                                        {item.product.price > 0 ? (
                                                            `₹${item.product.price.toLocaleString()}`
                                                        ) : (
                                                            <span className="text-emerald-600 uppercase tracking-widest text-[10px]">Free</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleRemoveItem(item.product.id)}
                                                    disabled={removingId === item.product.id}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Remove from playlist"
                                                >
                                                    {removingId === item.product.id ? (
                                                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <TrashIcon className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
