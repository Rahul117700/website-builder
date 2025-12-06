'use client';

import { useEffect, useState } from 'react';
import Logo from '@/components/Logo';

interface LogoLoaderProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Logo-based loading component
 * Shows animated logo with engaging messages to retain users
 */
export default function LogoLoader({ 
  message, 
  fullScreen = false,
  size = 'lg'
}: LogoLoaderProps) {
  const [currentMessage, setCurrentMessage] = useState(0);
  
  const messages = [
    message || 'Loading amazing content...',
    'Almost there! 🚀',
    'Preparing something special...',
    'Just a moment... ⏳',
    'Setting things up for you... ✨',
  ];

  useEffect(() => {
    if (!message) {
      const interval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % messages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [message, messages.length]);

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          {/* Animated Logo */}
          <div className="mb-8 flex justify-center">
            <div className={`${sizeClasses[size]} relative`}>
              <div className="absolute inset-0 animate-ping opacity-20">
                <Logo variant="icon-only" size={size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg'} />
              </div>
              <div className="relative animate-pulse">
                <Logo variant="icon-only" size={size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg'} />
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {messages[currentMessage]}
            </h3>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>

          {/* Retention Message */}
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            💡 <strong>Pro Tip:</strong> While you wait, did you know you can create unlimited funnels with our premium plans?
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} relative mb-4`}>
        <div className="absolute inset-0 animate-ping opacity-20">
          <Logo variant="icon-only" size={size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg'} />
        </div>
        <div className="relative animate-pulse">
          <Logo variant="icon-only" size={size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg'} />
        </div>
      </div>
      <p className="text-gray-600 text-sm">{messages[currentMessage]}</p>
      <div className="flex items-center justify-center gap-2 mt-4">
        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}

