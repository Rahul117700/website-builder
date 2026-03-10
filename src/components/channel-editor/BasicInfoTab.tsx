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
  const [imageKey, setImageKey] = useState(0);

  const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (!url.startsWith('/')) return `/${url}`;
    return url;
  };

  const requirements = useMemo(() => {
    return [
      { id: 'name', label: 'Channel Name', required: true, completed: channel.name && channel.name.length >= 3 },
      { id: 'description', label: 'Description', required: false, recommended: true, completed: channel.description && channel.description.length > 0 },
      { id: 'welcomeMessage', label: 'Welcome Message', required: false, recommended: true, completed: channel.welcomeMessage && channel.welcomeMessage.length > 0 },
      { id: 'coverImage', label: 'Cover Image', required: false, recommended: true, completed: !!channel.coverImage },
      { id: 'profileImage', label: 'Profile Image', required: false, recommended: true, completed: !!channel.profileImage },
    ];
  }, [channel]);

  const progressPercentage = useMemo(() => {
    const totalWeight = requirements.reduce((sum, req) => sum + (req.required ? 2 : 1), 0);
    const completedWeight = requirements.reduce((sum, req) => sum + (req.completed ? (req.required ? 2 : 1) : 0), 0);
    return Math.round((completedWeight / totalWeight) * 100);
  }, [requirements]);

  const canPublish = useMemo(() => requirements.filter((r) => r.required).every((r) => r.completed), [requirements]);

  const handleImageUpload = async (file: File, type: 'cover' | 'profile') => {
    const setUploading = type === 'cover' ? setUploadingCover : setUploadingProfile;
    try {
      setUploading(true);
      if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
      if (file.size > 50 * 1024 * 1024) { toast.error('Image size should be less than 50MB'); return; }

      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || 'Upload failed');

      let imageUrl = data.url;
      if (imageUrl.startsWith('/public')) imageUrl = imageUrl.replace('/public', '');
      if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) imageUrl = `/${imageUrl}`;

      await new Promise(resolve => setTimeout(resolve, 300));

      const verifyImage = (url: string): Promise<boolean> => {
        return new Promise((resolve) => {
          const img = new Image();
          let resolved = false;
          img.onload = () => { if (!resolved) { resolved = true; resolve(true); } };
          img.onerror = () => { if (!resolved) { resolved = true; resolve(false); } };
          setTimeout(() => { if (!resolved) { resolved = true; resolve(false); } }, 3000);
          const cacheBuster = `?v=${Date.now()}`;
          img.src = url + (url.includes('?') ? '&' : '?') + cacheBuster.replace('?', '');
        });
      };

      const isAccessible = await verifyImage(imageUrl);
      if (!isAccessible) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const retryAccessible = await verifyImage(imageUrl);
        if (!retryAccessible) {
          toast('Image uploaded but may take a moment to appear', { icon: '⚠️', duration: 3000 });
        }
      }

      if (type === 'cover') { onUpdate({ coverImage: imageUrl }); }
      else { onUpdate({ profileImage: imageUrl }); }
      setImageKey(prev => prev + 1);
      if (isAccessible) toast.success('Image uploaded successfully!');
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
        <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">
          Channel Name
        </label>
        <input
          type="text"
          value={channel.name || ''}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Enter your channel name"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base text-white bg-white/5 placeholder-gray-600 touch-manipulation"
        />
        {channel.name && channel.name.length >= 3 && (
          <p className="text-xs text-green-500 mt-1.5 flex items-center gap-1">
            <CheckCircleIcon className="h-3 w-3" />
            Looks good!
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">
          Description
        </label>
        <textarea
          value={channel.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Brief description of your channel"
          rows={3}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base text-white resize-none bg-white/5 placeholder-gray-600 touch-manipulation"
        />
        <p className="text-xs text-gray-500 mt-1">
          {channel.description?.length || 0}/200 characters
        </p>
      </div>

      {/* Welcome Message */}
      <div>
        <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">
          Welcome Message
        </label>
        <textarea
          value={channel.welcomeMessage || ''}
          onChange={(e) => onUpdate({ welcomeMessage: e.target.value })}
          placeholder="Greet your visitors"
          rows={4}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base text-white resize-none bg-white/5 placeholder-gray-600 touch-manipulation"
        />
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">
          Cover Image
        </label>
        {channel.coverImage ? (
          <div className="relative rounded-lg overflow-hidden border border-white/10 group">
            <img
              src={`${getImageUrl(channel.coverImage)}${getImageUrl(channel.coverImage).includes('?') ? '&' : '?'}v=${imageKey}&t=${Date.now()}`}
              alt="Cover"
              className="w-full h-32 object-cover"
              key={`cover-${channel.coverImage}-${imageKey}`}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                const imageUrl = getImageUrl(channel.coverImage);
                if (imageUrl && !imageUrl.startsWith('http')) {
                  const absoluteUrl = typeof window !== 'undefined' ? `${window.location.origin}${imageUrl}` : imageUrl;
                  img.src = `${absoluteUrl}${absoluteUrl.includes('?') ? '&' : '?'}v=${imageKey}&t=${Date.now()}`;
                } else if (imageUrl.startsWith('http')) {
                  img.src = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}v=${imageKey}&t=${Date.now()}`;
                }
              }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <label className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white/20 text-white rounded-lg text-xs sm:text-sm font-medium cursor-pointer hover:bg-white/30 active:scale-95 touch-manipulation min-h-[44px] flex items-center">
                Change
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')} className="hidden" />
              </label>
              <button onClick={() => onUpdate({ coverImage: null })} className="px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-red-700 active:scale-95 touch-manipulation min-h-[44px] flex items-center">
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className="block w-full border-2 border-dashed border-white/10 rounded-lg p-6 sm:p-8 text-center hover:border-white/20 hover:bg-white/5 transition-colors cursor-pointer bg-transparent touch-manipulation">
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')} className="hidden" disabled={uploadingCover} />
            {uploadingCover ? (
              <div className="flex flex-col items-center gap-2">
                <CloudArrowUpIcon className="h-10 w-10 text-gray-500 animate-pulse" />
                <span className="text-sm text-gray-500">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <PhotoIcon className="h-10 w-10 text-gray-500" />
                <span className="text-sm text-gray-400">Click to upload cover</span>
                <span className="text-xs text-gray-600">1200x400px recommended</span>
              </div>
            )}
          </label>
        )}
      </div>

      {/* Profile Image */}
      <div>
        <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">
          Profile Image
        </label>
        <div className="flex items-center gap-3 sm:gap-4">
          {channel.profileImage ? (
            <div className="relative group flex-shrink-0">
              <img
                src={`${getImageUrl(channel.profileImage)}${getImageUrl(channel.profileImage).includes('?') ? '&' : '?'}v=${imageKey}&t=${Date.now()}`}
                alt="Profile"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white/10"
                key={`profile-${channel.profileImage}-${imageKey}`}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  const imageUrl = getImageUrl(channel.profileImage);
                  if (imageUrl && !imageUrl.startsWith('http')) {
                    const absoluteUrl = typeof window !== 'undefined' ? `${window.location.origin}${imageUrl}` : imageUrl;
                    img.src = `${absoluteUrl}${absoluteUrl.includes('?') ? '&' : '?'}v=${imageKey}&t=${Date.now()}`;
                  } else if (imageUrl.startsWith('http')) {
                    img.src = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}v=${imageKey}&t=${Date.now()}`;
                  }
                }}
              />
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-center justify-center">
                <label className="px-3 py-2 bg-white/20 text-white rounded-lg text-xs font-medium cursor-pointer active:scale-95 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center">
                  Edit
                  <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'profile')} className="hidden" />
                </label>
              </div>
            </div>
          ) : (
            <label className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-dashed border-white/10 rounded-full flex items-center justify-center hover:border-white/20 hover:bg-white/5 transition-colors cursor-pointer flex-shrink-0 bg-transparent touch-manipulation">
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'profile')} className="hidden" disabled={uploadingProfile} />
              {uploadingProfile ? (
                <CloudArrowUpIcon className="h-8 w-8 text-gray-500 animate-spin" />
              ) : (
                <PhotoIcon className="h-8 w-8 text-gray-500" />
              )}
            </label>
          )}
          <div className="text-xs text-gray-500">
            <p className="font-medium mb-0.5 text-gray-400">Square image recommended</p>
            <p className="text-gray-600">200x200px, JPG or PNG</p>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Completion</span>
          <span className="text-lg font-bold text-purple-400">{progressPercentage}%</span>
        </div>
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        {channel.published ? (
          <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1 font-bold">
            <CheckCircleIcon className="h-3.5 w-3.5" />
            Channel is Live
          </p>
        ) : canPublish && (
          <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
            <CheckCircleIcon className="h-3.5 w-3.5" />
            Ready to launch!
          </p>
        )}
      </div>

      {/* Tip */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
        <p className="text-xs font-medium text-indigo-300 mb-1">💡 Channel Tip</p>
        <p className="text-xs text-indigo-400">
          Complete all fields for maximum visibility. Channels with complete info get 3x more engagement!
        </p>
      </div>
    </div>
  );
}
