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

interface HomeRightSidebarProps {
    userChannelInfo?: { hasChannel: boolean; productCount: number; totalEarnings?: number } | null;
    sidebarData?: any;
}

export default function HomeRightSidebar({ userChannelInfo, sidebarData }: HomeRightSidebarProps) {
    const { data: session } = useSession();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start pb-24">
            {/* 1. Creator Dashboard (If they have a channel) */}
            {userChannelInfo?.hasChannel && (
                <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-2xl p-5 relative overflow-hidden group hover:border-indigo-500/40 transition-colors shadow-lg">
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

                    <div className="grid grid-cols-2 gap-3 relative z-10">
                        <div className="bg-black/40 rounded-xl p-3 border border-white/5 hover:bg-black/60 transition-colors">
                            <p className="text-gray-400 text-[11px] mb-1 font-medium">Total Earnings</p>
                            <p className="text-emerald-400 font-black text-lg flex items-center">
                                <CurrencyRupeeIcon className="w-4 h-4 mr-0.5" />
                                {userChannelInfo.totalEarnings || '0'}
                            </p>
                            <p className="text-[9px] text-emerald-500/80 mt-1 uppercase font-bold tracking-wider">All time</p>
                        </div>
                        <div className="bg-black/40 rounded-xl p-3 border border-white/5 hover:bg-black/60 transition-colors">
                            <p className="text-gray-400 text-[11px] mb-1 font-medium">Products</p>
                            <p className="text-white font-black text-lg flex items-center gap-1">
                                <UserGroupIcon className="w-4 h-4 text-purple-400" />
                                {userChannelInfo.productCount || 0}
                            </p>
                            <p className="text-[9px] text-purple-400/80 mt-1 uppercase font-bold tracking-wider">Active listings</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Upcoming Premieres & Live Drops */}
            {sidebarData?.upcomingDrops && (
                <div className="bg-gradient-to-tr from-[#111] to-[#1a1a1a] border border-white/5 rounded-2xl p-5 relative overflow-hidden shadow-lg group">
                    {/* Glowing orb */}
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors blur-[40px] rounded-full pointer-events-none"></div>

                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                            <FireIcon className="w-5 h-5 text-amber-500" />
                            Next Premiere
                        </h3>
                        <span className="animate-pulse flex items-center gap-1.5 bg-rose-500/20 text-rose-400 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full border border-rose-500/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_5px_#f43f5e]"></div>
                            COMING SOON
                        </span>
                    </div>

                    <div className="flex gap-3 items-center bg-black/60 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors relative z-10 cursor-pointer">
                        <div className="w-14 h-14 rounded-lg overflow-hidden relative flex-shrink-0 bg-gray-800 border border-white/10">
                            <Image
                                src={sidebarData.upcomingDrops.previewImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=200&auto=format&fit=crop"}
                                alt="Drop" fill className="object-cover" unoptimized
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-white text-xs font-bold leading-tight line-clamp-2">{sidebarData.upcomingDrops.title}</p>
                            <p className="text-gray-500 text-[10px] mt-0.5 font-medium">By {sidebarData.upcomingDrops.channel?.name || "Unknown"}</p>

                            {/* Countdown Placeholder */}
                            <div className="flex items-center gap-1 mt-2">
                                <div className="bg-white/10 border border-white/5 rounded px-1.5 py-0.5 text-white font-mono text-[10px] font-bold">Soon</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Trending Clubs (Channels) */}
            {sidebarData?.trendingClubs && sidebarData.trendingClubs.length > 0 && (
                <div className="bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                            <UserGroupIcon className="w-5 h-5 text-emerald-400" />
                            Trending Clubs
                        </h3>
                    </div>

                    <div className="space-y-2">
                        {sidebarData.trendingClubs.map((club: any, i: number) => (
                            <Link href={`/channel/${club.slug}`} key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden relative shadow-sm group-hover:scale-110 transition-all">
                                        {club.profileImage ? (
                                            <Image src={club.profileImage} alt={club.name} fill className="object-cover" unoptimized />
                                        ) : (
                                            <span className="text-lg">✨</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-gray-200 text-sm font-bold group-hover:text-emerald-400 transition-colors line-clamp-1">{club.name}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <p className="text-gray-500 text-[10px] font-medium">{club.totalSubscribers || club.totalFollowers || 0} members</p>
                                            <span className="w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981]"></span>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-all flex-shrink-0 ml-2">
                                    <ChevronRightIcon className="w-3 h-3" />
                                </button>
                            </Link>
                        ))}
                    </div>

                    <button className="w-full mt-3 py-2 border border-white/10 hover:bg-white/10 rounded-xl text-gray-300 text-xs font-bold transition-colors">
                        Explore All Clubs
                    </button>
                </div>
            )}

            {/* 5. Sponsored Ad Highlight */}
            <div className="rounded-2xl overflow-hidden relative group cursor-pointer border border-[#333] hover:border-indigo-500/50 transition-colors shadow-lg">
                <div className="aspect-[4/3] w-full relative bg-gray-900">
                    <Image src="/ADs/ad-1.jpg" alt="Ad" fill className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>

                    <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider text-gray-300 border border-white/10 shadow-sm">
                        Sponsored
                    </span>

                    <div className="absolute bottom-4 left-4 right-4">
                        <h4 className="text-white font-bold text-sm mb-1.5 line-clamp-2 shadow-sm drop-shadow-md">Boost Your Audience With Ads</h4>
                        <div className="flex items-center justify-between">
                            <span className="text-emerald-400 text-xs font-bold drop-shadow">Reach millions</span>
                            <span className="text-white text-[10px] uppercase tracking-wider bg-white/20 px-2 py-1.5 rounded-lg backdrop-blur-md font-bold group-hover:bg-indigo-500 transition-colors shadow-lg border border-white/10">Learn More</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. Top Creators Leaderboard */}
            {sidebarData?.topCreators && sidebarData.topCreators.length > 0 && (
                <div className="bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 mb-8 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                            <TrophyIcon className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
                            Top Creators
                        </h3>
                    </div>

                    <div className="space-y-3">
                        {sidebarData.topCreators.map((creator: any, i: number) => (
                            <Link href={`/channel/${creator.slug}`} key={i} className="flex items-center justify-between p-2 rounded-xl group cursor-pointer hover:bg-white/5 transition-colors -mx-2">
                                <div className="flex items-center gap-3">
                                    <div className={`font-black text-xs w-4 text-center ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                                        {i + 1}
                                    </div>
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 group-hover:border-indigo-400 transition-colors shadow-sm bg-gray-800 relative">
                                        {creator.profileImage ? (
                                            <Image src={creator.profileImage} alt={creator.name} fill className="object-cover" unoptimized />
                                        ) : (
                                            <div className="absolute inset-0 bg-indigo-900 text-indigo-200 flex items-center justify-center font-bold text-xs">
                                                {creator.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="max-w-[120px]">
                                        <p className="text-gray-200 text-xs font-bold group-hover:text-indigo-400 transition-colors truncate">{creator.name}</p>
                                        <p className="text-gray-500 text-[9px] font-medium truncate">@{creator.slug}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded border border-white/5">
                                    <StarIcon className="w-3 h-3 text-yellow-500" />
                                    <span className="text-gray-300 text-[10px] font-bold">Top</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

