'use client';

import { useEffect, useRef } from 'react';

interface NotificationSoundProps {
  play: boolean;
  onPlay?: () => void;
}

export default function NotificationSound({ play, onPlay }: NotificationSoundProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (play && audioRef.current) {
      console.log('Playing notification sound');
      
      // Reset audio to beginning
      audioRef.current.currentTime = 0;
      
      // Try to play the sound
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Notification sound played successfully');
            onPlay?.();
          })
          .catch(error => {
            console.error('Audio playback failed:', error);
            // This is normal in some browsers that require user interaction first
            onPlay?.();
          });
      } else {
        onPlay?.();
      }
    }
  }, [play, onPlay]);

  return (
    <audio
      ref={audioRef}
      src="/sound/notification.mp3"
      preload="auto"
      style={{ display: 'none' }}
      onError={(e) => {
        console.error('Audio error:', e);
        console.log('Make sure you have a notification.mp3 file in /public/sound/ directory');
      }}
      onLoadStart={() => console.log('Loading notification sound...')}
      onCanPlay={() => console.log('Notification sound ready to play')}
    />
  );
} 