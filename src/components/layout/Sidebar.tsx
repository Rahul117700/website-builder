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

export function Sidebar({ userSubscriptions = [] }: { userSubscriptions?: SubscriptionData[] }) {
    return (
        <>
            <nav className="space-y-1">
                <SidebarItem icon={HomeIcon} label="Home" href="/" />
                <SidebarItem icon={FireIcon} label="Trending" href="/trending" />
                <SidebarItem icon={ShoppingBagIcon} label="Marketplace" href="/marketplace" />
                <Link href="/landing" className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100">
                    <GlobeAltIcon className="w-6 h-6 text-gray-500" />
                    <span>Landing Page</span>
                </Link>


                {userSubscriptions.length > 0 && (
                    <>
                        <div className="my-4 border-t border-gray-100" />
                        <h3 className="px-3 py-2 text-sm font-semibold text-gray-900 mt-2">Subscriptions</h3>
                        <div className="space-y-1 mb-2">
                            {userSubscriptions.map(sub => (
                                <Link key={sub.channelId} href={`/channel/${sub.slug}`} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-xl group">
                                    <div className="relative w-6 h-6 flex-shrink-0">
                                        <Image
                                            src={sub.channelAvatar}
                                            alt={sub.channelName}
                                            fill
                                            className="rounded-full object-cover"
                                            unoptimized
                                        />
                                    </div>
                                    <span className="text-sm text-gray-700 font-medium truncate group-hover:text-black">{sub.channelName}</span>
                                </Link>
                            ))}
                        </div>
                    </>
                )}

                <div className="my-4 border-t border-gray-100" />
                <h3 className="px-3 py-2 text-sm font-semibold text-gray-900 uppercase tracking-wider text-gray-400">Library</h3>
                <SidebarItem icon={ClockIcon} label="History" href="/history" />
                <SidebarItem icon={HeartIcon} label="Liked Products" href="/liked" />
                <SidebarItem icon={BookmarkIcon} label="Saved" href="/saved" />
                <button className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100">
                    <PlusIcon className="w-6 h-6 text-gray-500" />
                    <span>Create Playlist</span>
                </button>

                <div className="my-4 border-t border-gray-100" />
                <h3 className="px-3 py-2 text-sm font-semibold text-gray-900 uppercase tracking-wider text-gray-400">Explore</h3>

                <SidebarItem icon={MusicalNoteIcon} label="Music" href="/explore/music" />
                <SidebarItem icon={TrophyIcon} label="Sports" href="/explore/sports" />
                <SidebarItem icon={VideoCameraIcon} label="Gaming" href="/explore/gaming" />
                <SidebarItem icon={NewspaperIcon} label="News" href="/explore/news" />
                <SidebarItem icon={LightBulbIcon} label="Learning" href="/explore/learning" />
            </nav>
            <div className="my-4 border-t border-gray-100" />
            <div className="px-3 py-4 text-xs text-gray-500">
                <p className="mb-2">About Press Copyright</p>
                <p className="mb-2">Contact Us Creators</p>
                <p className="mb-4">Developers</p>
                <p>© 2026 SellEarnDirect</p>
            </div>
        </>
    );
}

export function SidebarItem({ icon: Icon, label, active = false, href }: { icon: any, label: string, active?: boolean, href?: string }) {
    const className = `w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`;

    const content = (
        <>
            <Icon className={`w-6 h-6 ${active ? 'fill-current text-indigo-600' : 'text-gray-500'}`} />
            <span>{label}</span>
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
