'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  UserIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export default function ViewerSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // User Profile State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userImage, setUserImage] = useState('');
  const [userImagePreview, setUserImagePreview] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userWebsite, setUserWebsite] = useState('');
  const [userCreatedAt, setUserCreatedAt] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadMessage, setImageUploadMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Load user profile on mount
  useEffect(() => {
    if (session?.user) {
      loadUserProfile();
    } else {
      router.push('/auth/signin');
    }
  }, [session, router]);

  const loadUserProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await fetch('/api/user/profile');
      
      if (response.ok) {
        const profileData = await response.json();
        let imageUrl = profileData.image || '';
        if (imageUrl && imageUrl.startsWith('/public')) {
          imageUrl = imageUrl.replace('/public', '');
        }
        
        const imagePreview = imageUrl ? `${imageUrl}?t=${Date.now()}` : '';
        
        setUserName(profileData.name || '');
        setUserEmail(profileData.email || '');
        setUserImage(imageUrl);
        setUserImagePreview(imagePreview);
        setUserPhone(profileData.phone || '');
        setUserWebsite(profileData.website || '');
        setUserCreatedAt(profileData.createdAt || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfileMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageUploadMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setImageUploadMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    try {
      setUploadingImage(true);
      setImageUploadMessage(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/profile-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUserImage(data.url);
        setUserImagePreview(`${data.url}?t=${Date.now()}`);
        setImageUploadMessage({ type: 'success', text: 'Profile image uploaded successfully!' });
        // Reload profile to get updated data
        await loadUserProfile();
        // Session will refresh automatically on next request
      } else {
        setImageUploadMessage({ type: 'error', text: data.error || 'Failed to upload image' });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setImageUploadMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setUploadingImage(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleRemoveImage = async () => {
    try {
      setUploadingImage(true);
      setImageUploadMessage(null);

      const response = await fetch('/api/upload/profile-image', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUserImage('');
        setUserImagePreview('');
        setImageUploadMessage({ type: 'success', text: 'Profile image removed successfully!' });
        // Reload profile to get updated data
        await loadUserProfile();
        // Session will refresh automatically on next request
      } else {
        setImageUploadMessage({ type: 'error', text: data.error || 'Failed to remove image' });
      }
    } catch (error) {
      console.error('Error removing image:', error);
      setImageUploadMessage({ type: 'error', text: 'Failed to remove image' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setProfileSaving(true);
      setProfileMessage(null);

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userName,
          phone: userPhone,
          website: userWebsite,
          image: userImage,
        }),
      });

      if (response.ok) {
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Update image preview
        if (userImage) {
          setUserImagePreview(`${userImage}?t=${Date.now()}`);
        }
        // Session will refresh automatically on next request
      } else {
        const errorData = await response.json();
        setProfileMessage({ type: 'error', text: errorData.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setProfileMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setProfileSaving(false);
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Profile Picture */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-gray-900 to-black rounded-xl">
                  <Cog6ToothIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">Settings</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {session?.user && (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">{session.user.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{session.user.email}</p>
                  </div>
                  {userImagePreview || session.user.image ? (
                    <img
                      src={userImagePreview || session.user.image || ''}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 shadow-sm"
                      onError={(e) => {
                        // Fallback to session image if preview fails
                        if (session.user?.image && e.currentTarget.src !== session.user.image) {
                          e.currentTarget.src = session.user.image;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                      <UserIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Settings</h2>
          <p className="text-sm text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <div className="p-2 rounded-lg bg-blue-100">
              <UserIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
          </div>

          {profileLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-900 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading profile...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Profile Picture
                </label>
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  {/* Profile Picture Preview */}
                  <div className="relative flex-shrink-0">
                    {userImagePreview ? (
                      <img
                        src={userImagePreview}
                        alt="Profile"
                        className="w-28 h-28 rounded-full object-cover border-2 border-gray-300 shadow-lg"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-2 border-gray-300 shadow-lg">
                        <UserIcon className="w-14 h-14 text-gray-500" />
                      </div>
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 w-full space-y-4">
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                          id="profile-image-upload"
                        />
                        <span className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                          {uploadingImage ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span>Upload Image</span>
                            </>
                          )}
                        </span>
                      </label>
                      {userImagePreview && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          disabled={uploadingImage}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    {/* Or Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <span className="text-xs text-gray-500">OR</span>
                      <div className="flex-1 h-px bg-gray-200"></div>
                    </div>
                    
                    {/* URL Input */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Enter image URL
                      </label>
                      <input
                        type="text"
                        value={userImage}
                        onChange={(e) => setUserImage(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900 placeholder-gray-400 bg-white text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1.5">
                        Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                      </p>
                    </div>

                    {/* Upload Message */}
                    {imageUploadMessage && (
                      <div
                        className={`p-3 rounded-lg flex items-start gap-2 text-sm ${
                          imageUploadMessage.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : 'bg-red-50 border border-red-200 text-red-800'
                        }`}
                      >
                        {imageUploadMessage.type === 'success' ? (
                          <CheckCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XMarkIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        )}
                        <span>{imageUploadMessage.text}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900 placeholder-gray-400 bg-white"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userEmail}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1.5">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone Number <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900 placeholder-gray-400 bg-white"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Website <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={userWebsite}
                  onChange={(e) => setUserWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900 placeholder-gray-400 bg-white"
                />
              </div>

              {/* Account Info */}
              {userCreatedAt && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Member since: <span className="font-semibold text-gray-900">{new Date(userCreatedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </p>
                </div>
              )}

              {/* Message */}
              {profileMessage && (
                <div
                  className={`p-4 rounded-lg flex items-center gap-3 ${
                    profileMessage.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {profileMessage.type === 'success' ? (
                    <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <XMarkIcon className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium">{profileMessage.text}</span>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

