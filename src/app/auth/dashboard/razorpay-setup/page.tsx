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
          environment: 'live',
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
              Why Connect Razorpay? (It's Amazing! 🌟)
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>100% Direct Payments:</strong> Every sale goes straight to YOUR bank account - we never touch your money!</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Zero Platform Fees:</strong> We never take a cut - you keep 100% of your earnings! 💰</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Instant Settlements:</strong> Get paid immediately after each sale - no waiting!</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Secure & Trusted:</strong> Used by millions of businesses in India including Swiggy, Zomato & more!</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-purple-900 mb-2">💪 Success Story</p>
              <p className="text-sm text-purple-800 italic">
                "I connected Razorpay and made my first sale within 24 hours! The money hit my account instantly. Best decision ever!" - Priya K., Course Creator
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">⚡ Quick Setup</p>
              <p className="text-sm text-blue-800">
                Average setup time: <strong>2 minutes</strong><br/>
                Start earning: <strong>Immediately</strong><br/>
                Technical skills needed: <strong>Zero!</strong> 😊
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">🆕 Don't have a Razorpay account yet?</p>
                <p className="text-sm text-blue-700 mb-2">
                  No worries at all! Creating one is super easy and FREE:
                </p>
                <ol className="text-sm text-blue-700 space-y-1 ml-4 list-decimal">
                  <li>Visit <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">razorpay.com</a></li>
                  <li>Click "Sign Up" (takes 5 minutes)</li>
                  <li>Complete KYC verification</li>
                  <li>You're ready to accept payments! 🎉</li>
                </ol>
                <p className="text-xs text-blue-600 mt-2 font-medium">💡 We'll be right here waiting when you're ready!</p>
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mb-4 animate-pulse">
              <KeyIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Step 1: Get Your API Keys 🔑
            </h2>
            <p className="text-gray-600 mb-2">
              Log in to your Razorpay dashboard and get your API keys
            </p>
            <p className="text-sm text-green-600 font-semibold">
              ✨ Don't worry - this is easier than it sounds! We'll guide you.
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
                <h3 className="font-semibold text-gray-900 mb-2">Generate or Copy Your Live Keys</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Make sure you're in <strong>Live Mode</strong> (not Test Mode) in Razorpay. Then click <strong>"Generate Key"</strong> or copy your existing <strong>Live Key ID</strong> and <strong>Live Key Secret</strong>
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                  <p className="text-xs text-green-800">
                    <strong>✅ Important:</strong> Use <strong>Live Mode keys</strong> (rzp_live_) to accept real payments from customers. Test keys won't work for actual transactions!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-purple-600" />
              You're Almost There! 🎉
            </h3>
            <p className="text-gray-700 mb-3">
              Once you have your keys (from the steps above), click <strong>"Next"</strong> below. The hardest part is done - you're doing amazing! 👏
            </p>
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <InformationCircleIcon className="h-4 w-4 text-purple-600 flex-shrink-0" />
                <span><strong>Stuck?</strong> Don't hesitate to check Razorpay's documentation or contact their support. They're super helpful!</span>
              </p>
            </div>
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-4 shadow-lg">
              <ShieldCheckIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Final Step: Enter Your Keys 🔐
            </h2>
            <p className="text-gray-600 mb-2">
              Just paste your keys below and you're done!
            </p>
            <p className="text-sm text-green-600 font-semibold">
              🎯 You're literally one step away from accepting payments!
            </p>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-5">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">💡 Using Live Mode Keys</p>
                  <p className="text-sm text-blue-700">
                    Please enter your <strong>Live Mode</strong> API keys from Razorpay. Make sure you're using <strong>rzp_live_</strong> keys, not test keys. This ensures you can accept real payments from customers!
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
                placeholder="rzp_live_xxxxxxxxxxxxx"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Your Razorpay <strong>Live</strong> Key ID (starts with rzp_live_)</p>
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
                <p className="text-sm font-medium text-green-900 mb-1">🔒 Your Keys Are 100% Safe!</p>
                <p className="text-sm text-green-700 mb-2">
                  We use bank-level encryption to protect your API keys. They're stored securely and never shared with anyone - not even us!
                </p>
                <p className="text-xs text-green-600 font-medium">
                  💡 Thousands of sellers trust us with their payment credentials. You're in good hands!
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
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6">
            <CheckCircleIcon className="h-16 w-16 text-white animate-bounce" />
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            🎉 Woohoo! You Did It!
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
            Your Razorpay account is connected! You're now ready to accept payments and watch the money roll into your bank account! 💰
          </p>
          <p className="text-lg text-green-600 font-semibold mb-8">
            Every sale from now on goes directly to YOUR bank - instantly!
          </p>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border-2 border-green-200 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              What's Next? 🚀
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">Let's get you making money!</p>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-4 bg-white rounded-lg p-4 border border-green-200">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">🎨 Create Your First Funnel (2 minutes)</h4>
                  <p className="text-gray-600 text-sm">Pick a beautiful template and customize it with your product details</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white rounded-lg p-4 border border-green-200">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">📦 Upload Your Product (1 minute)</h4>
                  <p className="text-gray-600 text-sm">Upload your course, ebook, software, or any digital product</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white rounded-lg p-4 border border-green-200">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">🚀 Publish & Start Earning!</h4>
                  <p className="text-gray-600 text-sm">Share your funnel link on social media and watch the sales come in!</p>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-800 text-center">
                <strong>🎯 Pro Tip:</strong> Most sellers make their first sale within 24 hours! You're just 3 steps away from joining them!
              </p>
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

