'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, SparklesIcon, RocketLaunchIcon, GiftIcon, FireIcon, StarIcon } from '@heroicons/react/24/outline';
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
        title: '👋 Welcome!',
        message: 'Discover how to turn your traffic into revenue. Explore our features!',
        icon: <SparklesIcon className="h-5 w-5" />,
        action: {
          label: 'Explore Features',
          href: '/#features',
        },
        duration: 5000,
      });
      setShownNotifications(prev => new Set(prev).add('welcome'));
    }

    // After 30 seconds - Engagement prompt (only once, and only if no other notification is showing)
    if (timeOnPage === 30 && !shownNotifications.has('engagement') && notifications.length === 0) {
      showNotification({
        id: 'engagement',
        type: 'info',
        title: '💡 Pro Tip',
        message: 'Join 10,000+ creators already selling on our platform. Start your free trial!',
        icon: <RocketLaunchIcon className="h-5 w-5" />,
        action: {
          label: 'Start Free Trial',
          href: '/auth/signup',
        },
        duration: 6000,
      });
      setShownNotifications(prev => new Set(prev).add('engagement'));
    }

    // After 60 seconds - Achievement (only once, and only if no other notification is showing)
    if (timeOnPage === 60 && !shownNotifications.has('achievement') && notifications.length === 0) {
      showNotification({
        id: 'achievement',
        type: 'achievement',
        title: '🎉 Achievement Unlocked!',
        message: "You've been exploring for a minute! Ready to create your first funnel?",
        icon: <StarIcon className="h-5 w-5" />,
        action: {
          label: 'Create Funnel',
          href: '/auth/dashboard/funnels',
        },
        duration: 7000,
      });
      setShownNotifications(prev => new Set(prev).add('achievement'));
    }

    // At 25% scroll - Blog suggestion (only once, and only if no other notification is showing)
    if (scrollProgress >= 25 && scrollProgress < 26 && !shownNotifications.has('scroll-25') && notifications.length === 0) {
      showNotification({
        id: 'scroll-25',
        type: 'info',
        title: '📚 Check Out Our Blog',
        message: 'Learn how to maximize your sales with our expert tips and guides!',
        icon: <FireIcon className="h-5 w-5" />,
        action: {
          label: 'Read Blog',
          href: '/blog',
        },
        duration: 5000,
      });
      setShownNotifications(prev => new Set(prev).add('scroll-25'));
    }

    // At 50% scroll - Feature highlight (only once, and only if no other notification is showing)
    if (scrollProgress >= 50 && scrollProgress < 51 && !shownNotifications.has('scroll-50') && notifications.length === 0) {
      showNotification({
        id: 'scroll-50',
        type: 'info',
        title: '🚀 Halfway There!',
        message: 'You\'re halfway through! Did you know you can create unlimited funnels?',
        icon: <GiftIcon className="h-5 w-5" />,
        action: {
          label: 'View Plans',
          href: '/auth/dashboard/plans',
        },
        duration: 5000,
      });
      setShownNotifications(prev => new Set(prev).add('scroll-50'));
    }

    // At 75% scroll - CTA (only once, and only if no other notification is showing)
    if (scrollProgress >= 75 && scrollProgress < 76 && !shownNotifications.has('scroll-75') && notifications.length === 0) {
      showNotification({
        id: 'scroll-75',
        type: 'warning',
        title: '✨ Almost Done!',
        message: 'Don\'t miss out! Start building your sales funnel today - it\'s free!',
        icon: <RocketLaunchIcon className="h-5 w-5" />,
        action: {
          label: 'Get Started',
          href: '/auth/signup',
        },
        duration: 6000,
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
    <div className="fixed bottom-4 right-4 z-[9998] max-w-sm w-[calc(100%-2rem)] sm:w-auto">
      <div
        key={activeNotification.id}
        className={`bg-white rounded-xl shadow-2xl border-2 p-4 animate-[slideInRight_0.3s_ease-out] ${
          activeNotification.type === 'achievement'
            ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50'
            : activeNotification.type === 'warning'
            ? 'border-orange-400 bg-orange-50'
            : 'border-purple-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex-shrink-0 ${
              activeNotification.type === 'achievement'
                ? 'text-yellow-600'
                : activeNotification.type === 'warning'
                ? 'text-orange-600'
                : 'text-purple-600'
            }`}
          >
            {activeNotification.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 text-sm mb-1">{activeNotification.title}</h4>
            <p className="text-sm text-gray-600 mb-2">{activeNotification.message}</p>
            {activeNotification.action && (
              <Link
                href={activeNotification.action.href}
                className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
              >
                {activeNotification.action.label}
                <span>→</span>
              </Link>
            )}
          </div>
          <button
            onClick={() => removeNotification(activeNotification.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close notification"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

