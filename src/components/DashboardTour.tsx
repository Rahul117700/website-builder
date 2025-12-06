'use client';

import { useEffect, useState, useRef } from 'react';
import { TourProvider, useTour } from '@reactour/tour';

interface DashboardTourProps {
  run: boolean;
  onFinish: () => void;
}

// Helper function to check if we're on mobile
const isMobileView = () => {
  if (typeof window === 'undefined') return false;
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

// Module-level ref to track if onFinish has been called to prevent duplicates
const hasCalledOnFinishRef = { current: false };

const steps = [
  {
    selector: 'body',
    content: (
      <div className="space-y-2 p-1 max-h-[60vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-gray-900">👋 Welcome to SellEarnDirect!</h3>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-3">
          <p className="text-base font-bold text-green-800 mb-1">
            💰 Earn Lakhs to Crores - Turn Your Expertise Into Income!
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            Join thousands of entrepreneurs earning <strong className="text-green-700">₹15 Lakhs to ₹45 Lakhs+</strong> in just 6-12 months 
            by selling digital products. From courses to software, turn what you know into a profitable business!
          </p>
        </div>

        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
          <p className="text-sm font-bold text-blue-800 mb-1">💳 Direct Payments - Zero Middleman Fees!</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong className="text-blue-700">100% of your revenue goes directly to YOUR bank account!</strong> No platform fees, 
            no middleman charges. We only charge a small subscription plan fee. Once you're on a plan, you're ready to go and 
            keep every rupee your customers pay!
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
          <p className="text-xs text-purple-800">
            <strong>🎯 Our Mission:</strong> We started SellEarnDirect to help digital creators and entrepreneurs earn money directly 
            without losing profits to middlemen. Our platform gives you complete control over your sales funnels and payments.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
          <p className="text-xs text-gray-600">
            💡 <strong>Pro Tip:</strong> You can exit this tour anytime by clicking the X button or pressing ESC.
          </p>
        </div>
      </div>
    ),
  },
  {
    selector: '[data-tour="dashboard-sidebar"]',
    content: (
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900">🎨 Dashboard Navigation</h3>
        <p className="text-sm text-gray-700">
          This is your main navigation sidebar. From here you can access:
        </p>
        <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
          <li><strong>Dashboard</strong> - Your earnings overview (you're here!)</li>
          <li><strong>Funnels</strong> - Create and manage sales funnels</li>
          <li><strong>Analytics</strong> - Track performance and conversions</li>
          <li><strong>Plans</strong> - Manage your subscription</li>
          <li><strong>Settings</strong> - Configure payment gateway and preferences</li>
        </ul>
        <p className="text-xs text-gray-600 mt-2">
          <strong>Tip:</strong> Click the menu icon (☰) to open/close the sidebar on mobile.
        </p>
      </div>
    ),
    beforeScroll: () => {
      openMobileSidebar();
      return new Promise((resolve) => setTimeout(resolve, 400));
    },
    afterOpen: () => {
      openMobileSidebar();
    },
  },
  {
    selector: '[data-tour="dashboard-header"]',
    content: (
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900">🚀 Quick Actions</h3>
        <p className="text-sm text-gray-700">
          This is your dashboard header with quick access buttons:
        </p>
        <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
          <li><strong>+ Sell Product</strong> - Create a new funnel in just 2 minutes</li>
          <li><strong>View Analytics</strong> - See detailed performance metrics</li>
        </ul>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 mt-2">
          <p className="text-xs text-indigo-800">
            ⚡ <strong>Quick Start:</strong> Click "+ Sell Product" to create your first funnel and start earning!
          </p>
        </div>
      </div>
    ),
    beforeScroll: () => {
      closeMobileSidebar();
      return new Promise((resolve) => setTimeout(resolve, 300));
    },
  },
  {
    selector: '[data-tour="dashboard-stats"]',
    content: (
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900">📊 Your Earnings Dashboard</h3>
        <p className="text-sm text-gray-700">
          This is where you'll see your total earnings! Here you can track:
        </p>
        <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
          <li><strong>Total Earnings</strong> - All-time revenue from all your products</li>
          <li><strong>Live Viewers</strong> - Real-time count of people viewing your funnels</li>
          <li><strong>Revenue Growth</strong> - Track your income growth over time</li>
        </ul>
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
          <p className="text-xs text-green-800">
            <strong>💰 How You Earn:</strong> Every time a customer purchases through your funnel, 
            the money goes <strong>directly to your bank account</strong> via Razorpay. No waiting, no middleman fees!
          </p>
        </div>
      </div>
    ),
    beforeScroll: () => {
      closeMobileSidebar();
      return new Promise((resolve) => setTimeout(resolve, 300));
    },
  },
  {
    selector: '[data-tour="quick-actions"]',
    content: (
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900">⚡ Quick Actions Panel</h3>
        <p className="text-sm text-gray-700">
          Quick access to the most important features:
        </p>
        <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
          <li><strong>Create Funnel</strong> - Build a new sales page in minutes</li>
          <li><strong>View Analytics</strong> - See how your funnels are performing</li>
          <li><strong>Manage Products</strong> - Upload and organize your digital products</li>
        </ul>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-2">
          <p className="text-xs text-yellow-800">
            🎯 <strong>Pro Tip:</strong> Start by creating your first funnel - it takes less than 2 minutes!
          </p>
        </div>
      </div>
    ),
    beforeScroll: () => {
      closeMobileSidebar();
      return new Promise((resolve) => setTimeout(resolve, 300));
    },
  },
  {
    selector: '[data-tour="top-funnel"]',
    content: (
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900">🏆 Top Performing Funnel</h3>
        <p className="text-sm text-gray-700">
          See your best-performing funnel at a glance:
        </p>
        <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
          <li><strong>Funnel Name</strong> - Your top revenue generator</li>
          <li><strong>Performance Metrics</strong> - Visitors, conversions, revenue</li>
          <li><strong>Quick Actions</strong> - Edit, view, or manage the funnel</li>
        </ul>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 mt-2">
          <p className="text-xs text-purple-800">
            📈 <strong>Success Tip:</strong> Focus on optimizing your top funnel to maximize earnings!
          </p>
        </div>
      </div>
    ),
    beforeScroll: () => {
      closeMobileSidebar();
      return new Promise((resolve) => setTimeout(resolve, 300));
    },
  },
  {
    selector: '[data-tour="recent-activity"]',
    content: (
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900">📋 Recent Activity</h3>
        <p className="text-sm text-gray-700">
          Track all your recent activities and transactions:
        </p>
        <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
          <li><strong>Recent Sales</strong> - See who purchased what and when</li>
          <li><strong>Funnel Updates</strong> - Track changes to your funnels</li>
          <li><strong>Payment History</strong> - Monitor money coming into your account</li>
        </ul>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mt-2">
          <p className="text-xs text-blue-800">
            💳 <strong>Payment Info:</strong> All payments are processed instantly via Razorpay and go directly to your account!
          </p>
        </div>
      </div>
    ),
    beforeScroll: () => {
      closeMobileSidebar();
      return new Promise((resolve) => setTimeout(resolve, 300));
    },
  },
  {
    selector: 'body',
    content: (
      <div className="space-y-2 p-1 max-h-[60vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-gray-900">🎉 Tour Complete!</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Congratulations! You've now seen all the key features of your dashboard. 
          You understand how to navigate, track earnings, and manage your funnels.
        </p>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-800 font-semibold mb-2">
            🚀 Ready to Start Earning?
          </p>
          <ol className="text-xs text-green-700 space-y-1 ml-4 list-decimal">
            <li>Choose a subscription plan (if you haven't already)</li>
            <li>Click "+ Sell Product" to create your first funnel</li>
            <li>Add your digital product (course, software, etc.)</li>
            <li>Set up Razorpay for payments</li>
            <li>Start promoting and watch the money flow directly to your account!</li>
          </ol>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2">
          <p className="text-xs text-indigo-800">
            💡 <strong>Remember:</strong> 100% of your revenue goes to you - no middleman fees! 
            Once you're on a plan, you're ready to go!
          </p>
        </div>
      </div>
    ),
  },
];

function TourContent({ run, onFinish }: DashboardTourProps) {
  const { setIsOpen, setCurrentStep, isOpen } = useTour();
  const [wasOpen, setWasOpen] = useState(false);

  useEffect(() => {
    if (run) {
      // Wait for DOM to be fully ready
      const timer = setTimeout(() => {
        setIsOpen(true);
        setCurrentStep(0);
        setWasOpen(true);
        hasCalledOnFinishRef.current = false;
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
      setWasOpen(false);
      hasCalledOnFinishRef.current = false;
    }
  }, [run, setIsOpen, setCurrentStep]);

  // Handle tour close (when user clicks close button or ESC)
  useEffect(() => {
    if (wasOpen && !isOpen && run && !hasCalledOnFinishRef.current) {
      // Tour was open and is now closed, clean up
      hasCalledOnFinishRef.current = true;
      closeMobileSidebar();
      onFinish();
    }
    if (isOpen) {
      setWasOpen(true);
    }
  }, [isOpen, run, onFinish, wasOpen]);

  return null;
}

export default function DashboardTour({ run, onFinish }: DashboardTourProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <TourProvider
      steps={steps}
      styles={{
        popover: (base: any) => ({
          ...base,
          '--reactour-accent': '#4F46E5',
          borderRadius: '12px',
          padding: '20px',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          maxWidth: '450px',
          maxHeight: '80vh',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
        }),
        controls: (base: any) => ({
          ...base,
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #e5e7eb',
          flexShrink: 0,
          position: 'sticky',
          bottom: 0,
          background: '#FFFFFF',
          zIndex: 10,
        }),
        maskArea: (base: any) => ({
          ...base,
          rx: 8,
        }),
        badge: (base: any) => ({
          ...base,
          left: 'auto',
          right: '-0.8125em',
        }),
        close: (base: any) => ({
          ...base,
          right: '1em',
          top: '1em',
          color: '#6B7280',
        }),
      }}
      prevButton={({ currentStep, stepsLength, setCurrentStep }) => (
        <button
          onClick={() => {
            if (currentStep > 0) {
              setCurrentStep(currentStep - 1);
            }
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentStep === 0}
        >
          Back
        </button>
      )}
      nextButton={({ currentStep, stepsLength, setCurrentStep, setIsOpen }) => (
        <button
          onClick={() => {
            if (currentStep < stepsLength - 1) {
              setCurrentStep(currentStep + 1);
            } else {
              // Finish the tour
              hasCalledOnFinishRef.current = true;
              closeMobileSidebar();
              onFinish();
              setIsOpen(false);
            }
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          {currentStep === stepsLength - 1 ? 'Finish' : 'Next'}
        </button>
      )}
      onClickMask={({ setIsOpen }) => {
        // Allow closing by clicking outside
        setIsOpen(false);
        // onFinish will be called by the useEffect in TourContent
      }}
      disableInteraction={false}
      showNavigation={true}
      showBadge={true}
      showCloseButton={true}
      className="reactour-portal"
      padding={{ mask: 10, popover: [10, 10] }}
    >
      <TourContent run={run} onFinish={onFinish} />
    </TourProvider>
  );
}
