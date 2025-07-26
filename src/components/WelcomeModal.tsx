'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@mui/material';
import { DialogTitle } from '@mui/material';
import { DialogContent } from '@mui/material';
import { DialogActions } from '@mui/material';
import { Button } from '@mui/material';
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
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Let's build something amazing together!
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              This quick tour will show you how to create your first website in just a few minutes.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Choose Your Building Method",
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-white text-sm font-bold">1</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Use Templates</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Start with professionally designed templates and customize them to match your brand.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-white text-sm font-bold">2</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Code from Scratch</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Use our powerful HTML/CSS/JS editor to build your website exactly how you want it.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-white text-sm font-bold">3</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">AI Assistant</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
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
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Collect User Data</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <svg className="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Contact Forms</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">Get messages from visitors</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Sign Up Forms</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">Collect user registrations</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <svg className="w-8 h-8 text-purple-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Login Forms</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">User authentication</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Track Your Success",
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Monitor Your Website</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">Analytics Dashboard</h5>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Track visitors, page views, and user behavior to optimize your website.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">Form Submissions</h5>
              <p className="text-sm text-gray-600 dark:text-gray-300">
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
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckIcon className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Ready to build your website!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You now have all the tools you need to create amazing websites. Start building today!
            </p>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Pro Tips:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 text-left">
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

  if (hasSeenWelcome) {
    return null;
  }

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: "rounded-2xl"
      }}
    >
      <DialogTitle className="flex items-center justify-between text-2xl font-bold text-gray-900 dark:text-white">
        {steps[currentStep].title}
        <button
          onClick={handleSkip}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </DialogTitle>
      
      <DialogContent className="px-6 py-4">
        {steps[currentStep].content}
      </DialogContent>
      
      <DialogActions className="px-6 py-4 flex justify-between">
        <div className="flex space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentStep 
                  ? 'bg-purple-600' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={handleSkip}
            variant="outlined"
            color="secondary"
          >
            Skip Tour
          </Button>
          
          <Button
            onClick={handleNext}
            variant="contained"
            color="primary"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
} 