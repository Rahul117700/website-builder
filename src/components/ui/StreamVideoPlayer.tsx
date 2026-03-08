'use client';

import { useEffect, useRef, useState } from 'react';

import CatLoader from '@/components/loaders/CatLoader';

interface StreamVideoPlayerProps {
    src: string;
    fileType?: string;
    createdAt?: string;
    onPlayChange?: (playing: boolean) => void;
}

/**
 * StreamVideoPlayer — instant-start video player.
 * Routes all /uploads/ video requests through /api/video-stream which serves
 * proper HTTP 206 Partial Content responses, so the browser can start playing
 * from the very first chunk without downloading the whole file.
 */
export default function StreamVideoPlayer({ src, fileType = 'video/mp4', onPlayChange }: StreamVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isReady, setIsReady] = useState(false);

    // Convert a direct /uploads/... URL into our streaming route
    const streamSrc = (() => {
        try {
            // Handle absolute URLs — extract the path part only
            const url = src.startsWith('http') ? new URL(src).pathname : src;
            if (url.startsWith('/uploads/')) {
                return `/api/video-stream?path=${encodeURIComponent(url)}`;
            }
            return src; // External URLs (CDN etc) — use as-is
        } catch {
            return src;
        }
    })();

    useEffect(() => {
        const vid = videoRef.current;
        if (!vid) return;

        const onCanPlay = () => {
            setIsReady(true);
            vid.play().catch(() => { /* user interaction required */ });
            onPlayChange?.(true);
        };

        vid.addEventListener('canplay', onCanPlay);
        return () => vid.removeEventListener('canplay', onCanPlay);
    }, [streamSrc, onPlayChange]);

    return (
        <div className="relative w-full h-full bg-black">
            {/* Spinner shown until first frame is ready */}
            {!isReady && (
                <div className="absolute inset-0 z-[100] bg-black">
                    <CatLoader fullScreen={false} message="Buffering..." />
                </div>
            )}

            <video
                ref={videoRef}
                src={streamSrc}
                controls
                playsInline
                preload="auto"
                className={`w-full h-full transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}
                style={{ objectFit: 'contain', backgroundColor: 'black' }}
                onPlay={() => onPlayChange?.(true)}
                onPause={() => onPlayChange?.(false)}
                onError={(e) => console.error('Video error:', e)}
            >
                <source src={streamSrc} type={fileType} />
            </video>
        </div>
    );
}
