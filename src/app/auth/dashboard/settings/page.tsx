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
  ArrowTopRightOnSquareIcon,
  GlobeAltIcon,
  PhoneIcon,
  AtSymbolIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

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

        // Add cache-busting for image preview
        const imagePreview = imageUrl ? `${imageUrl}?t=${Date.now()}` : '';

        setUserName(profileData.name || '');
        setUserEmail(profileData.email || '');
        setUserImage(imageUrl);
        setUserImagePreview(imagePreview);
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

        // Add cache-busting timestamp for immediate preview
        const cacheBuster = `?t=${Date.now()}`;

        setUserImage(imageUrl);
        setUserImagePreview(imageUrl + cacheBuster);
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

  const handleRemoveProfileImage = async () => {
    if (!confirm('Are you sure you want to remove your profile image?')) {
      return;
    }

    try {
      setUploadingProfileImage(true);
      setProfileImageUploadMessage(null);

      const response = await fetch('/api/upload/profile-image', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUserImage('');
        setUserImagePreview('');
        setProfileImageUploadMessage({
          type: 'success',
          text: 'Profile image removed successfully!'
        });

        // Reload profile
        setTimeout(() => {
          loadUserProfile();
        }, 500);
      } else {
        setProfileImageUploadMessage({
          type: 'error',
          text: data.error || 'Failed to remove profile image'
        });
      }
    } catch (error) {
      console.error('Error removing profile image:', error);
      setProfileImageUploadMessage({
        type: 'error',
        text: 'Failed to remove profile image. Please try again.'
      });
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
      <div className="min-h-screen bg-slate-50/50 p-6 sm:p-10 space-y-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-900 rounded-xl">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-black uppercase tracking-widest text-slate-400">Security & Profile</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Settings<span className="text-purple-600">.</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium mt-2 max-w-xl">
              Architecture control center. Manage your global identity, financial nodes, and distribution protocols.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-5 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none pt-0.5">{userRole} Node</span>
            </div>
          </div>
        </motion.div>

        {/* Tactical Navigation */}
        <div className="relative border-b border-slate-200">
          <div className="flex space-x-2 px-1 pb-1 overflow-x-auto scrollbar-hide no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 whitespace-nowrap overflow-hidden group ${activeTab === tab.id
                  ? 'text-white shadow-xl shadow-slate-200'
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-slate-900"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className={`h-5 w-5 relative z-10 ${activeTab === tab.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}`} />
                <span className="relative z-10">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Operational Modules */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {activeTab === 'profile' && (
              <div className="space-y-10">
                {profileMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-3xl border flex items-center gap-4 ${profileMessage.type === 'success'
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-900'
                      : 'bg-rose-50 border-rose-100 text-rose-900'
                      }`}
                  >
                    {profileMessage.type === 'success' ? (
                      <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                    ) : (
                      <XMarkIcon className="h-6 w-6 text-rose-600" />
                    )}
                    <p className="text-sm font-black uppercase tracking-wider text-slate-900">
                      {profileMessage.text}
                    </p>
                  </motion.div>
                )}

                {profileLoading ? (
                  <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="relative">
                      <div className="h-16 w-16 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-2 w-2 bg-slate-900 rounded-full animate-pulse" />
                      </div>
                    </div>
                    <p className="mt-6 text-sm font-black uppercase tracking-widest text-slate-400">Initializing Profile Node...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Identity & Assets */}
                    <div className="lg:col-span-2 space-y-8">
                      {/* Account Overview Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { label: 'Asset Nodes', value: userStats.totalFunnels, icon: SparklesIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
                          { label: 'Gross Revenue', value: `₹${userStats.totalRevenue.toLocaleString()}`, icon: BanknotesIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                          { label: 'Global Sales', value: userStats.totalOrders, icon: ChartBarIcon, color: 'text-blue-600', bg: 'bg-blue-50' }
                        ].map((stat, i) => (
                          <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group"
                          >
                            <div className={`p-3 rounded-2xl ${stat.bg} w-fit mb-6 group-hover:scale-110 transition-transform`}>
                              <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                            <p className={`text-3xl font-black text-slate-900 tracking-tight`}>{stat.value}</p>
                          </motion.div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                            <div>
                              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Identity Details</h3>
                              <p className="text-slate-500 font-medium mt-1">Global metadata for your seller protocol</p>
                            </div>
                            <button
                              onClick={saveUserProfile}
                              disabled={profileSaving || !userName}
                              className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:shadow-2xl hover:shadow-slate-300 transition-all active:scale-95 disabled:opacity-50"
                            >
                              {profileSaving ? 'Synchronizing...' : 'Save Configuration'}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                              <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                <UserIcon className="h-3.5 w-3.5" /> Functional Name
                              </label>
                              <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Enter your administrative name"
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-900 font-black transition-all"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                <AtSymbolIcon className="h-3.5 w-3.5" /> Authentication Node
                              </label>
                              <div className="relative">
                                <input
                                  type="email"
                                  value={userEmail}
                                  disabled
                                  className="w-full px-6 py-4 bg-slate-100/50 border-none rounded-2xl text-slate-400 font-bold cursor-not-allowed pr-12"
                                />
                              </div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-1">Read-only protocol address</p>
                            </div>
                            <div className="space-y-3">
                              <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                <PhoneIcon className="h-3.5 w-3.5" /> Communication Node
                              </label>
                              <input
                                type="tel"
                                value={userPhone}
                                onChange={(e) => setUserPhone(e.target.value)}
                                placeholder="+00 (000) 000-0000"
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-900 font-black transition-all"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                <GlobeAltIcon className="h-3.5 w-3.5" /> Domain Pointer
                              </label>
                              <input
                                type="url"
                                value={userWebsite}
                                onChange={(e) => setUserWebsite(e.target.value)}
                                placeholder="https://nexus.yourdomain.com"
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-900 font-black transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Visual Identity */}
                    <div className="space-y-8">
                      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 text-center">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Visual Signature</h3>

                        <div className="relative mx-auto w-48 h-48 rounded-full group">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 animate-pulse group-hover:animate-none group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-2 rounded-full overflow-hidden bg-white border border-slate-100 shadow-inner z-10 transition-transform duration-500 group-hover:scale-105">
                            {userImagePreview ? (
                              <img src={userImagePreview} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-200">
                                <UserIcon className="h-24 w-24" />
                              </div>
                            )}
                            {uploadingProfileImage && (
                              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                                <div className="h-8 w-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4 pt-4">
                          <label className="block">
                            <span className="sr-only">Choose profile photo</span>
                            <div className="flex flex-col gap-3">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleProfileImageUpload}
                                className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-3 file:px-6
                                file:rounded-full file:border-0
                                file:text-xs file:font-black file:uppercase file:tracking-widest
                                file:bg-slate-900 file:text-white
                                hover:file:bg-slate-800 transition-all cursor-pointer"
                              />
                              {userImagePreview && (
                                <button
                                  onClick={handleRemoveProfileImage}
                                  className="w-full py-4 text-xs font-black uppercase tracking-widest text-rose-500 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-all"
                                >
                                  Terminate Image
                                </button>
                              )}
                            </div>
                          </label>
                          {profileImageUploadMessage && (
                            <p className={`text-[10px] font-black uppercase tracking-widest ${profileImageUploadMessage.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {profileImageUploadMessage.text}
                            </p>
                          )}
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-left mb-2 ml-1">Manual Asset Pointer</label>
                          <input
                            type="url"
                            value={userImage}
                            onChange={(e) => {
                              setUserImage(e.target.value);
                              setUserImagePreview(e.target.value);
                            }}
                            placeholder="Static URL Pointer"
                            className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white text-xs font-bold text-slate-900 transition-all"
                          />
                        </div>
                      </div>

                      {/* Info Stat Card */}
                      <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10 flex flex-col items-center">
                          <CheckCircleIcon className="h-10 w-10 text-emerald-400 mb-4" />
                          <p className="text-white font-black text-xl tracking-tight">Node Operational</p>
                          <p className="text-white/50 text-xs font-bold uppercase tracking-widest mt-2">Member Since {userCreatedAt ? new Date(userCreatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Revenue Matrix</h3>
                    <p className="text-slate-500 font-medium">Financial performance and clearing logs</p>
                  </div>
                </div>

                {/* Master Revenue Card */}
                <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl shadow-slate-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30 flex items-center gap-2">
                          <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Direct Settlement</span>
                        </div>
                      </div>
                      <p className="text-sm font-black text-white/40 uppercase tracking-widest">Total Cleared Earnings</p>
                      <p className="text-7xl font-black tracking-tight">₹{userStats.totalRevenue.toLocaleString()}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 md:w-1/3">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Global Orders</p>
                        <p className="text-3xl font-black">{userStats.totalOrders}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Avg Value</p>
                        <p className="text-3xl font-black text-emerald-400">
                          ₹{userStats.totalOrders > 0 ? Math.round(userStats.totalRevenue / userStats.totalOrders).toLocaleString() : 0}
                        </p>
                      </div>
                      <div className="col-span-2 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Signal Integrity</span>
                          <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">99.9% Operational</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '99.9%' }}
                            className="h-full bg-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <button
                    onClick={() => setActiveTab('payment-gateway')}
                    className="flex items-center justify-between p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-purple-50 rounded-2xl group-hover:bg-purple-600 transition-colors">
                        <BanknotesIcon className="h-10 w-10 text-purple-600 group-hover:text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xl font-black text-slate-900 tracking-tight">Financing Protocol</h4>
                        <p className="text-slate-500 font-medium">Configure Razorpay Clearing House</p>
                      </div>
                    </div>
                    <ArrowTopRightOnSquareIcon className="h-6 w-6 text-slate-300 group-hover:text-slate-900" />
                  </button>

                  <a
                    href="/auth/dashboard/analytics"
                    className="flex items-center justify-between p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-600 transition-colors">
                        <ChartBarIcon className="h-10 w-10 text-blue-600 group-hover:text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xl font-black text-slate-900 tracking-tight">Visual Suite</h4>
                        <p className="text-slate-500 font-medium">Deep Performance Analytics</p>
                      </div>
                    </div>
                    <ArrowTopRightOnSquareIcon className="h-6 w-6 text-slate-300 group-hover:text-slate-900" />
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'payment-gateway' && (
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Clearing House Node</h3>
                    <p className="text-slate-500 font-medium">Global payment gateway and settlement protocols</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest ${hasRazorpayConfig ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {hasRazorpayConfig ? 'Operational' : 'Disconnected'}
                    </div>
                  </div>
                </div>

                {/* Direct Payment Highlight */}
                <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />

                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-5">
                      <div className="h-16 w-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center border border-white/20 backdrop-blur-xl">
                        <BanknotesIcon className="h-8 w-8 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black tracking-tight">Zero Platform Extraction</h4>
                        <p className="text-white/50 font-medium">Protocol settlement goes 100% directly to your node.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { title: 'Direct Node', desc: 'Settles strictly to your bank', icon: CheckCircleIcon },
                        { title: 'Extraction Free', desc: '0% platform handling fee', icon: CheckCircleIcon },
                        { title: 'Instant Relay', desc: 'Real-time transaction clearing', icon: CheckCircleIcon }
                      ].map((feature, i) => (
                        <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                          <feature.icon className="h-6 w-6 text-white/30 mb-4" />
                          <h5 className="font-black text-sm uppercase tracking-widest mb-1">{feature.title}</h5>
                          <p className="text-xs text-white/50 font-medium leading-relaxed">{feature.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Technical Input Suite */}
                <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-12">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-10">
                    <div>
                      <h4 className="text-2xl font-black text-slate-900 tracking-tight">Razorpay Protocols</h4>
                      <p className="text-slate-500 font-medium">Input your administrative RSA keys for processing</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={saveRazorpayConfig}
                        disabled={!razorpayKeyId || !razorpayKeySecret || razorpaySaving}
                        className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                      >
                        {razorpaySaving ? 'Encrypting...' : hasRazorpayConfig ? 'Update Node' : 'Initialize Node'}
                      </button>
                      {hasRazorpayConfig && (
                        <button
                          onClick={deleteRazorpayConfig}
                          className="px-8 py-5 text-xs font-black uppercase tracking-widest text-rose-500 bg-rose-50 rounded-[2rem] hover:bg-rose-100 transition-all"
                        >
                          Decommission
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                        Node Identification Key (Key ID)
                      </label>
                      <input
                        type="text"
                        value={razorpayKeyId}
                        onChange={(e) => setRazorpayKeyId(e.target.value)}
                        placeholder="rzp_live_XXXXXXXXXXXX"
                        className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-900 font-mono font-bold transition-all"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                        Administrative Secret Key (Key Secret)
                      </label>
                      <div className="relative">
                        <input
                          type={showRazorpaySecret ? "text" : "password"}
                          value={razorpayKeySecret}
                          onChange={(e) => setRazorpayKeySecret(e.target.value)}
                          placeholder={hasRazorpayConfig ? "HIDDEN FOR SECURITY - UPDATE TO OVERWRITE" : "PASTE SECRET KEY HERE"}
                          className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-900 font-mono font-bold transition-all pr-24"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900"
                        >
                          {showRazorpaySecret ? 'Conceal' : 'Reveal'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                        Network Callback Secret (Webhook - Optional)
                      </label>
                      <input
                        type="password"
                        value={razorpayWebhookSecret}
                        onChange={(e) => setRazorpayWebhookSecret(e.target.value)}
                        placeholder="whsec_XXXXXXXX"
                        className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-900 font-mono font-bold transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Help Hub */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                  <div className="flex items-center gap-3">
                    <QuestionMarkCircleIcon className="h-6 w-6 text-slate-900" />
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">Documentation Relay</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a href="https://dashboard.razorpay.com/app/keys" target="_blank" className="p-6 bg-slate-50 rounded-[2rem] flex items-center justify-between group hover:bg-slate-900 transition-all">
                      <span className="font-black text-xs uppercase tracking-widest text-slate-600 group-hover:text-white">Relay Authority: Get API Keys</span>
                      <ArrowTopRightOnSquareIcon className="h-5 w-5 text-slate-300" />
                    </a>
                    <a href="https://razorpay.com/docs/payments/dashboard/account-settings/api-keys/" target="_blank" className="p-6 bg-slate-50 rounded-[2rem] flex items-center justify-between group hover:bg-slate-900 transition-all">
                      <span className="font-black text-xs uppercase tracking-widest text-slate-600 group-hover:text-white">Protocol Guide: Official Keys Docs</span>
                      <ArrowTopRightOnSquareIcon className="h-5 w-5 text-slate-300" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Danger Zone: Terminal Access Only */}
        <div className="pt-20 border-t border-slate-100">
          <div className="bg-rose-50/50 p-10 rounded-[3rem] border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 bg-rose-500 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-rose-200">
                <ExclamationTriangleIcon className="h-8 w-8 text-white" />
              </div>
              <div className="text-center md:text-left">
                <p className="text-xl font-black text-slate-900 tracking-tight">Security Override: Delete Account</p>
                <p className="text-slate-500 font-medium">This protocol will permanently wipe all local and cloud data.</p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-10 py-5 bg-rose-500 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-rose-600 hover:shadow-2xl hover:shadow-rose-300 transition-all active:scale-95 whitespace-nowrap"
            >
              Initiate Wipe
            </button>
          </div>
        </div>

        {/* Delete Confirmation Overlay */}
        <AnimatePresence>
          {showDeleteModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteModal(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-lg rounded-[3.5rem] p-12 text-center shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-rose-50 rounded-full" />
                <div className="relative z-10">
                  <div className="h-20 w-20 bg-rose-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-rose-100">
                    <ExclamationTriangleIcon className="h-10 w-10 text-rose-600" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Complete Wipeout?</h3>
                  <p className="text-slate-500 font-medium leading-relaxed mb-10">
                    This action is <span className="text-rose-600 font-black">IRREVERSIBLE</span>. Your administrative nodes, distribution protocols, and financial records will be purged from the global matrix.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Abort Mission
                    </button>
                    <button className="flex-1 py-5 bg-rose-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-200 transition-all">
                      Confirm Purge
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}