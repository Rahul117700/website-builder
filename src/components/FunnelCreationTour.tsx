'use client';

import { useEffect, useState } from 'react';
import { TourProvider, useTour } from '@reactour/tour';

interface FunnelCreationTourProps {
  run: boolean;
  onFinish: () => void;
}

function TourContent({ run, onFinish }: { run: boolean; onFinish: () => void }) {
  const { setIsOpen, setCurrentStep } = useTour();

  useEffect(() => {
    if (run) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setCurrentStep(0);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
    }
  }, [run, setIsOpen, setCurrentStep]);

  return null;
}

export default function FunnelCreationTour({ run, onFinish }: FunnelCreationTourProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Add global styles to ensure tour buttons are clickable
    const styleId = 'tour-button-fix';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        [data-tour-elem="controls"] {
          z-index: 10001 !important;
          pointer-events: auto !important;
        }
        [data-tour-elem="controls"] button {
          z-index: 10002 !important;
          position: relative !important;
          pointer-events: auto !important;
          cursor: pointer !important;
        }
        [data-tour-elem="popover"] {
          pointer-events: auto !important;
          z-index: 10000 !important;
        }
        [data-tour-elem="popover"] * {
          pointer-events: auto !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (!isClient) {
    return null;
  }

  const steps = [
    {
      selector: 'body',
      content: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
              <span className="text-3xl">🚀</span>
            </div>
            <h3 className="text-2xl font-bold text-black mb-2">Welcome to Funnel Builder!</h3>
            <p className="text-sm text-black/80">
              Let's create your first sales funnel together. This quick tour will show you everything you need to know.
          </p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <p className="text-sm font-semibold text-black mb-3">What you'll learn:</p>
            <div className="space-y-2.5">
              {[
                { icon: '🎨', text: 'Customize your funnel design' },
                { icon: '📝', text: 'Add compelling content' },
                { icon: '👤', text: 'Set up seller information' },
                { icon: '📦', text: 'Upload your product' },
                { icon: '🚀', text: 'Preview and publish' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm text-black">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-black flex items-start gap-2">
              <span className="text-base">💡</span>
              <span><strong>Tip:</strong> You can interact with the page while the tour is active. Take your time exploring!</span>
          </p>
          </div>
        </div>
      ),
    },
    {
      selector: '[data-tour="funnel-tabs"]',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <span className="text-xl">📑</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-black">Four Essential Tabs</h3>
              <p className="text-xs text-black/70">Navigate between sections easily</p>
            </div>
          </div>

          <p className="text-sm text-black">
            Your funnel customizer has four main sections, each with a specific purpose:
          </p>

          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '🎨', label: 'Design', desc: 'Colors, images & styling', color: 'purple' },
              { icon: '📝', label: 'Content', desc: 'Headlines & descriptions', color: 'blue' },
              { icon: '👤', label: 'Seller', desc: 'Your contact details', color: 'orange' },
              { icon: '📦', label: 'Product', desc: 'Details & file upload', color: 'green' },
            ].map((tab, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border-2 ${
                  tab.color === 'purple' ? 'bg-purple-50 border-purple-200' :
                  tab.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                  tab.color === 'orange' ? 'bg-orange-50 border-orange-200' :
                  'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-semibold text-sm text-black">{tab.label}</span>
            </div>
                <p className="text-xs text-black/70">{tab.desc}</p>
            </div>
            ))}
            </div>

          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-black">
              <strong>💡 Pro Tip:</strong> Click on any tab to switch between sections. Let's start with the Design tab!
            </p>
          </div>
        </div>
      ),
      beforeScroll: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
      },
    },
    {
      selector: '[data-tour="color-scheme"]',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-xl">🎨</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-black">Choose Your Color Scheme</h3>
              <p className="text-xs text-black/70">Match your brand identity</p>
            </div>
          </div>

          <p className="text-sm text-black">
            Select a color palette that matches your brand. The primary color is used for headers and buttons, while the secondary color creates beautiful gradients.
          </p>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
          <div className="space-y-2 text-sm text-black">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>Click on any preset to apply it instantly</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>See changes in the preview panel on the right</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>Choose colors that represent your brand</span>
              </div>
            </div>
          </div>
        </div>
      ),
      beforeScroll: async () => {
        const designTab = document.querySelector('[data-tour="funnel-tabs"] button:first-child') as HTMLElement;
        if (designTab && !designTab.classList.contains('bg-purple-100')) {
          designTab.click();
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      },
    },
    {
      selector: '[data-tour="cover-image"]',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-xl">📸</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-black">Upload Cover Image</h3>
              <p className="text-xs text-black/70">Make a great first impression</p>
            </div>
          </div>

          <p className="text-sm text-black">
            Add a high-quality image of your product. This will be the main visual element on your sales page.
          </p>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="space-y-2.5 text-sm text-black">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Click the upload area to select an image</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Supported formats: PNG, JPG, GIF</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Maximum file size: 5MB</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Use high-resolution images for best results</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-black">
              <strong>💡 Pro Tip:</strong> A great cover image can significantly increase conversions!
          </p>
          </div>
        </div>
      ),
    },
    {
      selector: '[data-tour="content-tab"]',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-black">Add Compelling Content</h3>
              <p className="text-xs text-black/70">Write what sells</p>
            </div>
          </div>

          <p className="text-sm text-black">
            Now let's add the text content for your funnel. This is what visitors will read first!
          </p>

          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <p className="text-sm font-semibold text-black mb-3">In the Content tab, you'll add:</p>
            <div className="space-y-2.5">
              {[
                { label: 'Headline', desc: 'Your main message (required)' },
                { label: 'Subheadline', desc: 'Supporting details' },
                { label: 'CTA Button Text', desc: 'Action button label' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600">•</span>
                  <div>
                    <span className="font-semibold text-sm text-black">{item.label}:</span>
                    <span className="text-sm text-black/70 ml-1">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
      beforeScroll: async () => {
        const contentTab = document.querySelector('[data-tour="funnel-tabs"] button:nth-child(2)') as HTMLElement;
        if (contentTab) {
          contentTab.click();
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      },
    },
    {
      selector: '[data-tour="headline-input"]',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <span className="text-xl">✍️</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-black">Write Your Headline</h3>
              <p className="text-xs text-black/70">First impressions matter</p>
            </div>
          </div>

          <p className="text-sm text-black">
            Your headline is the first thing visitors see. Make it powerful and clear!
          </p>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="space-y-2.5 text-sm text-black">
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Keep it concise and benefit-focused</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Maximum 100 characters</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>This is a required field</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>You'll see it update in the preview as you type</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-xs text-black">
              <strong>💡 Example:</strong> "Transform Your Business with Our Digital Solution"
          </p>
          </div>
        </div>
      ),
    },
    {
      selector: '[data-tour="seller-tab"]',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <span className="text-xl">👤</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-black">Add Seller Information</h3>
              <p className="text-xs text-black/70">Build trust with customers</p>
            </div>
          </div>

          <p className="text-sm text-black">
            Build trust with your customers by adding your seller information. This helps establish credibility.
          </p>

          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-sm font-semibold text-black mb-3">You can add:</p>
            <div className="space-y-2">
              {[
                'Your name and contact details',
                'Email and phone number',
                'Website URL',
                'A short bio about yourself',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-black">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
      beforeScroll: async () => {
        const sellerTab = document.querySelector('[data-tour="funnel-tabs"] button:nth-child(3)') as HTMLElement;
        if (sellerTab) {
          sellerTab.click();
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      },
    },
    {
      selector: '[data-tour="product-tab"]',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center">
              <span className="text-xl">📦</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-black">Set Up Your Product</h3>
              <p className="text-xs text-black/70">The most important step</p>
            </div>
          </div>

          <p className="text-sm text-black">
            This is the most important step! Add your product details and upload the file that customers will receive.
          </p>

          <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
            <p className="text-sm font-semibold text-black mb-3">You'll need to provide:</p>
            <div className="space-y-2.5">
              {[
                { label: 'Product Name', desc: 'What you\'re selling (required)' },
                { label: 'Description', desc: 'What it does' },
                { label: 'Price', desc: 'In Indian Rupees (required)' },
                { label: 'Product File', desc: 'The digital file to deliver (required for publishing)' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="font-bold text-teal-600">•</span>
                  <div>
                    <span className="font-semibold text-sm text-black">{item.label}:</span>
                    <span className="text-sm text-black/70 ml-1">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-black">
              <strong>⚠️ Important:</strong> You must upload a file before you can publish!
          </p>
          </div>
        </div>
      ),
      beforeScroll: async () => {
        const productTab = document.querySelector('[data-tour="funnel-tabs"] button:nth-child(4)') as HTMLElement;
        if (productTab) {
          productTab.click();
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      },
    },
    {
      selector: '[data-tour="product-file-upload"]',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <span className="text-xl">📎</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-black">Upload Product File</h3>
              <p className="text-xs text-black/70">Deliver value to customers</p>
            </div>
          </div>

          <p className="text-sm text-black">
            Upload the digital product file that customers will receive after purchase. This is required to publish your funnel.
          </p>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm font-semibold text-black mb-3">Supported file types:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-black">
              {['ZIP files', 'PDF documents', 'Images (JPG, PNG)', 'Videos (MP4, AVI, MOV)', 'Documents (DOC, PPT, TXT)'].map((type, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>{type}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200 space-y-1 text-xs text-black">
              <p>• Maximum file size: 100MB</p>
            <p>• The file will be securely stored and delivered to customers</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-black">
              <strong>⚠️ Critical:</strong> You cannot publish without uploading a product file!
          </p>
          </div>
        </div>
      ),
    },
    {
      selector: '[data-tour="preview-panel"]',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <span className="text-xl">👁️</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-black">Live Preview</h3>
              <p className="text-xs text-black/70">See changes in real-time</p>
            </div>
          </div>

          <p className="text-sm text-black">
            The preview panel shows you exactly how your funnel will look to customers. All changes update in real-time!
          </p>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="space-y-2.5 text-sm text-black">
              <div className="flex items-center gap-2">
                <span className="text-purple-600 font-bold">→</span>
                <span>See your changes instantly as you make them</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-600 font-bold">→</span>
                <span>Toggle between desktop, tablet, and mobile views</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-600 font-bold">→</span>
                <span>Use the eye icon in the header to show/hide the preview</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-600 font-bold">→</span>
                <span>Perfect for testing your design before publishing</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <p className="text-xs text-black">
              <strong>💡 Pro Tip:</strong> Keep the preview open while customizing to see your changes live!
          </p>
          </div>
        </div>
      ),
    },
    {
      selector: '[data-tour="save-button"]',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
              <span className="text-xl">💾</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-black">Save Your Work</h3>
              <p className="text-xs text-black/70">Don't lose your progress</p>
            </div>
          </div>

          <p className="text-sm text-black">
            Always save your changes regularly! The Save button stores all your customizations.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="space-y-2.5 text-sm text-black">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-bold">✓</span>
                <span>Click Save to store your progress</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-bold">✓</span>
                <span>Your changes are saved to the database</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-bold">✓</span>
                <span>You can come back and continue editing anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-bold">✓</span>
                <span>Save doesn't publish - it just stores your work</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-black">
              <strong>💡 Tip:</strong> Save frequently to avoid losing your work!
          </p>
          </div>
        </div>
      ),
    },
    {
      selector: '[data-tour="publish-button"]',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <span className="text-xl">🚀</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-black">Publish Your Funnel</h3>
              <p className="text-xs text-black/70">Go live and start selling</p>
            </div>
          </div>

          <p className="text-sm text-black">
            Once everything is set up, click Publish to make your funnel live! Customers will be able to visit and purchase.
          </p>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm font-semibold text-black mb-3">Before publishing, make sure you have:</p>
            <div className="space-y-2">
              {[
                'Added a headline',
                'Set a product name and price',
                'Uploaded a product file',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-black">
                  <span className="text-green-600 font-bold text-lg">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-green-200 space-y-1 text-xs text-black">
              <p>• Once published, your funnel gets a public URL</p>
            <p>• You can unpublish anytime to make changes</p>
            <p>• All payments go directly to your account - no platform fees!</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-black">
              <strong>🎉 Congratulations!</strong> You're ready to start earning! Once published, share your funnel URL and start selling.
          </p>
          </div>
        </div>
      ),
    },
    {
      selector: 'body',
      content: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-4">
              <span className="text-3xl">🎊</span>
            </div>
            <h3 className="text-2xl font-bold text-black mb-2">You're All Set!</h3>
            <p className="text-sm text-black/80">
            You've learned everything you need to create amazing sales funnels. Now it's time to customize your funnel!
          </p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
            <p className="text-sm font-semibold text-black mb-3">Quick checklist:</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-black">
              {[
                'Choose color scheme',
                'Add compelling headline',
                'Upload cover image',
                'Fill seller information',
                'Add product details',
                'Upload product file',
                'Save and publish',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-black">
              <strong>💡 Remember:</strong> You can always come back to edit your funnel. Start customizing now!
          </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <TourProvider
      steps={steps}
      styles={{
        popover: (base: any) => ({
          ...base,
          '--reactour-accent': '#8B5CF6',
          borderRadius: '16px',
          padding: '24px',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          maxWidth: '480px',
          maxHeight: '85vh',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          pointerEvents: 'auto',
          isolation: 'isolate',
        }),
        popoverContent: (base: any) => ({
          ...base,
          maxHeight: '70vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          flex: '1 1 auto',
          marginBottom: '0',
          paddingBottom: '0',
        }),
        maskArea: (base: any) => ({
          ...base,
          rx: 12,
        }),
        highlightedArea: (base: any) => ({
          ...base,
          zIndex: 9998,
        }),
        badge: (base: any) => ({
          ...base,
          left: 'auto',
          right: '-0.8125em',
          backgroundColor: '#8B5CF6',
          color: '#FFFFFF',
          fontWeight: 'bold',
          fontSize: '12px',
          padding: '4px 8px',
          borderRadius: '8px',
        }),
        controls: (base: any) => ({
          ...base,
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '2px solid #F3F4F6',
          flexShrink: 0,
          position: 'sticky',
          bottom: 0,
          background: '#FFFFFF',
          zIndex: 10000,
          pointerEvents: 'auto',
        }),
        close: (base: any) => ({
          ...base,
          right: '1em',
          top: '1em',
          color: '#6B7280',
          fontSize: '20px',
          fontWeight: 'bold',
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          backgroundColor: '#F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }),
      } as any}
      prevButton={({ currentStep, stepsLength, setCurrentStep }) => (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (currentStep > 0) {
              setCurrentStep(currentStep - 1);
            }
          }}
          style={{ zIndex: 10001, position: 'relative', pointerEvents: 'auto' }}
          className="px-5 py-2.5 bg-gray-100 text-black rounded-lg font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          disabled={currentStep === 0}
        >
          ← Back
        </button>
      )}
      nextButton={({ currentStep, stepsLength, setCurrentStep, setIsOpen }) => (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (currentStep < stepsLength - 1) {
              setCurrentStep(currentStep + 1);
            } else {
              setIsOpen(false);
              onFinish();
            }
          }}
          style={{ zIndex: 10001, position: 'relative', pointerEvents: 'auto', cursor: 'pointer' }}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
        >
          {currentStep === stepsLength - 1 ? '🎉 Finish' : 'Next →'}
        </button>
      )}
      onClickMask={({ setIsOpen }) => {
        setIsOpen(false);
        onFinish();
      }}
      disableInteraction={false}
      disableDotsNavigation={false}
      showNavigation={true}
      showBadge={true}
      showCloseButton={true}
      className="reactour-portal"
      padding={{ mask: 10, popover: [10, 10] }}
    >
      <TourContent run={run} onFinish={onFinish} />
    </TourProvider>
  );
}
