'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, EnvelopeIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

/**
 * Newsletter Prompt
 * Non-intrusive bottom banner that encourages users to subscribe
 */
export default function NewsletterPrompt() {
  const { data: session } = useSession();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Check if user has already subscribed (from localStorage or database)
    const checkSubscription = async () => {
      // 1. Check local storage first
      const hasSubscribedLocal = localStorage.getItem('newsletter_subscribed');
      const savedEmail = localStorage.getItem('newsletter_email');
      const dismissed = sessionStorage.getItem('newsletter_dismissed');

      if (hasSubscribedLocal === 'true' || dismissed === 'true') return;

      // 2. If session email exists, check the database
      let alreadyInDb = false;
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/newsletter/subscribe?email=${encodeURIComponent(session.user.email)}`);
          if (response.ok) {
            const data = await response.json();
            if (data.subscribed) {
              localStorage.setItem('newsletter_subscribed', 'true');
              localStorage.setItem('newsletter_email', session.user.email);
              alreadyInDb = true;
            }
          }
        } catch (error) {
          console.error('Error checking session subscription:', error);
        }
      }

      if (alreadyInDb) return;

      // 3. If we have a saved email but local subscribed flag is false (edge case)
      if (savedEmail && !hasSubscribedLocal) {
        try {
          const response = await fetch(`/api/newsletter/subscribe?email=${encodeURIComponent(savedEmail)}`);
          if (response.ok) {
            const data = await response.json();
            if (data.subscribed) {
              localStorage.setItem('newsletter_subscribed', 'true');
              return;
            }
          }
        } catch (error) {
          console.error('Error checking saved email:', error);
        }
      }

      // Show after 45 seconds if user hasn't subscribed
      const timer = setTimeout(() => {
        setShow(true);
      }, 45000);

      return () => clearTimeout(timer);
    };

    checkSubscription();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          source: 'newsletter-popup',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save to localStorage to prevent showing popup again
        localStorage.setItem('newsletter_subscribed', 'true');
        localStorage.setItem('newsletter_email', email.trim());

        setSubmitted(true);
        setSubmitting(false);

        // Hide after 3 seconds
        setTimeout(() => {
          setShow(false);
        }, 3000);
      } else {
        // Handle error
        setSubmitting(false);
        alert(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      setSubmitting(false);
      alert('Failed to subscribe. Please try again later.');
    }
  };

  const handleDismiss = () => {
    setShow(false);
    // Remember dismissal for this session
    sessionStorage.setItem('newsletter_dismissed', 'true');
  };

  if (!show) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9999] flex justify-center px-4 pb-4 pointer-events-none transition-all duration-500 ${show ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
    >
      <div className="max-w-4xl w-full pointer-events-auto">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl border border-white/20 animate-in slide-in-from-bottom duration-500">
          {!submitted ? (
            <div className="relative p-4 sm:p-6">
              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                aria-label="Dismiss"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <EnvelopeIcon className="h-7 w-7 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                    🎉 Get Exclusive Tips & Updates!
                  </h3>
                  <p className="text-sm text-white/90 mb-0">
                    Weekly sales tips • Exclusive discounts • New features
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-shrink-0 w-full sm:w-auto">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="px-4 py-2.5 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all min-w-[200px] sm:min-w-[240px]"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-white text-purple-600 rounded-xl font-bold hover:bg-white/90 transition-all disabled:opacity-50 whitespace-nowrap shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    >
                      {submitting ? 'Subscribing...' : 'Subscribe'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Small text */}
              <p className="text-xs text-white/70 text-center sm:text-right mt-3 sm:mt-2">
                No spam, unsubscribe anytime
              </p>
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="inline-flex items-center gap-3">
                <div className="text-3xl">🎉</div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">Thank You!</h3>
                  <p className="text-sm text-white/90">
                    Check your email for exclusive content!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
