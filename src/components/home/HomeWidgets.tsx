'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import {
    PlayCircleIcon,
    FireIcon,
    UserGroupIcon,
    ChartBarIcon,
    CurrencyRupeeIcon,
    TrophyIcon,
    StarIcon
} from '@heroicons/react/24/solid';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface WidgetProps {
    userChannelInfo?: { hasChannel: boolean; productCount: number; totalEarnings?: number } | null;
}

// 1. Creator Stats
export function CreatorStatsWidget({ userChannelInfo }: WidgetProps) {
    if (!userChannelInfo?.hasChannel) return null;
    return (
        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-2xl p-5 relative overflow-hidden group hover:border-indigo-500/40 transition-colors shadow-lg h-full flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                    <ChartBarIcon className="w-5 h-5 text-indigo-400" />
                    Creator Stats
                </h3>
                <Link href="/auth/dashboard" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                    Dashboard →
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10 flex-1">
                <div className="bg-black/40 rounded-xl p-3 border border-white/5 hover:bg-black/60 transition-colors flex flex-col justify-center">
                    <p className="text-gray-400 text-[11px] mb-1 font-medium">Today's Earnings</p>
                    <p className="text-emerald-400 font-black text-2xl flex items-center">
                        <CurrencyRupeeIcon className="w-5 h-5 mr-0.5" />
                        {userChannelInfo.totalEarnings || '0'}
                    </p>
                    <p className="text-[9px] text-emerald-500/80 mt-1 uppercase font-bold tracking-wider">+12% vs yday</p>
                </div>
                <div className="bg-black/40 rounded-xl p-3 border border-white/5 hover:bg-black/60 transition-colors flex flex-col justify-center">
                    <p className="text-gray-400 text-[11px] mb-1 font-medium">New Subs</p>
                    <p className="text-white font-black text-2xl flex items-center gap-1.5">
                        <UserGroupIcon className="w-5 h-5 text-purple-400" />
                        +24
                    </p>
                    <p className="text-[9px] text-purple-400/80 mt-1 uppercase font-bold tracking-wider">Highly active</p>
                </div>
            </div>
        </div>
    );
}

