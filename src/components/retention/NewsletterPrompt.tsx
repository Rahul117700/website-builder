'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, EnvelopeIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

/**
 * Newsletter Prompt
 * Encourages users to subscribe for exclusive content and offers
 */
export default function NewsletterPrompt() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Check if user has already subscribed (from localStorage or database)
    const checkSubscription = async () => {
      const hasSubscribed = localStorage.getItem('newsletter_subscribed');
      const savedEmail = localStorage.getItem('newsletter_email');
      
      // If we have a saved email, verify it's still subscribed
      if (savedEmail && hasSubscribed) {
        try {
          const response = await fetch(`/api/newsletter/subscribe?email=${encodeURIComponent(savedEmail)}`);
          const data = await response.json();
          
          if (data.subscribed) {
            // Still subscribed, don't show popup
            return;
          } else {
            // No longer subscribed, clear localStorage
            localStorage.removeItem('newsletter_subscribed');
            localStorage.removeItem('newsletter_email');
          }
        } catch (error) {
          console.error('Error checking subscription:', error);
        }
      }
      
      // Show after 45 seconds if user hasn't subscribed
      const timer = setTimeout(() => {
        if (!hasSubscribed) {
          setShow(true);
        }
      }, 45000);

      return () => clearTimeout(timer);
    };

    checkSubscription();
  }, []);

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

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-[fadeIn_0.3s_ease-in-out,zoomIn_0.3s_ease-in-out]">
        <button
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {!submitted ? (
          <>
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-3">
                <EnvelopeIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Get Exclusive Tips & Updates! 📧
              </h3>
              <p className="text-sm text-gray-600">
                Join our newsletter and get:
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li className="flex items-center justify-center gap-2">
                  <SparklesIcon className="h-4 w-4 text-purple-600" />
                  <span>Weekly sales tips</span>
                </li>
                <li className="flex items-center justify-center gap-2">
                  <SparklesIcon className="h-4 w-4 text-purple-600" />
                  <span>Exclusive discounts</span>
                </li>
                <li className="flex items-center justify-center gap-2">
                  <SparklesIcon className="h-4 w-4 text-purple-600" />
                  <span>New feature announcements</span>
                </li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
              >
                {submitting ? 'Subscribing...' : 'Subscribe Now'}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-3">
              No spam, unsubscribe anytime
            </p>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-sm text-gray-600">
              Check your email for exclusive content and offers!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

