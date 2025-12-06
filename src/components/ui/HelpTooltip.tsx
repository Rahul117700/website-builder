'use client';

import { useState } from 'react';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface HelpTooltipProps {
  content: string | React.ReactNode;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  trigger?: 'hover' | 'click';
  className?: string;
}

export default function HelpTooltip({ 
  content, 
  title, 
  position = 'top', 
  size = 'md',
  trigger = 'hover',
  className = ''
}: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-xs text-xs p-2';
      case 'lg':
        return 'max-w-md text-sm p-4';
      default:
        return 'max-w-sm text-sm p-3';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="cursor-help"
      >
        <InformationCircleIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
      </div>

      {isVisible && (
        <div
          className={`absolute z-50 ${getPositionClasses()} ${getSizeClasses()} bg-gray-800 text-white rounded-lg shadow-xl border border-gray-700`}
        >
          <div className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`}></div>
          
          {title && (
            <div className="font-semibold mb-2 text-white">
              {title}
            </div>
          )}
          
          <div className="text-gray-200">
            {content}
          </div>

          {trigger === 'click' && (
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Helper component for contextual help sections
interface HelpSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

export function HelpSection({ title, children, icon, variant = 'info' }: HelpSectionProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getVariantClasses()} mb-4`}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-2">{title}</h4>
          <div className="text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Progress indicator component
interface ProgressStepProps {
  steps: Array<{
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    current?: boolean;
  }>;
  className?: string;
}

export function ProgressSteps({ steps, className = '' }: ProgressStepProps) {
  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step.completed
                    ? 'bg-green-500 text-white'
                    : step.current
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.completed ? '✓' : index + 1}
              </div>
              <div className="mt-2 text-center">
                <div className="text-xs font-medium text-gray-900">{step.title}</div>
                {step.description && (
                  <div className="text-xs text-gray-500 mt-1">{step.description}</div>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${
                  step.completed ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
