'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  UserIcon
} from '@heroicons/react/24/outline';
import { RocketLaunchIcon } from '@heroicons/react/24/solid';
import { useTheme } from 'next-themes';
import { WelcomeModal } from '@/components/dashboard/welcome-modal';
import { io as socketIOClient, Socket } from 'socket.io-client';
import { useUserPlan } from '@/hooks/useUserPlan';
import { getHiddenNavigationItems, canAccessPage } from '@/utils/planPermissions';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import NotificationSound from '@/components/NotificationSound';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { userPlan, loading: planLoading } = useUserPlan();
  const [isLoading, setIsLoading] = useState(false);
  const [playNotificationSound, setPlayNotificationSound] = useState(false);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  // After mounting, we can access the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let socket: Socket | undefined;
    if (session?.user?.id) {
      // Fetch initial notifications
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          const notificationsArray = Array.isArray(data) ? data : [];
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
        const notificationsArray = Array.isArray(data) ? data : [];
        
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
  
  const navigation = [
    { name: 'Dashboard', href: '/auth/dashboard', icon: HomeIcon, current: pathname === '/auth/dashboard' },
    { name: 'Websites', href: '/auth/dashboard/sites', icon: GlobeAltIcon, current: pathname?.startsWith('/auth/dashboard/sites') },
    { name: 'Analytics', href: '/auth/dashboard/analytics', icon: ChartBarIcon, current: pathname === '/auth/dashboard/analytics' },
    { name: 'Submissions', href: '/auth/dashboard/submissions', icon: InboxArrowDownIcon, current: pathname === '/auth/dashboard/submissions' },
    { name: 'Marketplace', href: '/auth/dashboard/marketplace', icon: ShoppingBagIcon, current: pathname === '/auth/dashboard/marketplace' },
    { name: 'Sales', href: '/auth/dashboard/sales', icon: SparklesIcon, current: pathname === '/auth/dashboard/sales' },
    { name: 'Funnels', href: '/auth/dashboard/funnels', icon: RocketLaunchIcon as any, current: pathname === '/auth/dashboard/funnels' },
    { name: 'Purchased Templates', href: '/auth/dashboard/purchased-templates', icon: HeartIcon, current: pathname === '/auth/dashboard/purchased-templates' },
    { name: 'Community', href: '/auth/dashboard/community', icon: UserGroupIcon, current: pathname === '/auth/dashboard/community' },
    // { name: 'Domain', href: '/auth/dashboard/domain', icon: GlobeAltIcon, current: pathname === '/auth/dashboard/domain' },
    // { name: 'Billing', href: '/auth/dashboard/billing', icon: BanknotesIcon, current: pathname === '/auth/dashboard/billing' },
    // { name: 'Transactions', href: '/auth/dashboard/transactions', icon: CreditCardIcon, current: pathname === '/auth/dashboard/transactions' },
    { name: 'Settings', href: '/auth/dashboard/settings', icon: Cog6ToothIcon, current: pathname === '/auth/dashboard/settings' },
  ].filter(item => !hiddenItems.includes(item.name));

  // Add Super Admin tab if user is SUPER_ADMIN or has the special email
  if (session?.user?.role === 'SUPER_ADMIN' || session?.user?.email === 'i.am.rahul4550@gmail.com') {
    navigation.unshift({
      name: 'Super Admin',
      href: '/auth/dashboard/super-admin',
      icon: ShieldCheckIcon,
      current: pathname === '/auth/dashboard/super-admin',
    });
  }

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

  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      // Optionally show error
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      setIsLoading(true);
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      // Optionally show error
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
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Notification Bell (desktop, top-right) */}
      <div className="hidden lg:block fixed top-4 right-8 z-40">
        <button
          className="relative p-2 rounded-full bg-white dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-800"
          onClick={() => setShowNotifications(true)}
          aria-label="Show notifications"
        >
          <BellIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
        </button>
      </div>
      {/* Help Button (desktop, top-right) */}
      <div className="hidden lg:block fixed top-4 right-24 z-40">
        <button
          className="relative p-2 rounded-full bg-white dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-800"
          onClick={() => setShowWelcome(true)}
          aria-label="Show help / onboarding"
        >
          <QuestionMarkCircleIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </button>
      </div>
      
      {/* Test Notification Button (desktop, top-right) - Remove in production */}
      {/* 
      <div className="hidden lg:block fixed top-4 right-40 z-40">
        <button
          className="relative p-2 rounded-full bg-white dark:bg-slate-800 shadow border border-gray-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-slate-700"
          onClick={async () => {
            try {
              const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'test',
                  message: 'Test notification - ' + new Date().toLocaleTimeString(),
                }),
              });
              if (response.ok) {
                console.log('Test notification created');
              }
            } catch (error) {
              console.error('Error creating test notification:', error);
            }
          }}
          aria-label="Test notification"
        >
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400">🔔</span>
        </button>
      </div>
      */}
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        {/* Hamburger menu button (only when sidebar is closed) */}
        {!isSidebarOpen && (
          <button
            type="button"
            className="absolute top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-md border border-gray-200 dark:border-gray-700"
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
              className="fixed inset-0 bg-purple-900/10 dark:bg-gray-600/75 transition-opacity" 
              onClick={toggleSidebar}
            />
            {/* Sidebar */}
            <div
              className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white dark:bg-black pt-5 pb-4 transform transition ease-in-out duration-300 translate-x-0 shadow-2xl rounded-r-2xl border-r border-gray-200 dark:border-gray-800"
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
              <div className="flex-shrink-0 flex items-center px-4">
                <Link href="/" className="text-xl font-bold text-primary-600 dark:text-primary-500">
                  Website Builder
                </Link>
              </div>
              <div className="mt-5 flex-1 h-0 overflow-y-auto">
                <nav className="px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-2 text-base font-semibold rounded-xl transition-all duration-150 ${
                        item.current
                          ? 'bg-purple-100 dark:bg-gray-900 text-purple-700 dark:text-purple-300 shadow-md'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-900 hover:text-purple-700 dark:hover:text-purple-300'
                      }`}
                    >
                      <item.icon
                        className={`mr-4 h-6 w-6 ${
                          item.current
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-gray-400 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-800 p-6 mt-4">
                <div className="flex-shrink-0 w-full group block">
                  <div className="flex items-center gap-4">
                    <div>
                      {session?.user?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          className="inline-block h-10 w-10 rounded-full border border-purple-200"
                          src={session.user.image}
                          alt=""
                        />
                      ) : (
                        <div className="inline-block h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center border border-purple-200">
                          <UserIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="ml-2 flex-1">
                      <p className="text-base font-semibold text-gray-900 dark:text-gray-200">
                        {session?.user?.name || session?.user?.email || 'User'}
                      </p>
                      <button
                        onClick={handleSignOut}
                        disabled={isLoading}
                        className="mt-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center gap-1"
                      >
                        {isLoading ? (
                          <>
                            <LoadingSpinner size="sm" color="primary" />
                            Signing out...
                          </>
                        ) : (
                          <>
                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                            Sign out
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <Link href="/" className="text-xl font-bold text-primary-600 dark:text-primary-500">
                Website Builder
              </Link>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-base font-semibold rounded-xl transition-all duration-150 ${
                    item.current
                      ? 'bg-purple-100 dark:bg-gray-900 text-purple-700 dark:text-purple-300 shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-900 hover:text-purple-700 dark:hover:text-purple-300'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      item.current
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 dark:border-gray-800 p-6 mt-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center gap-4">
                <div>
                  {session?.user?.image ? (
                    <img
                      className="inline-block h-10 w-10 rounded-full border border-purple-200"
                      src={session.user.image}
                      alt=""
                    />
                  ) : (
                    <div className="inline-block h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center border border-purple-200">
                      <UserIcon className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="ml-2 flex-1">
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-200">
                    {session?.user?.name || session?.user?.email || 'User'}
                  </p>
                  <button
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="mt-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center gap-1"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" color="primary" />
                        Signing out...
                      </>
                    ) : (
                      <>
                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        Sign out
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 bg-white dark:bg-black pl-1 pt-1 sm:pl-3 sm:pt-3 lg:hidden shadow-md rounded-b-2xl">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <main className="flex-1 pb-8">
          <div className="px-[20px] py-10 w-full">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-800 w-full">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Notification Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative max-h-[80vh] flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-between flex-shrink-0">
              Notifications & Activity
              {notifications.length > 0 && unreadCount > 0 && (
                <button
                  className="text-xs px-3 py-1 rounded bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 font-semibold ml-2 hover:bg-purple-200 dark:hover:bg-purple-700"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </button>
              )}
            </h2>
            <button
              className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
              onClick={() => setShowNotifications(false)}
              aria-label="Close notifications"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            </button>
            <ul className="divide-y divide-gray-200 dark:divide-gray-800 overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <li className="py-4 text-center text-gray-500 dark:text-gray-400">No notifications yet.</li>
              ) : notifications.map((activity) => (
                <li key={activity.id} className={`py-3 flex items-start gap-3 cursor-pointer ${!activity.read ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}
                    onClick={() => !activity.read && handleMarkAsRead(activity.id)}>
                  <span className="inline-block h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                    {/* Icon based on type */}
                    {activity.type === 'site' && <GlobeAltIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                    {activity.type === 'template' && <SparklesIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                    {activity.type === 'booking' && <CubeIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                    {activity.type === 'submission' && <InboxArrowDownIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                    {activity.type === 'domain' && <GlobeAltIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                    {activity.type === 'comment' && <ChatBubbleLeftIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                    {activity.type === 'like' && <HeartIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                    {activity.type === 'plan' && <CreditCardIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                    {activity.type === 'publish' && <GlobeAltIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="truncate">{activity.message}</span>
                      {!activity.read && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(activity.createdAt).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Welcome/Onboarding Modal (can be triggered by Help button) */}
      {showWelcome && <WelcomeModal open={showWelcome} setOpen={setShowWelcome} forceShow />}

      {/* Notification Sound */}
      <NotificationSound 
        play={playNotificationSound} 
        onPlay={() => setPlayNotificationSound(false)}
      />
    </div>
  );
}
