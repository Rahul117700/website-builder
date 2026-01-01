'use client';

import { useState, useMemo } from 'react';
import { 
  PhotoIcon, 
  CloudArrowUpIcon,
  CheckCircleIcon,
  XMarkIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface BasicInfoTabProps {
  channel: any;
  onUpdate: (updates: Partial<any>) => void;
}

export default function BasicInfoTab({ channel, onUpdate }: BasicInfoTabProps) {
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [imageKey, setImageKey] = useState(0); // Force re-render of images

  // Calculate completion progress
  const requirements = useMemo(() => {
    return [
      {
        id: 'name',
        label: 'Channel Name',
        required: true,
        completed: channel.name && channel.name.length >= 3,
      },
      {
        id: 'description',
        label: 'Description',
        required: false,
        recommended: true,
        completed: channel.description && channel.description.length > 0,
      },
      {
        id: 'welcomeMessage',
        label: 'Welcome Message',
        required: false,
        recommended: true,
        completed: channel.welcomeMessage && channel.welcomeMessage.length > 0,
      },
      {
        id: 'coverImage',
        label: 'Cover Image',
        required: false,
        recommended: true,
        completed: !!channel.coverImage,
      },
      {
        id: 'profileImage',
        label: 'Profile Image',
        required: false,
        recommended: true,
        completed: !!channel.profileImage,
      },
    ];
  }, [channel]);

  const progressPercentage = useMemo(() => {
    const totalWeight = requirements.reduce((sum, req) => sum + (req.required ? 2 : 1), 0);
    const completedWeight = requirements.reduce(
      (sum, req) => sum + (req.completed ? (req.required ? 2 : 1) : 0),
      0
    );
    return Math.round((completedWeight / totalWeight) * 100);
  }, [requirements]);

  const canPublish = useMemo(() => {
    return requirements.filter((r) => r.required).every((r) => r.completed);
  }, [requirements]);

  const handleImageUpload = async (file: File, type: 'cover' | 'profile') => {
    const setUploading = type === 'cover' ? setUploadingCover : setUploadingProfile;
    
    try {
      setUploading(true);

      // Validate file
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      // Ensure URL doesn't have /public prefix
      let imageUrl = data.url;
      if (imageUrl.startsWith('/public')) {
        imageUrl = imageUrl.replace('/public', '');
      }

      // Verify the image URL is correct
      console.log('Uploaded image URL:', imageUrl);
      
      // Immediately update channel with the image URL (don't wait for preload)
      if (type === 'cover') {
        onUpdate({ coverImage: imageUrl });
        setImageKey(prev => prev + 1); // Force image re-render
      } else {
        onUpdate({ profileImage: imageUrl });
        setImageKey(prev => prev + 1); // Force image re-render
      }

      // Verify image is accessible
      const img = new Image();
      img.onload = () => {
        console.log('Image verified and loaded:', imageUrl);
        toast.success('Image uploaded successfully!');
      };
      img.onerror = () => {
        console.error('Image verification failed:', imageUrl);
        toast.error('Image uploaded but may not display correctly. Please check the file.');
      };
      img.src = imageUrl; // Start loading the image for verification
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 py-1">
      {/* Channel Name */}
      <div>
        <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">
          Channel Name
        </label>
        <input
          type="text"
          value={channel.name || ''}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Enter your channel name"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm sm:text-base text-gray-900 bg-white touch-manipulation"
        />
        {channel.name && channel.name.length >= 3 && (
          <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
            <CheckCircleIcon className="h-3 w-3" />
            Looks good!
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">
          Description
        </label>
        <textarea
          value={channel.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Brief description of your channel"
          rows={3}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm sm:text-base text-gray-900 resize-none bg-white touch-manipulation"
        />
        <p className="text-xs text-gray-500 mt-1">
          {channel.description?.length || 0}/200 characters
        </p>
      </div>

      {/* Welcome Message */}
      <div>
        <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">
          Welcome Message
        </label>
        <textarea
          value={channel.welcomeMessage || ''}
          onChange={(e) => onUpdate({ welcomeMessage: e.target.value })}
          placeholder="Greet your visitors"
          rows={4}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm sm:text-base text-gray-900 resize-none bg-white touch-manipulation"
        />
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">
          Cover Image
        </label>
        {channel.coverImage ? (
          <div className="relative rounded-lg overflow-hidden border border-gray-300 group">
            <img
              src={channel.coverImage}
              alt="Cover"
              className="w-full h-32 object-cover"
              key={`cover-${channel.coverImage}-${imageKey}`} // Force re-render when URL changes or key updates
              onError={(e) => {
                console.error('Failed to load cover image:', channel.coverImage);
                toast.error('Failed to load cover image. Please try uploading again.');
              }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-center justify-center gap-2 sm:group-hover:opacity-100">
              <label className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-gray-900 rounded-lg text-xs sm:text-sm font-medium cursor-pointer hover:bg-gray-100 active:scale-95 touch-manipulation min-h-[44px] flex items-center">
                Change
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => onUpdate({ coverImage: null })}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-red-700 active:scale-95 touch-manipulation min-h-[44px] flex items-center"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer bg-white touch-manipulation">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')}
              className="hidden"
              disabled={uploadingCover}
            />
            {uploadingCover ? (
              <div className="flex flex-col items-center gap-2">
                <CloudArrowUpIcon className="h-10 w-10 text-gray-400 animate-pulse" />
                <span className="text-sm text-gray-600">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <PhotoIcon className="h-10 w-10 text-gray-400" />
                <span className="text-sm text-gray-700">Click to upload cover</span>
                <span className="text-xs text-gray-500">1200x400px recommended</span>
              </div>
            )}
          </label>
        )}
      </div>

      {/* Profile Image */}
      <div>
        <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">
          Profile Image
        </label>
        <div className="flex items-center gap-3 sm:gap-4">
          {channel.profileImage ? (
            <div className="relative group flex-shrink-0">
              <img
                src={channel.profileImage}
                alt="Profile"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-300 bg-white"
                key={`profile-${channel.profileImage}-${imageKey}`} // Force re-render when URL changes or key updates
                onError={(e) => {
                  console.error('Failed to load profile image:', channel.profileImage);
                  toast.error('Failed to load profile image. Please try uploading again.');
                }}
              />
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-center justify-center sm:group-hover:opacity-100">
                <label className="px-3 py-2 bg-white text-gray-900 rounded-lg text-xs font-medium cursor-pointer active:scale-95 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center">
                  Edit
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'profile')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <label className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer flex-shrink-0 bg-white touch-manipulation">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'profile')}
                className="hidden"
                disabled={uploadingProfile}
              />
              {uploadingProfile ? (
                <CloudArrowUpIcon className="h-8 w-8 text-gray-400 animate-spin" />
              ) : (
                <PhotoIcon className="h-8 w-8 text-gray-400" />
              )}
            </label>
          )}
          <div className="text-xs text-gray-600">
            <p className="font-medium mb-0.5">Square image recommended</p>
            <p className="text-gray-500">200x200px, JPG or PNG</p>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">Completion</span>
          <span className="text-lg font-bold text-purple-600">{progressPercentage}%</span>
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        {canPublish && (
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <CheckCircleIcon className="h-3.5 w-3.5" />
            Ready to publish!
          </p>
        )}
      </div>

      {/* Tip */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <p className="text-xs font-medium text-purple-900 mb-1">💡 Channel Tip</p>
        <p className="text-xs text-purple-800">
          Complete all fields for maximum visibility. Channels with complete info get 3x more engagement!
        </p>
      </div>
    </div>
  );
}
