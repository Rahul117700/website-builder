'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import {
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SparklesIcon,
  BanknotesIcon,
  KeyIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  XMarkIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

type Step = 1 | 2 | 3 | 4;

export default function RazorpaySetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [testMode, setTestMode] = useState(true);

  // Check if already configured
  useEffect(() => {
    checkExistingConfig();
  }, []);

  const checkExistingConfig = async () => {
    try {
      const response = await fetch('/api/razorpay-config');
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          // Already configured, redirect to settings
          router.push('/auth/dashboard/settings?tab=payment-gateway');
        }
      }
    } catch (error) {
      console.error('Error checking config:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSave = async () => {
    if (!keyId || !keySecret) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/razorpay-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId,
          keySecret,
          webhookSecret: webhookSecret || undefined,
          environment: testMode ? 'test' : 'live',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Razorpay connected successfully! 🎉');
        setTimeout(() => {
          setCurrentStep(4);
        }, 500);
      } else {
        toast.error(data.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      number: 1,
      title: 'Welcome to Razorpay Setup!',
      icon: SparklesIcon,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
              <BanknotesIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Get Paid Directly to Your Bank! 💰
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect your Razorpay account in just 2 minutes and start receiving payments directly to your bank account. No middleman, no delays!
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              Why Connect Razorpay?
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>100% Direct Payments:</strong> Every sale goes straight to YOUR bank account</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Zero Platform Fees:</strong> We never take a cut - you keep everything</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Instant Settlements:</strong> Get paid immediately after each sale</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Secure & Trusted:</strong> Used by millions of businesses in India</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Don't have a Razorpay account?</p>
                <p className="text-sm text-blue-700">
                  No problem! You can create one for free at{' '}
                  <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                    razorpay.com
                  </a>
                  {' '}in just 5 minutes. We'll wait! 😊
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: 2,
      title: 'Get Your API Keys',
      icon: KeyIcon,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mb-4">
              <KeyIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Step 1: Get Your API Keys 🔑
            </h2>
            <p className="text-gray-600">
              Log in to your Razorpay dashboard and get your API keys
            </p>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Go to Razorpay Dashboard</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Visit{' '}
                  <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline font-semibold">
                    dashboard.razorpay.com
                  </a>
                  {' '}and log in to your account
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Navigate to Settings → API Keys</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Click on <strong>Settings</strong> in the left sidebar, then select <strong>API Keys</strong>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Generate or Copy Your Keys</h3>
                <p className="text-sm text-gray-600 mb-3">
                  If you don't have keys yet, click <strong>"Generate Key"</strong>. Otherwise, copy your existing <strong>Key ID</strong> and <strong>Key Secret</strong>
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                  <p className="text-xs text-yellow-800">
                    <strong>💡 Tip:</strong> Start with <strong>Test Mode</strong> to try everything out safely. You can switch to Live Mode later!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-purple-600" />
              You're Doing Great! 🎉
            </h3>
            <p className="text-gray-700">
              Once you have your keys, click <strong>"Next"</strong> to enter them. Don't worry - we'll guide you through every step!
            </p>
          </div>
        </div>
      ),
    },
    {
      number: 3,
      title: 'Enter Your API Keys',
      icon: ShieldCheckIcon,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-4">
              <ShieldCheckIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Step 2: Enter Your Keys 🔐
            </h2>
            <p className="text-gray-600">
              Paste your Razorpay API keys below. Your data is encrypted and secure.
            </p>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <input
                  type="checkbox"
                  checked={testMode}
                  onChange={(e) => setTestMode(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span>Use Test Mode (Recommended for first-time setup)</span>
              </label>
              <p className="text-xs text-gray-500 ml-6">
                Test mode lets you try everything without real money. Switch to Live Mode when you're ready!
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
                placeholder="rzp_test_xxxxxxxxxxxxx"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Your Razorpay Key ID (starts with rzp_test_ or rzp_live_)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Secret <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={keySecret}
                onChange={(e) => setKeySecret(e.target.value)}
                placeholder="Enter your Key Secret"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Your Razorpay Key Secret (keep this secure!)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook Secret (Optional)
              </label>
              <input
                type="password"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder="Enter webhook secret (optional)"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">For advanced webhook verification (optional)</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ShieldCheckIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900 mb-1">Your Keys Are Safe 🔒</p>
                <p className="text-sm text-green-700">
                  All your API keys are encrypted and stored securely. We never share them with anyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: 4,
      title: 'Congratulations!',
      icon: RocketLaunchIcon,
      content: (
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 animate-bounce">
            <CheckCircleIcon className="h-12 w-12 text-white" />
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            🎉 You're All Set!
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Your Razorpay account is connected and ready to accept payments. Every sale will go directly to your bank account!
          </p>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border-2 border-green-200 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              What's Next? 🚀
            </h3>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Create Your First Funnel</h4>
                  <p className="text-gray-600 text-sm">Build a beautiful sales page for your digital product</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Upload Your Product</h4>
                  <p className="text-gray-600 text-sm">Add your course, ebook, software, or any digital product</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Publish & Share</h4>
                  <p className="text-gray-600 text-sm">Share your funnel link and start making sales!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <button
              onClick={() => router.push('/auth/dashboard/funnels')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RocketLaunchIcon className="h-6 w-6" />
              Create Your First Funnel
            </button>
            <button
              onClick={() => router.push('/auth/dashboard')}
              className="inline-flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep - 1];
  const progress = ((currentStep - 1) / 3) * 100;

  return (
    <DashboardLayout>
      <div className="w-full min-h-screen p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Razorpay Setup</h1>
            <p className="text-gray-600 mt-1">Get paid directly to your bank account</p>
          </div>

          {/* Progress Bar */}
          {currentStep < 4 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Step {currentStep} of 3
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-12 mb-6">
            {currentStepData.content}
          </div>

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Back
              </button>

              {currentStep === 3 ? (
                <button
                  onClick={handleSave}
                  disabled={loading || !keyId || !keySecret}
                  className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-white transition-all ${
                    loading || !keyId || !keySecret
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      Connect Razorpay
                      <ArrowRightIcon className="h-5 w-5" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  Next
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

