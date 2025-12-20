import React from 'react';
import {
    DocumentTextIcon,
    SparklesIcon,
    ClockIcon,
    StarIcon,
    TagIcon,
    InformationCircleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface ContentTabProps {
    customizations: any;
    setCustomizations: (customizations: any) => void;
}

export default function ContentTab({
    customizations,
    setCustomizations
}: ContentTabProps) {
    return (
        <div className="space-y-6" data-tour="content-tab">
            {/* Helpful Guidance Banner */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">✍️ Content Tips</h3>
                        <ul className="text-xs text-gray-700 space-y-1">
                            <li className="flex items-center gap-2">
                                <span className={customizations.headline ? "text-green-600" : "text-blue-600"}>
                                    {customizations.headline ? "✓" : "💡"}
                                </span>
                                Create a compelling headline (recommended)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className={customizations.subheadline ? "text-green-600" : "text-blue-600"}>
                                    {customizations.subheadline ? "✓" : "💡"}
                                </span>
                                Add a subheadline to explain your offer (recommended)
                            </li>
                        </ul>
                        {customizations.headline && customizations.subheadline && (
                            <p className="mt-2 text-xs font-medium text-green-700 flex items-center gap-1">
                                <CheckCircleIcon className="w-4 h-4" />
                                Great! Your content looks good.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Headlines */}
            <div>
                <h3 className="text-sm font-medium text-black mb-3">Hero Section</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Headline</label>
                        <input
                            type="text"
                            value={customizations.headline}
                            onChange={(e) => setCustomizations({ ...customizations, headline: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-black"
                            placeholder="e.g. Master Digital Marketing in 30 Days"
                            maxLength={100}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Subheadline</label>
                        <textarea
                            value={customizations.subheadline}
                            onChange={(e) => setCustomizations({ ...customizations, subheadline: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm text-black"
                            placeholder="e.g. A comprehensive guide to growing your online business..."
                            maxLength={200}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Call to Action (Button Text)</label>
                        <input
                            type="text"
                            value={customizations.cta}
                            onChange={(e) => setCustomizations({ ...customizations, cta: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-black"
                            placeholder="e.g. Get Instant Access"
                            maxLength={50}
                        />
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100 my-4"></div>

            {/* Features & Toggles */}
            <div>
                <h3 className="text-sm font-medium text-black mb-3 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-purple-600" />
                    <span>Features & urgency</span>
                </h3>

                <div className="space-y-4">
                    {/* Countdown Timer */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="toggle-countdown" className="text-xs font-medium text-gray-900 flex items-center gap-1.5 cursor-pointer select-none">
                                <ClockIcon className="w-3.5 h-3.5" />
                                Show Countdown Timer
                            </label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    id="toggle-countdown"
                                    type="checkbox"
                                    checked={customizations.showCountdown}
                                    onChange={(e) => {
                                        const isChecked = e.target.checked;
                                        // Auto-set date to tomorrow if enabling and no date set
                                        const tomorrow = new Date();
                                        tomorrow.setDate(tomorrow.getDate() + 1);
                                        const defaultDate = tomorrow.toISOString().slice(0, 16);

                                        setCustomizations({
                                            ...customizations,
                                            showCountdown: isChecked,
                                            countdownDate: isChecked && !customizations.countdownDate ? defaultDate : customizations.countdownDate
                                        });
                                    }}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>

                        {customizations.showCountdown && (
                            <div className="mt-2 text-xs">
                                <label className="block text-gray-600 mb-1">End Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={customizations.countdownDate}
                                    onChange={(e) => setCustomizations({ ...customizations, countdownDate: e.target.value })}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-black bg-white"
                                />
                                <p className="text-[10px] text-gray-500 mt-1">
                                    Set a date to create urgency. The timer will appear at the top of your page.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Discount Badge */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="mb-2">
                            <label className="text-xs font-medium text-gray-900 flex items-center gap-1.5 mb-2">
                                <TagIcon className="w-3.5 h-3.5" />
                                Discount Offer
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <input
                                        type="text"
                                        value={customizations.discountCode}
                                        onChange={(e) => setCustomizations({ ...customizations, discountCode: e.target.value })}
                                        placeholder="Code (e.g. SAVE20)"
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs text-black"
                                    />
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={customizations.discountPercent}
                                        onChange={(e) => setCustomizations({ ...customizations, discountPercent: Number(e.target.value) })}
                                        placeholder="0"
                                        min="0"
                                        max="100"
                                        className="w-full pl-2 pr-6 py-1.5 border border-gray-300 rounded text-xs text-black"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Proof */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="toggle-reviews" className="text-xs font-medium text-gray-900 flex items-center gap-1.5 cursor-pointer select-none">
                                <StarIcon className="w-3.5 h-3.5" />
                                Show Reviews / Rating
                            </label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    id="toggle-reviews"
                                    type="checkbox"
                                    checked={customizations.showReviews}
                                    onChange={(e) => setCustomizations({ ...customizations, showReviews: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>

                        {customizations.showReviews && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] text-gray-500 mb-1">Rating</label>
                                    <select
                                        value={customizations.reviewsRating}
                                        onChange={(e) => setCustomizations({ ...customizations, reviewsRating: Number(e.target.value) })}
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs text-black bg-white"
                                    >
                                        <option value="5">⭐⭐⭐⭐⭐ (5.0)</option>
                                        <option value="4.5">⭐⭐⭐⭐½ (4.5)</option>
                                        <option value="4">⭐⭐⭐⭐ (4.0)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-500 mb-1">Review Count</label>
                                    <input
                                        type="number"
                                        value={customizations.reviewsCount}
                                        onChange={(e) => setCustomizations({ ...customizations, reviewsCount: Number(e.target.value) })}
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs text-black"
                                        placeholder="e.g. 120"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
