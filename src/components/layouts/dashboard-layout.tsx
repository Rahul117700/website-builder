'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  GlobeAltIcon, 
  ChartBarIcon, 
  CreditCardIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  CubeIcon,
  ShoppingBagIcon,
  BanknotesIcon,
  SparklesIcon,
  InboxArrowDownIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  UserIcon,
  FunnelIcon,
  InformationCircleIcon,
  LightBulbIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { RocketLaunchIcon } from '@heroicons/react/24/solid';

import { WelcomeModal } from '@/components/dashboard/welcome-modal';
import { io as socketIOClient, Socket } from 'socket.io-client';
import { useUserPlan } from '@/hooks/useUserPlan';
import { getHiddenNavigationItems, canAccessPage } from '@/utils/planPermissions';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import NotificationSound from '@/components/NotificationSound';
import Logo from '@/components/Logo';
import dynamic from 'next/dynamic';

const DashboardTour = dynamic(() => import('@/components/DashboardTour'), { ssr: false });

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);


  const [showNotifications, setShowNotifications] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { userPlan, loading: planLoading } = useUserPlan();
  const [isLoading, setIsLoading] = useState(false);
  const [playNotificationSound, setPlayNotificationSound] = useState(false);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  const [runDashboardTour, setRunDashboardTour] = useState(false);



  // Check for tour parameter and start dashboard tour
  useEffect(() => {
    if (!searchParams) return;
    
    const tourParam = searchParams.get('tour');
    if (tourParam === 'true') {
      // Start the dashboard tour after a delay to ensure everything is loaded
      setTimeout(() => {
        setRunDashboardTour(true);
      }, 2000);
      
      // Remove the tour parameter from URL without triggering a page reload
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('tour');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);

  // Auto-start tour for new users (first time on dashboard)
  useEffect(() => {
    if (!session?.user?.id) return;
    if (pathname !== '/auth/dashboard') return;
    
    const tourShownKey = `tour_shown_${session.user.id}`;
    const hasSeenTour = localStorage.getItem(tourShownKey);
    
    if (!hasSeenTour) {
      // Wait a bit longer for new users to see the dashboard first
      setTimeout(() => {
        setRunDashboardTour(true);
        // Mark tour as shown
        localStorage.setItem(tourShownKey, 'true');
      }, 3000); // 3 seconds delay for new users
    }
  }, [session?.user?.id, pathname]);

  useEffect(() => {
    let socket: Socket | undefined;
    if (session?.user?.id) {
      // Fetch initial notifications
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          const notificationsArray = Array.isArray(data) ? data : (data.notifications || []);
          setNotifications(notificationsArray);
          setLastNotificationCount(notificationsArray.length);
        })
        .catch(error => console.error('Error fetching notifications:', error));
      
      // Connect to Socket.IO
      try {
        socket = socketIOClient('http://localhost:4000', {
          transports: ['websocket', 'polling'],
          timeout: 5000,
        });
        
        socket.on('connect', () => {
          console.log('Socket connected, identifying user:', session.user.id);
          socket!.emit('identify', session.user.id);
        });
        
        socket.on('notification', (notification) => {
          console.log('Received real-time notification:', notification);
          setNotifications(prev => [notification, ...prev]);
          // Play notification sound for new notifications
          setPlayNotificationSound(true);
        });
        
        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });
        
        socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
        });
      } catch (error) {
        console.error('Error setting up Socket.IO:', error);
      }
    }
    return () => {
      if (socket) {
        console.log('Disconnecting socket');
        socket.disconnect();
      }
    };
  }, [session?.user?.id]);

  // Poll for new notifications every 10 seconds as fallback
  useEffect(() => {
    if (!session?.user?.id) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/notifications');
        const data = await response.json();
        const notificationsArray = Array.isArray(data) ? data : (data.notifications || []);
        
        // Check if there are new notifications
        if (notificationsArray.length > lastNotificationCount) {
          const newNotifications = notificationsArray.slice(0, notificationsArray.length - lastNotificationCount);
          console.log('Found new notifications via polling:', newNotifications);
          
          // Add new notifications to the beginning
          setNotifications(prev => [...newNotifications, ...prev]);
          setLastNotificationCount(notificationsArray.length);
          
          // Play sound for new notifications
          setPlayNotificationSound(true);
        }
      } catch (error) {
        console.error('Error polling notifications:', error);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(pollInterval);
  }, [session?.user?.id, lastNotificationCount]);

  // Get hidden navigation items based on user's plan
  const hiddenItems = getHiddenNavigationItems(userPlan);
  
  // State for navigation settings
  const [navigationSettings, setNavigationSettings] = useState<any[]>([]);
  
  // Fetch navigation settings
  useEffect(() => {
    const fetchNavigationSettings = async () => {
      try {
        const response = await fetch('/api/navigation-settings');
        if (response.ok) {
          const settings = await response.json();
          console.log('Navigation settings fetched:', settings);
          setNavigationSettings(settings);
        } else {
          console.error('Failed to fetch navigation settings:', response.status);
        }
      } catch (error) {
        console.error('Error fetching navigation settings:', error);
      }
    };
    
    fetchNavigationSettings();
  }, []);
  
  // Create navigation array with filtering logic
  const navigation = useMemo(() => {
    const allNavigationItems = [
      { 
        name: 'Dashboard', 
        href: '/auth/dashboard', 
        icon: HomeIcon, 
        current: pathname === '/auth/dashboard',
        description: 'View your sales overview and key metrics'
      },
      { 
        name: 'My Funnels', 
        href: '/auth/dashboard/funnels', 
        icon: RocketLaunchIcon as any, 
        current: pathname?.startsWith('/auth/dashboard/funnels'),
        description: 'Manage your products and sales pages'
      },
      { 
        name: 'Analytics', 
        href: '/auth/dashboard/analytics', 
        icon: ChartBarIcon, 
        current: pathname === '/auth/dashboard/analytics',
        description: 'Track performance and sales data'
      },
      { 
        name: 'Plans', 
        href: '/auth/dashboard/plans', 
        icon: CreditCardIcon, 
        current: pathname === '/auth/dashboard/plans',
        description: 'View and manage your subscription'
      },
      { 
        name: 'Blog', 
        href: '/blog', 
        icon: DocumentTextIcon, 
        current: pathname?.startsWith('/blog'),
        description: 'Read helpful articles and guides'
      },
      { 
        name: 'Settings', 
        href: '/auth/dashboard/settings', 
        icon: Cog6ToothIcon, 
        current: pathname === '/auth/dashboard/settings',
        description: 'Configure your account and preferences'
      },
    ];

    return allNavigationItems.filter(item => {
      // Filter out items hidden by plan restrictions
      if (hiddenItems.includes(item.name)) {
        return false;
      }
      
      // Filter out items hidden by Super Admin navigation settings
      const setting = navigationSettings.find(s => s.itemName === item.name);
      if (setting && setting.isHidden) {
        return false;
      }
      
      return true;
    });
  }, [hiddenItems, navigationSettings, pathname]);

  // Add Super Admin tab only if user has SUPER_ADMIN role
  const finalNavigation = useMemo(() => {
    const baseNavigation = [...navigation];
    
    if (session?.user?.role === 'SUPER_ADMIN') {
      // Insert Super Admin after Dashboard but before My Funnels
      const superAdminItem = {
        name: 'Super Admin',
        href: '/auth/dashboard/super-admin',
        icon: ShieldCheckIcon,
        current: pathname === '/auth/dashboard/super-admin',
        description: 'Super Admin Panel',
      };
      
      // Find Dashboard index and insert Super Admin after it
      const dashboardIndex = baseNavigation.findIndex(item => item.name === 'Dashboard');
      if (dashboardIndex !== -1) {
        baseNavigation.splice(dashboardIndex + 1, 0, superAdminItem);
      } else {
        baseNavigation.unshift(superAdminItem);
      }
    }
    
    return baseNavigation;
  }, [navigation, session?.user?.role, pathname]);

  const mockActivities = [
    { id: 1, type: 'site', text: 'Created new site "My Portfolio"', time: '2 min ago' },
    { id: 2, type: 'template', text: 'Applied "Agency" template to "My Portfolio"', time: '5 min ago' },
    { id: 3, type: 'booking', text: 'Received new booking on "My Restaurant"', time: '10 min ago' },
    { id: 4, type: 'submission', text: 'New form submission on "My Business"', time: '20 min ago' },
    { id: 5, type: 'domain', text: 'Connected custom domain to "My Portfolio"', time: '1 hour ago' },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [id] }),
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      setIsLoading(true);
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/auth/signin' });
  };

  // Since we're no longer using subscription plans, all users have access to features
  const currentPlanName = 'All Features';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        {/* Hamburger menu button (only when sidebar is closed) */}
        {!isSidebarOpen && (
          <button
            type="button"
            className="absolute top-4 left-4 z-50 p-2 rounded-md bg-white text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-md border border-gray-200"
            onClick={toggleSidebar}
            aria-label="Open sidebar"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        )}
        {/* Sidebar and overlay only when open */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 flex">
            {/* Sidebar overlay */}
            <div 
              className="fixed inset-0 bg-purple-900/10 transition-opacity" 
              onClick={toggleSidebar}
            />
            {/* Sidebar */}
            <div
              className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white pt-6 pb-6 transform transition ease-in-out duration-300 translate-x-0 shadow-2xl z-50"
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={toggleSidebar}
                  aria-label="Close sidebar"
                >
                  <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-shrink-0 flex items-center px-6 mb-8">
                <Link href="/" className="flex items-center justify-center w-full" onClick={toggleSidebar}>
                  <img 
                    src="/logo/logo.png" 
                    alt="SellEarnDirect - Turn Traffic Into Revenue" 
                    className="w-auto object-contain transition-transform hover:scale-105 no-blur"
                    style={{ 
                      height: '60px',
                      maxWidth: '200px'
                    }}
                  />
                </Link>
              </div>
              <div className="flex-1 h-0 overflow-y-auto scrollbar-hide">
                <nav className="px-4 space-y-3">
                  {/* Main Navigation Group */}
                  <div className="bg-gray-50 rounded-2xl p-3 space-y-1 border border-gray-200">
                    {finalNavigation.slice(0, 2).map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        data-tour={item.name === 'My Funnels' ? 'funnels-link' : item.name === 'Analytics' ? 'analytics-link' : item.name === 'Settings' ? 'settings-link' : undefined}
                        className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                          item.current
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                        }`}
                      >
                        <item.icon
                          className={`h-5 w-5 mr-3 ${
                            item.current
                              ? 'text-white'
                              : 'text-gray-400 group-hover:text-purple-600'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="flex-1">{item.name}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Analytics & Settings Group */}
                  <div className="bg-gray-50 rounded-2xl p-3 space-y-1 border border-gray-200">
                    {finalNavigation.slice(2).map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        data-tour={item.name === 'My Funnels' ? 'funnels-link' : item.name === 'Analytics' ? 'analytics-link' : item.name === 'Settings' ? 'settings-link' : undefined}
                        className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                          item.current
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                        }`}
                      >
                        <item.icon
                          className={`h-5 w-5 mr-3 ${
                            item.current
                              ? 'text-white'
                              : 'text-gray-400 group-hover:text-purple-600'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="flex-1">{item.name}</span>
                      </Link>
                    ))}
                  </div>

                </nav>
              </div>
              {/* Bottom Section */}
              <div className="flex-shrink-0 p-4 space-y-4">
                {/* Action Icons */}
                <div className="flex items-center justify-center gap-2 px-4">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`p-2.5 rounded-xl transition-all duration-200 relative ${
                      showNotifications 
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-600 hover:text-white'
                    }`}
                    title="Notifications"
                  >
                    <BellIcon className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white transition-all duration-200"
                    title="Sign Out"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" color="primary" />
                    ) : (
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {/* User Profile Card */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 relative">
                      {session?.user?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          className="h-10 w-10 rounded-xl"
                          src={session.user.image}
                          alt=""
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center">
                          <UserIcon className="h-5 w-5" />
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {session?.user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session?.user?.role || 'User'}
                      </p>
                    </div>
                    <button 
                      onClick={() => router.push('/auth/dashboard/settings')}
                      className="flex-shrink-0 p-1.5 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-white transition-all duration-200"
                      title="Settings"
                    >
                      <Cog6ToothIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Collapsible sidebar for desktop */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 group z-30 ${
        isSidebarCollapsed ? (isSidebarHovered ? 'lg:w-72' : 'lg:w-16') : 'lg:w-72'
      }`} 
      onMouseEnter={() => setIsSidebarHovered(true)}
      onMouseLeave={() => setIsSidebarHovered(false)}
      data-tour="dashboard-sidebar">
      
      {/* Expand button for collapsed sidebar */}
      {isSidebarCollapsed && !isSidebarHovered && (
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="absolute top-4 right-0 z-10 w-6 h-6 bg-purple-500 text-white rounded-l-lg flex items-center justify-center hover:bg-purple-600 transition-colors shadow-lg"
          title="Expand sidebar"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
        <div className="flex min-h-0 flex-1 flex-col bg-white shadow-2xl border-r border-gray-200">
          <div className="flex flex-1 flex-col pt-4 pb-4 h-full">
            {/* Logo Section */}
            <div className="flex flex-shrink-0 items-center justify-center px-4 sm:px-6 mb-6 sm:mb-8">
              <Link href="/" className="flex items-center justify-center w-full">
                {isSidebarCollapsed && !isSidebarHovered ? (
                  // Collapsed Logo - Show a modern icon design
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
                      <div className="relative">
                        <span className="text-white font-bold text-xl tracking-tight">S</span>
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-white/30"></div>
                      </div>
                    </div>
                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl opacity-20 blur-md -z-10"></div>
                  </div>
                ) : (
                  // Expanded Logo - Show full logo with modern styling
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <img 
                        src="/logo/logo.png" 
                        alt="SellEarnDirect - Turn Traffic Into Revenue" 
                        className="object-contain transition-all duration-300 hover:scale-105 no-blur"
                        style={{ 
                          height: '52px',
                          width: 'auto',
                          maxWidth: '200px'
                        }}
                      />
                    </div>
                    <button
                      onClick={toggleSidebarCollapse}
                      className="hidden lg:flex p-2 rounded-xl text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 ml-2 group"
                      aria-label="Collapse sidebar"
                      title="Collapse sidebar"
                    >
                      <Bars3Icon className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                    </button>
                  </div>
                )}
              </Link>
            </div>
            <nav className={`flex-1 overflow-y-auto scrollbar-hide ${
              isSidebarCollapsed && !isSidebarHovered ? 'px-2 space-y-3' : 'px-4 space-y-3'
            }`}>
              {(!isSidebarCollapsed || isSidebarHovered) ? (
                <>
                  {/* Main Navigation Group */}
                  <div className="bg-gray-50 rounded-2xl p-3 space-y-1 border border-gray-200">
                    {finalNavigation.slice(0, 2).map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        data-tour={item.name === 'My Funnels' ? 'funnels-link' : item.name === 'Analytics' ? 'analytics-link' : item.name === 'Settings' ? 'settings-link' : undefined}
                        className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                          item.current
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                        }`}
                      >
                        <item.icon
                          className={`h-5 w-5 mr-3 ${
                            item.current
                              ? 'text-white'
                              : 'text-gray-400 group-hover:text-purple-600'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="flex-1">{item.name}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Analytics & Settings Group */}
                  <div className="bg-gray-50 rounded-2xl p-3 space-y-1 border border-gray-200">
                    {finalNavigation.slice(2).map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        data-tour={item.name === 'My Funnels' ? 'funnels-link' : item.name === 'Analytics' ? 'analytics-link' : item.name === 'Settings' ? 'settings-link' : undefined}
                        className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                          item.current
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                        }`}
                      >
                        <item.icon
                          className={`h-5 w-5 mr-3 ${
                            item.current
                              ? 'text-white'
                              : 'text-gray-400 group-hover:text-purple-600'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="flex-1">{item.name}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Notifications Button */}
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-3 shadow-lg">
                    <button
                      onClick={() => setShowNotifications(true)}
                      className="group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 w-full text-white hover:bg-white hover:text-purple-600 hover:shadow-xl"
                    >
                      <div className="relative">
                        <BellIcon
                          className="h-5 w-5 mr-3 text-white group-hover:text-purple-600"
                          aria-hidden="true"
                        />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse border-2 border-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </div>
                      <span className="flex-1 font-semibold">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                      )}
                    </button>
                  </div>

                </>
              ) : (
                <>
                  {/* Collapsed view - show just icons with better spacing */}
                  <div className="space-y-2">
                    {finalNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                          item.current
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        title={item.name}
                      >
                        <item.icon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </Link>
                    ))}
                    
                    {/* Prominent Notification button for collapsed view */}
                    <div className="relative">
                      <button
                        onClick={() => setShowNotifications(true)}
                        className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 w-full ${
                          showNotifications 
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg' 
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        } hover:shadow-xl hover:scale-105`}
                        title="Notifications"
                      >
                        <BellIcon className="h-5 w-5" />
                      </button>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse border-2 border-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </nav>
          </div>
          {/* Bottom Section */}
          <div className={`flex-shrink-0 space-y-4 ${
            isSidebarCollapsed && !isSidebarHovered ? 'p-2' : 'p-4'
          }`}>
            {!(isSidebarCollapsed && !isSidebarHovered) && (
              <>
                {/* Action Icons */}
                <div className="flex items-center justify-center gap-2 px-4">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`p-2.5 rounded-xl transition-all duration-200 relative ${
                      showNotifications 
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-600 hover:text-white'
                    }`}
                    title="Notifications"
                  >
                    <BellIcon className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white transition-all duration-200"
                    title="Sign Out"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" color="primary" />
                    ) : (
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {/* User Profile Card */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 relative">
                      {session?.user?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          className="h-10 w-10 rounded-xl"
                          src={session.user.image}
                          alt=""
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center">
                          <UserIcon className="h-5 w-5" />
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {session?.user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session?.user?.role || 'User'}
                      </p>
                    </div>
                    <button 
                      onClick={() => router.push('/auth/dashboard/settings')}
                      className="flex-shrink-0 p-1.5 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-white transition-all duration-200"
                      title="Settings"
                    >
                      <Cog6ToothIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
            {(isSidebarCollapsed && !isSidebarHovered) && (
              <div className="flex flex-col items-center gap-3">
                <button 
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white transition-all duration-200"
                  title="Sign Out"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" color="primary" />
                  ) : (
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex flex-col flex-1 transition-all duration-300 relative z-10 ${
        isSidebarCollapsed ? (isSidebarHovered ? 'lg:pl-72' : 'lg:pl-16') : 'lg:pl-72'
      }`}>
        {/* Modern Mobile Header */}
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm" data-tour="dashboard-header">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              className="flex items-center justify-center h-10 w-10 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="hover:opacity-90 transition-opacity"
            >
              <Logo 
                variant="icon-only" 
                size="md"
                href=""
                showText={false}
              />
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex items-center justify-center h-10 w-10 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
              >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <main className="flex-1 w-full h-full m-0 p-0">
          {children}
        </main>
      </div>

      {/* Enhanced Notification Modal - Mobile Optimized */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
            onClick={() => setShowNotifications(false)}
          ></div>
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto transform transition-all max-h-[90vh] flex flex-col">
              {/* Header - Mobile Optimized */}
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-2xl flex-shrink-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 bg-purple-100 rounded-xl flex-shrink-0">
                      <BellIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">Notifications & Activity</h3>
                      {unreadCount > 0 && (
                        <p className="text-xs sm:text-sm text-purple-600 font-medium">{unreadCount} unread notifications</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {notifications.length > 0 && unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="hidden sm:block px-3 py-2 text-xs sm:text-sm font-semibold text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                      aria-label="Close notifications"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Mobile Mark All Button */}
                {notifications.length > 0 && unreadCount > 0 && (
                  <div className="sm:hidden mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={handleMarkAllAsRead}
                      className="w-full px-4 py-2 text-sm font-semibold text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors touch-manipulation"
                    >
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>

              {/* Content - Mobile Optimized */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                    <div className="p-3 bg-gray-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 flex items-center justify-center">
                      <BellIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                    </div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No notifications yet</h4>
                    <p className="text-sm text-gray-500 px-4">You'll see your activity and updates here</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((activity) => (
                      <div 
                        key={activity.id} 
                        className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer touch-manipulation ${
                          !activity.read ? 'bg-purple-50 border-l-4 border-purple-400' : 'bg-white'
                        }`}
                        onClick={() => !activity.read && handleMarkAsRead(activity.id)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`p-2 rounded-lg flex-shrink-0 ${
                            activity.category === 'SALE' ? 'bg-green-100' : 'bg-purple-100'
                          }`}>
                            {activity.category === 'SALE' && <BanknotesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />}
                            {activity.category === 'PAYMENT' && <CreditCardIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />}
                            {activity.category === 'SITE' && <GlobeAltIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />}
                            {activity.category === 'COMMUNITY' && <ChatBubbleLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />}
                            {activity.category === 'SYSTEM' && <BellIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />}
                            {/* Fallback to old type-based icons if category doesn't match */}
                            {!activity.category && activity.type === 'site' && <GlobeAltIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />}
                            {!activity.category && activity.type === 'template' && <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />}
                            {!activity.category && activity.type === 'booking' && <CubeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />}
                            {!activity.category && activity.type === 'submission' && <InboxArrowDownIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />}
                            {!activity.category && activity.type === 'domain' && <GlobeAltIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />}
                            {!activity.category && activity.type === 'comment' && <ChatBubbleLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />}
                            {!activity.category && activity.type === 'like' && <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />}
                            {!activity.category && activity.type === 'plan' && <CreditCardIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />}
                            {!activity.category && activity.type === 'publish' && <GlobeAltIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                {activity.title && (
                                  <h4 className="text-sm font-semibold text-gray-900 mb-1 break-words">
                                    {activity.title}
                                  </h4>
                                )}
                                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed break-words">
                                  {activity.message}
                                </p>
                              </div>
                              
                              {/* Unread indicator */}
                              {!activity.read && (
                                <div className="flex-shrink-0 mt-1">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                </div>
                              )}
                            </div>
                            
                            {/* Timestamp and Category - Mobile Optimized */}
                            <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {new Date(activity.createdAt).toLocaleString()}
                              </span>
                              {activity.category && (
                                <span className={`px-2 py-1 text-xs font-medium rounded-full self-start ${
                                  activity.category === 'SALE' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-purple-100 text-purple-700'
                                }`}>
                                  {activity.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome/Onboarding Modal (can be triggered by Help button) - Don't show if tour is running */}
      {showWelcome && !runDashboardTour && <WelcomeModal open={showWelcome} setOpen={setShowWelcome} forceShow />}

      {/* Notification Sound */}
      <NotificationSound 
        play={playNotificationSound} 
        onPlay={() => setPlayNotificationSound(false)}
      />

      {/* Dashboard Tour with Reactour */}
      <DashboardTour run={runDashboardTour} onFinish={() => setRunDashboardTour(false)} />

      {/* Tour Trigger Button */}
      <button
        onClick={() => setRunDashboardTour(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-full shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105"
        title="Start Dashboard Tour"
      >
        <QuestionMarkCircleIcon className="h-6 w-6" />
      </button>
    </div>
  );
}
