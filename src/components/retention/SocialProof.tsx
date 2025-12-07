'use client';

import { useState, useEffect } from 'react';
import { UserGroupIcon, FireIcon, StarIcon } from '@heroicons/react/24/solid';

interface SocialProofItem {
  id: string;
  type: 'sale' | 'signup' | 'review';
  message: string;
  location?: string;
  time: string;
}

/**
 * Social Proof Component
 * Shows real-time activity to create FOMO and encourage signups
 * HIDDEN ON MOBILE to prevent obstruction of checkout form
 */
export default function SocialProof() {
  const [items, setItems] = useState<SocialProofItem[]>([]);

  useEffect(() => {
    // Generate realistic social proof items
    const generateSocialProof = () => {
      const names = ['Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'John', 'Priya', 'Raj', 'Anita', 'Alex'];
      const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai'];
      const products = ['Digital Course', 'Ebook', 'Video Series', 'Software', 'Template Pack'];

      const newItems: SocialProofItem[] = [
        {
          id: '1',
          type: 'sale',
          message: `${names[Math.floor(Math.random() * names.length)]} just made a sale!`,
          location: locations[Math.floor(Math.random() * locations.length)],
          time: '2 minutes ago',
        },
        {
          id: '2',
          type: 'signup',
          message: `${names[Math.floor(Math.random() * names.length)]} joined the platform`,
          location: locations[Math.floor(Math.random() * locations.length)],
          time: '5 minutes ago',
        },
        {
          id: '3',
          type: 'review',
          message: `${names[Math.floor(Math.random() * names.length)]} left a 5-star review`,
          time: '10 minutes ago',
        },
      ];

      setItems(newItems);
    };

    // Initial load
    generateSocialProof();

    // Update every 30 seconds
    const interval = setInterval(() => {
      generateSocialProof();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="hidden @md:block fixed bottom-4 left-4 z-[9996] bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <FireIcon className="h-4 w-4 text-orange-500" />
        <span className="text-xs font-bold text-gray-900">Live Activity</span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-2 text-xs">
            <div className="flex-shrink-0 mt-0.5">
              {item.type === 'sale' && <FireIcon className="h-3 w-3 text-green-500" />}
              {item.type === 'signup' && <UserGroupIcon className="h-3 w-3 text-blue-500" />}
              {item.type === 'review' && <StarIcon className="h-3 w-3 text-yellow-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-700 leading-tight">{item.message}</p>
              {item.location && (
                <p className="text-gray-500 text-[10px] mt-0.5">
                  {item.location} • {item.time}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-gray-200">
        <p className="text-[10px] text-gray-500 text-center">
          Join <strong className="text-purple-600">10,000+</strong> creators already selling
        </p>
      </div>
    </div>
  );
}
