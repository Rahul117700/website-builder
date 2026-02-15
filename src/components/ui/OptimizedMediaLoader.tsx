'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';

interface OptimizedMediaLoaderProps {
    children: ReactNode;
    aspectRatio?: string;
    className?: string;
    type?: 'video' | 'pdf' | 'image' | 'code';
}

export default function OptimizedMediaLoader({
    children,
    aspectRatio = 'aspect-video',
    className = '',
    type = 'video'
}: OptimizedMediaLoaderProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' } // Load slightly before it comes into view
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
        return () => observer.disconnect();
    }, []);

    // Fallback: If loader hangs for too long (e.g. iframe issues), show content anyway
    useEffect(() => {
        if (isVisible && !isLoaded) {
            const timer = setTimeout(() => {
                if (!isLoaded) setIsLoaded(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, isLoaded]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full ${aspectRatio} bg-slate-900 overflow-hidden ${className}`}
        >
            {/* Skeleton Loader */}
            {!isLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 animate-pulse z-10">
                    <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
                    <div className="w-48 h-4 bg-slate-200 rounded"></div>
                    <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {isVisible ? `Optimizing ${type} Stream...` : 'Waiting for Viewport...'}
                    </div>
                </div>
            )}

            {/* Actual Content (Lazy Loaded) */}
            {isVisible && (
                <div
                    className={`w-full h-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setIsLoaded(true)}
                    // Custom event for non-image elements like video/iframe
                    onTransitionEnd={() => !isLoaded && setIsLoaded(true)}
                >
                    {/* We wrap children and try to detect load for iframes and videos */}
                    <div className="w-full h-full" ref={(el) => {
                        if (!el) return;
                        // Immediate check for elements that don't trigger onLoad easily
                        const media = el.querySelector('video, iframe, img');
                        if (media) {
                            if (media.tagName === 'IMG' && (media as HTMLImageElement).complete) {
                                setIsLoaded(true);
                            } else {
                                media.addEventListener('load', () => setIsLoaded(true));
                                media.addEventListener('loadeddata', () => setIsLoaded(true));
                                media.addEventListener('canplay', () => setIsLoaded(true));
                            }
                        }
                    }}>
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
}
