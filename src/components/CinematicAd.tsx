'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import Image from 'next/image';
import { ProductCardData } from '@/app/actions/homepage';
import {
    CheckBadgeIcon,
    StarIcon,
    PlayIcon,
    DocumentIcon,
    ArrowRightIcon,
    ShoppingCartIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/solid';

export default function CinematicAd({ className = "", trendingProducts = [] }: { className?: string; trendingProducts?: ProductCardData[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const tiltRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Floating animation for notifications
            gsap.to(".floating-badge", {
                y: -10,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                stagger: 0.5
            });

            // Entrance animation
            gsap.from(tiltRef.current, {
                y: 100,
                opacity: 0,
                rotateX: 20,
                duration: 1.5,
                ease: "power4.out"
            });

            // Mouse parallax
            const handleMouseMove = (e: MouseEvent) => {
                if (!tiltRef.current) return;
                const { clientX, clientY } = e;
                const x = (clientX / window.innerWidth - 0.5) * 2; // -1 to 1
                const y = (clientY / window.innerHeight - 0.5) * 2; // -1 to 1

                gsap.to(tiltRef.current, {
                    rotationY: x * 5,
                    rotationX: -y * 5,
                    duration: 1,
                    ease: "power2.out"
                });
            };

            window.addEventListener('mousemove', handleMouseMove);
            return () => window.removeEventListener('mousemove', handleMouseMove);
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const product = trendingProducts[0] || {
        title: "The Creator Masterclass",
        price: 4999,
        thumbnail: null,
        channelName: "Sarah's Studio",
        channelAvatar: null
    };

    return (
        <div ref={containerRef} className={`relative flex items-center justify-center w-full h-full perspective-1000 ${className}`}>

            {/* Ambient Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gradient-to-tr from-indigo-100/40 via-purple-100/40 to-pink-100/40 opacity-50 blur-[100px] -z-10 rounded-full animate-pulse-slow"></div>

            {/* Main 3D Container */}
            <div ref={tiltRef} className="relative w-full max-w-[500px] aspect-square sm:aspect-[4/3] transform-style-3d">

                {/* Layer 1: The "Revenue Dashboard" (Back Layer) */}
                <div className="absolute top-4 sm:top-8 left-0 sm:left-4 w-[85%] bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 z-10 overflow-hidden transform transition-transform duration-500 hover:scale-[1.02] hover:z-30">
                    <div className="p-3 sm:p-4 border-b border-gray-100 flex justify-between items-center">
                        <div className="flex gap-2">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400/80"></div>
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400/80"></div>
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400/80"></div>
                        </div>
                        <div className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Analytics</div>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <div className="text-[10px] sm:text-xs text-gray-500 font-medium mb-1">Total Revenue</div>
                                <div className="text-2xl sm:text-3xl font-black text-gray-900">₹1,24,500</div>
                            </div>
                            <div className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                +24%
                            </div>
                        </div>
                        {/* Mock Chart Area */}
                        <div className="h-24 sm:h-32 w-full mt-4 relative">
                            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d="M0,80 C40,70 80,90 120,50 C160,10 200,40 240,20 C280,0 320,30 360,10 L360,128 L0,128 Z" fill="url(#chartGradient)" />
                                <path d="M0,80 C40,70 80,90 120,50 C160,10 200,40 240,20 C280,0 320,30 360,10" fill="none" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            {/* Data Points */}
                            <div className="absolute top-[10%] left-[65%] w-3 h-3 bg-indigo-600 rounded-full border-[3px] border-white shadow-md"></div>
                            <div className="absolute top-[10%] left-[65%] -translate-x-1/2 -translate-y-[130%] bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-xl">
                                ₹8.5k
                            </div>
                        </div>
                    </div>
                </div>

                {/* Layer 2: The "Mobile Storefront" (Front Layer, Overlapping) */}
                <div className="absolute -bottom-4 right-1 sm:-right-8 w-[160px] sm:w-[45%] sm:max-w-[220px] bg-gray-900 rounded-[2rem] sm:rounded-[2.5rem] border-[4px] sm:border-[6px] border-gray-900 shadow-2xl z-20 overflow-hidden transform-style-3d rotate-y-[-10deg] translate-z-10 ring-1 ring-white/10">
                    {/* Notch & Status Bar */}
                    <div className="h-5 sm:h-7 bg-gray-900 w-full relative z-20 flex justify-center">
                        <div className="w-16 sm:w-20 h-3 sm:h-4 bg-black rounded-b-xl"></div>
                    </div>

                    {/* Screen Content */}
                    <div className="bg-gray-50 h-[280px] sm:h-[380px] w-full relative overflow-hidden">
                        {/* Header Image */}
                        <div className="h-20 sm:h-24 bg-indigo-600 relative">
                            <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 -translate-x-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-sm">
                                <Image src={product.channelAvatar || "/hero/avatar.svg"} alt="Creator" fill className="object-cover" />
                            </div>
                        </div>

                        {/* Store Content */}
                        <div className="pt-8 sm:pt-10 px-3 sm:px-4 text-center">
                            <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight truncate px-2">{product.channelName || "John's Studio"}</h4>
                            <p className="text-[8px] sm:text-[9px] text-gray-500 font-medium mb-3 sm:mb-4">Digital Creator</p>

                            <div className="bg-white p-2 sm:p-3 rounded-xl shadow-sm border border-gray-100 text-left mb-2">
                                <div className="aspect-video bg-gray-100 rounded-lg mb-2 relative overflow-hidden group">
                                    <Image src={product.thumbnail || "/placeholder-product.jpg"} alt="Product" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                            <PlayIcon className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600 ml-0.5" />
                                        </div>
                                    </div>
                                </div>
                                <div className="h-2 sm:h-3 w-3/4 bg-gray-100 rounded mb-1.5"></div>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="h-2 sm:h-3 w-1/3 bg-indigo-50 rounded"></div>
                                    <div className="bg-gray-900 text-white text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">BUY</div>
                                </div>
                            </div>

                            <div className="space-y-1 sm:space-y-1.5 opacity-50">
                                <div className="h-8 sm:h-10 w-full bg-white rounded-xl border border-gray-50"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Layer 3: Floating Success Badges */}
                <div className="floating-badge absolute top-[5%] -right-2 sm:top-[20%] sm:-right-12 bg-white p-2 sm:p-3 rounded-xl shadow-xl border border-gray-100 flex items-center gap-2 sm:gap-3 z-30 animate-bounce-slow">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <CurrencyDollarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <div className="text-[8px] sm:text-[10px] font-medium text-gray-400 uppercase">New Sale</div>
                        <div className="text-xs sm:text-sm font-black text-gray-900">+ ₹4,999</div>
                    </div>
                </div>

                <div className="floating-badge absolute bottom-[15%] -left-2 sm:bottom-[30%] sm:-left-8 bg-white p-2 sm:p-3 rounded-xl shadow-xl border border-gray-100 flex items-center gap-2 sm:gap-3 z-30 animate-bounce-slower delay-700">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <StarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <div className="text-[8px] sm:text-[10px] font-medium text-gray-400 uppercase">Review</div>
                        <div className="text-xs sm:text-sm font-black text-gray-900">5.0 ★★★★★</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