// 2. Continue Watching
export function ContinueWatchingWidget() {
    const { data: session } = useSession();
    if (!session) return null;
    return (
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors shadow-lg h-full flex flex-col">
            <h3 className="text-white font-bold flex items-center gap-2 mb-4 text-sm">
                <PlayCircleIcon className="w-5 h-5 text-rose-500" />
                Continue Watching
            </h3>

            <div className="group relative rounded-xl overflow-hidden cursor-pointer shadow-md bg-black flex-1">
                <div className="absolute inset-0 w-full h-full">
                    {/* Placeholder Image */}
                    <Image src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop" alt="Thumbnail" fill className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-xl group-hover:scale-110 group-hover:bg-rose-500 transition-all duration-300">
                            <PlayCircleIcon className="w-7 h-7 text-white" />
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-600/50">
                        <div className="h-full bg-rose-500 w-[65%] shadow-[0_0_10px_#f43f5e]"></div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-3 pt-6 bg-gradient-to-t from-black to-transparent pointer-events-none">
                        <h4 className="text-sm font-bold text-gray-100 line-clamp-1 group-hover:text-rose-400 transition-colors">Advanced Next.js 14 Architecture</h4>
                        <p className="text-[11px] text-gray-300 mt-0.5 font-medium">CodeMastery Flow • 12m left</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 3. Next Premiere
export function NextPremiereWidget() {
    return (
        <div className="bg-gradient-to-tr from-[#111] to-[#1a1a1a] border border-white/5 rounded-2xl p-5 relative overflow-hidden shadow-lg group h-full flex flex-col">
            {/* Glowing orb */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors blur-[50px] rounded-full pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                    <FireIcon className="w-5 h-5 text-amber-500" />
                    Next Premiere
                </h3>
                <span className="animate-pulse flex items-center gap-1.5 bg-rose-500/20 text-rose-400 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full border border-rose-500/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_5px_#f43f5e]"></div>
                    LIVE IN
                </span>
            </div>

            <div className="flex flex-col gap-4 bg-black/60 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors relative z-10 cursor-pointer flex-1 justify-center">
                <div className="flex gap-4 items-center">
                    <div className="w-16 h-20 rounded-lg overflow-hidden relative flex-shrink-0 bg-gray-800 border border-white/10 shadow-lg">
                        <Image src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=200&auto=format&fit=crop" alt="Drop" fill className="object-cover" unoptimized />
                    </div>
                    <div>
                        <p className="text-white text-sm font-bold leading-tight line-clamp-2">Zero to Mastery: Fullstack Guide</p>
                        <p className="text-gray-400 text-xs mt-1 font-medium">By TechNinja</p>
                    </div>
                </div>

                {/* Countdown */}
                <div className="flex items-center justify-center gap-2 mt-auto">
                    <div className="bg-white/10 border border-white/5 rounded-lg px-3 py-1.5 text-white font-mono text-sm font-bold shadow-sm">02</div>
                    <span className="text-gray-600 font-bold text-sm">:</span>
                    <div className="bg-white/10 border border-white/5 rounded-lg px-3 py-1.5 text-white font-mono text-sm font-bold shadow-sm">45</div>
                    <span className="text-gray-600 font-bold text-sm">:</span>
                    <div className="bg-white/10 border border-white/5 rounded-lg px-3 py-1.5 text-rose-400 font-mono text-sm font-bold shadow-sm">12</div>
                </div>
            </div>
        </div>
    );
}

// 4. Trending Clubs
export function TrendingClubsWidget() {
    return (
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-lg h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                    <UserGroupIcon className="w-5 h-5 text-emerald-400" />
                    Trending Clubs
                </h3>
            </div>

            <div className="space-y-2 flex-1">
                {[
                    { name: "UI/UX Mavericks", members: "12.4k", icon: "🎨", active: true },
                    { name: "Day Traders India", members: "8.2k", icon: "📈", active: false },
                    { name: "Indie Hackers", members: "54.1k", icon: "🚀", active: true },
                    { name: "Code Wizards", members: "2.1k", icon: "💻", active: true }
                ].slice(0, 3).map((club, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg shadow-sm group-hover:scale-110 group-hover:bg-white/10 transition-all">
                                {club.icon}
                            </div>
                            <div>
                                <p className="text-gray-200 text-sm font-bold group-hover:text-emerald-400 transition-colors">{club.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <p className="text-gray-500 text-[10px] font-medium">{club.members} members</p>
                                    {club.active && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981]"></span>}
                                </div>
                            </div>
                        </div>
                        <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 py-2 border border-white/10 hover:bg-white/10 rounded-xl text-gray-300 text-xs font-bold transition-colors">
                Explore All Clubs
            </button>
        </div>
    );
}

// 5. Sponsored Ad
export function SponsoredAdWidget() {
    return (
        <div className="rounded-2xl overflow-hidden relative group cursor-pointer border border-[#333] hover:border-indigo-500/50 transition-colors shadow-lg h-full min-h-[250px]">
            <div className="absolute inset-0 w-full h-full bg-gray-900">
                <Image src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop" alt="Ad" fill className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>

                <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider text-gray-300 border border-white/10 shadow-sm">
                    Sponsored
                </span>

                <div className="absolute bottom-5 left-5 right-5">
                    <h4 className="text-white font-bold text-base mb-2 line-clamp-2 shadow-sm drop-shadow-md">Premium Retro Gaming Setup Guide</h4>
                    <div className="flex items-center justify-between">
                        <span className="text-emerald-400 text-sm font-bold drop-shadow">₹499 <span className="text-gray-400 text-xs line-through ml-1">₹999</span></span>
                        <span className="text-white text-xs uppercase tracking-wider bg-white/20 px-3 py-2 rounded-lg backdrop-blur-md font-bold group-hover:bg-indigo-500 transition-colors shadow-lg border border-white/10">Buy Now</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 6. Top Creators
export function TopCreatorsWidget() {
    return (
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-lg h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                    <TrophyIcon className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
                    Top Creators
                </h3>
            </div>

            <div className="space-y-4 flex-1">
                {[
                    { name: "Rahul Sharma", handle: "@rahulcodes", score: "99.2", avatar: "https://i.pravatar.cc/150?u=1" },
                    { name: "Design Ninja", handle: "@uixninja", score: "96.4", avatar: "https://i.pravatar.cc/150?u=2" },
                    { name: "Stock Mentor", handle: "@tradeindia", score: "94.1", avatar: "https://i.pravatar.cc/150?u=3" }
                ].map((creator, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl group cursor-pointer hover:bg-white/5 transition-colors -mx-2">
                        <div className="flex items-center gap-3">
                            <div className={`font-black text-xs w-4 text-center ${i === 0 ? 'text-yellow-500 flex items-center justify-center bg-yellow-500/10 rounded-full h-6' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                                {i + 1}
                            </div>
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 group-hover:border-indigo-400 transition-colors shadow-sm bg-gray-800">
                                <Image src={creator.avatar} alt="avatar" width={40} height={40} className="object-cover" unoptimized />
                            </div>
                            <div>
                                <p className="text-gray-200 text-sm font-bold group-hover:text-indigo-400 transition-colors">{creator.name}</p>
                                <p className="text-gray-500 text-[10px] font-medium">{creator.handle}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                            <StarIcon className="w-3.5 h-3.5 text-yellow-500" />
                            <span className="text-gray-300 text-xs font-bold">{creator.score}</span>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 py-2 border border-white/10 hover:bg-white/10 rounded-xl text-gray-300 text-xs font-bold transition-colors">
                View Leaderboard
            </button>
        </div>
    );
}
