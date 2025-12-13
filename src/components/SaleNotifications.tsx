'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import saleNotificationsData from '@/data/sale-notifications.json';

interface SaleNotification {
  id: number;
  name: string;
  product: string;
  amount: number;
  location: string;
  time: string;
  avatar: string;
}

export default function SaleNotifications() {
  const [currentNotification, setCurrentNotification] = useState<SaleNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show first notification after 5 seconds
    const initialTimer = setTimeout(() => {
      showNextNotification();
    }, 5000);

    return () => clearTimeout(initialTimer);
  }, []);

  const showNextNotification = () => {
    // Get random notification from the list
    const randomIndex = Math.floor(Math.random() * saleNotificationsData.length);
    setCurrentNotification(saleNotificationsData[randomIndex] as SaleNotification);
    setIsVisible(true);

    // Hide notification after 8 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 8000);

    // Show next notification after 15-30 seconds (random interval)
    const nextTimer = setTimeout(() => {
      showNextNotification();
    }, Math.random() * 15000 + 15000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && currentNotification && (
        <motion.div
          initial={{ opacity: 0, x: -100, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -100, scale: 0.95 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.34, 1.56, 0.64, 1]
          }}
          className="fixed bottom-6 left-6 z-50 max-w-sm"
        >
          <div className="relative bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-gray-200/60 overflow-hidden">
            {/* Minimal accent */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gray-900"></div>
            
            {/* Main Content */}
            <div className="pl-5 pr-3 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Someone just earned
                    </p>
                  </div>

                  {/* Seller Info */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-[10px]">{currentNotification.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {currentNotification.name}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {currentNotification.location}
                      </p>
                    </div>
                  </div>

                  {/* Product & Amount */}
                  <div className="pl-10">
                    <p className="text-xs text-gray-600 mb-1.5 truncate">
                      {currentNotification.product}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="bg-gray-900 text-white px-2.5 py-1 rounded-md">
                        <span className="text-xs font-bold">₹{currentNotification.amount.toLocaleString()}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{currentNotification.time}</span>
                    </div>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 hover:bg-gray-100 rounded"
                  aria-label="Close notification"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
