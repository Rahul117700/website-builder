'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ClockIcon, TrashIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/outline';
import MainLayout from '@/components/layout/MainLayout';

interface HistoryItem {
    id: string;
    productId: string;
    viewedAt: string;
    product: {
        id: string;
        title: string;
        description: string | null;
        price: number;
        previewImage: string | null;
        slug: string | null;
        type: string;
        channel: {
            id: string;
            name: string;
            slug: string;
        };
    };
}

interface GroupedHistory {
    today: HistoryItem[];
    yesterday: HistoryItem[];
    thisWeek: HistoryItem[];
    earlier: HistoryItem[];
}

export default function HistoryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [groupedHistory, setGroupedHistory] = useState<GroupedHistory>({
        today: [],
        yesterday: [],
        thisWeek: [],
        earlier: [],
    });
    const [loading, setLoading] = useState(true);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }

        if (status === 'authenticated') {
            fetchHistory();
        }
    }, [status, router]);

    const fetchHistory = async () => {
        try {
            const response = await fetch('/api/history');
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
                groupHistoryByDate(data);
            } else {
                console.error('Failed to fetch history');
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const groupHistoryByDate = (historyItems: HistoryItem[]) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const thisWeek = new Date(today);
        thisWeek.setDate(thisWeek.getDate() - 7);

        const groups: GroupedHistory = {
            today: [],
            yesterday: [],
            thisWeek: [],
            earlier: [],
        };

        historyItems.forEach(item => {
            const viewDate = new Date(item.viewedAt);
            if (viewDate >= today) {
                groups.today.push(item);
            } else if (viewDate >= yesterday) {
                groups.yesterday.push(item);
            } else if (viewDate >= thisWeek) {
                groups.thisWeek.push(item);
            } else {
                groups.earlier.push(item);
            }
        });

        setGroupedHistory(groups);
    };

    const handleClearHistory = async () => {
        try {
            const response = await fetch('/api/history', { method: 'DELETE' });
            if (response.ok) {
                setHistory([]);
                setGroupedHistory({
                    today: [],
                    yesterday: [],
                    thisWeek: [],
                    earlier: [],
                });
                setShowClearConfirm(false);
            } else {
                console.error('Failed to clear history');
            }
        } catch (error) {
            console.error('Error clearing history:', error);
        }
    };

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const renderHistoryGroup = (title: string, items: HistoryItem[]) => {
        if (items.length === 0) return null;

        return (
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
                <div className="space-y-3">
                    {items.map((item) => (
                        <Link
                            key={item.id}
                            href={`/channel/${item.product.channel.slug}/products/${item.product.id}`}
                            className="group block"
                        >
                            <div className="flex gap-4 bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md hover:border-gray-300 transition-all">
                                {/* Thumbnail */}
                                <div className="relative w-40 h-24 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                    {item.product.previewImage ? (
                                        <Image
                                            src={item.product.previewImage}
                                            alt={item.product.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <ClockIcon className="w-8 h-8 text-gray-300" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                                        {item.product.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                        {item.product.channel.name}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <ClockIcon className="w-4 h-4" />
                                        <span>{formatRelativeTime(item.viewedAt)}</span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex-shrink-0 text-right">
                                    {item.product.price > 0 ? (
                                        <p className="text-sm font-semibold text-gray-900">
                                            ₹{item.product.price.toLocaleString()}
                                        </p>
                                    ) : (
                                        <p className="text-sm font-semibold text-green-600">
                                            Free
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        );
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
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <ClockIcon className="w-8 h-8 text-gray-700" />
                            <h1 className="text-3xl font-bold text-gray-900">Watch History</h1>
                        </div>
                        <p className="text-gray-600">
                            Products you've viewed recently
                        </p>
                    </div>
                    {history.length > 0 && (
                        <button
                            onClick={() => setShowClearConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <TrashIcon className="w-5 h-5" />
                            <span className="font-medium">Clear History</span>
                        </button>
                    )}
                </div>

                {/* Content */}
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="bg-gray-100 rounded-full p-6 mb-6">
                            <ClockIcon className="w-16 h-16 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            No viewing history yet
                        </h2>
                        <p className="text-gray-600 text-center mb-8 max-w-md">
                            Your viewing history will appear here as you explore products across different channels.
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
                    <div>
                        {renderHistoryGroup('Today', groupedHistory.today)}
                        {renderHistoryGroup('Yesterday', groupedHistory.yesterday)}
                        {renderHistoryGroup('This Week', groupedHistory.thisWeek)}
                        {renderHistoryGroup('Earlier', groupedHistory.earlier)}
                    </div>
                )}

                {/* Clear Confirmation Modal */}
                {showClearConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Clear watch history?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                This will remove all products from your viewing history. This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowClearConfirm(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClearHistory}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                >
                                    Clear History
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
