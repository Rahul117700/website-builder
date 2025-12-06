'use client';

import { useState } from 'react';
import {
  XMarkIcon,
  LinkIcon,
  ShareIcon,
  GlobeAltIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  LightBulbIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CameraIcon,
  HashtagIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface FunnelPublishedModalProps {
  isOpen: boolean;
  onClose: () => void;
  funnelData: {
    name: string;
    url: string;
    funnelId: string;
  };
}

export default function FunnelPublishedModal({ isOpen, onClose, funnelData }: FunnelPublishedModalProps) {
  const [activeTab, setActiveTab] = useState('links');
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=Check%20out%20this%20amazing%20product:%20${encodeURIComponent(funnelData.url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(funnelData.url)}&text=Check%20out%20this%20amazing%20product`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(funnelData.url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(funnelData.url)}&text=Check%20out%20this%20amazing%20product`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(funnelData.url)}`
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <CheckCircleIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">🎉 Funnel Published Successfully!</h2>
                <p className="text-green-100 text-sm">Your funnel is now live and ready to convert visitors</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 px-6">
            {[
              { id: 'links', name: 'Funnel Links', icon: LinkIcon },
              { id: 'instagram', name: 'Instagram', icon: CameraIcon },
              { id: 'facebook', name: 'Facebook', icon: ChatBubbleLeftRightIcon },
              { id: 'seo', name: 'SEO Tips', icon: MagnifyingGlassIcon },
              { id: 'general', name: 'Marketing Tips', icon: RocketLaunchIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'links' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <GlobeAltIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Your Funnel Links
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Live Funnel URL</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={funnelData.url}
                        readOnly
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(funnelData.url)}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                          copiedUrl
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {copiedUrl ? (
                          <>
                            <CheckCircleIcon className="h-4 w-4 mr-2 inline" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="h-4 w-4 mr-2 inline" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">📱 Mobile QR Code</h4>
                      <div className="bg-gray-100 rounded-lg p-4 text-center">
                        <div className="text-gray-500 text-sm">QR Code will be generated here</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">📊 Analytics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Views:</span>
                          <span className="font-medium">0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Conversions:</span>
                          <span className="font-medium">0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <ShareIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Quick Share Links
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(shareLinks).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors text-sm font-medium"
                    >
                      <span className="capitalize">{platform}</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'instagram' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <CameraIcon className="h-5 w-5 mr-2 text-pink-600" />
                  Instagram Marketing Strategy
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs font-bold mr-2">1</span>
                      Create Eye-Catching Posts
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Use high-quality images of your product in action
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Create before/after comparisons if applicable
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Use carousel posts to showcase multiple features
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs font-bold mr-2">2</span>
                      Optimize Your Captions
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Start with a hook: "Stop struggling with..."
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Tell a story about how your product helps
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        End with a clear call-to-action
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs font-bold mr-2">3</span>
                      Use Strategic Hashtags
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                      <p className="text-gray-600 mb-2">Mix of hashtag types:</p>
                      <div className="space-y-1">
                        <div><span className="font-medium">Popular:</span> #digitalmarketing #entrepreneur</div>
                        <div><span className="font-medium">Niche:</span> #salesfunnel #digitalproducts</div>
                        <div><span className="font-medium">Branded:</span> #YourBrandName</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs font-bold mr-2">4</span>
                      Stories & Reels Strategy
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Create behind-the-scenes content
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Use polls and questions to engage audience
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Share customer testimonials and results
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'facebook' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Facebook Marketing Strategy
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-bold mr-2">1</span>
                      Facebook Posts
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Post at optimal times (7-9 AM, 1-3 PM, 7-9 PM)
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Use engaging visuals and videos
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Ask questions to encourage comments
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-bold mr-2">2</span>
                      Facebook Ads
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Start with a small budget ($5-10/day)
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Target interests related to your product
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Use video ads for better engagement
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-bold mr-2">3</span>
                      Facebook Groups
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Join relevant groups in your niche
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Provide value before promoting
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Share helpful tips and insights
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-green-600" />
                  SEO Optimization Tips
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-bold mr-2">1</span>
                      On-Page SEO
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Use relevant keywords in your product title
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Write detailed product descriptions
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Add alt text to all images
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-bold mr-2">2</span>
                      Content Marketing
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Create blog posts about your product benefits
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Write how-to guides and tutorials
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Share customer success stories
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-bold mr-2">3</span>
                      Link Building
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Guest post on relevant blogs
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Reach out to influencers for mentions
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Submit to relevant directories
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <RocketLaunchIcon className="h-5 w-5 mr-2 text-purple-600" />
                  General Marketing Tips
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs font-bold mr-2">1</span>
                      Email Marketing
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Build an email list from your funnel
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Send regular newsletters with valuable content
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Use email automation for follow-ups
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs font-bold mr-2">2</span>
                      YouTube Marketing
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Create product demo videos
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Share tutorials and how-to content
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Add your funnel link in video descriptions
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs font-bold mr-2">3</span>
                      Influencer Outreach
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Find micro-influencers in your niche
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Offer free products for honest reviews
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Collaborate on content creation
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-600" />
                      Pro Tips
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <SparklesIcon className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        Track your marketing efforts with analytics
                      </li>
                      <li className="flex items-start">
                        <SparklesIcon className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        A/B test different marketing messages
                      </li>
                      <li className="flex items-start">
                        <SparklesIcon className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        Focus on providing value before selling
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Bookmark this modal for future reference
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.open(funnelData.url, '_blank')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Live Funnel
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
