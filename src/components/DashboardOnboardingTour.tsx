'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface Step {
  id: number;
  title: string;
  description: string;
  target?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    text: string;
    link?: string;
  };
}

const ONBOARDING_STEPS: Step[] = [
  {
    id: 1,
    title: '🎉 Welcome to Your Dashboard!',
    description: 'This is your command center where you can manage all your products, track sales, and grow your business.',
    position: 'center'
  },
  {
    id: 2,
    title: '📊 Track Your Performance',
    description: 'Here you can see your total earnings, visitors, and conversion rates at a glance.',
    target: 'dashboard-stats',
    position: 'bottom'
  },
  {
    id: 3,
    title: '🚀 Quick Actions',
    description: 'Start selling by creating your first product funnel. Choose from various product types!',
    target: 'quick-actions',
    position: 'top',
    action: {
      text: 'Create Your First Product',
      link: '/auth/dashboard/funnels'
    }
  },
  {
    id: 4,
    title: '🎯 Track Recent Activity',
    description: 'Monitor all your sales, funnel creations, and important activities in real-time.',
    target: 'recent-activity',
    position: 'top'
  }
];

export default function DashboardOnboardingTour() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    // Check if user has seen the tour before
    const tourSeen = localStorage.getItem('dashboardTourSeen');
    
    if (!tourSeen && session?.user) {
      // Show tour after a small delay
      const timer = setTimeout(() => {
        setShowTour(true);
        setHasSeenTour(false);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setHasSeenTour(true);
    }
  }, [session]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    completeTour();
  };

  const completeTour = () => {
    localStorage.setItem('dashboardTourSeen', 'true');
    setShowTour(false);
    setHasSeenTour(true);
  };

  const handleActionClick = () => {
    const action = ONBOARDING_STEPS[currentStep].action;
    if (action?.link) {
      completeTour();
      router.push(action.link);
    }
  };

  const getTooltipPosition = (step: Step) => {
    if (step.position === 'center' || !step.target) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const targetElement = document.querySelector(`[data-tour="${step.target}"]`);
    if (!targetElement) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const positions: { [key: string]: any } = {
      top: {
        top: `${rect.top - 20}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translate(-50%, -100%)'
      },
      bottom: {
        top: `${rect.bottom + 20}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translate(-50%, 0)'
      },
      left: {
        top: `${rect.top + rect.height / 2}px`,
        left: `${rect.left - 20}px`,
        transform: 'translate(-100%, -50%)'
      },
      right: {
        top: `${rect.top + rect.height / 2}px`,
        left: `${rect.right + 20}px`,
        transform: 'translate(0, -50%)'
      }
    };

    return positions[step.position] || positions.bottom;
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];

  if (!showTour || hasSeenTour) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {showTour && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              onClick={handleSkip}
            />

            {/* Highlight for targeted element */}
            {currentStepData.target && (
              <div
                className="fixed z-[9999] pointer-events-none"
                style={{
                  ...((() => {
                    const targetElement = document.querySelector(`[data-tour="${currentStepData.target}"]`);
                    if (!targetElement) return {};
                    const rect = targetElement.getBoundingClientRect();
                    return {
                      top: `${rect.top - 8}px`,
                      left: `${rect.left - 8}px`,
                      width: `${rect.width + 16}px`,
                      height: `${rect.height + 16}px`,
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                      borderRadius: '12px',
                      border: '3px solid #8b5cf6',
                    };
                  })())
                }}
              />
            )}

            {/* Tooltip */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="fixed z-[10000]"
              style={getTooltipPosition(currentStepData)}
            >
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-purple-500 max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">{currentStep + 1}</span>
                      </div>
                      <h3 className="text-lg font-bold">{currentStepData.title}</h3>
                    </div>
                    <button
                      onClick={handleSkip}
                      className="text-white/80 hover:text-white transition-colors"
                      aria-label="Close tour"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-700 text-base mb-6">
                    {currentStepData.description}
                  </p>

                  {/* Action Button */}
                  {currentStepData.action && (
                    <button
                      onClick={handleActionClick}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center space-x-2 mb-4 shadow-lg hover:shadow-xl"
                    >
                      <span>{currentStepData.action.text}</span>
                      <ArrowRightIcon className="h-5 w-5" />
                    </button>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {ONBOARDING_STEPS.map((_, index) => (
                        <div
                          key={index}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentStep
                              ? 'w-8 bg-gradient-to-r from-purple-600 to-pink-600'
                              : 'w-2 bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      {currentStep > 0 && (
                        <button
                          onClick={handlePrevious}
                          className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Previous
                        </button>
                      )}
                      <button
                        onClick={handleNext}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
                      >
                        <span>{currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}</span>
                        {currentStep === ONBOARDING_STEPS.length - 1 ? (
                          <CheckCircleIcon className="h-5 w-5" />
                        ) : (
                          <ArrowRightIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Skip Button */}
                  <button
                    onClick={handleSkip}
                    className="w-full text-center text-gray-500 hover:text-gray-700 text-sm mt-3 transition-colors"
                  >
                    Skip tour
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
