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
} from '@heroicons/react/24/outline';
import { SubscriptionData } from '@/app/actions/homepage';
import { useState, useEffect } from 'react';

export function Sidebar({
    userSubscriptions = [],
    onCreatePlaylist,
    refreshKey = 0
}: {
    userSubscriptions?: SubscriptionData[];
    onCreatePlaylist?: () => void;
    refreshKey?: number;
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
        <div className="flex flex-col h-full bg-white/70 backdrop-blur-xl border-r border-gray-100/50 sidebar-container">
            <style jsx global>{`
                .sidebar-container::-webkit-scrollbar {
                    width: 4px;
                }
                .sidebar-container::-webkit-scrollbar-track {
                    background: transparent;
                }
                .sidebar-container::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .sidebar-container:hover::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                }
            `}</style>
            <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar py-4 px-2">
                <SidebarItem icon={HomeIcon} label="Home" href="/" />
                <SidebarItem icon={FireIcon} label="Trending" href="/trending" />
                <SidebarItem icon={ShoppingBagIcon} label="Marketplace" href="/marketplace" />
                <Link href="/landing" className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 text-gray-700 hover:bg-white hover:shadow-md hover:scale-[1.02] group">
                    <GlobeAltIcon className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                    <span>Landing Page</span>
                </Link>


                {userSubscriptions.length > 0 && (
                    <div className="mt-8">
                        <div className="px-3 mb-3">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Subscriptions</h3>
                        </div>
                        <div className="space-y-1">
                            {userSubscriptions.map(sub => (
                                <Link key={sub.channelId} href={`/channel/${sub.slug}`} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-xl group">
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
                                    <span className="text-sm text-gray-700 font-medium truncate group-hover:text-black">{sub.channelName}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    <div className="px-3 mb-3">
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Library</h3>
                    </div>
                    <SidebarItem icon={ClockIcon} label="History" href="/history" />
                    <SidebarItem icon={HeartIcon} label="Liked Products" href="/liked" />
                    <SidebarItem icon={BookmarkIcon} label="Saved" href="/saved" />

                    {playlists.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {playlists.map(playlist => (
                                <SidebarItem
                                    key={playlist.id}
                                    icon={FolderIcon}
                                    label={playlist.name}
                                    href={`/playlists/${playlist.id}`}
                                />
                            ))}
                        </div>
                    )}

                    <button
                        onClick={onCreatePlaylist}
                        className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 text-gray-700 hover:bg-white hover:shadow-md hover:scale-[1.02] group"
                    >
                        <PlusIcon className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                        <span>Create Playlist</span>
                    </button>
                </div>

                <div className="mt-8 pb-4">
                    <div className="px-3 mb-3">
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Explore</h3>
                    </div>
                    <SidebarItem icon={MusicalNoteIcon} label="Music" href="/explore/music" />
                    <SidebarItem icon={TrophyIcon} label="Sports" href="/explore/sports" />
                    <SidebarItem icon={VideoCameraIcon} label="Gaming" href="/explore/gaming" />
                    <SidebarItem icon={NewspaperIcon} label="News" href="/explore/news" />
                    <SidebarItem icon={LightBulbIcon} label="Learning" href="/explore/learning" />
                </div>
            </nav>

            <div className="px-5 py-6 border-t border-gray-100/50 bg-gray-50/30">
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                        <a href="#" className="hover:text-indigo-600 transition-colors">About</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Copyright</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Developers</a>
                    </div>
                    <p className="text-[10px] font-bold text-gray-900/40 uppercase tracking-[0.2em]">© 2026 SellEarnDirect</p>
                </div>
            </div>
        </div>
    );
}

export function SidebarItem({ icon: Icon, label, active = false, href }: { icon: any, label: string, active?: boolean, href?: string }) {
    const className = `w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group ${active
        ? 'bg-gradient-to-r from-indigo-600/10 to-purple-600/10 text-indigo-700 shadow-sm border border-indigo-100/50'
        : 'text-gray-700 hover:bg-white hover:shadow-md hover:scale-[1.02]'
        }`;

    const content = (
        <>
            <div className={`relative flex items-center justify-center p-1 rounded-lg transition-transform duration-300 group-hover:scale-110 ${active ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-lg' : 'text-gray-400 group-hover:text-indigo-600'}`}>
                <Icon className="w-5 h-5 flex-shrink-0" />
            </div>
            <span className="relative z-10 transition-colors duration-300">{label}</span>
            {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full shadow-[2px_0_8px_rgba(79,70,229,0.4)]" />
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
