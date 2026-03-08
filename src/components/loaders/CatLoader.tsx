'use client';

import React from 'react';

interface CatLoaderProps {
    message?: string;
    fullScreen?: boolean;
}

export default function CatLoader({ message = "", fullScreen = false }: CatLoaderProps) {
    const content = (
        <div className="flex flex-col items-center justify-center p-8 bg-transparent">
            {/* Aesthetic Minimal Spinner */}
            <div className="relative w-16 h-16 mb-6">
                {/* Outer subtle ring */}
                <div className="absolute inset-0 rounded-full border border-white/10" />
                {/* Animated spinning ring */}
                <div className="absolute inset-0 rounded-full border border-white/80 border-t-transparent animate-spin" style={{ animationDuration: '1s', animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }} />
                {/* Inner static small dot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full bg-glow-white" />
            </div>

            {/* Brand & Loading Text */}
            <div className="text-center">
                <h2 className="text-xl font-bold text-white tracking-[0.2em] mb-4">
                    SED STUDIOS
                </h2>
                {message && (
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-widest animate-pulse">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-[100] bg-[#111111] flex items-center justify-center">
                {content}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center w-full min-h-[400px]">
            {content}
        </div>
    );
}
