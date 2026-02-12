'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
    CheckBadgeIcon,
    StarIcon,
    PlayIcon,
    DocumentIcon,
    ArrowRightIcon,
    ShoppingCartIcon
} from '@heroicons/react/24/solid';

export default function CinematicAd({ className = "" }: { className?: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const browserRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Entrance animation
            gsap.from(browserRef.current, {
                y: 40,
                opacity: 0,
                duration: 1.2,
                ease: "expo.out"
            });

            // Subtle tilt effect on hover logic
            const handleMouseMove = (e: MouseEvent) => {
                if (!browserRef.current) return;
                const { clientX, clientY } = e;
                const rect = browserRef.current.getBoundingClientRect();
                const x = (clientX - rect.left) / rect.width - 0.5;
                const y = (clientY - rect.top) / rect.height - 0.5;

                gsap.to(browserRef.current, {
                    rotationY: x * 8,
                    rotationX: -y * 8,
                    duration: 1,
                    ease: "power2.out"
                });
            };

            window.addEventListener('mousemove', handleMouseMove);
            return () => window.removeEventListener('mousemove', handleMouseMove);
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const products = [
        {
            title: "Mastering Digital Markets",
            type: "Video Course",
            price: "₹4,999",
            icon: PlayIcon,
            color: "indigo",
            img: "/hero/digital_marketing.svg"
        },
        {
            title: "The Creator Playbook",
            type: "PDF E-Book",
            price: "₹999",
            icon: DocumentIcon,
            color: "emerald",
            img: "/hero/creator_playbook.svg"
        }
    ];

    return (
        <div ref={containerRef} className={`relative flex items-center justify-center h-[500px] sm:h-[600px] w-full perspective-2000 ${className}`}>

            {/* Background Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-50/50 rounded-full blur-[120px] -z-10"></div>

            {/* THE STOREFRONT PREVIEW (Browser Frame) */}
            <div
                ref={browserRef}
                className="relative w-full max-w-[550px] bg-white rounded-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Browser Toolbar */}
                <div className="h-12 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/40"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/40"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400/40"></div>
                    </div>
                    <div className="flex-1 max-w-[280px] mx-auto h-6 bg-white rounded-full border border-gray-100 flex items-center px-3 gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-100 flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                        </div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate">sedstudios.com/your-brand</span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 sm:p-8 space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                                <span className="font-black text-xs">JS</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-gray-900 leading-tight flex items-center gap-1">
                                    John's Studio <CheckBadgeIcon className="w-3 h-3 text-indigo-500" />
                                </h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Premium Creator</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-full border border-amber-100 text-amber-600 text-[10px] font-black">
                            <StarIcon className="w-3 h-3" /> 4.9 (1.2k)
                        </div>
                    </div>

                    {/* Featured Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Available Now</h4>
                            <span className="text-[10px] font-bold text-indigo-600">See All Assets →</span>
                        </div>

                        {/* Product List */}
                        <div className="space-y-4">
                            {products.map((p, i) => (
                                <div key={i} className="group relative flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-50 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
                                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex-shrink-0">
                                        <img
                                            src={p.img}
                                            alt={p.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className={`absolute top-1 right-1 p-1 bg-white rounded shadow-sm`}>
                                            <p.icon className={`w-3 h-3 text-${p.color}-500`} />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className={`text-[9px] font-black text-${p.color}-500 uppercase tracking-widest block mb-1`}>{p.type}</span>
                                        <h5 className="text-sm font-black text-gray-900 leading-tight mb-2 truncate group-hover:text-indigo-600 transition-colors">{p.title}</h5>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-black text-gray-900">{p.price}</span>
                                            <button className="h-8 px-4 rounded-full bg-gray-950 text-white text-[10px] font-black uppercase tracking-wider hover:bg-indigo-600 transition-colors flex items-center gap-2">
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer / Stats */}
                    <div className="pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Total Sales</span>
                            <span className="text-[15px] font-black text-gray-900">₹145,210</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Downloads</span>
                            <span className="text-[15px] font-black text-gray-900">2,480+</span>
                        </div>
                    </div>
                </div>

                {/* Floating Sales Badge - Grounded in the frame */}
                <div className="absolute bottom-6 right-6 p-3 bg-indigo-600 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce cursor-pointer hover:bg-gray-950 transition-colors">
                    <ShoppingCartIcon className="w-4 h-4 text-white" />
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">Join 2k sellers</span>
                </div>
            </div>

            {/* Subtle background decoration to avoid 'empty' feeling */}
            <div className="absolute -z-20 top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] opacity-40"></div>
            <div className="absolute -z-20 bottom-0 left-0 w-48 h-48 bg-purple-50 rounded-full blur-[60px] opacity-30"></div>
        </div>
    );
}
