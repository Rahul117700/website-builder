import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CreditCardIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Razorpay Integration Guide - Sell Earn Direct | Payment Setup',
  description: 'Complete guide to integrate Razorpay payment gateway with Sell Earn Direct. Step-by-step instructions to accept payments.',
};

export default function RazorpayIntegrationPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <CreditCardIcon className="h-8 w-8" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Razorpay Integration
            </h1>
          </div>
          <p className="text-xl text-purple-100">
            Complete guide to set up Razorpay and start accepting payments from your customers.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Important Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-lg">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">Important: Payment Gateway Required</h3>
              <p className="text-yellow-800">
                You <strong>must</strong> configure your payment gateway before you can publish any funnel. This is required to accept payments from customers.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Step-by-Step Setup</h2>
          
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <h3 className="text-xl font-bold text-gray-900">Create a Razorpay Account</h3>
              </div>
              <p className="text-gray-700 ml-11 mb-4">
                If you don't have a Razorpay account yet, you'll need to create one:
              </p>
              <ol className="ml-11 space-y-2 mb-4 list-decimal list-inside text-gray-700">
                <li>Visit <a href="https://dashboard.razorpay.com/signup" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">https://dashboard.razorpay.com/signup</a></li>
                <li>Sign up with your email and business details</li>
                <li>Complete KYC verification (required for live payments)</li>
                <li>For testing, you can use test mode without KYC</li>
              </ol>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <h3 className="text-xl font-bold text-gray-900">Get Your API Keys</h3>
              </div>
              <p className="text-gray-700 ml-11 mb-4">
                Once logged into your Razorpay dashboard:
              </p>
              <ol className="ml-11 space-y-2 mb-4 list-decimal list-inside text-gray-700">
                <li>Go to <strong>Settings</strong> → <strong>API Keys</strong></li>
                <li>Click <strong>"Generate Test Keys"</strong> for testing (or use live keys for production)</li>
                <li>Copy your <strong>Key ID</strong> (starts with <code className="bg-gray-100 px-1 rounded">rzp_test_</code> or <code className="bg-gray-100 px-1 rounded">rzp_live_</code>)</li>
                <li>Copy your <strong>Key Secret</strong> (the longer string - keep this secure!)</li>
              </ol>
              <div className="ml-11 bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> Test keys allow you to test payments without real money. For live payments, you'll need to complete KYC and use live keys.
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <h3 className="text-xl font-bold text-gray-900">Add Keys to Your Dashboard</h3>
              </div>
              <p className="text-gray-700 ml-11 mb-4">
                Now add your Razorpay credentials to Sell Earn Direct:
              </p>
              <ol className="ml-11 space-y-2 mb-4 list-decimal list-inside text-gray-700">
                <li>Go to your <Link href="/auth/dashboard/settings" className="text-purple-600 hover:underline">Dashboard Settings</Link></li>
                <li>Click on the <strong>"Payment Gateway"</strong> tab</li>
                <li>Paste your <strong>Key ID</strong> in the first field</li>
                <li>Paste your <strong>Key Secret</strong> in the second field</li>
                <li>Click <strong>"Save Configuration"</strong></li>
              </ol>
              <Link
                href="/auth/dashboard/settings"
                className="ml-11 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Go to Settings →
              </Link>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                <h3 className="text-xl font-bold text-gray-900">Verify Setup</h3>
              </div>
              <p className="text-gray-700 ml-11 mb-4">
                After saving, you should see a green checkmark indicating your payment gateway is configured. You can now publish your funnels!
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Razorpay?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Multiple Payment Methods</h4>
                <p className="text-gray-600 text-sm">Accept credit/debit cards, UPI, net banking, and wallets</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Instant Settlements</h4>
                <p className="text-gray-600 text-sm">Get paid quickly with fast settlement times</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Real-time Tracking</h4>
                <p className="text-gray-600 text-sm">Track all transactions in real-time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Secure & Compliant</h4>
                <p className="text-gray-600 text-sm">PCI DSS compliant and bank-grade security</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Do I need to pay to use Razorpay?</h4>
              <p className="text-gray-700">No, creating a Razorpay account is free. You only pay transaction fees (typically 2% + GST) when you receive payments.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I test payments before going live?</h4>
              <p className="text-gray-700">Yes! Use test keys to simulate payments without real money. This is perfect for testing your funnel before launch.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">How do I get paid?</h4>
              <p className="text-gray-700">Payments go directly to your Razorpay account, and then you can transfer them to your bank account. Razorpay handles all the payment processing.</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/auth/dashboard/settings"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Configure Payment Gateway Now →
          </Link>
          <Link
            href="/docs"
            className="px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-purple-200"
          >
            Back to Documentation
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

