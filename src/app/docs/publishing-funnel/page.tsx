import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RocketLaunchIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Publishing Your Funnel - Sell Earn Direct | Go Live Guide',
  description: 'Learn how to publish your sales funnel and make it live. Complete publishing guide with checklist.',
};

export default function PublishingFunnelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <RocketLaunchIcon className="h-8 w-8" />
            <h1 className="text-4xl md:text-5xl font-bold">Publishing Your Funnel</h1>
          </div>
          <p className="text-xl text-purple-100">
            Complete guide to publish your funnel and make it live for customers.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Pre-Publishing Checklist */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pre-Publishing Checklist</h2>
          <p className="text-gray-700 mb-6">Make sure you've completed these steps before publishing:</p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Payment Gateway Configured</p>
                <p className="text-gray-600 text-sm">You must set up Razorpay before publishing. <Link href="/docs/razorpay-integration" className="text-purple-600 hover:underline">Learn how →</Link></p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Product Added</p>
                <p className="text-gray-600 text-sm">Your product must be uploaded and configured. <Link href="/docs/adding-products" className="text-purple-600 hover:underline">Learn how →</Link></p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Content Customized</p>
                <p className="text-gray-600 text-sm">Headlines, features, and seller info should be filled in. <Link href="/docs/customizing-funnel" className="text-purple-600 hover:underline">Learn how →</Link></p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Previewed on Mobile</p>
                <p className="text-gray-600 text-sm">Check how your funnel looks on mobile devices using the preview feature.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Publishing Steps */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Publish</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <h3 className="text-xl font-bold text-gray-900">Save Your Funnel</h3>
              </div>
              <p className="text-gray-700 ml-11">
                Click the <strong>"Save"</strong> button in the top right corner to save all your changes.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <h3 className="text-xl font-bold text-gray-900">Preview Your Funnel</h3>
              </div>
              <p className="text-gray-700 ml-11 mb-4">
                Click <strong>"Preview"</strong> to see exactly how your funnel will look to customers. Check both desktop and mobile views.
              </p>
              <div className="ml-11 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Preview is a great way to catch any errors or issues before going live.
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <h3 className="text-xl font-bold text-gray-900">Click Publish</h3>
              </div>
              <p className="text-gray-700 ml-11 mb-4">
                Once you're satisfied with your funnel, click the <strong>"Publish"</strong> button. Your funnel will be live immediately!
              </p>
              <div className="ml-11 bg-green-50 border-l-4 border-green-400 p-4 rounded">
                <p className="text-sm text-green-800">
                  <strong>Success!</strong> After publishing, you'll receive a unique URL to share with your customers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* After Publishing */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">After Publishing</h2>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Get Your Funnel URL</h4>
              <p className="text-gray-700 text-sm mb-2">After publishing, you'll see your funnel's unique URL. Copy this link to share with your audience.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Share Your Funnel</h4>
              <p className="text-gray-700 text-sm mb-2">Share your funnel link on social media, email, your website, or anywhere you market your products.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Track Performance</h4>
              <p className="text-gray-700 text-sm mb-2">Monitor your funnel's performance in the Analytics dashboard. <Link href="/auth/dashboard/analytics" className="text-purple-600 hover:underline">View Analytics →</Link></p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Make Changes Anytime</h4>
              <p className="text-gray-700 text-sm">You can unpublish, edit, and republish your funnel anytime. Changes take effect immediately after republishing.</p>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-lg">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">Important Notes</h3>
              <ul className="text-yellow-800 text-sm space-y-1">
                <li>• Your funnel URL will remain the same even if you unpublish and republish</li>
                <li>• You cannot publish without a configured payment gateway</li>
                <li>• Make sure your product file is uploaded before publishing</li>
                <li>• Test your funnel with a small purchase before sharing widely</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/auth/dashboard/funnels" className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
            Go to My Funnels →
          </Link>
          <Link href="/docs" className="px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-purple-200">
            Back to Documentation
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

