'use client';

import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import { gsap } from 'gsap';

interface Screenshot {
  image: string;
  title: string;
  description: string;
}

const screenshots: Screenshot[] = [
  {
    image: '/screenshots/Home page.png',
    title: 'Beautiful Home Page',
    description: 'Start your journey with our sleek and modern home page design'
  },
  {
    image: '/screenshots/your channel.png',
    title: 'Your Channel Dashboard',
    description: 'Manage all your channels from one central dashboard'
  },
  {
    image: '/screenshots/edit channel screen.png',
    title: 'Edit Your Channel',
    description: 'Customize your channel with easy-to-use editing tools'
  },
  {
    image: '/screenshots/new product.png',
    title: 'Create New Products',
    description: 'Add products quickly with our intuitive product creation interface'
  },
  {
    image: '/screenshots/created product list.png',
    title: 'Product Management',
    description: 'View and manage all your products in one place'
  },
  {
    image: '/screenshots/product.png',
    title: 'Product Details',
    description: 'Showcase your products with beautiful product pages'
  },
  {
    image: '/screenshots/subscribe modal.png',
    title: 'Subscription System',
    description: 'Let customers subscribe to your channel with ease'
  },
  {
    image: '/screenshots/live analytics.png',
    title: 'Live Analytics',
    description: 'Track your performance in real-time with live analytics'
  },
  {
    image: '/screenshots/channel analytics.png',
    title: 'Channel Analytics',
    description: 'Get detailed insights into your channel performance'
  },
  {
    image: '/screenshots/basic settings.png',
    title: 'Basic Settings',
    description: 'Configure your channel settings quickly and easily'
  },
  {
    image: '/screenshots/Theme setting.png',
    title: 'Theme Customization',
    description: 'Customize your channel theme to match your brand'
  },
  {
    image: '/screenshots/layout setting.png',
    title: 'Layout Settings',
    description: 'Choose from various layout options for your channel'
  },
  {
    image: '/screenshots/seo setting.png',
    title: 'SEO Settings',
    description: 'Optimize your channel for search engines'
  },
  {
    image: '/screenshots/subscription setting.png',
    title: 'Subscription Settings',
    description: 'Configure subscription plans and pricing'
  }
];

interface ScreenshotShowcaseProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScreenshotShowcase({ isOpen, onClose }: ScreenshotShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); // Auto-start playing
  const [isTransitioning, setIsTransitioning] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Auto-start playing when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      setCurrentIndex(0);
    } else {
      setIsPlaying(false);
    }
  }, [isOpen]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && isOpen) {
      // Reset and animate progress bar
      const resetProgress = () => {
        if (progressRef.current) {
          progressRef.current.style.transition = 'none';
          progressRef.current.style.width = '0%';
          // Force reflow
          void progressRef.current.offsetWidth;
          // Start animation
          setTimeout(() => {
            if (progressRef.current) {
              progressRef.current.style.transition = 'width 4s linear';
              progressRef.current.style.width = '100%';
            }
          }, 50);
        }
      };

      resetProgress();

      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % screenshots.length);
      }, 4000); // Change slide every 4 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isOpen]);

  // Reset progress bar when slide changes
  useEffect(() => {
    if (isPlaying && isOpen && progressRef.current) {
      progressRef.current.style.transition = 'none';
      progressRef.current.style.width = '0%';
      void progressRef.current.offsetWidth;
      setTimeout(() => {
        if (progressRef.current) {
          progressRef.current.style.transition = 'width 4s linear';
          progressRef.current.style.width = '100%';
        }
      }, 50);
    }
  }, [currentIndex, isPlaying, isOpen]);

  // Animation on slide change
  useEffect(() => {
    if (!isOpen) return;

    setIsTransitioning(true);
    
    // Fade out current content
    gsap.to(imageRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        // Fade in new content
        gsap.fromTo(imageRef.current,
          { opacity: 0, scale: 1.05 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => setIsTransitioning(false)
          }
        );
      }
    });

    // Animate content text
    if (contentRef.current) {
      gsap.fromTo(contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: 'power2.out' }
      );
    }
  }, [currentIndex, isOpen]);

  // Modal entrance animation
  useEffect(() => {
    if (isOpen && containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, [isOpen]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setCurrentIndex((prev) => (prev + 1) % screenshots.length);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setCurrentIndex(index);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (!isOpen) return null;

  const currentScreenshot = screenshots[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-sm overflow-hidden">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close"
      >
        <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* Main container */}
      <div
        ref={containerRef}
        className="relative w-full h-full max-w-7xl max-h-[95vh] mx-auto bg-gray-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Image container - takes most of the space */}
        <div className="relative flex-1 bg-gray-800 flex items-center justify-center overflow-hidden min-h-0">
          <img
            ref={imageRef}
            src={currentScreenshot.image}
            alt={currentScreenshot.title}
            className="max-w-full max-h-full w-auto h-auto object-contain"
            style={{ maxHeight: 'calc(95vh - 250px)' }}
            onError={(e) => {
              // Fallback if image doesn't load
              (e.target as HTMLImageElement).src = '/logo/logo.png';
            }}
          />

          {/* Navigation arrows */}
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm z-10"
            aria-label="Previous"
          >
            <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm z-10"
            aria-label="Next"
          >
            <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Progress bar */}
          {isPlaying && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-10">
              <div
                ref={progressRef}
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                style={{ 
                  width: '0%'
                }}
                key={`progress-${currentIndex}`}
              />
            </div>
          )}
        </div>

        {/* Content section - fixed height */}
        <div ref={contentRef} className="flex-shrink-0 p-4 sm:p-6 bg-gradient-to-b from-gray-900 to-gray-800 overflow-y-auto max-h-[250px]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2 truncate">
                {currentScreenshot.title}
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm md:text-base">
                {currentScreenshot.description}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={togglePlay}
                className="p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <PauseIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <PlayIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Thumbnail navigation */}
          <div className="mt-4 sm:mt-6 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {screenshots.map((screenshot, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`flex-shrink-0 relative group ${
                    index === currentIndex ? 'ring-2 ring-purple-500' : 'opacity-60 hover:opacity-100'
                  } transition-all`}
                >
                  <img
                    src={screenshot.image}
                    alt={screenshot.title}
                    className="w-16 h-10 sm:w-20 sm:h-12 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo/logo.png';
                    }}
                  />
                  {index === currentIndex && (
                    <div className="absolute inset-0 bg-purple-500/20 rounded-lg" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Slide counter */}
          <div className="mt-3 sm:mt-4 text-center text-gray-400 text-xs sm:text-sm">
            {currentIndex + 1} / {screenshots.length}
          </div>
        </div>
      </div>

      {/* Keyboard navigation */}
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') prevSlide();
          if (e.key === 'ArrowRight') nextSlide();
          if (e.key === 'Escape') onClose();
          if (e.key === ' ') {
            e.preventDefault();
            togglePlay();
          }
        }}
        className="absolute inset-0"
        aria-label="Keyboard navigation: Arrow keys to navigate, Space to play/pause, Escape to close"
      />
    </div>
  );
}

