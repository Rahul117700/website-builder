'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, SparklesIcon, RocketLaunchIcon, GiftIcon, FireIcon, StarIcon, CircleStackIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'achievement';
  title: string;
  message: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    href: string;
  };
  duration?: number;
}

/**
 * Engagement Notifier
 * Shows engaging notifications to keep users on the site
 */
export default function EngagementNotifier() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [timeOnPage, setTimeOnPage] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [shownNotifications, setShownNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Track time on page
    const startTime = Date.now();
    const interval = setInterval(() => {
      setTimeOnPage(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Track scroll progress
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    // Track user interaction
    const handleInteraction = () => {
      setHasInteracted(true);
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Show notifications based on engagement
  useEffect(() => {
    if (!hasInteracted) return;

    // After 10 seconds - Welcome message (only once)
    if (timeOnPage === 10 && !shownNotifications.has('welcome')) {
      showNotification({
        id: 'welcome',
        type: 'info',
        title: '🚀 Scale Your Influence',
        message: 'Channels with frequent updates see 5x more engagement. Start your journey now!',
        icon: <SparklesIcon className="h-5 w-5" />,
        action: {
          label: 'Explore Dashboard',
          href: '/auth/dashboard/my-channel',
        },
        duration: 8000,
      });
      setShownNotifications(prev => new Set(prev).add('welcome'));
    }

    // After 30 seconds - Engagement prompt
    if (timeOnPage === 30 && !shownNotifications.has('monetization') && notifications.length === 0) {
      showNotification({
        id: 'monetization',
        type: 'success',
        title: '💰 Monetize Your Passion',
        message: 'Turn your content into revenue. Setup your subscription and start earning today.',
        icon: <CircleStackIcon className="h-5 w-5" />,
        action: {
          label: 'Get Started',
          href: '/auth/dashboard/my-channel',
        },
        duration: 8000,
      });
      setShownNotifications(prev => new Set(prev).add('monetization'));
    }

    // After 60 seconds - Professional Insights
    if (timeOnPage === 60 && !shownNotifications.has('achievement') && notifications.length === 0) {
      showNotification({
        id: 'achievement',
        type: 'achievement',
        title: '📈 Professional Insights',
        message: 'Unlock detailed analytics for your products and track your growth in real-time.',
        icon: <ChartBarIcon className="h-5 w-5" />,
        action: {
          label: 'Go to Channel',
          href: '/auth/dashboard/my-channel',
        },
        duration: 8000,
      });
      setShownNotifications(prev => new Set(prev).add('achievement'));
    }

    // At 25% scroll - Growth Tip
    if (scrollProgress >= 25 && scrollProgress < 26 && !shownNotifications.has('scroll-25') && notifications.length === 0) {
      showNotification({
        id: 'scroll-25',
        type: 'info',
        title: '📈 Scale Your Influence',
        message: 'Channels with frequent updates see 5x more engagement. Start your journey now!',
        icon: <FireIcon className="h-5 w-5" />,
        action: {
          label: 'Explore Dashboard',
          href: '/auth/dashboard',
        },
        duration: 5000,
      });
      setShownNotifications(prev => new Set(prev).add('scroll-25'));
    }

    // At 50% scroll - Premium reveal
    if (scrollProgress >= 50 && scrollProgress < 51 && !shownNotifications.has('scroll-50') && notifications.length === 0) {
      showNotification({
        id: 'scroll-50',
        type: 'info',
        title: '🚀 Scale to Unlimited',
        message: 'Did you know premium creators can manage unlimited channels and funnels?',
        icon: <GiftIcon className="h-5 w-5" />,
        action: {
          label: 'Upgrade Access',
          href: '/auth/dashboard/plans',
        },
        duration: 8000,
      });
      setShownNotifications(prev => new Set(prev).add('scroll-50'));
    }

    // At 75% scroll - Final Push
    if (scrollProgress >= 75 && scrollProgress < 76 && !shownNotifications.has('scroll-75') && notifications.length === 0) {
      showNotification({
        id: 'scroll-75',
        type: 'warning',
        title: '✨ Your Audience Awaits',
        message: "Finalize your setup and start building your community today.",
        icon: <RocketLaunchIcon className="h-5 w-5" />,
        action: {
          label: 'Explore Dashboard',
          href: '/auth/dashboard/my-channel',
        },
        duration: 8000,
      });
      setShownNotifications(prev => new Set(prev).add('scroll-75'));
    }
  }, [timeOnPage, scrollProgress, hasInteracted, notifications, shownNotifications]);

  const showNotification = (notification: Notification) => {
    setNotifications((prev) => [...prev, notification]);

    // Auto-remove after duration
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) return null;

  // Only show the most recent notification (limit to 1 at a time)
  const activeNotification = notifications[notifications.length - 1];

  return (
    <div className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-[9998] w-full max-w-lg md:max-w-5xl px-4 md:px-6 pointer-events-none">
      <div
        key={activeNotification.id}
        className={`pointer-events-auto relative bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-white/50 py-3 md:py-2.5 px-4 md:px-5 animate-[slideUpCenter_0.5s_cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.005] transition-transform duration-300 group overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 ${activeNotification.type === 'achievement'
          ? 'bg-gradient-to-r from-amber-50/95 to-white/95'
          : activeNotification.type === 'warning'
            ? 'bg-gradient-to-r from-orange-50/95 to-white/95'
            : 'bg-gradient-to-r from-indigo-50/95 to-white/95'
          }`}
      >
        {/* Animated Background Pulse */}
        <div className={`absolute -left-20 top-1/2 -translate-y-1/2 w-48 h-48 blur-3xl opacity-20 transition-opacity group-hover:opacity-40 animate-pulse ${activeNotification.type === 'achievement' ? 'bg-amber-500' :
          activeNotification.type === 'warning' ? 'bg-orange-500' : 'bg-indigo-500'
          }`} />

        <div className="flex items-center gap-3 md:gap-5 flex-1 min-w-0">
          <div
            className={`flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shadow-lg transform transition-transform group-hover:rotate-6 ${activeNotification.type === 'achievement'
              ? 'bg-amber-100 text-amber-600 shadow-amber-200/50'
              : activeNotification.type === 'warning'
                ? 'bg-orange-100 text-orange-600 shadow-orange-200/50'
                : 'bg-indigo-100 text-indigo-600 shadow-indigo-200/50'
              }`}
          >
            {activeNotification.icon}
          </div>
          <div className="min-w-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <h4 className="font-black text-gray-900 text-sm tracking-tight leading-tight md:leading-none whitespace-normal md:whitespace-nowrap">
              {activeNotification.title}
            </h4>
            <div className="hidden md:block w-1 h-1 rounded-full bg-gray-300 flex-shrink-0"></div>
            <p className="text-[11px] md:text-xs font-bold text-gray-500/80 leading-tight md:leading-none line-clamp-2 md:truncate">
              {activeNotification.message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 md:gap-5 w-full md:w-auto mt-1 md:mt-0">
          {activeNotification.action && (
            <Link
              href={activeNotification.action.href}
              className={`flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap shadow-lg ${activeNotification.type === 'achievement'
                ? 'bg-amber-600 text-white shadow-amber-300/40 hover:bg-amber-700 hover:-translate-y-0.5'
                : activeNotification.type === 'warning'
                  ? 'bg-orange-600 text-white shadow-orange-300/40 hover:bg-orange-700 hover:-translate-y-0.5'
                  : 'bg-slate-900 text-white shadow-slate-300/40 hover:bg-black hover:-translate-y-0.5'
                }`}
            >
              {activeNotification.action.label}
              <RocketLaunchIcon className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            onClick={() => removeNotification(activeNotification.id)}
            className="p-1.5 md:p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition-all"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Premium Slim Progress Bar */}
        {activeNotification.duration && (
          <div className="absolute bottom-0 left-0 h-[3px] bg-gray-100/50 w-full">
            <div
              className={`h-full transition-all linear ${activeNotification.type === 'achievement' ? 'bg-amber-500' :
                activeNotification.type === 'warning' ? 'bg-orange-500' : 'bg-indigo-500'
                }`}
              style={{
                animation: `progress ${activeNotification.duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes progress {
            from { width: 100%; }
            to { width: 0%; }
        }
        @keyframes slideUpCenter {
            from {
                transform: translateY(100%) scale(0.9);
                opacity: 0;
            }
            to {
                transform: translateY(0) scale(1);
                opacity: 1;
            }
        }
      `}</style>
    </div>
  );
}

