'use client';

import { useState, useEffect } from 'react';
import TemplateRenderer from '@/components/channel/TemplateRenderer';
import LogoLoader from '@/components/loaders/LogoLoader';
import MainLayout from '@/components/layout/MainLayout';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ChannelClient({ initialChannel, slug }: { initialChannel: any, slug: string }) {
    const [channel, setChannel] = useState<any | null>(initialChannel);
    const [loading, setLoading] = useState(!initialChannel);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!initialChannel && slug) {
            loadChannel();
        }
    }, [slug, initialChannel]);

    const loadChannel = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/channels/public/${slug}`);

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to load channel');
                return;
            }

            const data = await response.json();
            setChannel(data);
        } catch (error) {
            console.error('Error loading channel:', error);
            setError('Failed to load channel');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LogoLoader fullScreen />;
    }

    if (error || !channel) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="inline-block p-6 bg-red-100 rounded-full mb-6">
                        <ExclamationTriangleIcon className="h-16 w-16 text-red-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Channel Not Found</h1>
                    <p className="text-gray-600 mb-8">
                        {error || 'This channel does not exist or is not available.'}
                    </p>
                    <a
                        href="/"
                        className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black transition-colors"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        );
    }

    return (
        <MainLayout isDarkTheme={true}>
            <TemplateRenderer channel={channel} />
        </MainLayout>
    );
}
