'use client';

import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useState, useEffect } from 'react';
import {
  UserIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  BanknotesIcon,
  ChartBarIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'payment-gateway'>('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // User Profile State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userImage, setUserImage] = useState('');
  const [userImagePreview, setUserImagePreview] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userWebsite, setUserWebsite] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userCreatedAt, setUserCreatedAt] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [profileImageUploadMessage, setProfileImageUploadMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // User Stats
  const [userStats, setUserStats] = useState({
    totalFunnels: 0,
    totalRevenue: 0,
    totalOrders: 0
  });
  
  // Razorpay Config State
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
  const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState('');
  const [hasRazorpayConfig, setHasRazorpayConfig] = useState(false);
  const [razorpaySaving, setRazorpaySaving] = useState(false);
  const [razorpayMessage, setRazorpayMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const [showRazorpayGuide, setShowRazorpayGuide] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'billing', name: 'My Earnings', icon: CreditCardIcon },
    { id: 'payment-gateway', name: 'Payment Gateway', icon: BanknotesIcon }
  ];

  // Load user profile and Razorpay config on mount
  useEffect(() => {
    loadUserProfile();
    loadRazorpayConfig();
  }, []);

  const loadUserProfile = async () => {
    try {
      setProfileLoading(true);
      const [profileRes, analyticsRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/analytics')
      ]);
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        // Fix image URL if it has /public prefix
        let imageUrl = profileData.image || '';
        if (imageUrl && imageUrl.startsWith('/public')) {
          imageUrl = imageUrl.replace('/public', '');
        }
        
        setUserName(profileData.name || '');
        setUserEmail(profileData.email || '');
        setUserImage(imageUrl);
        setUserImagePreview(imageUrl);
        setUserPhone(profileData.phone || '');
        setUserWebsite(profileData.website || '');
        setUserRole(profileData.role || 'USER');
        setUserCreatedAt(profileData.createdAt || '');
      }
      
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setUserStats({
          totalFunnels: analyticsData.overview.totalFunnels || 0,
          totalRevenue: analyticsData.overview.totalRevenue || 0,
          totalOrders: analyticsData.overview.totalConversions || 0
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setProfileImageUploadMessage({ type: 'error', text: 'File must be an image' });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setProfileImageUploadMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setUserImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      setUploadingProfileImage(true);
      setProfileImageUploadMessage(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/profile-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Ensure URL doesn't have /public prefix
        let imageUrl = data.url;
        if (imageUrl.startsWith('/public')) {
          imageUrl = imageUrl.replace('/public', '');
        }
        
        setUserImage(imageUrl);
        setUserImagePreview(imageUrl);
        setProfileImageUploadMessage({ 
          type: 'success', 
          text: data.message || 'Profile image uploaded successfully!' 
        });
        
        // Reload profile to get updated image from database
        setTimeout(() => {
          loadUserProfile();
        }, 500);
      } else {
        setProfileImageUploadMessage({ 
          type: 'error', 
          text: data.error || 'Failed to upload profile image' 
        });
        // Reset preview on error
        setUserImagePreview(userImage);
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      setProfileImageUploadMessage({ 
        type: 'error', 
        text: 'Failed to upload profile image. Please try again.' 
      });
      setUserImagePreview(userImage);
    } finally {
      setUploadingProfileImage(false);
    }
  };

  const saveUserProfile = async () => {
    setProfileSaving(true);
    setProfileMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userName,
          phone: userPhone,
          website: userWebsite,
          image: userImage
        })
      });

      const data = await response.json();

      if (response.ok) {
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        await loadUserProfile();
      } else {
        setProfileMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setProfileMessage({ type: 'error', text: 'An error occurred while updating profile' });
    } finally {
      setProfileSaving(false);
    }
  };

  const loadRazorpayConfig = async () => {
    try {
      const response = await fetch('/api/razorpay-config');
      const data = await response.json();
      
      if (data.hasConfig && data.config) {
        setHasRazorpayConfig(true);
        setRazorpayKeyId(data.config.keyId);
      }
    } catch (error) {
      console.error('Error loading Razorpay config:', error);
    }
  };

  const saveRazorpayConfig = async () => {
    setRazorpaySaving(true);
    setRazorpayMessage(null);

    try {
      const response = await fetch('/api/razorpay-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyId: razorpayKeyId,
          keySecret: razorpayKeySecret,
          webhookSecret: razorpayWebhookSecret || undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        setRazorpayMessage({ type: 'success', text: 'Razorpay credentials saved successfully!' });
        setHasRazorpayConfig(true);
        setRazorpayKeySecret(''); // Clear the secret from form
        setRazorpayWebhookSecret('');
        await loadRazorpayConfig();
      } else {
        setRazorpayMessage({ type: 'error', text: data.error || 'Failed to save credentials' });
      }
    } catch (error) {
      console.error('Error saving Razorpay config:', error);
      setRazorpayMessage({ type: 'error', text: 'An error occurred while saving credentials' });
    } finally {
      setRazorpaySaving(false);
    }
  };

  const deleteRazorpayConfig = async () => {
    if (!confirm('Are you sure you want to delete your Razorpay configuration?')) {
      return;
    }

    try {
      const response = await fetch('/api/razorpay-config', {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        setRazorpayMessage({ type: 'success', text: 'Razorpay configuration deleted successfully!' });
        setHasRazorpayConfig(false);
        setRazorpayKeyId('');
        setRazorpayKeySecret('');
        setRazorpayWebhookSecret('');
      } else {
        setRazorpayMessage({ type: 'error', text: data.error || 'Failed to delete configuration' });
      }
    } catch (error) {
      console.error('Error deleting Razorpay config:', error);
      setRazorpayMessage({ type: 'error', text: 'An error occurred while deleting configuration' });
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full h-screen m-0 p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 overflow-y-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your account settings</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                
                {profileMessage && (
                  <div className={`border rounded-lg p-4 ${
                    profileMessage.type === 'success' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center">
                      {profileMessage.type === 'success' ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      ) : (
                        <XMarkIcon className="h-5 w-5 text-red-600 mr-2" />
                      )}
                      <p className={`text-sm ${
                        profileMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {profileMessage.text}
                      </p>
                    </div>
                  </div>
                )}

                {profileLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <>
                    {/* Account Overview */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                      <h4 className="font-semibold text-gray-900 mb-4">Account Overview</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <p className="text-sm text-gray-600 mb-1">Total Funnels</p>
                          <p className="text-2xl font-bold text-purple-600">{userStats.totalFunnels}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                          <p className="text-2xl font-bold text-green-600">₹{userStats.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                          <p className="text-2xl font-bold text-blue-600">{userStats.totalOrders}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-600">Account Type: </span>
                          <span className="font-semibold text-gray-900 capitalize">{userRole}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Member since: </span>
                          <span className="font-semibold text-gray-900">
                            {userCreatedAt ? new Date(userCreatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={userEmail}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (Optional)</label>
                        <input
                          type="tel"
                          value={userPhone}
                          onChange={(e) => setUserPhone(e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                        />
                        <p className="text-xs text-gray-500 mt-1">Used in your funnel seller information</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website (Optional)</label>
                        <input
                          type="url"
                          value={userWebsite}
                          onChange={(e) => setUserWebsite(e.target.value)}
                          placeholder="https://yourwebsite.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                        />
                        <p className="text-xs text-gray-500 mt-1">Used in your funnel seller information</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                        <div className="flex items-center space-x-4">
                          {/* Preview */}
                          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0 bg-gray-100">
                            {userImagePreview ? (
                              <img 
                                src={userImagePreview} 
                                alt="Profile Preview" 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <UserIcon className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                            {uploadingProfileImage && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                              </div>
                            )}
                          </div>
                          {/* File Input */}
                          <div className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProfileImageUpload}
                              disabled={uploadingProfileImage}
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-purple-50 file:text-purple-700
                                hover:file:bg-purple-100
                                disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            {profileImageUploadMessage && (
                              <p className={`mt-2 text-sm ${profileImageUploadMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                                {profileImageUploadMessage.text}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Upload a profile picture (Max 5MB). Supports JPG, PNG, GIF</p>
                          </div>
                        </div>
                        {/* Alternative: URL input (optional) */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Or enter image URL (Optional)</label>
                          <input
                            type="url"
                            value={userImage}
                            onChange={(e) => {
                              setUserImage(e.target.value);
                              setUserImagePreview(e.target.value);
                            }}
                            placeholder="https://example.com/your-image.jpg"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                          />
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={saveUserProfile}
                      disabled={profileSaving || !userName}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {profileSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Revenue & Earnings</h3>
                
                {/* Revenue Overview */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-green-700 font-medium">Total Earnings</p>
                      <p className="text-4xl font-bold text-green-900">₹{userStats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-green-200 rounded-full">
                      <CreditCardIcon className="h-8 w-8 text-green-700" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-white rounded-lg p-3 border border-green-100">
                      <p className="text-xs text-gray-600 mb-1">Total Sales</p>
                      <p className="text-xl font-bold text-gray-900">{userStats.totalOrders}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-100">
                      <p className="text-xs text-gray-600 mb-1">Avg. Order</p>
                      <p className="text-xl font-bold text-gray-900">
                        ₹{userStats.totalOrders > 0 ? Math.round(userStats.totalRevenue / userStats.totalOrders).toLocaleString() : 0}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-100">
                      <p className="text-xs text-gray-600 mb-1">This Month</p>
                      <p className="text-xl font-bold text-green-600">+8.3%</p>
                    </div>
                  </div>
                </div>

                {/* Payment Gateway Status */}
                <div className={`border rounded-lg p-4 ${
                  hasRazorpayConfig 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center">
                    {hasRazorpayConfig ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                    )}
                    <div>
                      <p className={`font-medium ${hasRazorpayConfig ? 'text-green-900' : 'text-yellow-900'}`}>
                        {hasRazorpayConfig ? 'Payment Gateway Active' : 'Payment Gateway Not Configured'}
                      </p>
                      <p className={`text-sm ${hasRazorpayConfig ? 'text-green-700' : 'text-yellow-700'}`}>
                        {hasRazorpayConfig 
                          ? 'Your Razorpay credentials are configured and ready to accept payments'
                          : 'Configure your Razorpay credentials in the Payment Gateway tab to start accepting payments'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab('payment-gateway')}
                    className="flex items-center justify-between p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <BanknotesIcon className="h-6 w-6 text-purple-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Configure Payment Gateway</p>
                        <p className="text-sm text-gray-600">Set up Razorpay to accept payments</p>
                      </div>
                    </div>
                    <span className="text-purple-600">→</span>
                  </button>
                  <a
                    href="/auth/dashboard/analytics"
                    className="flex items-center justify-between p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <ChartBarIcon className="h-6 w-6 text-blue-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">View Analytics</p>
                        <p className="text-sm text-gray-600">Track your performance metrics</p>
                      </div>
                    </div>
                    <span className="text-blue-600">→</span>
                  </a>
                </div>
              </div>
            )}


            {activeTab === 'payment-gateway' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Payment Gateway Configuration</h3>
                
                {/* Direct Payment Highlight */}
                <div className={`relative overflow-hidden rounded-xl p-6 shadow-xl ${
                  hasRazorpayConfig
                    ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600'
                    : 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500'
                }`}>
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        {hasRazorpayConfig ? (
                          <CheckCircleIcon className="h-6 w-6 text-white" />
                        ) : (
                          <BanknotesIcon className="h-6 w-6 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="inline-flex items-center px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full mb-2">
                          <CheckCircleIcon className="h-4 w-4 text-white mr-1" />
                          <span className="text-xs font-bold text-white">
                            {hasRazorpayConfig ? '✅ CONNECTED & READY' : '100% YOUR MONEY'}
                          </span>
                        </div>
                        
                        {hasRazorpayConfig ? (
                          <>
                            <h4 className="text-xl font-bold text-white mb-2">
                              🎉 Payment Gateway is Active!
                            </h4>
                            
                            <p className="text-sm text-white/90 mb-3">
                              Your Razorpay account is connected and working perfectly. All your sales payments are going <strong>directly to your bank account</strong>. You're all set to earn money!
                            </p>
                          </>
                        ) : (
                          <>
                            <h4 className="text-xl font-bold text-white mb-2">
                              💰 All Payments Go Directly to Your Bank Account
                            </h4>
                            
                            <p className="text-sm text-white/90 mb-3">
                              When you connect your Razorpay account, every sale payment goes <strong>straight to YOUR bank</strong>. 
                              We never touch or hold your money - Zero middleman, Zero delays!
                            </p>
                          </>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="flex items-center text-white text-xs bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                            <CheckCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span>Direct to Your Bank</span>
                          </div>
                          <div className="flex items-center text-white text-xs bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                            <CheckCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span>No Platform Fees</span>
                          </div>
                          <div className="flex items-center text-white text-xs bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                            <CheckCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span>Instant Settlements</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-900">How to Connect Razorpay</p>
                      <p className="text-sm text-blue-700">
                        Add your own Razorpay credentials below to start accepting payments. 
                        Get your API keys from <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-blue-900">Razorpay Dashboard →</a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* How to Get API Keys Guide */}
                <div className="border-2 border-purple-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowRazorpayGuide(!showRazorpayGuide)}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <QuestionMarkCircleIcon className="h-6 w-6 text-purple-600" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">How to Get Razorpay API Keys?</p>
                        <p className="text-sm text-gray-600">Step-by-step guide to get your Key ID and Secret</p>
                      </div>
                    </div>
                    {showRazorpayGuide ? (
                      <ChevronUpIcon className="h-5 w-5 text-purple-600" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-purple-600" />
                    )}
                  </button>

                  {showRazorpayGuide && (
                    <div className="p-6 bg-white border-t border-purple-200">
                      <div className="space-y-6">
                        {/* Step 1 */}
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            1
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">Create or Login to Razorpay Account</h4>
                            <p className="text-sm text-gray-700 mb-3">
                              If you don't have a Razorpay account, sign up for free. Otherwise, login to your existing account.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <a
                                href="https://dashboard.razorpay.com/signup"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                              >
                                Sign Up for Razorpay
                                <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1.5" />
                              </a>
                              <a
                                href="https://dashboard.razorpay.com/signin"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
                              >
                                Login to Razorpay
                                <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1.5" />
                              </a>
                            </div>
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-600">
                                💡 <strong>Tip:</strong> Creating a Razorpay account is free and takes less than 5 minutes!
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            2
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">Navigate to API Keys Section</h4>
                            <p className="text-sm text-gray-700 mb-3">
                              Once logged in, go to Settings → API Keys from the left sidebar menu.
                            </p>
                            <a
                              href="https://dashboard.razorpay.com/app/keys"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              Go to API Keys
                              <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1.5" />
                            </a>
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            3
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">Generate API Keys</h4>
                            <p className="text-sm text-gray-700 mb-3">
                              You'll see two modes: <strong>Test Mode</strong> and <strong>Live Mode</strong>
                            </p>
                            <div className="space-y-3">
                              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="font-medium text-yellow-900 mb-1">🧪 Test Mode (For Testing)</p>
                                <ul className="text-sm text-yellow-800 space-y-1 ml-4 list-disc">
                                  <li>Click <strong>"Generate Test Keys"</strong> button</li>
                                  <li>Use for testing before going live</li>
                                  <li>No real money involved</li>
                                  <li>Keys start with <code className="bg-yellow-100 px-1 rounded">rzp_test_</code></li>
                                </ul>
                              </div>
                              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="font-medium text-green-900 mb-1">🚀 Live Mode (For Real Payments)</p>
                                <ul className="text-sm text-green-800 space-y-1 ml-4 list-disc">
                                  <li>Click <strong>"Generate Live Keys"</strong> button</li>
                                  <li>Requires KYC verification</li>
                                  <li>Real money transactions</li>
                                  <li>Keys start with <code className="bg-green-100 px-1 rounded">rzp_live_</code></li>
                                </ul>
                              </div>
                            </div>
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-xs text-blue-800">
                                💡 <strong>Recommendation:</strong> Start with Test Mode to try everything out, then switch to Live Mode when you're ready!
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            4
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">Copy Your API Keys</h4>
                            <p className="text-sm text-gray-700 mb-3">
                              You'll see two keys displayed on the screen:
                            </p>
                            <div className="space-y-3">
                              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm font-semibold text-gray-900 mb-1">📋 Key ID</p>
                                <p className="text-xs text-gray-600 mb-2">Looks like: <code className="bg-gray-200 px-2 py-1 rounded">rzp_test_XXXXXXXXXXXX</code></p>
                                <p className="text-xs text-gray-600">This is safe to share publicly (used in frontend)</p>
                              </div>
                              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                <p className="text-sm font-semibold text-red-900 mb-1">🔒 Key Secret</p>
                                <p className="text-xs text-red-700 mb-2">Longer string (hidden by default)</p>
                                <p className="text-xs text-red-700">
                                  <strong>⚠️ IMPORTANT:</strong> Never share this with anyone! Keep it secret like your password!
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mt-3">
                              Click the <strong>Copy</strong> icon next to each key to copy them to your clipboard.
                            </p>
                          </div>
                        </div>

                        {/* Step 5 */}
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            5
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">Paste Keys Below</h4>
                            <p className="text-sm text-gray-700 mb-3">
                              Simply paste your copied keys into the form fields below and click <strong>"Save Configuration"</strong>
                            </p>
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm text-green-800">
                                ✅ Once saved, you'll be able to publish your funnels and start accepting payments!
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Additional Help */}
                        <div className="pt-4 border-t border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-3">📚 Need More Help?</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <a
                              href="https://razorpay.com/docs/payments/dashboard/account-settings/api-keys/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Razorpay Official Guide</p>
                                <p className="text-xs text-gray-600">Complete documentation</p>
                              </div>
                              <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400" />
                            </a>
                            <a
                              href="https://razorpay.com/docs/payments/payments/test-card-details/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Test Card Details</p>
                                <p className="text-xs text-gray-600">For testing payments</p>
                              </div>
                              <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {razorpayMessage && (
                  <div className={`border rounded-lg p-4 ${
                    razorpayMessage.type === 'success' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center">
                      {razorpayMessage.type === 'success' ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      ) : (
                        <XMarkIcon className="h-5 w-5 text-red-600 mr-2" />
                      )}
                      <p className={`text-sm ${
                        razorpayMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {razorpayMessage.text}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Razorpay Key ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={razorpayKeyId}
                      onChange={(e) => setRazorpayKeyId(e.target.value)}
                      placeholder="rzp_test_XXXXXXXXXXXX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Your Razorpay Key ID (starts with rzp_test_ or rzp_live_)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Razorpay Key Secret <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRazorpaySecret ? "text" : "password"}
                        value={razorpayKeySecret}
                        onChange={(e) => setRazorpayKeySecret(e.target.value)}
                        placeholder={hasRazorpayConfig ? "Enter new secret to update" : "Enter your Razorpay Key Secret"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black font-mono text-sm pr-20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        {showRazorpaySecret ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Your Razorpay Key Secret (never share this with anyone)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webhook Secret (Optional)
                    </label>
                    <input
                      type="password"
                      value={razorpayWebhookSecret}
                      onChange={(e) => setRazorpayWebhookSecret(e.target.value)}
                      placeholder="whsec_XXXXXXXXXXXX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional: Webhook secret for payment verification
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={saveRazorpayConfig}
                    disabled={!razorpayKeyId || !razorpayKeySecret || razorpaySaving}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {razorpaySaving ? 'Saving...' : hasRazorpayConfig ? 'Update Configuration' : 'Save Configuration'}
                  </button>

                  {hasRazorpayConfig && (
                    <button
                      onClick={deleteRazorpayConfig}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete Configuration
                    </button>
                  )}
                </div>

                {hasRazorpayConfig && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-sm text-green-800">
                        Your Razorpay configuration is active. All payments will be processed using your credentials.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg border border-red-200 shadow-sm">
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-red-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-red-900 text-sm sm:text-base">Delete Account</p>
                <p className="text-xs sm:text-sm text-red-700">Permanently delete your account and all data.</p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm w-full sm:w-auto"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-2 text-center">
                  <h3 className="text-lg font-medium text-gray-900">Delete Account</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-center space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}