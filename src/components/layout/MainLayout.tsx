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
    userFollows?: SubscriptionData[];
    notifications?: NotificationData[];
    hideSidebar?: boolean;
    isDarkTheme?: boolean;
    noPaddingTop?: boolean;
}

export default function MainLayout({
    children,
    userSubscriptions = [],
    userFollows = [],
    notifications = [],
    hideSidebar = false,
    isDarkTheme = false,
    noPaddingTop = false
}: MainLayoutProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
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
                // Do not force sidebar open on desktop by default
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

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={`min-h-screen font-sans ${isDarkTheme ? 'bg-[#141414] text-white' : 'bg-white text-gray-900'}`}>
            {/* Header - Premium Global Standard Design */}
            <header className={`fixed top-0 left-0 right-0 z-50 h-[56px] flex items-center justify-between px-4 lg:px-6 transition-all duration-300 ${isDarkTheme ? (scrolled ? 'bg-[#141414]/95 backdrop-blur-xl border-b border-[#2a2a2a] shadow-sm' : 'bg-transparent border-transparent') : 'backdrop-blur-xl bg-white/95 border-b border-gray-200/50'}`}>
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
                            className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${isDarkTheme ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100/80 text-gray-700'}`}
                        >
                            <Bars3Icon className={`w-5 h-5 ${isDarkTheme ? 'text-white' : 'text-gray-700'}`} />
                        </button>
                    )}
                    <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
                        <div className="transition-transform duration-300 group-hover:scale-105">
                            <Logo variant={isDarkTheme ? 'white' : 'default'} size="sm" showText={true} href="" />
                        </div>
                    </Link>
                </div>

                {/* Center Section - Enhanced Search Bar */}
                <div className={`flex-1 max-w-2xl mx-2 md:mx-4 ${isMobileSearchOpen ? `flex absolute inset-x-0 top-0 bottom-0 z-[60] px-4 items-center gap-2 ${isDarkTheme ? 'bg-[#141414]' : 'bg-white'}` : 'hidden md:flex'} items-center gap-4`}>
                    <form onSubmit={handleSearch} className="flex-1 group relative flex items-center gap-2">
                        <div className="relative flex-1">
                            {isMobileSearchOpen && (
                                <button
                                    type="button"
                                    onClick={() => setIsMobileSearchOpen(false)}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 p-2 md:hidden"
                                >
                                    <XMarkIcon className={`w-5 h-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                                </button>
                            )}
                            <MagnifyingGlassIcon className={`absolute ${isMobileSearchOpen ? 'left-8' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 group-focus-within:text-indigo-500 transition-colors duration-200 ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search channels, products..."
                                className={`w-full ${isMobileSearchOpen ? 'pl-14' : 'pl-10'} pr-3 py-2 border-2 rounded-full focus:border-indigo-500 focus:outline-none transition-all duration-300 text-sm focus:shadow-md ${isDarkTheme ? 'bg-white/10 border-white/5 text-white placeholder-gray-500 hover:border-white/20 focus:bg-white/20' : 'bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:bg-white'}`}
                                autoFocus={isMobileSearchOpen}
                            />
                        </div>
                        <button
                            type="submit"
                            className={`p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center shadow-lg ${isDarkTheme ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-gray-900 hover:bg-black text-white'}`}
                        >
                            <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </form>
                    {isMobileSearchOpen && (
                        <button
                            onClick={() => setIsMobileSearchOpen(false)}
                            className={`md:hidden p-2 text-sm font-bold ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                            Cancel
                        </button>
                    )}
                </div>

                {/* Mobile Search Trigger */}
                {!isMobileSearchOpen && (
                    <button
                        onClick={() => setIsMobileSearchOpen(true)}
                        className={`md:hidden p-2 rounded-xl transition-all mr-1 ${isDarkTheme ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                        <MagnifyingGlassIcon className={`w-5 h-5 ${isDarkTheme ? 'text-white' : 'text-gray-700'}`} />
                    </button>
                )}

                {/* Right Section - Actions */}
                <div className="flex items-center gap-1.5 sm:gap-4 lg:gap-6 flex-shrink-0">
                    {/* Navigation Links */}
                    <div className="hidden xl:flex items-center gap-6 mr-2">
                        <Link href="/docs" className={`text-sm font-bold transition-colors ${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-indigo-600'}`}>Docs</Link>
                        <Link href="/about" className={`text-sm font-bold transition-colors ${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-indigo-600'}`}>About</Link>
                        <Link href="/contact" className={`text-sm font-bold transition-colors ${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-indigo-600'}`}>Contact</Link>
                    </div>

                    {/* Create Button - Visible on Mobile */}
                    <Link
                        href="/auth/dashboard/my-channel"
                        className={`p-1.5 sm:p-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xl flex items-center gap-1.5 sm:gap-2 group whitespace-nowrap flex-shrink-0 ${isDarkTheme ? 'bg-indigo-600 text-white hover:bg-indigo-500 border-none' : 'bg-gray-900 border border-black text-white hover:bg-black'}`}
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
                                    className={`p-1.5 sm:p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 relative flex-shrink-0 ${isDarkTheme ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100/80'}`}
                                >
                                    <BellIcon className="w-5 h-5" />
                                    {/* Show ping indicator to represent mock notifications */}
                                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                                </button>

                                {notiMenuOpen && (
                                    <div className={`fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-80 backdrop-blur-xl rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 max-h-[70vh] sm:max-h-[400px] overflow-y-auto ${isDarkTheme ? 'bg-[#1a1a1a]/95 border border-[#333]' : 'bg-white/95 border border-gray-200/50'}`}>
                                        <div className={`px-4 py-3 border-b flex justify-between items-center sticky top-0 z-10 ${isDarkTheme ? 'border-[#333] bg-[#1a1a1a]/95 text-white' : 'border-gray-100 bg-white/95 text-gray-900'}`}>
                                            <h3 className="font-bold">Notifications</h3>
                                            <button onClick={() => setNotiMenuOpen(false)} className={`p-1 rounded-lg transition-colors ${isDarkTheme ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Mock Timely Notifications */}
                                        <div className={`px-4 py-3 border-b last:border-0 transition-colors cursor-pointer ${isDarkTheme ? 'bg-white/5 border-[#333] hover:bg-[#333]' : 'bg-indigo-50/30 border-gray-50 hover:bg-gray-50/80'}`}>
                                            <div className="flex gap-3">
                                                <div className="w-2 h-2 mt-2 rounded-full flex-shrink-0 bg-[#e50914] sm:bg-indigo-600"></div>
                                                <div>
                                                    <p className={`text-sm font-medium line-clamp-1 ${isDarkTheme ? 'text-gray-200' : 'text-gray-800'}`}>Welcome to Sed Studios</p>
                                                    <p className={`text-xs mt-1 line-clamp-2 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>Explore premium content and engage with the community.</p>
                                                    <p className="text-[10px] text-gray-500 mt-1">Just now</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`px-4 py-3 border-b last:border-0 transition-colors cursor-pointer ${isDarkTheme ? 'border-[#333] hover:bg-[#2a2a2a]' : 'border-gray-50 hover:bg-gray-50/80'}`}>
                                            <div className="flex gap-3">
                                                <div className="w-2 h-2 mt-2 rounded-full flex-shrink-0 bg-gray-600"></div>
                                                <div>
                                                    <p className={`text-sm font-medium line-clamp-1 ${isDarkTheme ? 'text-gray-200' : 'text-gray-800'}`}>New tools added</p>
                                                    <p className={`text-xs mt-1 line-clamp-2 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>A huge update was applied to your creator dashboard.</p>
                                                    <p className="text-[10px] text-gray-500 mt-1">2 hours ago</p>
                                                </div>
                                            </div>
                                        </div>

                                        {notifications && notifications.length > 0 && notifications.map(note => (
                                            <div key={note.id} className={`px-4 py-3 border-b last:border-0 transition-colors cursor-pointer ${isDarkTheme ? (!note.read ? 'bg-white/5 border-[#333] hover:bg-[#333]' : 'border-[#333] hover:bg-[#2a2a2a]') : (!note.read ? 'bg-indigo-50/30 border-gray-50 hover:bg-gray-50/80' : 'border-gray-50 hover:bg-gray-50/80')}`}>
                                                <div className="flex gap-3">
                                                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!note.read ? (isDarkTheme ? 'bg-[#e50914]' : 'bg-indigo-600') : 'bg-gray-600'}`}></div>
                                                    <div>
                                                        <p className={`text-sm font-medium line-clamp-1 ${isDarkTheme ? 'text-gray-200' : 'text-gray-800'}`}>{note.title}</p>
                                                        <p className={`text-xs mt-1 line-clamp-2 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>{note.message}</p>
                                                        <p className="text-[10px] text-gray-500 mt-1">{note.createdAt}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Enhanced Profile Menu */}
                            <div className="relative -ml-1">
                                <button
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                    className={`flex items-center gap-2 p-0.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0 ${isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                                >
                                    {session.user?.image ? (
                                        <div className={`relative w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border-2 transition-colors flex-shrink-0 ${isDarkTheme ? 'border-gray-700 hover:border-indigo-500' : 'border-gray-200 hover:border-indigo-400 shadow-sm'}`}>
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
                                                        parent.innerHTML = `<div class="w-full h-full flex items-center justify-center ${isDarkTheme ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-600'} font-bold">${initials}</div>`;
                                                    }
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shadow-sm ${isDarkTheme ? 'bg-gradient-to-br from-indigo-900 to-purple-900 text-indigo-300' : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600'}`}>
                                            <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                    )}
                                </button>

                                {profileMenuOpen && (
                                    <div className={`absolute right-0 mt-3 w-72 backdrop-blur-xl rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 ${isDarkTheme ? 'bg-[#1a1a1a]/95 border border-[#333]' : 'bg-white/95 border border-gray-200/50'}`}>
                                        <div className={`px-4 py-3 border-b flex items-start gap-3 ${isDarkTheme ? 'border-[#333]' : 'border-gray-100'}`}>
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
                                                            parent.insertAdjacentHTML('afterbegin', `<div class="w-10 h-10 rounded-full ${isDarkTheme ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-600'} flex items-center justify-center font-bold">${initials}</div>`);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                    <UserCircleIcon className="w-6 h-6" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className={`text-sm font-bold truncate ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{session.user?.name}</p>
                                                <p className={`text-xs truncate ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>{session.user?.email}</p>
                                                {/* <Link href="/auth/dashboard/my-channel" className="text-xs text-indigo-600 mt-0.5 block hover:underline">
                                                    View your channel →
                                                </Link> */}
                                            </div>
                                        </div>

                                        <div className="py-2">
                                            <Link
                                                href="/auth/dashboard/my-channel"
                                                className={`flex items-center gap-3 px-4 py-2 text-sm mx-2 rounded-lg mb-1 ${isDarkTheme ? 'text-gray-300 hover:bg-[#333] hover:text-white bg-[#2a2a2a]' : 'text-gray-700 hover:bg-gray-50 bg-gray-50'}`}
                                                onClick={() => setProfileMenuOpen(false)}
                                            >
                                                <FolderIcon className="w-5 h-5" />
                                                My Channel
                                            </Link>
                                        </div>
                                        <div className={`border-t py-2 ${isDarkTheme ? 'border-[#333]' : 'border-gray-100'}`}>
                                            <p className={`px-4 py-1 text-xs font-semibold uppercase tracking-wider ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>Subscriptions</p>
                                            <Link
                                                href="/subscriptions"
                                                className={`flex items-center gap-3 px-4 py-2 text-sm ${isDarkTheme ? 'text-gray-300 hover:bg-[#2a2a2a] hover:text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                                                onClick={() => setProfileMenuOpen(false)}
                                            >
                                                <CreditCardIcon className="w-5 h-5" />
                                                My Subscriptions
                                            </Link>
                                        </div>

                                        <div className={`border-t py-2 ${isDarkTheme ? 'border-[#333]' : 'border-gray-100'}`}>
                                            {session?.user?.role === 'SUPER_ADMIN' && (
                                                <Link
                                                    href="/auth/dashboard/super-admin"
                                                    className={`flex items-center gap-3 px-4 py-2 text-sm font-bold transition-colors ${isDarkTheme ? 'text-purple-400 hover:bg-[#2a2a2a]' : 'text-purple-600 hover:bg-purple-50'}`}
                                                    onClick={() => setProfileMenuOpen(false)}
                                                >
                                                    <ShieldCheckIcon className={`w-5 h-5 ${isDarkTheme ? 'text-purple-400' : 'text-purple-600'}`} />
                                                    Super Admin Dashboard
                                                </Link>
                                            )}
                                            <Link
                                                href="/help"
                                                className={`flex items-center gap-3 px-4 py-2 text-sm ${isDarkTheme ? 'text-gray-300 hover:bg-[#2a2a2a]' : 'text-gray-700 hover:bg-gray-50'}`}
                                                onClick={() => setProfileMenuOpen(false)}
                                            >
                                                <QuestionMarkCircleIcon className="w-5 h-5" />
                                                Help
                                            </Link>
                                            <Link
                                                href="/feedback"
                                                className={`flex items-center gap-3 px-4 py-2 text-sm ${isDarkTheme ? 'text-gray-300 hover:bg-[#2a2a2a]' : 'text-gray-700 hover:bg-gray-50'}`}
                                                onClick={() => setProfileMenuOpen(false)}
                                            >
                                                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                                Send feedback
                                            </Link>
                                        </div>

                                        <div className={`border-t pt-2 pb-1 ${isDarkTheme ? 'border-[#333]' : 'border-gray-100'}`}>
                                            <button
                                                onClick={() => signOut()}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 text-left"
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
            </header>

            {!hideSidebar && (
                <>
                    {/* Sidebar - Desktop */}
                    <aside className={`hidden lg:block fixed left-0 top-16 bottom-0 w-60 overflow-hidden transition-transform duration-300 z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <Sidebar
                            userSubscriptions={userSubscriptions}
                            userFollows={userFollows}
                            onCreatePlaylist={() => setIsPlaylistModalOpen(true)}
                            refreshKey={playlistRefreshKey}
                            isDarkTheme={isDarkTheme}
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
                            <aside className={`fixed left-0 top-0 bottom-0 w-64 z-50 overflow-y-auto no-scrollbar shadow-2xl transition-transform duration-300 p-4 ${isDarkTheme ? 'bg-[#141414]' : 'bg-white'}`}>
                                <div className="flex items-center gap-4 mb-6 px-2">
                                    <button onClick={() => setMobileMenuOpen(false)}>
                                        <Bars3Icon className={`w-6 h-6 ${isDarkTheme ? 'text-white' : 'text-gray-700'}`} />
                                    </button>
                                    <Logo variant={isDarkTheme ? 'white' : 'default'} size="sm" showText={true} />
                                </div>
                                <Sidebar
                                    userSubscriptions={userSubscriptions}
                                    userFollows={userFollows}
                                    onCreatePlaylist={() => setIsPlaylistModalOpen(true)}
                                    refreshKey={playlistRefreshKey}
                                    isDarkTheme={isDarkTheme}
                                />
                            </aside>
                        </>
                    )}
                </>
            )
            }

            {/* Main Content */}
            <main className={`${noPaddingTop ? '' : 'pt-16'} min-h-screen transition-all duration-300 ${!hideSidebar && sidebarOpen ? 'lg:ml-60' : 'ml-0'}`}>
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
