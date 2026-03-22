'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    HomeIcon,
    FireIcon,
    ShoppingBagIcon,
    GlobeAltIcon,
    MusicalNoteIcon,
    TrophyIcon,
    VideoCameraIcon,
    NewspaperIcon,
    LightBulbIcon,
    ClockIcon,
    HeartIcon,
    BookmarkIcon,
    PlusIcon,
    FolderIcon,
    CreditCardIcon,
    UserPlusIcon,
} from '@heroicons/react/24/outline';
import { SubscriptionData } from '@/app/actions/homepage';
import { useState, useEffect } from 'react';

export function Sidebar({
    userSubscriptions = [],
    userFollows = [],
    onCreatePlaylist,
    refreshKey = 0,
    isDarkTheme = false
}: {
    userSubscriptions?: SubscriptionData[];
    userFollows?: SubscriptionData[];
    onCreatePlaylist?: () => void;
    refreshKey?: number;
    isDarkTheme?: boolean;
}) {
    const [playlists, setPlaylists] = useState<any[]>([]);

    useEffect(() => {
        fetchPlaylists();
    }, [refreshKey]);

    const fetchPlaylists = async () => {
        try {
            const response = await fetch('/api/user/playlists');
            if (response.ok) {
                const data = await response.json();
                setPlaylists(data.playlists || []);
            }
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    };

    return (
        <div className={`flex flex-col h-full backdrop-blur-xl border-r sidebar-container ${isDarkTheme ? 'bg-black/90 border-white/5' : 'bg-white/70 border-gray-100/50'}`}>
            <style jsx global>{`
                .sidebar-container::-webkit-scrollbar {
                    width: 4px;
                }
                .sidebar-container::-webkit-scrollbar-track {
                    background: transparent;
                }
                .sidebar-container::-webkit-scrollbar-thumb {
                    background: ${isDarkTheme ? '#333' : '#e2e8f0'};
                    border-radius: 10px;
                }
                .sidebar-container:hover::-webkit-scrollbar-thumb {
                    background: ${isDarkTheme ? '#555' : '#cbd5e1'};
                }
            `}</style>
            <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar py-4 px-2">
                <SidebarItem icon={HomeIcon} label="Home" href="/" isDarkTheme={isDarkTheme} />
                <SidebarItem icon={FireIcon} label="Trending" href="/trending" isDarkTheme={isDarkTheme} />

                {userSubscriptions.length > 0 && (
                    <div className="mt-8">
                        <div className="px-3 mb-3">
                            <h3 className={`text-[11px] font-bold uppercase tracking-[0.1em] ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>Subscriptions</h3>
                        </div>
                        <div className="space-y-1">
                            {userSubscriptions.map(sub => (
                                <Link key={sub.channelId} href={`/channel/${sub.slug}`} className={`flex items-center gap-3 px-3 py-2 rounded-xl group transition-all ${isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                                    <div className="relative w-6 h-6 flex-shrink-0">
                                        {sub.channelAvatar ? (
                                            <Image
                                                src={sub.channelAvatar}
                                                alt={sub.channelName}
                                                fill
                                                className="rounded-full object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-[10px]">
                                                {sub.channelName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-sm font-medium truncate transition-colors ${isDarkTheme ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-black'}`}>{sub.channelName}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* My Subscriptions + My Followings quick links */}
                <div className="mt-6">
                    <div className="px-3 mb-2">
                        <h3 className={`text-[11px] font-bold uppercase tracking-[0.1em] ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>My Content</h3>
                    </div>
                    <SidebarItem icon={CreditCardIcon} label="My Subscriptions" href="/subscriptions" isDarkTheme={isDarkTheme} />
                    <SidebarItem icon={UserPlusIcon} label="My Followings" href="/followings" isDarkTheme={isDarkTheme} />
                </div>

                {/* Followed channels list */}
                {userFollows.length > 0 && (
                    <div className="mt-6">
                        <div className="px-3 mb-3">
                            <h3 className={`text-[11px] font-bold uppercase tracking-[0.1em] ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>Following</h3>
                        </div>
                        <div className="space-y-1">
                            {userFollows.map(follow => (
                                <Link key={follow.channelId} href={`/channel/${follow.slug}`} className={`flex items-center gap-3 px-3 py-2 rounded-xl group transition-all ${isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                                    <div className="relative w-6 h-6 flex-shrink-0">
                                        {follow.channelAvatar ? (
                                            <Image
                                                src={follow.channelAvatar}
                                                alt={follow.channelName}
                                                fill
                                                className="rounded-full object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-[10px]">
                                                {follow.channelName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-sm font-medium truncate transition-colors ${isDarkTheme ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-black'}`}>{follow.channelName}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    <div className="px-3 mb-3">
                        <h3 className={`text-[11px] font-bold uppercase tracking-[0.1em] ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>Library</h3>
                    </div>
                    <SidebarItem icon={ClockIcon} label="History" href="/history" isDarkTheme={isDarkTheme} />
                    <SidebarItem icon={HeartIcon} label="Liked Products" href="/liked" isDarkTheme={isDarkTheme} />
                    <SidebarItem icon={BookmarkIcon} label="Saved" href="/saved" isDarkTheme={isDarkTheme} />

                    {playlists.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {playlists.map(playlist => (
                                <SidebarItem
                                    key={playlist.id}
                                    icon={FolderIcon}
                                    label={playlist.name}
                                    href={`/playlists/${playlist.id}`}
                                    isDarkTheme={isDarkTheme}
                                />
                            ))}
                        </div>
                    )}

                    <button
                        onClick={onCreatePlaylist}
                        className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group ${isDarkTheme ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-white hover:shadow-md hover:scale-[1.02]'}`}
                    >
                        <PlusIcon className={`w-5 h-5 transition-colors ${isDarkTheme ? 'text-gray-400 group-hover:text-white' : 'text-gray-400 group-hover:text-indigo-600'}`} />
                        <span>Create Playlist</span>
                    </button>
                </div>

                <div className="mt-8 pb-4">
                    <div className="px-3 mb-3">
                        <h3 className={`text-[11px] font-bold uppercase tracking-[0.1em] ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>Explore</h3>
                    </div>
                    <SidebarItem icon={MusicalNoteIcon} label="Music" href="/explore/music" isDarkTheme={isDarkTheme} />
                    <SidebarItem icon={TrophyIcon} label="Sports" href="/explore/sports" isDarkTheme={isDarkTheme} />
                    <SidebarItem icon={VideoCameraIcon} label="Gaming" href="/explore/gaming" isDarkTheme={isDarkTheme} />
                    <SidebarItem icon={NewspaperIcon} label="News" href="/explore/news" isDarkTheme={isDarkTheme} />
                    <SidebarItem icon={LightBulbIcon} label="Learning" href="/explore/learning" isDarkTheme={isDarkTheme} />
                </div>
            </nav>

            <div className={`px-5 py-6 border-t ${isDarkTheme ? 'border-white/5 bg-black' : 'border-gray-100/50 bg-gray-50/30'}`}>
                <div className="space-y-3">
                    <div className={`flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-medium uppercase tracking-wider ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                        <a href="#" className={`transition-colors ${isDarkTheme ? 'hover:text-white' : 'hover:text-indigo-600'}`}>About</a>
                        <a href="#" className={`transition-colors ${isDarkTheme ? 'hover:text-white' : 'hover:text-indigo-600'}`}>Copyright</a>
                        <a href="#" className={`transition-colors ${isDarkTheme ? 'hover:text-white' : 'hover:text-indigo-600'}`}>Contact</a>
                        <a href="#" className={`transition-colors ${isDarkTheme ? 'hover:text-white' : 'hover:text-indigo-600'}`}>Developers</a>
                        <Link href="/terms" className={`transition-colors ${isDarkTheme ? 'hover:text-white' : 'hover:text-indigo-600'}`}>Terms of Service</Link>
                        <Link href="/privacy" className={`transition-colors ${isDarkTheme ? 'hover:text-white' : 'hover:text-indigo-600'}`}>Privacy Policy</Link>
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDarkTheme ? 'text-gray-600' : 'text-gray-900/40'}`}>© 2026 SellEarnDirect</p>
                </div>
            </div>
        </div>
    );
}

export function SidebarItem({ icon: Icon, label, active = false, href, isDarkTheme = false }: { icon: any, label: string, active?: boolean, href?: string, isDarkTheme?: boolean }) {
    let className;
    if (isDarkTheme) {
        className = `w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group ${active
            ? 'bg-white/10 text-white shadow-sm border border-white/10'
            : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`;
    } else {
        className = `w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group ${active
            ? 'bg-gradient-to-r from-indigo-600/10 to-purple-600/10 text-indigo-700 shadow-sm border border-indigo-100/50'
            : 'text-gray-700 hover:bg-white hover:shadow-md hover:scale-[1.02]'
            }`;
    }

    const content = (
        <>
            <div className={`relative flex items-center justify-center p-1 rounded-lg transition-transform duration-300 group-hover:scale-110 ${active ? (isDarkTheme ? 'text-white' : 'bg-indigo-600 text-white shadow-indigo-200 shadow-lg') : (isDarkTheme ? 'text-gray-400 group-hover:text-white' : 'text-gray-400 group-hover:text-indigo-600')}`}>
                <Icon className="w-5 h-5 flex-shrink-0" />
            </div>
            <span className="relative z-10 transition-colors duration-300">{label}</span>
            {active && !isDarkTheme && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full shadow-[2px_0_8px_rgba(79,70,229,0.4)]" />
            )}
            {active && isDarkTheme && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
            )}
        </>
    );

    if (href) {
        return (
            <Link href={href} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <button className={className}>
            {content}
        </button>
    );
}
