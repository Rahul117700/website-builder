import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CubeIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Adding Products - Sell Earn Direct | Product Upload Guide',
  description: 'Learn how to add and upload your digital products to your sales funnel. Complete product setup guide.',
};

export default function AddingProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <CubeIcon className="h-8 w-8" />
            <h1 className="text-4xl md:text-5xl font-bold">Adding Products</h1>
          </div>
          <p className="text-xl text-purple-100">
            Complete guide to add and configure your digital products in your sales funnel.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Setup Steps</h2>
          
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <h3 className="text-xl font-bold text-gray-900">Navigate to Product Tab</h3>
              </div>
              <p className="text-gray-700 ml-11">
                In your funnel customizer, click on the <strong>"Product"</strong> tab on the left sidebar.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <h3 className="text-xl font-bold text-gray-900">Enter Product Information</h3>
              </div>
              <div className="ml-11 space-y-3">
                <div>
                  <p className="text-gray-700 mb-2"><strong>Product Name:</strong></p>
                  <p className="text-gray-600 text-sm">Enter a clear, descriptive name that tells customers exactly what they're buying.</p>
                </div>
                <div>
                  <p className="text-gray-700 mb-2"><strong>Description:</strong></p>
                  <p className="text-gray-600 text-sm">Explain what's included in your product. Be specific about features, content, or benefits.</p>
                </div>
                <div>
                  <p className="text-gray-700 mb-2"><strong>Price:</strong></p>
                  <p className="text-gray-600 text-sm">Set your product price in INR. Consider your target audience and product value.</p>
                </div>
                <div>
                  <p className="text-gray-700 mb-2"><strong>Product Type:</strong></p>
                  <p className="text-gray-600 text-sm">Select the appropriate type: Software, Video, Document, Image, or Course.</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <h3 className="text-xl font-bold text-gray-900">Upload Your Product File</h3>
              </div>
              <div className="ml-11 space-y-3">
                <p className="text-gray-700">Click <strong>"Choose File"</strong> and select your product file from your computer.</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2"><strong>Supported File Types:</strong></p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Software: ZIP, EXE, DMG files</li>
                    <li>• Videos: MP4, MOV, AVI files</li>
                    <li>• Documents: PDF, DOC, DOCX files</li>
                    <li>• Images: JPG, PNG, GIF files</li>
                    <li>• Courses: ZIP files containing course materials</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                <h3 className="text-xl font-bold text-gray-900">Complete Upload</h3>
              </div>
              <p className="text-gray-700 ml-11 mb-4">
                Click <strong>"Upload Product"</strong> and wait for the upload to complete. You'll see a success message when it's done.
              </p>
              <div className="ml-11 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Large files may take a few minutes to upload. Don't close the page during upload.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-lg">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">File Size Limits</h3>
              <p className="text-yellow-800 text-sm">
                Make sure your file doesn't exceed the maximum size limit. If your file is too large, consider compressing it or splitting it into multiple parts.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700">Use descriptive product names that clearly communicate what the customer is buying</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700">Write detailed descriptions highlighting key features and benefits</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700">Test your product file before uploading to ensure it works correctly</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700">Keep file sizes reasonable for faster downloads and better customer experience</p>
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/docs/publishing-funnel" className="px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-purple-200">
            Next: Publishing Your Funnel →
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

