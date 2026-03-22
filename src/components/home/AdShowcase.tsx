'use client';

import React from 'react';
import Image from 'next/image';

const adImages = [
    '/ADs/lapis-ad-26650-original.png',
    '/ADs/lapis-ad-26651-original.png',
    '/ADs/lapis-ad-26654-original.png',
    '/ADs/lapis-ad-ad-original (1).png',
    '/ADs/lapis-ad-ad-original (2).png',
    '/ADs/lapis-ad-ad-original (6).png',
    '/ADs/lapis-ad-ad-original (7).png',
    '/ADs/lapis-ad-ad-original.png',
];

export default function AdShowcase() {
    return (
        <div className="w-full relative py-12 overflow-hidden rounded-3xl bg-[#141414] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center border border-[#333] isolate group my-8">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-amber-500/5 to-indigo-500/10 blur-3xl pointer-events-none group-hover:opacity-100 transition-opacity duration-1000 opacity-50"></div>

            <div className="text-center mb-8 px-4 z-10 w-full">
                <span className="inline-block px-3 py-1 mb-3 text-[10px] sm:text-xs font-black uppercase tracking-widest bg-white/5 text-emerald-400 rounded-full border border-white/10 shadow-lg">
                    See What's Possible
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
                    Global Standard Aesthetics
                </h3>
                <p className="text-gray-400 text-sm mt-3 max-w-lg mx-auto">
                    A premium, fully customized channel experience designed to mesmerize your fans and maximize your revenue.
                </p>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes ad-marquee {
                  0% { transform: translateX(0%); }
                  100% { transform: translateX(-50%); }
                }
                .animate-ad-marquee {
                  display: flex;
                  width: max-content;
                  animation: ad-marquee 40s linear infinite;
                }
                .animate-ad-marquee:hover {
                  animation-play-state: paused;
                }
                `
            }} />

            {/* Marquee Container */}
            <div className="relative w-full overflow-hidden pt-2 pb-6 flex items-center">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#141414] to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#141414] to-transparent z-10 pointer-events-none"></div>

                {/* The Scrolling Tracker */}
                <div className="animate-ad-marquee gap-4 sm:gap-6 px-4">
                    {/* Double the array for seamless infinite scrolling */}
                    {[...adImages, ...adImages].map((src, index) => (
                        <div key={index} className="relative w-[280px] h-[360px] sm:w-[320px] sm:h-[420px] shrink-0 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 hover:ring-red-500/50 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(239,68,68,0.2)] transition-all duration-300">
                            <Image
                                src={src}
                                alt={`Ad Showcase ${index}`}
                                fill
                                className="object-cover"
                                unoptimized
                                sizes="(max-width: 640px) 280px, 320px"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 z-10 text-center">
                <a href="/auth/dashboard/my-channel" className="px-8 py-4 bg-white text-black font-extrabold rounded-xl hover:bg-gray-200 transition-all shadow-lg hover:shadow-white/20 hover:-translate-y-0.5 inline-block text-sm sm:text-base border border-transparent">
                    Launch Your Channel Today
                </a>
            </div>
        </div>
    );
}
