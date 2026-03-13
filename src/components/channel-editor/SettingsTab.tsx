'use client';

import { LinkIcon, GlobeAltIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface SettingsTabProps {
  channel: any;
  onUpdate: (updates: Partial<any>) => void;
}

export default function SettingsTab({ channel, onUpdate }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* Channel Slug */}
      <div>
        <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">
          Channel URL
        </label>
        <div className="flex items-start gap-2">
          <LinkIcon className="h-5 w-5 text-gray-400 mt-2" />
          <div className="flex-1">
            <div className="flex items-center">
              <span className="px-3 py-2 bg-white/10 text-gray-400 text-sm border border-r-0 border-white/10 rounded-l-lg">
                /channel/
              </span>
              <input
                type="text"
                value={channel.slug || ''}
                readOnly
                className="flex-1 px-3 py-2 border border-white/10 rounded-r-lg bg-white/5 text-sm text-gray-300"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Your channel URL is automatically generated from your channel name
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">
          Channel Status
        </label>
        <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-lg">
          <div className={`w-2 h-2 rounded-full ${channel.published ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm font-medium text-white">
            {channel.published ? 'Published' : 'Draft'}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {channel.published
            ? 'Your channel is live and visible to everyone'
            : 'Your channel is in draft mode and not yet published'}
        </p>
      </div>

      {/* SEO Section */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <GlobeAltIcon className="h-4 w-4" />
          SEO Settings
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">
              Meta Title
            </label>
            <input
              type="text"
              value={channel.customizations?.seo?.metaTitle || channel.name || ''}
              onChange={(e) => onUpdate({
                customizations: {
                  ...channel.customizations,
                  seo: {
                    ...channel.customizations?.seo,
                    metaTitle: e.target.value,
                  },
                },
              })}
              placeholder="Your channel title for search engines"
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white/5 text-sm text-white placeholder-gray-600"
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">
              {(channel.customizations?.seo?.metaTitle || channel.name || '').length}/60 characters
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">
              Meta Description
            </label>
            <textarea
              value={channel.customizations?.seo?.metaDescription || channel.description || ''}
              onChange={(e) => onUpdate({
                customizations: {
                  ...channel.customizations,
                  seo: {
                    ...channel.customizations?.seo,
                    metaDescription: e.target.value,
                  },
                },
              })}
              placeholder="Brief description for search engines"
              rows={3}
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white/5 text-sm resize-none text-white placeholder-gray-600"
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">
              {(channel.customizations?.seo?.metaDescription || channel.description || '').length}/160 characters
            </p>
          </div>
        </div>
      </div>

      {/* Marketing & Analytics Section */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <ChartBarIcon className="h-4 w-4 text-indigo-400" />
          Marketing Tracking
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">
              Meta Pixel ID
            </label>
            <input
              type="text"
              value={channel.customizations?.marketing?.metaPixelId || ''}
              onChange={(e) => onUpdate({
                customizations: {
                  ...channel.customizations,
                  marketing: {
                    ...(channel.customizations?.marketing || {}),
                    metaPixelId: e.target.value,
                  },
                },
              })}
              placeholder="e.g., 1234567890"
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white/5 text-sm text-white placeholder-gray-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">
              Google Analytics ID
            </label>
            <input
              type="text"
              value={channel.customizations?.marketing?.googleAnalyticsId || ''}
              onChange={(e) => onUpdate({
                customizations: {
                  ...channel.customizations,
                  marketing: {
                    ...(channel.customizations?.marketing || {}),
                    googleAnalyticsId: e.target.value,
                  },
                },
              })}
              placeholder="e.g., G-XXXXXXXXXX"
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white/5 text-sm text-white placeholder-gray-600"
            />
          </div>
          <p className="text-[10px] text-gray-400 italic bg-white/5 p-2 rounded-lg border border-white/10">
            Note: These IDs will be automatically integrated into your channel and used to attribute conversions to your ad campaigns.
          </p>
        </div>
      </div>

      {/* Tip */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
        <p className="text-xs font-medium text-indigo-300 mb-1">🔍 SEO Tip</p>
        <p className="text-xs text-indigo-400">
          Good meta titles and descriptions help your channel rank better in search engines and get more clicks!
        </p>
      </div>
    </div>
  );
}

