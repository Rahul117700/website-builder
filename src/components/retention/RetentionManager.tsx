'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ExitIntentPopup from './ExitIntentPopup';
import EngagementNotifier from './EngagementNotifier';
import { getUserEngagementStatus, UserEngagementStatus } from '@/app/actions/user-status';
// SocialProof removed - flagged as deceptive content by Google Search Console
// import SocialProof from './SocialProof';
import NewsletterPrompt from './NewsletterPrompt';

/**
 * Global Retention Manager
 * Handles exit intent detection and user retention strategies
 * Combines multiple retention mechanisms to keep users engaged
 */
export default function RetentionManager() {
  const { data: session, status } = useSession();
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [timeOnPage, setTimeOnPage] = useState(0);
  const [isDashboard, setIsDashboard] = useState(false);
  const [userStatus, setUserStatus] = useState<UserEngagementStatus | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check if we're on a dashboard page (less retention needed)
    setIsDashboard(window.location.pathname.includes('/dashboard'));

    // Fetch user status if logged in
    if (session) {
      getUserEngagementStatus().then(status => {
        if (status) setUserStatus(status);
      });
    }

    // Track time on page
    const startTime = Date.now();
    const interval = setInterval(() => {
      setTimeOnPage(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Track user interaction
    const handleInteraction = () => {
      setHasInteracted(true);
    };

    // Exit intent detection - mouse leaving top of screen
    const handleMouseLeave = (e: MouseEvent) => {
      // Only show if user has been on page for at least 5 seconds and has interacted
      if (e.clientY <= 0 && hasInteracted && timeOnPage >= 5 && !showExitIntent && !isDashboard) {
        setShowExitIntent(true);
      }
    };

    // Before unload - when user tries to close tab/window
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show if user has been on page for at least 10 seconds
      if (timeOnPage >= 10 && hasInteracted && !isDashboard) {
        e.preventDefault();
        e.returnValue = '';
        if (!showExitIntent) {
          setShowExitIntent(true);
        }
      }
    };

    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasInteracted, timeOnPage, showExitIntent, isDashboard]);

  // Hide for guests as per user request
  if (!mounted || status === 'loading' || !session) {
    return null;
  }

  return (
    <>
      {/* Exit Intent Popup */}
      {showExitIntent && <ExitIntentPopup onClose={() => setShowExitIntent(false)} />}

      {/* Engagement Notifications - Only on public pages */}
      {/* Notifications removed as per user request */}

      {/* Social Proof removed - flagged as deceptive content by Google */}
      {/* {!isDashboard && <SocialProof />} */}

      {/* Newsletter Prompt - Only on public pages */}
      {!isDashboard && <NewsletterPrompt />}
    </>
  );
}

