'use client';

import { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('hasSeenWelcome');
    if (seen) {
      setHasSeenWelcome(true);
    }
  }, []);

  const steps = [
    {
      title: "Welcome to Website Builder! 🎉",
      content: (
        <div className="text-center">
          <div className="mb-8">
            <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Let&#39;s build something amazing together!
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              This quick tour will show you how to create your first website in just a few minutes.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Choose Your Building Method",
      content: (
        <div className="space-y-6">
          <div className="flex items-start gap-6 p-6 bg-blue-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-white text-lg font-bold">1</span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Use Templates</h4>
              <p className="text-base text-gray-600 leading-relaxed">
                Start with professionally designed templates and customize them to match your brand.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-6 p-6 bg-green-50 rounded-xl">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-white text-lg font-bold">2</span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Code from Scratch</h4>
              <p className="text-base text-gray-600 leading-relaxed">
                Use our powerful HTML/CSS/JS editor to build your website exactly how you want it.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-6 p-6 bg-purple-50 rounded-xl">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-white text-lg font-bold">3</span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">AI Assistant</h4>
              <p className="text-base text-gray-600 leading-relaxed">
                Describe what you want and our AI will generate the code for you instantly.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Add Interactive Forms",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-900">Collect User Data</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <svg className="w-10 h-10 text-blue-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-base font-medium text-gray-900">Contact Forms</p>
              <p className="text-sm text-gray-600">Get messages from visitors</p>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <svg className="w-10 h-10 text-green-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <p className="text-base font-medium text-gray-900">Sign Up Forms</p>
              <p className="text-sm text-gray-600">Collect user registrations</p>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <svg className="w-10 h-10 text-purple-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <p className="text-base font-medium text-gray-900">Login Forms</p>
              <p className="text-sm text-gray-600">User authentication</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Track Your Success",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-900">Monitor Your Website</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 rounded-xl">
              <h5 className="text-lg font-medium text-gray-900 mb-3">Analytics Dashboard</h5>
              <p className="text-base text-gray-600 leading-relaxed">
                Track visitors, page views, and user behavior to optimize your website.
              </p>
            </div>
            
            <div className="p-6 bg-green-50 rounded-xl">
              <h5 className="text-lg font-medium text-gray-900 mb-3">Form Submissions</h5>
              <p className="text-base text-gray-600 leading-relaxed">
                View and manage all form submissions from your website visitors.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "You're All Set! 🚀",
      content: (
        <div className="text-center">
          <div className="mb-8">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckIcon className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Ready to build your website!
            </h3>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              You now have all the tools you need to create amazing websites. Start building today!
            </p>
            
            <div className="bg-purple-50 rounded-xl p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Pro Tips:</h4>
              <ul className="text-base text-gray-600 space-y-2 text-left">
                <li>• Use the AI assistant for quick code generation</li>
                <li>• Add forms to collect user data</li>
                <li>• Preview your site on different devices</li>
                <li>• Check analytics to optimize performance</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setHasSeenWelcome(true);
    onClose();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (hasSeenWelcome || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-100 bg-opacity-80 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {steps[currentStep].title}
            </h2>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 p-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-7 h-7" />
            </button>
          </div>
          
          <div className="mb-8">
            {steps[currentStep].content}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentStep 
                      ? 'bg-indigo-600 scale-110' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={handleSkip}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
              >
                Skip Tour
              </button>
              
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 