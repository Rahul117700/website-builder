import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PaintBrushIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Customizing Your Funnel - Sell Earn Direct | Design & Content Guide',
  description: 'Learn how to customize your sales funnel with colors, fonts, content, and more. Complete customization guide.',
};

export default function CustomizingFunnelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <PaintBrushIcon className="h-8 w-8" />
            <h1 className="text-4xl md:text-5xl font-bold">Customizing Your Funnel</h1>
          </div>
          <p className="text-xl text-purple-100">
            Learn how to customize your funnel's design, content, and branding to match your style.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customization Tabs</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Design Tab</h3>
              <p className="text-gray-700 mb-4">
                Customize the visual appearance of your funnel:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Color Presets:</strong> Choose from Purple, Blue, Green, or Red themes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Font Selection:</strong> Pick from various font families to match your brand</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Preview Modes:</strong> See how your funnel looks on desktop and mobile</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Content Tab</h3>
              <p className="text-gray-700 mb-4">
                Edit the text and messaging on your funnel:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Headline:</strong> Your main selling point - make it compelling!</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Features:</strong> Add 4-5 key benefits or features of your product</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Call-to-Action:</strong> Customize your "Buy Now" button text</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Product Tab</h3>
              <p className="text-gray-700 mb-4">
                Add and configure your digital product:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Product Name:</strong> Enter a clear, descriptive name</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Description:</strong> Explain what's included in your product</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Price:</strong> Set your product price</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Upload:</strong> Upload your product file</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Seller Info Tab</h3>
              <p className="text-gray-700 mb-4">
                Build trust with your customers:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Name:</strong> Your name or business name</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Email:</strong> Contact email for customer support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Bio:</strong> Brief description about you or your business</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pro Tips</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700">Use the preview feature frequently to see how changes look before publishing</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700">Keep your headline clear and benefit-focused - visitors should understand the value immediately</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700">Test your funnel on mobile devices - most visitors will view it on their phones</p>
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/docs/adding-products" className="px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-purple-200">
            Next: Adding Products →
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

