import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BookOpenIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Creating Your First Funnel - Sell Earn Direct | Step-by-Step Guide',
  description: 'Learn how to create your first sales funnel with Sell Earn Direct. Complete step-by-step guide with screenshots and tips.',
};

export default function CreatingFirstFunnelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpenIcon className="h-8 w-8" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Creating Your First Funnel
            </h1>
          </div>
          <p className="text-xl text-purple-100">
            Step-by-step guide to create your first sales funnel and start selling your digital products.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Step-by-Step Instructions</h2>
          
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <h3 className="text-xl font-bold text-gray-900">Access the Funnel Builder</h3>
              </div>
              <p className="text-gray-700 ml-11 mb-4">
                Navigate to your dashboard and click on <strong>"My Funnels"</strong> in the sidebar, then click the <strong>"Create New Funnel"</strong> button.
              </p>
              <Link
                href="/auth/dashboard/funnels"
                className="ml-11 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Go to My Funnels
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <h3 className="text-xl font-bold text-gray-900">Choose a Template</h3>
              </div>
              <p className="text-gray-700 ml-11 mb-4">
                Select a template that matches your product type:
              </p>
              <ul className="ml-11 space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Software Funnel:</strong> Perfect for software, apps, and digital tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Video Sales Funnel:</strong> Ideal for video courses and tutorials</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Document Sales:</strong> Great for eBooks, PDFs, and documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Image Sales:</strong> For digital art, photos, and graphics</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <h3 className="text-xl font-bold text-gray-900">Name Your Funnel</h3>
              </div>
              <p className="text-gray-700 ml-11">
                Enter a descriptive name for your funnel. This helps you identify it later in your dashboard. For example: "My First Product Launch" or "Premium Course Sales Page".
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                <h3 className="text-xl font-bold text-gray-900">Start Customizing</h3>
              </div>
              <p className="text-gray-700 ml-11 mb-4">
                Once created, you'll be taken to the funnel customizer where you can:
              </p>
              <ul className="ml-11 space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Customize colors, fonts, and design</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Edit headlines and content</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Add your product</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Configure seller information</span>
                </li>
              </ul>
              <Link
                href="/docs/customizing-funnel"
                className="ml-11 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Learn About Customization →
              </Link>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pro Tips</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700">Start with a template that closely matches your product type for faster setup</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700">You can always change the template later, but it's easier to start with the right one</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700">Use descriptive names to easily identify funnels in your dashboard</p>
            </li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/docs/customizing-funnel"
            className="px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-purple-200"
          >
            Next: Customizing Your Funnel →
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

