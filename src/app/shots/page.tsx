import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserSubscriptions, getUserNotifications, getTrendingShots } from '@/app/actions/homepage';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/product/ProductCard';
import { VideoCameraIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function AllShotsPage() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const [userSubscriptions, notifications, shots] = await Promise.all([
        userId ? getUserSubscriptions(userId) : [],
        userId ? getUserNotifications(userId) : [],
        getTrendingShots(userId)
    ]);

    return (
        <MainLayout
            userSubscriptions={userSubscriptions}
            notifications={notifications}
            isDarkTheme={true}
        >
            <div className="max-w-[1400px] mx-auto p-4 md:p-6 text-white pb-20">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <VideoCameraIcon className="w-8 h-8 text-red-500" />
                        All Shots
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Browse the latest bite-sized reels and mini-videos.
                    </p>
                </div>

                {shots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {shots.map((shot) => (
                            <Link href={`/shots/${shot.id}`} key={shot.id} className="group relative rounded-[20px] overflow-hidden aspect-[9/16] bg-[#1a1a1a] border border-white/5 hover:border-red-500/50 hover:scale-[1.03] transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(229,9,20,0.3)]">
                                <Image
                                    src={shot.thumbnail}
                                    alt={shot.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    unoptimized
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
                                
                                {/* Avatar */}
                                <div className="absolute top-3 left-0 right-0 flex justify-center">
                                    <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-[#1a1a1a] overflow-hidden ring-2 ring-white/20 shadow-lg group-hover:ring-red-500 transition-all">
                                        {shot.channelAvatar ? (
                                            <Image src={shot.channelAvatar} alt="" fill className="object-cover" unoptimized />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600 to-rose-700 text-white text-xs font-black">
                                                {(shot.channelName || 'C')[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Label */}
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <h3 className="text-white font-bold text-[11px] sm:text-xs line-clamp-2 leading-tight drop-shadow-md mb-1">{shot.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 text-[9px] font-bold truncate max-w-[65%]">{shot.channelName}</span>
                                        <span className="text-[9px] text-red-400 font-bold">{shot.views} views</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-[#1a1a1a] rounded-2xl border-2 border-dashed border-[#333]">
                        <VideoCameraIcon className="w-12 h-12 text-[#444] mb-4" />
                        <h3 className="text-xl font-bold text-gray-200 mb-2">No shots found</h3>
                        <p className="text-gray-500 text-center">There are no shots available at the moment.</p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
