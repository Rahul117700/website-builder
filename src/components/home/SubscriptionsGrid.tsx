'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    BellIcon,
    CheckCircleIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    UserPlusIcon
} from '@heroicons/react/24/solid';
import { SubscriptionData } from '@/app/actions/homepage';

export default function SubscriptionsGrid({ initialSubscriptions }: { initialSubscriptions: SubscriptionData[] }) {
    const [filter, setFilter] = useState('');

    const filteredSubs = initialSubscriptions.filter(sub =>
        sub.channelName.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div>
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="relative group w-full max-w-md">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Filter"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full bg-white shadow-sm transition-all"
                    />
                </div>
            </div>

            {filteredSubs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredSubs.map((sub) => (
                        <Link key={sub.channelId} href={`/channel/${sub.slug}`} className="group relative block">
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-indigo-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center h-full relative overflow-hidden">

                                {/* Decorative Background Blur */}
                                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                {/* Avatar */}
                                <div className="relative mb-4 z-10">
                                    <div className="p-1 rounded-full border-2 border-indigo-100 group-hover:border-indigo-300 transition-colors bg-white">
                                        <div className="relative w-24 h-24 rounded-full overflow-hidden">
                                            <Image
                                                src={sub.channelAvatar || '/placeholder-avatar.jpg'}
                                                alt={sub.channelName}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md border border-gray-100" title="Notifications on">
                                        <BellIcon className="w-4 h-4 text-gray-900" />
                                    </div>
                                </div>

                                {/* Info */}
                                <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors z-10 line-clamp-1">{sub.channelName}</h3>

                                {/* Action Button */}
                                <div className="mt-auto pt-6 w-full z-10">
                                    <div className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-100 group-hover:bg-indigo-50 text-gray-700 group-hover:text-indigo-700 font-medium rounded-full text-sm transition-colors">
                                        <CheckCircleIcon className="w-5 h-5" />
                                        <span>Subscribed</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Hero Banner - Start Selling */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 sm:p-12 lg:p-16">
                        {/* Animated Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
                            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                        </div>

                        <div className="relative z-10 max-w-4xl mx-auto text-center">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm font-bold uppercase tracking-wider mb-6 border border-white/30">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
                                </span>
                                Start Earning Today
                            </div>

                            {/* Headline */}
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-6 leading-tight">
                                Ready to Make Money?
                                <span className="block mt-2 text-yellow-300">Start Selling Your Skills!</span>
                            </h1>

                            {/* Description */}
                            <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
                                Sell courses, PDFs, videos online. Very easy setup. No technical knowledge needed. <span className="font-bold text-yellow-300">Keep 100% money - zero fees!</span>
                            </p>

                            {/* Benefits Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                                {[
                                    { icon: '💰', title: 'No Fees', desc: '100% money is yours' },
                                    { icon: '⚡', title: 'Very Easy', desc: 'Start in 5 minutes' },
                                    { icon: '🏦', title: 'Get Paid', desc: 'Money to your bank' }
                                ].map((item, i) => (
                                    <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all">
                                        <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{item.icon}</div>
                                        <h3 className="text-white font-bold text-sm sm:text-base mb-1">{item.title}</h3>
                                        <p className="text-white/80 text-xs sm:text-sm">{item.desc}</p>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link
                                    href="/auth/dashboard/my-channel"
                                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-indigo-600 font-bold rounded-full shadow-2xl hover:shadow-white/50 hover:scale-105 transition-all text-base sm:text-lg"
                                >
                                    <span>Start Selling Now - Free!</span>
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>

                                <Link
                                    href="/"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-full border-2 border-white/30 hover:bg-white/20 transition-all text-base"
                                >
                                    Explore Channels
                                </Link>
                            </div>

                            {/* Social Proof */}
                            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-white/90 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-white/20 flex items-center justify-center text-xs">
                                                👤
                                            </div>
                                        ))}
                                    </div>
                                    <span className="font-semibold">1000+ sellers earning</span>
                                </div>
                                <div className="hidden sm:block w-1 h-1 rounded-full bg-white/50"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">⭐</span>
                                    <span className="font-semibold">4.8/5 rating</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How It Works Section */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10">
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center mb-8 sm:mb-12">
                            How It Works - <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Very Simple!</span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                            {[
                                { step: '1', icon: '🏪', title: 'Create Store', desc: 'Make your online shop in 5 minutes' },
                                { step: '2', icon: '📦', title: 'Upload Products', desc: 'Add courses, PDFs or videos' },
                                { step: '3', icon: '🎨', title: 'Make It Yours', desc: 'Choose colors and design' },
                                { step: '4', icon: '💸', title: 'Get Money', desc: '100% payment to your bank' }
                            ].map((item, i) => (
                                <div key={i} className="relative group">
                                    {/* Connector Line - Hidden on mobile, shown on larger screens */}
                                    {i < 3 && (
                                        <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-indigo-200 to-purple-200 -z-10"></div>
                                    )}

                                    <div className="text-center">
                                        {/* Step Number */}
                                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-black text-lg mb-4 shadow-lg">
                                            {item.step}
                                        </div>

                                        {/* Icon */}
                                        <div className="text-5xl sm:text-6xl mb-4 group-hover:scale-110 transition-transform">
                                            {item.icon}
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{item.title}</h3>

                                        {/* Description */}
                                        <p className="text-sm sm:text-base text-gray-600">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom CTA */}
                        <div className="mt-10 sm:mt-12 text-center">
                            <Link
                                href="/auth/dashboard/my-channel"
                                className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-base sm:text-lg"
                            >
                                <span>Start Your Store Now</span>
                                <span className="text-2xl">🚀</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
