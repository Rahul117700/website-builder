'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
    Bars3Icon,
    BellIcon,
    MagnifyingGlassIcon,
    VideoCameraIcon,
    XMarkIcon,
    UserCircleIcon,
    UserIcon,
    FolderIcon,
    Cog6ToothIcon,
    CreditCardIcon,
    GlobeAltIcon,
    QuestionMarkCircleIcon,
    ChatBubbleLeftRightIcon,
    ArrowRightOnRectangleIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Logo from '@/components/Logo';
import { Sidebar } from './Sidebar';
import { SubscriptionData, NotificationData } from '@/app/actions/homepage';
import CreatePlaylistModal from '@/components/modals/CreatePlaylistModal';

interface MainLayoutProps {
    children: React.ReactNode;
    userSubscriptions?: SubscriptionData[];
    notifications?: NotificationData[];
    hideSidebar?: boolean;
}

export default function MainLayout({
    children,
    userSubscriptions = [],
    notifications = [],
    hideSidebar = false
}: MainLayoutProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [notiMenuOpen, setNotiMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [playlistRefreshKey, setPlaylistRefreshKey] = useState(0);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    // Close mobile menu on resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setMobileMenuOpen(false);
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Init
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            {/* Header - Premium Global Standard Design */}
            <header className="fixed top-0 left-0 right-0 z-50 h-[56px] flex items-center justify-between px-4 lg:px-6 backdrop-blur-xl bg-white/95 border-b border-gray-200/50 shadow-sm transition-all duration-300">
                {/* Left Section - Menu & Logo */}
                <div className="flex items-center gap-3 lg:gap-4">
                    {!hideSidebar && (
                        <button
                            onClick={() => {
                                if (window.innerWidth < 1024) {
                                    setMobileMenuOpen(!mobileMenuOpen);
                                } else {
                                    setSidebarOpen(!sidebarOpen);
                                }
                            }}
                            className="p-2 hover:bg-gray-100/80 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            <Bars3Icon className="w-5 h-5 text-gray-700" />
                        </button>
                    )}
                    <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
                        <div className="transition-transform duration-300 group-hover:scale-105">
                            <Logo variant="default" size="sm" showText={false} href="" />
                        </div>
                    </Link>
                </div>

                {/* Center Section - Enhanced Search Bar */}
                <div className={`flex-1 max-w-2xl mx-2 md:mx-4 ${isMobileSearchOpen ? 'flex absolute inset-x-0 top-0 bottom-0 bg-white z-[60] px-4 items-center gap-2' : 'hidden md:flex'} items-center gap-4`}>
                    <form onSubmit={handleSearch} className="flex-1 group relative flex items-center gap-2">
                        <div className="relative flex-1">
                            {isMobileSearchOpen && (
                                <button
                                    type="button"
                                    onClick={() => setIsMobileSearchOpen(false)}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 p-2 md:hidden"
                                >
                                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                                </button>
                            )}
                            <MagnifyingGlassIcon className={`absolute ${isMobileSearchOpen ? 'left-8' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200`} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search channels, products..."
                                className={`w-full ${isMobileSearchOpen ? 'pl-14' : 'pl-10'} pr-3 py-2 border-2 border-gray-200 rounded-full focus:border-indigo-500 focus:outline-none bg-gray-50/50 focus:bg-white transition-all duration-300 text-sm placeholder:text-gray-400 hover:border-gray-300 shadow-sm focus:shadow-md`}
                                autoFocus={isMobileSearchOpen}
                            />
                        </div>
                        <button
                            type="submit"
                            className="p-2 bg-gray-900 hover:bg-black text-white rounded-full transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center shadow-lg"
                        >
                            <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </form>
                    {isMobileSearchOpen && (
                        <button
                            onClick={() => setIsMobileSearchOpen(false)}
                            className="md:hidden p-2 text-sm font-bold text-gray-500"
                        >
                            Cancel
                        </button>
                    )}
                </div>

                {/* Mobile Search Trigger */}
                {!isMobileSearchOpen && (
                    <button
                        onClick={() => setIsMobileSearchOpen(true)}
                        className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-all mr-1"
                    >
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-700" />
                    </button>
                )}

                {/* Right Section - Actions */}
                <div className="flex items-center gap-1.5 sm:gap-4 lg:gap-6 flex-shrink-0">
                    {/* Navigation Links */}
                    <div className="hidden xl:flex items-center gap-6 mr-2">
                        <Link href="/docs" className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors">Docs</Link>
                        <Link href="/about" className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors">About</Link>
                        <Link href="/contact" className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors">Contact</Link>
                    </div>

                    {/* Create Button - Visible on Mobile */}
                    <Link
                        href="/auth/dashboard/my-channel"
                        className="p-1.5 sm:p-2.5 bg-gray-900 border border-black text-white rounded-xl sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-black transition-all shadow-xl flex items-center gap-1.5 sm:gap-2 group whitespace-nowrap flex-shrink-0"
                    >
                        <VideoCameraIcon className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Create</span>
                    </Link>

                    {session ? (
                        <>
                            {/* Enhanced Notification Bell */}
                            <div className="relative">
                                <button
                                    onClick={() => setNotiMenuOpen(!notiMenuOpen)}
                                    className="p-1.5 sm:p-2 hover:bg-gray-100/80 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 relative flex-shrink-0"
                                >
                                    <BellIcon className="w-5 h-5 text-gray-700" />
                                    {notifications && notifications.some(n => !n.read) && (
                                        <>
                                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                                        </>
                                    )}
                                </button>

                                {notiMenuOpen && (
                                    <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 py-2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 max-h-[400px] overflow-y-auto">
                                        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-xl">
                                            <h3 className="font-bold text-gray-900">Notifications</h3>
                                            <button onClick={() => setNotiMenuOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                                <XMarkIcon className="w-5 h-5 text-gray-500" />
                                            </button>
                                        </div>
                                        {notifications && notifications.length > 0 ? (
                                            notifications.map(note => (
                                                <div key={note.id} className={`px-4 py-3 hover:bg-gray-50/80 border-b border-gray-50 last:border-0 transition-colors cursor-pointer ${!note.read ? 'bg-indigo-50/30' : ''}`}>
                                                    <div className="flex gap-3">
                                                        <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!note.read ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-800 line-clamp-1">{note.title}</p>
                                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{note.message}</p>
                                                            <p className="text-[10px] text-gray-400 mt-1">{note.createdAt}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                                No notifications
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Enhanced Profile Menu */}
                            <div className="relative -ml-1">
                                <button
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                    className="flex items-center gap-2 p-0.5 rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
                                >
                                    {session.user?.image ? (
                                        <div className="relative w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border-2 border-gray-200 hover:border-indigo-400 transition-colors shadow-sm flex-shrink-0">
                                            <img
                                                src={session.user.image}
                                                alt={session.user.name || "User"}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    // Fallback for button image
                                                    e.currentTarget.style.display = 'none';
                                                    const parent = e.currentTarget.parentElement;
                                                    if (parent) {
                                                        const initials = (session.user?.name || 'U').charAt(0).toUpperCase();
                                                        parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold">${initials}</div>`;
                                                    }
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                            <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                    )}
                                </button>

                                {profileMenuOpen && (
                                    <div className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 py-2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="px-4 py-3 border-b border-gray-100 flex items-start gap-3">
                                            {session.user?.image ? (
                                                <img
                                                    src={session.user.image}
                                                    alt={session.user.name || "User"}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                    onError={(e) => {
                                                        // Fallback for menu header image
                                                        e.currentTarget.style.display = 'none';
                                                        const parent = e.currentTarget.parentElement;
                                                        if (parent) {
                                                            const initials = (session.user?.name || 'U').charAt(0).toUpperCase();
                                                            parent.insertAdjacentHTML('afterbegin', `<div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">${initials}</div>`);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                    <UserCircleIcon className="w-6 h-6" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{session.user?.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                                                {/* <Link href="/auth/dashboard/my-channel" className="text-xs text-indigo-600 mt-0.5 block hover:underline">
                                                    View your channel →
                                                </Link> */}
                                            </div>
                                        </div>

                                        <div className="py-2">
                                            <Link
                                                href="/auth/dashboard/my-channel"
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 bg-gray-50 mx-2 rounded-lg mb-1"
                                                onClick={() => setProfileMenuOpen(false)}
                                            >
                                                <FolderIcon className="w-5 h-5" />
                                                My Channel
                                            </Link>
                                        </div>
                                        <div className="border-t border-gray-100 py-2">
                                            <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Subscriptions</p>
                                            <Link
                                                href="/subscriptions"
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => setProfileMenuOpen(false)}
                                            >
                                                <CreditCardIcon className="w-5 h-5" />
                                                My Subscriptions
                                            </Link>
                                        </div>

                                        <div className="border-t border-gray-100 py-2">
                                            {session?.user?.role === 'SUPER_ADMIN' && (
                                                <Link
                                                    href="/auth/dashboard/super-admin"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-purple-600 font-bold hover:bg-purple-50 transition-colors"
                                                    onClick={() => setProfileMenuOpen(false)}
                                                >
                                                    <ShieldCheckIcon className="w-5 h-5 text-purple-600" />
                                                    Super Admin Dashboard
                                                </Link>
                                            )}
                                            <Link
                                                href="/landing"
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => setProfileMenuOpen(false)}
                                            >
                                                <GlobeAltIcon className="w-5 h-5" />
                                                Landing Page
                                            </Link>
                                            <Link
                                                href="/help"
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => setProfileMenuOpen(false)}
                                            >
                                                <QuestionMarkCircleIcon className="w-5 h-5" />
                                                Help
                                            </Link>
                                            <Link
                                                href="/feedback"
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => setProfileMenuOpen(false)}
                                            >
                                                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                                Send feedback
                                            </Link>
                                        </div>

                                        <div className="border-t border-gray-100 pt-2 pb-1">
                                            <button
                                                onClick={() => signOut()}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                                            >
                                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <Link href="/auth/signin" className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
                            <UserCircleIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Sign in</span>
                        </Link>
                    )}
                </div>
            </header >

            {!hideSidebar && (
                <>
                    {/* Sidebar - Desktop */}
                    <aside className={`hidden lg:block fixed left-0 top-16 bottom-0 w-60 overflow-hidden transition-transform duration-300 z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <Sidebar
                            userSubscriptions={userSubscriptions}
                            onCreatePlaylist={() => setIsPlaylistModalOpen(true)}
                            refreshKey={playlistRefreshKey}
                        />
                    </aside>

                    {/* Sidebar - Mobile Overlay */}
                    {mobileMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                                onClick={() => setMobileMenuOpen(false)}
                                aria-hidden="true"
                            />
                            <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 overflow-y-auto no-scrollbar shadow-2xl transition-transform duration-300 p-4">
                                <div className="flex items-center gap-4 mb-6 px-2">
                                    <button onClick={() => setMobileMenuOpen(false)}>
                                        <Bars3Icon className="w-6 h-6" />
                                    </button>
                                    <Logo variant="icon-only" size="sm" showText={false} />
                                </div>
                                <Sidebar
                                    userSubscriptions={userSubscriptions}
                                    onCreatePlaylist={() => setIsPlaylistModalOpen(true)}
                                    refreshKey={playlistRefreshKey}
                                />
                            </aside>
                        </>
                    )}
                </>
            )
            }

            {/* Main Content */}
            <main className={`pt-16 min-h-screen transition-all duration-300 ${!hideSidebar && sidebarOpen ? 'lg:ml-60' : 'ml-0'}`}>
                {children}
            </main>

            <CreatePlaylistModal
                isOpen={isPlaylistModalOpen}
                onClose={() => setIsPlaylistModalOpen(false)}
                onPlaylistCreated={() => setPlaylistRefreshKey(prev => prev + 1)}
            />
        </div>
    );
}
