'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowRightIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

const SCENES = [
    {
        id: 1,
        title: "Keep 100% Revenue",
        subtitle: "No Platform Fees",
        desc: "Stop giving away your hard-earned money. Sell directly to your audience.",
        image: "/sedstudios_scene_revenue_1770285770569.png",
        accent: "from-indigo-600 to-purple-600",
    },
    {
        id: 2,
        title: "Futuristic Dashboard",
        subtitle: "Real-time Analytics",
        desc: "Global reach with instant payouts and deep insights into your growth.",
        image: "/sedstudios_scene_dashboard_1770285788523.png",
        accent: "from-blue-600 to-cyan-500",
    },
    {
        id: 3,
        title: "Built for Success",
        subtitle: "Join the Studio Revolution",
        desc: "Empowering 10,000+ creators to build their dream digital business.",
        image: "/sedstudios_scene_success_1770285805107.png",
        accent: "from-orange-500 to-red-600",
    }
];

export default function CinematicAd({ className = "" }: { className?: string }) {
    const [currentScene, setCurrentScene] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setCurrentScene((prev) => (prev + 1) % SCENES.length);
        }, 5000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Scene Transition
            gsap.fromTo(".scene-bg",
                { scale: 1.2, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1.5, ease: "power2.out" }
            );

            // Text Animations
            gsap.fromTo(".scene-text",
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.1, delay: 0.3 }
            );

            // Progress Bar
            gsap.fromTo(".progress-bar-fill",
                { width: "0%" },
                { width: "100%", duration: 5, ease: "none" }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [currentScene]);

    const scene = SCENES[currentScene];

    return (
        <div ref={containerRef} className={`relative overflow-hidden rounded-3xl bg-black ${className}`}>
            {SCENES.map((s, idx) => (
                <div
                    key={s.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${currentScene === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    {/* Background Image */}
                    <div className="absolute inset-0 pointer-events-none">
                        <img
                            src={s.image}
                            alt={s.title}
                            className="scene-bg w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    </div>

                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-end p-8 sm:p-12">
                        <div className="space-y-4 max-w-lg">
                            <span className={`scene-text inline-block px-3 py-1 rounded-full bg-gradient-to-r ${s.accent} text-[10px] font-black uppercase tracking-[0.2em] text-white`}>
                                {s.subtitle}
                            </span>

                            <h2 className="scene-text text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                                {s.title}
                            </h2>

                            <p className="scene-text text-sm sm:text-base text-gray-300 font-medium">
                                {s.desc}
                            </p>

                            <div className="scene-text pt-4">
                                <div className="flex items-center gap-2 text-white font-bold text-xs group">
                                    EXPLORE FEATURE
                                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Progress Indicators */}
            <div className="absolute top-6 left-8 right-8 z-20 flex gap-2">
                {SCENES.map((_, idx) => (
                    <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                        {currentScene === idx && (
                            <div className="progress-bar-fill h-full bg-white"></div>
                        )}
                        {currentScene > idx && (
                            <div className="h-full w-full bg-white opacity-40"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
