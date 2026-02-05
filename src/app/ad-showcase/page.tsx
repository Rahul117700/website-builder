'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowRightIcon, PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import Logo from '@/components/Logo';

const AD_SCRIPT = [
    {
        id: 1,
        title: "THE PROBLEM",
        subtitle: "The Creator Tax is Real.",
        script: "You spend weeks building your expertise. You pour your soul into every lesson. But when the sale hits...",
        boldLine: "The platforms take 30%.",
        image: "/sedstudios_scene_revenue_1770285770569.png",
        accent: "from-red-600 to-rose-600",
        duration: 7000,
    },
    {
        id: 2,
        title: "THE SOLUTION",
        subtitle: "Enter sedStudios.",
        script: "A revolutionary command center where middle-men don't exist. Direct payments. Instant scale.",
        boldLine: "Keep 100% of your revenue.",
        image: "/sedstudios_scene_dashboard_1770285788523.png",
        accent: "from-indigo-600 to-purple-600",
        duration: 8000,
    },
    {
        id: 3,
        title: "GLOBAL IMPACT",
        subtitle: "From Bedroom to Billboard.",
        script: "Your storefront, localized globally. Reach millions across Tokyo, London, and New York in one click.",
        boldLine: "The World is your Audience.",
        image: "/sedstudios_scene_global_1770286286740.png",
        accent: "from-blue-600 to-indigo-600",
        duration: 8000,
    },
    {
        id: 4,
        title: "INSTANT PAYOUTS",
        subtitle: "Zero-Day Payouts.",
        script: "Stop waiting 30 days for your money. When a fan buys, the funds hit your wallet instantly.",
        boldLine: "Liquid Wealth. Instant Payouts.",
        image: "/sedstudios_ad_dashboard_1770285045726.png",
        accent: "from-amber-500 to-orange-600",
        duration: 7000,
    },
    {
        id: 5,
        title: "THE REWARD",
        subtitle: "Your Empire, Unfiltered.",
        script: "Join a movement of 10,000+ creators who stopped selling their souls and started building their studios.",
        boldLine: "Your Passion. Your Profit.",
        image: "/sedstudios_scene_success_1770285805107.png",
        accent: "from-emerald-600 to-teal-600",
        duration: 8000,
    }
];

export default function AdShowcase() {
    const [currentScene, setCurrentScene] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isPlaying) {
            const scene = AD_SCRIPT[currentScene];
            timerRef.current = setTimeout(() => {
                setCurrentScene((prev) => (prev + 1) % AD_SCRIPT.length);
            }, scene.duration);
        } else if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isPlaying, currentScene]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Background Animation
            gsap.fromTo(".scene-bg",
                { scale: 1.15, filter: 'blur(20px)', opacity: 0 },
                { scale: 1, filter: 'blur(0px)', opacity: 1, duration: 2.5, ease: "power2.out" }
            );

            // Caption Script Animation (Voiceover vibe)
            gsap.fromTo(".script-line",
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 1.2, ease: "power2.out", delay: 1, stagger: 1.5 }
            );

            // Main Title Animation
            gsap.fromTo(".scene-title",
                { x: -100, opacity: 0 },
                { x: 0, opacity: 1, duration: 1.5, ease: "expo.out", delay: 0.5 }
            );

            // Bold Punchline Animation
            gsap.fromTo(".punchline",
                { scale: 0.9, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1, ease: "back.out(2)", delay: 3.5 }
            );

            // Progress Bar
            gsap.fromTo(".progress-bar-fill",
                { width: "0%" },
                { width: "100%", duration: AD_SCRIPT[currentScene].duration / 1000, ease: "none" }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [currentScene]);

    const scene = AD_SCRIPT[currentScene];

    return (
        <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-black text-white selection:bg-indigo-500 font-sans">
            {/* Cinematic Letterbox Overlays */}
            <div className="absolute top-0 left-0 right-0 h-[10vh] bg-black z-40 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 right-0 h-[10vh] bg-black z-40 pointer-events-none"></div>

            {/* Top Navigation */}
            <nav className="absolute top-0 left-0 right-0 z-50 px-12 py-10 flex justify-between items-center">
                <Logo variant="white" size="lg" />
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="group flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-all"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Audio Track</span>
                        {isMuted ? <SpeakerXMarkIcon className="w-5 h-5 text-red-500" /> : <SpeakerWaveIcon className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-3 rounded-full bg-white text-black hover:scale-110 transition-all shadow-xl"
                    >
                        {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                    </button>
                    <Link href="/" className="px-6 py-2 rounded-full border border-white/30 hover:bg-white hover:text-black transition-all font-black text-[10px] tracking-widest uppercase">
                        Exit Preview
                    </Link>
                </div>
            </nav>

            {/* Background Content */}
            {AD_SCRIPT.map((s, idx) => (
                <div
                    key={s.id}
                    className={`absolute inset-0 transition-opacity duration-1500 ${currentScene === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <img
                            src={s.image}
                            alt={s.title}
                            className="scene-bg w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent"></div>
                    </div>

                    {/* Content Container */}
                    <div className="relative h-full flex items-center px-12 sm:px-24">
                        <div className="max-w-4xl space-y-8">
                            <div className="space-y-2">
                                <span className={`scene-title inline-block px-4 py-1.5 rounded-md bg-gradient-to-r ${s.accent} text-[10px] font-black tracking-[0.3em] shadow-2xl`}>
                                    AD CHAPTER 0{s.id} : {s.title}
                                </span>
                                <h1 className="scene-title text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-none">
                                    {s.subtitle}
                                </h1>
                            </div>

                            {/* The "Script" / Subtitles */}
                            <div className="space-y-6">
                                <p className="script-line text-xl sm:text-3xl text-gray-300 font-medium leading-tight max-w-2xl border-l-4 border-white/20 pl-6 italic">
                                    "{s.script}"
                                </p>
                                <div className="punchline">
                                    <h2 className={`text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${s.accent} uppercase tracking-tight`}>
                                        {s.boldLine}
                                    </h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Bottom Controls / Timeline */}
            <div className="absolute bottom-0 left-0 right-0 z-50 px-12 py-12 flex items-center justify-between">
                <div className="flex gap-4">
                    {AD_SCRIPT.map((_, idx) => (
                        <div key={idx} className="relative w-32 h-[2px] bg-white/10 rounded-full overflow-hidden">
                            {currentScene === idx && isPlaying && (
                                <div className="progress-bar-fill absolute inset-0 bg-white"></div>
                            )}
                            {currentScene > idx && (
                                <div className="absolute inset-0 bg-white opacity-40"></div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-10">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Upcoming Feature</p>
                        <p className="text-sm font-bold">Instantly Paid in 2025</p>
                    </div>
                    <Link
                        href="/auth/signup"
                        className="group flex items-center gap-4 px-10 py-5 rounded-full bg-indigo-600 text-white font-black hover:bg-white hover:text-black hover:scale-105 transition-all shadow-[0_0_50px_rgba(79,70,229,0.3)]"
                    >
                        START YOUR STUDIO
                        <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Film Grain & Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>
    );
}
