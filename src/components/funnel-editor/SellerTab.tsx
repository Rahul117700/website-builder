import React from 'react';
import { UserCircleIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface SellerTabProps {
    sellerInfo: any;
    setSellerInfo: (info: any) => void;
}

export default function SellerTab({
    sellerInfo,
    setSellerInfo
}: SellerTabProps) {
    return (
        <div className="space-y-6" data-tour="seller-tab">
            {/* Helpful Guidance Banner */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">👤 Seller Info Setup</h3>
                        <ul className="text-xs text-gray-700 space-y-1">
                            <li className="flex items-center gap-2">
                                <span className={sellerInfo.name ? "text-green-600" : "text-orange-600"}>
                                    {sellerInfo.name ? "✓" : "1."}
                                </span>
                                Enter your name (required)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className={sellerInfo.email ? "text-green-600" : "text-orange-600"}>
                                    {sellerInfo.email ? "✓" : "2."}
                                </span>
                                Add your contact email (required)
                            </li>
                        </ul>
                        {sellerInfo.name && sellerInfo.email && (
                            <p className="mt-2 text-xs font-medium text-green-700 flex items-center gap-1">
                                <CheckCircleIcon className="w-4 h-4" />
                                Seller info complete! You're almost ready.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                        {sellerInfo.avatar ? (
                            <img src={sellerInfo.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <UserCircleIcon className="w-full h-full text-gray-300" />
                        )}
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-black">Seller Profile</h3>
                    <p className="text-xs text-gray-500">Profile image from your account settings</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={sellerInfo.name}
                        onChange={(e) => setSellerInfo({ ...sellerInfo, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-black"
                        placeholder="e.g. John Doe"
                        maxLength={50}
                    />
                    {!sellerInfo.name && (
                        <p className="text-xs text-orange-600 mt-1">⚠️ Required for publishing</p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bio / About</label>
                    <textarea
                        value={sellerInfo.bio}
                        onChange={(e) => setSellerInfo({ ...sellerInfo, bio: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm text-black"
                        placeholder="Tell customers a bit about yourself..."
                        maxLength={300}
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional but recommended</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={sellerInfo.email}
                            onChange={(e) => setSellerInfo({ ...sellerInfo, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-black"
                            placeholder="john@example.com"
                        />
                        {!sellerInfo.email && (
                            <p className="text-xs text-orange-600 mt-1">⚠️ Required</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Phone (Optional)</label>
                        <input
                            type="tel"
                            value={sellerInfo.phone}
                            onChange={(e) => setSellerInfo({ ...sellerInfo, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-black"
                            placeholder="+91 9999999999"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Website</label>
                    <input
                        type="url"
                        value={sellerInfo.website}
                        onChange={(e) => setSellerInfo({ ...sellerInfo, website: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-black"
                        placeholder="https://yourwebsite.com"
                    />
                </div>
            </div>
        </div>
    );
}
