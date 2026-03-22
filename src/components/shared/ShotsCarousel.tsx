'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    VideoCameraIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowRightIcon,
    FireIcon,
    PlayIcon,
} from '@heroicons/react/24/outline';
import { ProductCardData } from '@/app/actions/homepage';

interface ShotsCarouselProps {
    shots: ProductCardData[];
    /** Auto-advance interval in ms. Default 4000. Set 0 to disable. */
    autoPlayMs?: number;
}

export default function ShotsCarousel({ shots, autoPlayMs = 4000 }: ShotsCarouselProps) {
    const [activeIdx, setActiveIdx] = useState(0);
    const [paused, setPaused] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const scrollToCard = useCallback((idx: number) => {
        const el = scrollRef.current;
        if (!el) return;
        const cards = el.querySelectorAll('a');
        if (cards[idx]) {
            const card = cards[idx] as HTMLElement;
            const containerCenter = el.clientWidth / 2;
            const cardCenter = card.offsetLeft + card.offsetWidth / 2;
            el.scrollTo({ left: cardCenter - containerCenter, behavior: 'smooth' });
        }
    }, []);

    const goTo = useCallback((idx: number) => {
        const clamped = Math.max(0, Math.min(shots.length - 1, idx));
        setActiveIdx(clamped);
        scrollToCard(clamped);
    }, [shots.length, scrollToCard]);

    const scrollStrip = (dir: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const cardW = (el.querySelector('a') as HTMLElement)?.offsetWidth || 160;
        el.scrollBy({ left: dir === 'left' ? -(cardW + 12) * 2 : (cardW + 12) * 2, behavior: 'smooth' });
    };

    // Auto-rotate
    useEffect(() => {
        if (!autoPlayMs || paused || shots.length < 2) return;
        timerRef.current = setInterval(() => {
            setActiveIdx(prev => {
                const next = (prev + 1) % shots.length;
                scrollToCard(next);
                return next;
            });
        }, autoPlayMs);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [autoPlayMs, paused, shots.length, scrollToCard]);

    if (!shots.length) return null;

    return (
        <section
            className="mb-12 relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Cinematic blurred backdrop */}
            {shots[activeIdx]?.thumbnail && (
                <div className="absolute inset-0 overflow-hidden rounded-3xl -z-10 pointer-events-none">
                    <div
                        className="absolute inset-0 opacity-25 transition-all duration-700"
                        style={{ filter: 'blur(50px)', transform: 'scale(1.15)' }}
                    >
                        <Image
                            src={shots[activeIdx].thumbnail}
                            alt=""
                            fill
                            className="object-cover transition-all duration-700"
                            unoptimized
                        />
                    </div>
                </div>
            )}

            {/* Header row */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-2xl shadow-red-700/50 flex-shrink-0">
                        <VideoCameraIcon className="w-5 h-5 text-white" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black animate-ping" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight leading-none">Shots</h2>
                        <p className="text-[11px] text-gray-500 font-medium tracking-wide mt-0.5">Bite-sized reels · Swipe to explore</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Auto-play indicator */}
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                        <span className={`w-1.5 h-1.5 rounded-full ${paused ? 'bg-gray-500' : 'bg-red-500 animate-pulse'}`} />
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{paused ? 'Paused' : 'Live'}</span>
                    </div>

                    <button
                        onClick={() => { scrollStrip('left'); goTo(activeIdx - 1); }}
                        className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-all text-white shadow-lg backdrop-blur-sm"
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => { scrollStrip('right'); goTo(activeIdx + 1); }}
                        className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-all text-white shadow-lg backdrop-blur-sm"
                    >
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>

                    <Link href="/shots" className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-[0.15em] flex items-center gap-1 transition-colors ml-1">
                        All <ArrowRightIcon className="w-3 h-3" />
                    </Link>
                </div>
            </div>

            {/* Card strip */}
            <div
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto py-6 -my-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth w-full"
            >
                {shots.map((shot, idx) => {
                    const isActive = idx === activeIdx;
                    return (
                        <Link
                            href={`/shots/${shot.id}`}
                            key={shot.id}
                            onMouseEnter={() => { setActiveIdx(idx); setPaused(true); }}
                            onMouseLeave={() => setPaused(false)}
                            className={`relative flex-shrink-0 snap-center rounded-[20px] overflow-hidden cursor-pointer border transition-all duration-500 ease-out w-[130px] sm:w-[155px] h-[232px] sm:h-[276px] ${
                                isActive
                                    ? 'border-red-500/60 shadow-[0_0_35px_rgba(229,9,20,0.4)] scale-[1.15]'
                                    : 'border-white/5 shadow-xl opacity-75 hover:opacity-95 scale-100'
                            }`}
                        >
                            <Image
                                src={shot.thumbnail}
                                alt={shot.title}
                                fill
                                className={`object-cover transition-transform duration-700 ${isActive ? 'scale-110' : 'scale-100'}`}
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

                            {/* Active: center play button */}
                            {isActive && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-2xl">
                                        <PlayIcon className="w-5 h-5 text-white ml-1" />
                                    </div>
                                </div>
                            )}

                            {/* Progress bar on active card */}
                            {isActive && autoPlayMs > 0 && !paused && (
                                <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10">
                                    <div
                                        className="h-full bg-red-500 rounded-full"
                                        style={{
                                            animation: `progressBar ${autoPlayMs}ms linear`,
                                            animationFillMode: 'forwards',
                                        }}
                                    />
                                </div>
                            )}

                            {/* Channel avatar */}
                            <div className="absolute top-3 left-0 right-0 flex justify-center">
                                <div className={`relative flex-shrink-0 rounded-full bg-black overflow-hidden ring-2 shadow-lg transition-all duration-300 ${isActive ? 'w-10 h-10 ring-red-500' : 'w-8 h-8 ring-white/20'}`}>
                                    {shot.channelAvatar ? (
                                        <Image src={shot.channelAvatar} alt="" fill className="object-cover" unoptimized />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600 to-rose-700 text-white text-xs font-black">
                                            {(shot.channelName || 'C')[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bottom */}
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                <h3 className={`text-white font-bold line-clamp-2 leading-tight drop-shadow-md mb-1 transition-all duration-300 ${isActive ? 'text-sm' : 'text-[10px]'}`}>{shot.title}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-[9px] font-bold truncate max-w-[60%]">{shot.channelName}</span>
                                    <div className="flex items-center gap-0.5">
                                        <FireIcon className="w-2.5 h-2.5 text-red-500 shrink-0" />
                                        <span className="text-[9px] text-gray-400 font-bold">{shot.views}</span>
                                    </div>
                                </div>
                                {isActive && (
                                    <div className="mt-2 flex">
                                        <span className="px-2.5 py-1 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                            ▶ Watch Now
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-1.5 mt-4">
                {shots.slice(0, 12).map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => goTo(idx)}
                        className={`rounded-full transition-all duration-300 ${
                            idx === activeIdx
                                ? 'w-5 h-1.5 bg-red-500'
                                : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                        }`}
                    />
                ))}
            </div>

            {/* Progress bar keyframe */}
            <style>{`
                @keyframes progressBar {
                    from { width: 0%; }
                    to   { width: 100%; }
                }
            `}</style>
        </section>
    );
}
