'use client';

import { useEffect, useState } from 'react';
import { TourProvider, useTour } from '@reactour/tour';

interface ProductTourProps {
  run: boolean;
  onFinish: () => void;
}

const steps = [
  {
    selector: 'body',
    content: (
      <div className="space-y-2 p-1 max-h-[60vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-gray-900">👋 Welcome to SellEarnDirect!</h3>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-3">
          <p className="text-base font-bold text-green-800 mb-1">
            💰 Earn Lakhs to Crores - Start Your Digital Business Today!
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            Join thousands of entrepreneurs who are earning <strong className="text-green-700">₹15 Lakhs to ₹45 Lakhs+</strong> in just 6-12 months 
            by selling digital products through our platform. From courses to software, turn your expertise into a profitable business!
          </p>
        </div>
        
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
          <p className="text-sm font-bold text-blue-800 mb-1">💳 Direct Payments - Zero Middleman Fees!</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong className="text-blue-700">100% of your revenue goes directly to YOUR bank account!</strong> No platform fees, 
            no middleman charges. We only charge a small subscription plan fee - once you're on a plan, you're ready to go and 
            keep every rupee your customers pay!
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-700 font-semibold">✨ Our Key Features:</p>
          <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
            <li>🚀 <strong>Easy Funnel Builder</strong> - Create high-converting sales pages in minutes</li>
            <li>🛒 <strong>Digital Product Delivery</strong> - Automatically deliver software, courses, videos, ebooks</li>
            <li>📊 <strong>Real-time Analytics</strong> - Track visitors, conversions, and revenue live</li>
            <li>💳 <strong>Razorpay Integration</strong> - Secure payment processing with instant payouts</li>
            <li>🌐 <strong>Custom Domains</strong> - Use your own domain for professional branding</li>
            <li>⚙️ <strong>Complete Dashboard</strong> - Manage everything from one place</li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-2">
          <p className="text-xs text-purple-800">
            <strong>🎯 Simple Process:</strong> Choose a plan → Create your funnel → Start selling → Money goes directly to your account!
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
    selector: '[data-tour="hero-title"]',
    content: (
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900">🎯 Our Mission</h3>
        <p className="text-sm text-gray-700">
          Our goal is simple: help you convert your website traffic into real revenue. 
          Whether you're selling software, courses, videos, or any digital product, 
          we make it easy to create high-converting sales funnels.
        </p>
      </div>
    ),
  },
  {
    selector: '[data-tour="create-funnel"]',
    content: (
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900">🚀 Create Your First Funnel</h3>
        <p className="text-sm text-gray-700">
          Click here to start creating your sales funnel. You can sell software, 
          courses, videos, ebooks, and more - all without any technical skills!
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
          <p className="text-xs text-green-800">
            ✨ No coding required - just fill in your product details!
          </p>
        </div>
      </div>
    ),
  },
  {
    selector: '[data-tour="hero-visual"]',
    content: (
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900">📊 Live Dashboard Preview</h3>
        <p className="text-sm text-gray-700">
          This carousel shows you exactly what your dashboard will look like. 
          You'll see your earnings, funnel performance, and analytics - all in real-time!
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-2">
          <p className="text-xs text-yellow-800">
            🔄 The slides automatically rotate to show different features!
          </p>
        </div>
      </div>
    ),
  },
  {
    selector: '[data-tour="features-title"]',
    content: (
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900">✨ Powerful Features</h3>
        <p className="text-sm text-gray-700">
          Everything you need in one platform:
        </p>
        <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
          <li>🚀 Easy funnel builder</li>
          <li>🛒 Secure digital product delivery</li>
          <li>💳 Payment processing</li>
          <li>📊 Analytics & insights</li>
          <li>🎨 Customizable templates</li>
          <li>📱 Mobile-friendly pages</li>
        </ul>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mt-2">
          <p className="text-xs text-orange-800">
            🎯 All features work together seamlessly for maximum conversions!
          </p>
        </div>
      </div>
    ),
  },
  {
    selector: 'footer',
    content: (
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900">🔗 Important Links</h3>
        <p className="text-sm text-gray-700">
          The footer contains important links and information:
        </p>
        <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
          <li><strong>Platform</strong> - Features, Templates, Marketplace</li>
          <li><strong>Support</strong> - Community, Contact</li>
          <li><strong>Legal</strong> - About, Terms, Privacy</li>
        </ul>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 mt-2">
          <p className="text-xs text-gray-700">
            📞 Need help? Check out our community or contact support!
          </p>
        </div>
      </div>
    ),
  },
  {
    selector: 'body',
    content: (
      <div className="space-y-2 p-1 max-h-[60vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-gray-900">🎉 Tour Complete!</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Congratulations! You've now seen all the major features of our platform. 
          You know how to navigate, create funnels, and access support.
        </p>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-3">
          <p className="text-xs text-indigo-900 font-semibold">
            🚀 Ready to start? Click "Start Selling Now" to begin!
          </p>
        </div>
        <div className="text-xs text-gray-500">
          💡 Remember: You can restart this tour anytime or access help through the footer links
        </div>
      </div>
    ),
  },
];

function TourContent({ run, onFinish }: ProductTourProps) {
  const { setIsOpen, setCurrentStep, currentStep } = useTour();

  useEffect(() => {
    if (run) {
      // Wait for DOM to be fully ready
      const timer = setTimeout(() => {
        setIsOpen(true);
        setCurrentStep(0);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
    }
  }, [run, setIsOpen, setCurrentStep]);

  // Handle step changes and ensure elements exist
  useEffect(() => {
    if (!run || typeof window === 'undefined') return;

    const checkAndScroll = () => {
      const step = steps[currentStep];
      if (!step) return;

      const selector = step.selector;
      
      // If selector is 'body', it's always available
      if (selector === 'body') {
        return;
      }

      // Check if element exists
      const element = document.querySelector(selector);
      if (!element) {
        console.warn(`Tour step ${currentStep}: Element not found for selector "${selector}"`);
        // Wait a bit and retry
        setTimeout(checkAndScroll, 200);
      }
    };

    // Small delay to let DOM update
    const timer = setTimeout(checkAndScroll, 100);
    return () => clearTimeout(timer);
  }, [currentStep, run]);

  return null;
}

export default function ProductTour({ run, onFinish }: ProductTourProps) {
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
        popoverContent: (base: any) => ({
          ...base,
          maxHeight: '60vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          flex: '1 1 auto',
          marginBottom: '0',
          paddingBottom: '0',
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
      } as any}
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
              setIsOpen(false);
              onFinish();
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
        onFinish();
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
