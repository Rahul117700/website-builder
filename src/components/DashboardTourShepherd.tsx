'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

interface DashboardTourProps {
  run: boolean;
  onFinish: () => void;
}

export default function DashboardTourShepherd({ run, onFinish }: DashboardTourProps) {
  const tourRef = useRef<InstanceType<typeof Shepherd.Tour> | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Helper function to check if we're on mobile
  const isMobileView = () => {
    return window.innerWidth < 1024; // lg breakpoint
  };

  // Helper function to open mobile sidebar
  const openMobileSidebar = () => {
    if (isMobileView()) {
      const hamburgerButton = document.querySelector('button[aria-label="Open sidebar"]') as HTMLButtonElement;
      if (hamburgerButton && !document.querySelector('[data-tour="dashboard-sidebar"]')?.closest('.fixed')) {
        hamburgerButton.click();
      }
    }
  };

  // Helper function to close mobile sidebar
  const closeMobileSidebar = () => {
    if (isMobileView()) {
      const closeButton = document.querySelector('button[aria-label="Close sidebar"]') as HTMLButtonElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  };

  useEffect(() => {
    if (!run) return;
    
    // Cleanup any existing tour first
    if (tourRef.current) {
      tourRef.current.complete();
      tourRef.current = null;
    }

    // Ensure we're on the dashboard page
    if (pathname !== '/auth/dashboard') {
      router.push('/auth/dashboard');
      // Wait a bit for navigation
      setTimeout(() => {
        startTour();
      }, 800);
      return;
    }

    // Wait a bit for elements to render
    setTimeout(() => {
      startTour();
    }, 500);

    function startTour() {
      // Prevent multiple tours from running
      if (tourRef.current) {
        return;
      }
      
      // Create tour instance with professional settings
      const tour = new Shepherd.Tour({
        useModalOverlay: true,
        ...({
          modalOverlayOpeningPadding: 8,
          modalOverlayOpeningRadius: 8,
        } as any),
        exitOnEsc: true,
        keyboardNavigation: true,
        defaultStepOptions: {
          classes: 'shepherd-theme-custom',
          scrollTo: { behavior: 'smooth', block: 'center' },
          cancelIcon: {
            enabled: true
          },
          modalOverlayOpeningPadding: 8,
          modalOverlayOpeningRadius: 8,
          ...({
            popperOptions: {
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, 12]
                  }
                }
              ]
            }
          } as any),
          when: {
            show() {
              // Remove any stale tour elements first
              const oldElements = document.querySelectorAll('.shepherd-element');
              oldElements.forEach((el) => {
                if (el !== tour.getCurrentStep()?.el) {
                  el.remove();
                }
              });
              
              // Scroll to element when showing
              const element = tour.getCurrentStep()?.target;
              if (element && typeof element === 'string') {
                const el = document.querySelector(element) as HTMLElement | null;
                if (el && el.scrollIntoView) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }
            },
            hide() {
              // Clean up current step element
              const currentStep = tour.getCurrentStep();
              if (currentStep?.el) {
                currentStep.el.remove();
              }
            }
          }
        }
      });

    // Welcome Step
    tour.addStep({
      id: 'welcome',
      title: '👋 Welcome to SellEarnDirect!',
      text: `
        <div>
          <p class="text-gray-700 leading-relaxed mb-4">
            Let's take a comprehensive tour to show you all our amazing features including:
          </p>
          <ul class="text-sm text-gray-600 space-y-2">
            <li class="flex items-start gap-2">
              <span class="text-lg flex-shrink-0">🎯</span>
              <span>Subscription-based channel creation and management</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-lg flex-shrink-0">💳</span>
              <span>Direct payments - 85% to you, zero middleman fees</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-lg flex-shrink-0">📦</span>
              <span>Share unlimited content: videos, PDFs, courses, software, and more</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-lg flex-shrink-0">📊</span>
              <span>Real-time analytics and subscriber tracking</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-lg flex-shrink-0">⚙️</span>
              <span>Professional templates and easy customization</span>
            </li>
          </ul>
          <div class="bg-green-50 rounded-lg p-3 mt-4 border border-green-200">
            <p class="text-sm text-green-800 font-medium">
              💰 <strong>Earn Lakhs to Crores:</strong> Join thousands earning ₹15-45 Lakhs+ in 6-12 months!
            </p>
          </div>
          <p class="text-gray-700 text-sm mt-4 font-medium">
            ⏱️ This comprehensive tour will take about 4-5 minutes and show you everything!
          </p>
          <div class="bg-indigo-50 rounded-lg p-3 mt-4">
            <p class="text-sm text-indigo-800">
              💡 <strong>Pro Tip:</strong> You can exit this tour anytime by pressing ESC or clicking the ✕ button.
            </p>
          </div>
        </div>
      `,
      buttons: [
        {
          text: 'Skip Tour',
          action: tour.cancel,
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Start Tour 🚀',
          action: tour.next
        }
      ]
    });

      // Sidebar Step
      tour.addStep({
        id: 'sidebar',
        attachTo: {
          element: '[data-tour="dashboard-sidebar"]',
          on: 'right'
        },
        beforeShowPromise: function() {
          return new Promise<void>((resolve) => {
            // Open mobile sidebar first if on mobile
            openMobileSidebar();
            
            // Wait for sidebar to open
            setTimeout(() => {
              const element = document.querySelector('[data-tour="dashboard-sidebar"]');
              if (element) {
                resolve();
              } else {
                console.warn('Sidebar element not found');
                resolve();
              }
            }, 400);
          });
        },
        text: `
          <div class="space-y-2">
            <h3 class="text-lg font-bold text-gray-900">🎨 Dashboard Navigation</h3>
            <p class="text-gray-700">
              This is your main navigation sidebar. Access all your channels, analytics, and settings from here.
            </p>
            <p class="text-sm text-gray-600 mt-2">
              <strong>Tip:</strong> Click the menu icon (☰) to open/close the sidebar on mobile.
            </p>
          </div>
        `,
        buttons: [
          {
            text: 'Back',
            action: function() {
              closeMobileSidebar();
              setTimeout(() => {
                tour.back();
              }, 300);
            },
            classes: 'shepherd-button-secondary'
          },
          {
            text: 'Next →',
            action: function() {
              // Close mobile sidebar when going to next step
              closeMobileSidebar();
              setTimeout(() => {
                tour.next();
              }, 300);
            }
          }
        ]
      });

      // Dashboard Stats Step
      tour.addStep({
        id: 'stats',
        attachTo: {
          element: '[data-tour="dashboard-stats"]',
          on: 'bottom'
        },
        beforeShowPromise: function() {
          return new Promise<void>((resolve) => {
            const element = document.querySelector('[data-tour="dashboard-stats"]');
            if (element) {
              resolve();
            } else {
              console.warn('Stats element not found');
              setTimeout(resolve, 100);
            }
          });
        },
        text: `
          <div class="space-y-2">
            <h3 class="text-lg font-bold text-gray-900">📊 Your Earnings Dashboard</h3>
            <p class="text-gray-700">
              Track your total earnings, visitors, and channel performance in real-time. 
              Watch your revenue grow as subscribers join your channels!
            </p>
          </div>
        `,
        buttons: [
          {
            text: 'Back',
            action: tour.back,
            classes: 'shepherd-button-secondary'
          },
          {
            text: 'Next →',
            action: tour.next
          }
        ]
      });

      // Channels Page - Auto Navigate
      tour.addStep({
        id: 'channels-page',
        beforeShowPromise: function() {
          return new Promise<void>((resolve) => {
            // Auto-navigate to channels page
            router.push('/auth/dashboard/channels');
            setTimeout(() => {
              resolve();
            }, 1000);
          });
        },
        text: `
          <div class="space-y-2">
            <h3 class="text-lg font-bold text-gray-900">🚀 My Channels</h3>
            <p class="text-gray-700">
              This is your Channels page! Here you can:
            </p>
            <ul class="text-sm text-gray-600 space-y-1 ml-4 list-disc">
              <li>Create new subscription-based channels</li>
              <li>View all your existing channels</li>
              <li>Track subscriber metrics and revenue</li>
              <li>Manage and customize each channel</li>
            </ul>
            <p class="text-sm text-indigo-600 mt-2">
              <strong>Tip:</strong> Click "Create Channel" to start your 5-step journey!
            </p>
            <div class="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
              <p class="text-sm text-green-800">
                <strong>💰 Remember:</strong> Create Channel → Add Product → Customize → Publish → Get Sales!
              </p>
            </div>
          </div>
        `,
        buttons: [
          {
            text: 'Back',
            action: function() {
              router.push('/auth/dashboard');
              setTimeout(() => {
                tour.back();
              }, 500);
            },
            classes: 'shepherd-button-secondary'
          },
          {
            text: 'Next →',
            action: tour.next
          }
        ]
      });

      // Analytics Page - Auto Navigate
      tour.addStep({
        id: 'analytics-page',
        beforeShowPromise: function() {
          return new Promise<void>((resolve) => {
            // Auto-navigate to analytics page
            router.push('/auth/dashboard/analytics');
            setTimeout(() => {
              resolve();
            }, 1000);
          });
        },
        text: `
          <div class="space-y-2">
            <h3 class="text-lg font-bold text-gray-900">📈 Analytics Dashboard</h3>
            <p class="text-gray-700">
              Welcome to your Analytics hub! Here you can:
            </p>
            <ul class="text-sm text-gray-600 space-y-1 ml-4 list-disc">
              <li>Track visitor behavior and traffic sources</li>
              <li>Monitor conversion rates in real-time</li>
              <li>View revenue analytics and trends</li>
              <li>See device and location breakdowns</li>
              <li>Analyze channel performance over time</li>
            </ul>
            <p class="text-sm text-indigo-600 mt-2">
              <strong>Tip:</strong> Use the date range selector to view different time periods!
            </p>
          </div>
        `,
        buttons: [
          {
            text: 'Back',
            action: function() {
              router.push('/auth/dashboard/channels');
              setTimeout(() => {
                tour.back();
              }, 500);
            },
            classes: 'shepherd-button-secondary'
          },
          {
            text: 'Next →',
            action: tour.next
          }
        ]
      });

      // Subscription Plans Page - Auto Navigate
      tour.addStep({
        id: 'subscription-plans',
        beforeShowPromise: function() {
          return new Promise<void>((resolve) => {
            // Auto-navigate to subscription plans page
            router.push('/auth/dashboard/plans');
            setTimeout(() => {
              resolve();
            }, 1000);
          });
        },
        text: `
          <div class="space-y-2">
            <h3 class="text-lg font-bold text-gray-900">💳 Subscription Plans</h3>
            <p class="text-gray-700">
              Welcome to our subscription plans! Here you can:
            </p>
            <ul class="text-sm text-gray-600 space-y-1 ml-4 list-disc">
              <li>Choose the perfect plan for your business needs</li>
              <li>Upgrade or downgrade your subscription anytime</li>
              <li>View your current plan and usage limits</li>
              <li>See plan features and pricing details</li>
            </ul>
            <div class="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
              <p class="text-sm text-green-800">
                <strong>✅ Razorpay Integration:</strong> All payments are processed securely through Razorpay with instant activation!
              </p>
            </div>
          </div>
        `,
        buttons: [
          {
            text: 'Back',
            action: function() {
              router.push('/auth/dashboard/analytics');
              setTimeout(() => {
                tour.back();
              }, 500);
            },
            classes: 'shepherd-button-secondary'
          },
          {
            text: 'Next →',
            action: tour.next
          }
        ]
      });


      // My Channels Overview - Skip this step or update if page exists
      // Note: This step may need to be removed if my-channels page doesn't exist
      // Keeping it for now but updating references

      // Settings Page - Auto Navigate
      tour.addStep({
        id: 'settings-page',
        beforeShowPromise: function() {
          return new Promise<void>((resolve) => {
            // Auto-navigate to settings page
            router.push('/auth/dashboard/settings');
            setTimeout(() => {
              resolve();
            }, 1000);
          });
        },
        text: `
          <div class="space-y-2">
            <h3 class="text-lg font-bold text-gray-900">⚙️ Settings Hub</h3>
            <p class="text-gray-700">
              You're now in Settings! Here you can:
            </p>
            <ul class="text-sm text-gray-600 space-y-1 ml-4 list-disc">
              <li><strong>Profile:</strong> Update your personal information</li>
              <li><strong>Payment Gateway:</strong> Configure Razorpay for payments</li>
              <li><strong>Notifications:</strong> Manage your alerts and preferences</li>
              <li><strong>Platform Settings:</strong> Customize your experience</li>
            </ul>
            <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mt-3">
              <p class="text-sm text-indigo-800">
                <strong>💡 Important:</strong> Make sure to link your bank account to start receiving payments from your channels! You'll get 85% of all subscription payments directly.
              </p>
            </div>
          </div>
        `,
        buttons: [
          {
            text: 'Back',
            action: function() {
              router.push('/auth/dashboard/channels');
              setTimeout(() => {
                tour.back();
              }, 500);
            },
            classes: 'shepherd-button-secondary'
          },
          {
            text: 'Finish Tour ✓',
            action: function() {
              router.push('/auth/dashboard');
              setTimeout(() => {
                tour.complete();
              }, 500);
            }
          }
        ]
      });

      // Event handlers
      tour.on('complete', () => {
        closeMobileSidebar();
        tourRef.current = null;
        onFinish();
      });
      tour.on('cancel', () => {
        closeMobileSidebar();
        tourRef.current = null;
        onFinish();
      });

      // Start the tour
      tour.start();

      tourRef.current = tour;
    }

    return () => {
      if (tourRef.current) {
        try {
          tourRef.current.complete();
          tourRef.current = null;
        } catch (e) {
          // Tour already completed
        }
      }
    };
  }, [run, onFinish, pathname, router]);

  return null;
}
