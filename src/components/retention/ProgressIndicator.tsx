'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

/**
 * Progress Indicator
 * Shows user progress and achievements to encourage engagement
 */
export default function ProgressIndicator() {
  const [progress, setProgress] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newProgress = Math.min(100, Math.max(0, (scrollTop / (documentHeight - windowHeight)) * 100));
      setProgress(newProgress);

      // Unlock achievements
      if (newProgress >= 25 && !achievements.includes('explorer')) {
        setAchievements((prev) => [...prev, 'explorer']);
      }
      if (newProgress >= 50 && !achievements.includes('dedicated')) {
        setAchievements((prev) => [...prev, 'dedicated']);
      }
      if (newProgress >= 75 && !achievements.includes('enthusiast')) {
        setAchievements((prev) => [...prev, 'enthusiast']);
      }
      if (newProgress >= 100 && !achievements.includes('completionist')) {
        setAchievements((prev) => [...prev, 'completionist']);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [achievements]);

  if (progress === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[9997] bg-white rounded-lg shadow-lg p-3 border border-gray-200 min-w-[200px]">
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-700">Reading Progress</span>
          <span className="text-xs font-bold text-purple-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      {achievements.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-1">Achievements:</p>
          <div className="space-y-1">
            {achievements.map((achievement) => (
              <div key={achievement} className="flex items-center gap-1 text-xs text-gray-600">
                <CheckCircleIcon className="h-3 w-3 text-green-500" />
                <span className="capitalize">{achievement}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

