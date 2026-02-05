'use client';

import { useState, useRef, useEffect } from 'react';
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  LockClosedIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';
import OptimizedMediaLoader from './ui/OptimizedMediaLoader';

interface VideoPreviewPlayerProps {
  videoUrl: string;
  previewDuration?: number; // Duration in seconds (default 60 = 1 minute)
  isPaid?: boolean;
  onPaymentRequired?: () => void;
  productName?: string;
  productPrice?: number;
  currency?: string;
}

export default function VideoPreviewPlayer({
  videoUrl,
  previewDuration = 60, // 1 minute default
  isPaid = false,
  onPaymentRequired,
  productName = 'this video',
  productPrice = 0,
  currency = 'INR'
}: VideoPreviewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      setCurrentTime(current);

      // Check if preview limit is reached (only for non-paid users)
      if (!isPaid && current >= previewDuration) {
        video.pause();
        setIsPlaying(false);
        setShowPaymentPrompt(true);
        setHasReachedLimit(true);

        // Reset video to preview limit
        video.currentTime = previewDuration;
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleCanPlay = () => setIsBuffering(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [previewDuration, isPaid]);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (hasReachedLimit && !isPaid) {
      setShowPaymentPrompt(true);
      return;
    }

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);

    // Prevent seeking beyond preview limit for non-paid users
    if (!isPaid && newTime > previewDuration) {
      return;
    }

    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMaxSeekTime = () => {
    if (isPaid) return duration;
    return Math.min(previewDuration, duration);
  };

  return (
    <div className="relative w-full">
      {/* Video Player Container */}
      <OptimizedMediaLoader type="video" className="rounded-lg">
        <div className="relative bg-black w-full h-full overflow-hidden shadow-2xl">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full aspect-video"
            onClick={togglePlay}
            preload="metadata"
          />

          {/* Buffering Spinner */}
          {isBuffering && isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
              <ArrowPathIcon className="w-12 h-12 text-white animate-spin opacity-70" />
            </div>
          )}

          {/* Payment Prompt Overlay */}
          {showPaymentPrompt && !isPaid && (
            <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-20">
              <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LockClosedIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Unlock Full Video
                </h3>
                <p className="text-gray-600 mb-6">
                  You've watched the free 1-minute preview of {productName}.
                  Purchase now to watch the complete video.
                </p>
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Full Video Access</p>
                  <p className="text-4xl font-bold text-purple-600">
                    {currency} {productPrice?.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowPaymentPrompt(false);
                      if (onPaymentRequired) onPaymentRequired();
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    Purchase Full Access
                  </button>
                  <button
                    onClick={() => setShowPaymentPrompt(false)}
                    className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all"
                  >
                    Continue Preview
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preview Limit Indicator */}
          {!isPaid && (
            <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10 shadow-lg">
              Preview: {formatTime(Math.max(0, previewDuration - currentTime))} left
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-3">
              <input
                type="range"
                min="0"
                max={getMaxSeekTime()}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-600"
                style={{
                  background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(currentTime / getMaxSeekTime()) * 100}%, #4b5563 ${(currentTime / getMaxSeekTime()) * 100}%, #4b5563 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-300 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{isPaid ? formatTime(duration) : formatTime(previewDuration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors"
                  disabled={hasReachedLimit && !isPaid}
                >
                  {isPlaying ? (
                    <PauseIcon className="h-5 w-5 text-white" />
                  ) : (
                    <PlayIcon className="h-5 w-5 text-white ml-0.5" />
                  )}
                </button>

                {/* Volume */}
                <div className="flex items-center space-x-2">
                  <button onClick={toggleMute} className="text-white hover:text-purple-400 transition-colors">
                    {isMuted ? (
                      <SpeakerXMarkIcon className="h-5 w-5" />
                    ) : (
                      <SpeakerWaveIcon className="h-5 w-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-purple-400 transition-colors"
              >
                <ArrowsPointingOutIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Info Message */}
        {!isPaid && !hasReachedLimit && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <PlayIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-900">Free Preview Available</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Watch the first 1 minute for free. Purchase to unlock the full video.
                </p>
              </div>
            </div>
          </div>
        )}
      </OptimizedMediaLoader>
    </div>
  );
}
