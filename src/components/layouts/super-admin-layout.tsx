'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession as useAuthSession, signOut as authSignOut } from 'next-auth/react';
import {
    HomeIcon,
    UsersIcon,
    ChartBarIcon,
    CreditCardIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    ShieldCheckIcon,
    InboxIcon,
    ServerIcon,
    SignalIcon,
    ArrowLeftIcon,
    PowerIcon,
    Bars3Icon,
    XMarkIcon,
    RocketLaunchIcon,
    ChatBubbleLeftEllipsisIcon,
    GlobeAltIcon,
    CursorArrowRaysIcon
} from '@heroicons/react/24/outline';


interface SuperAdminLayoutProps {
    children: React.ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
    const { data: session } = useAuthSession();
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navigation = [
        { name: 'Dashboard', icon: HomeIcon, href: '/auth/dashboard/super-admin' },
        { name: 'Entity Registry', icon: UsersIcon, href: '/auth/dashboard/super-admin/users' },
        { name: 'Channel Audit', icon: RocketLaunchIcon, href: '/auth/dashboard/super-admin/channels' },
        { name: 'Intelligence', icon: ChartBarIcon, href: '/auth/dashboard/super-admin/analytics' },
        { name: 'User Activity', icon: CursorArrowRaysIcon, href: '/auth/dashboard/super-admin/user-activity' },
        { name: 'Protocols', icon: CreditCardIcon, href: '/auth/dashboard/super-admin/plans' },
        { name: 'Newsletter', icon: InboxIcon, href: '/auth/dashboard/super-admin/newsletter' },
        { name: 'Incoming', icon: ChatBubbleLeftEllipsisIcon, href: '/auth/dashboard/super-admin/contact' },
        { name: 'Settings', icon: Cog6ToothIcon, href: '/auth/dashboard/super-admin/settings' },
    ];

    const handleSignOut = () => {
        authSignOut({ callbackUrl: '/auth/signin' });
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Mobile Header */}
            <header className={`lg:hidden sticky top-0 z-[60] w-full transition-all duration-300 ${scrolled ? 'bg-slate-950/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
                <div className="flex items-center justify-between px-6 py-4">
                    <div className={`flex items-center gap-3 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
                            <ShieldCheckIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black tracking-tighter text-white leading-none">COMMAND</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">ONLINE</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 active:scale-95 transition-all"
                    >
                        {isSidebarOpen ? <XMarkIcon className="w-6 h-6 text-white" /> : <Bars3Icon className="w-6 h-6" />}
                    </button>
                </div>
            </header>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-[100] w-72 transform transition-all duration-500 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-full bg-slate-950/40 backdrop-blur-xl border-r border-slate-800/50 flex flex-col m-2 lg:m-4 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                    {/* Sidebar Decor */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

                    {/* Logo Section */}
                    <div className="p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20 group-hover:scale-110 transition-transform duration-300">
                                <ShieldCheckIcon className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black tracking-tighter text-white">SED COMMAND</h1>
                                <p className="text-[10px] font-bold text-indigo-400 tracking-[0.2em] uppercase">Control Center</p>
                            </div>
                        </div>

                        {/* Back to Home & User Dashboard */}
                        <div className="space-y-2 mb-8">
                            <Link
                                href="/"
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/50 hover:border-slate-700 transition-all duration-300 text-sm group/home"
                            >
                                <GlobeAltIcon className="w-4 h-4 group-hover/home:rotate-12 transition-transform" />
                                <span>Site Home</span>
                            </Link>

                            <Link
                                href="/auth/dashboard"
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:text-white hover:bg-indigo-500/20 transition-all duration-300 text-sm group/back"
                            >
                                <ArrowLeftIcon className="w-4 h-4 group-hover/back:-translate-x-1 transition-transform" />
                                <span>User Dashboard</span>
                            </Link>
                        </div>

                        {/* Nav Links */}
                        <nav className="space-y-2">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group/nav ${isActive
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                            : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'
                                            }`}
                                    >
                                        <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover/nav:text-indigo-400'}`} />
                                        <span className="font-semibold tracking-wide">{item.name}</span>
                                        {isActive && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"></div>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* User Profile Section */}
                    <div className="mt-auto p-6 border-t border-slate-800/50 bg-slate-950/20">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 ring-1 ring-slate-700 overflow-hidden">
                                    {session?.user?.image ? (
                                        <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                                            {session?.user?.name?.[0] || 'A'}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-[3px] border-slate-950"></div>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-white truncate">{session?.user?.name || 'Admin'}</p>
                                <p className="text-[10px] text-slate-500 truncate uppercase tracking-widest font-bold">Terminal Active</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-5 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-500 font-bold text-sm ring-1 ring-red-500/20"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            <span>Initiate Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Sidebar Overlay (Mobile) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-[90] bg-slate-950/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content Area */}
            <main className={`lg:ml-72 transition-all duration-300 min-h-screen relative`}>
                {/* Top Header Controls (Desktop) */}
                <div className="hidden lg:flex sticky top-0 z-40 h-20 items-center justify-between px-8 bg-[#020617]/40 backdrop-blur-md">
                    <div>
                        <h2 className="text-sm font-bold text-slate-500 tracking-[0.3em] uppercase">Terminal / System Overview</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 ring-1 ring-white/5">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                            <span className="text-xs font-bold text-slate-400 tracking-wider">PLATFORM ONLINE</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer">
                                <SignalIcon className="w-5 h-5" />
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer">
                                <ServerIcon className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Wrapper */}
                <div className="p-4 lg:p-8 pt-6 lg:pt-0 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>

            {/* Global CSS for Animations */}
            <style jsx global>{`
        @keyframes subtle-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        .animate-glow {
          animation: subtle-glow 4s ease-in-out infinite;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #020617;
        }
        ::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
        </div>
    );
}
