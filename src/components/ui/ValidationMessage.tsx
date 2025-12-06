'use client';

import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface ValidationMessageProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string | React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export default function ValidationMessage({
  type,
  title,
  message,
  actions,
  dismissible = false,
  onDismiss,
  className = ''
}: ValidationMessageProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getContainerClasses = () => {
    switch (type) {
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

  const getTitleClasses = () => {
    switch (type) {
      case 'success':
        return 'text-green-900 font-semibold';
      case 'warning':
        return 'text-yellow-900 font-semibold';
      case 'error':
        return 'text-red-900 font-semibold';
      default:
        return 'text-blue-900 font-semibold';
    }
  };

  const getActionButtonClasses = (variant: 'primary' | 'secondary' = 'primary') => {
    const baseClasses = 'px-3 py-1.5 text-sm font-medium rounded-md transition-colors';
    
    switch (type) {
      case 'success':
        return variant === 'primary' 
          ? `${baseClasses} bg-green-600 text-white hover:bg-green-700`
          : `${baseClasses} bg-green-100 text-green-700 hover:bg-green-200`;
      case 'warning':
        return variant === 'primary'
          ? `${baseClasses} bg-yellow-600 text-white hover:bg-yellow-700`
          : `${baseClasses} bg-yellow-100 text-yellow-700 hover:bg-yellow-200`;
      case 'error':
        return variant === 'primary'
          ? `${baseClasses} bg-red-600 text-white hover:bg-red-700`
          : `${baseClasses} bg-red-100 text-red-700 hover:bg-red-200`;
      default:
        return variant === 'primary'
          ? `${baseClasses} bg-blue-600 text-white hover:bg-blue-700`
          : `${baseClasses} bg-blue-100 text-blue-700 hover:bg-blue-200`;
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getContainerClasses()} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1">
          {title && (
            <h4 className={`text-sm mb-2 ${getTitleClasses()}`}>
              {title}
            </h4>
          )}
          <div className="text-sm leading-relaxed">
            {message}
          </div>
          {actions && actions.length > 0 && (
            <div className="flex gap-2 mt-3">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={getActionButtonClasses(action.variant)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircleIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Field validation indicator
interface FieldValidationProps {
  isValid?: boolean;
  error?: string;
  warning?: string;
  success?: string;
  className?: string;
}

export function FieldValidation({ isValid, error, warning, success, className = '' }: FieldValidationProps) {
  if (!error && !warning && !success) return null;

  const getMessage = () => {
    if (error) return { type: 'error' as const, message: error };
    if (warning) return { type: 'warning' as const, message: warning };
    if (success) return { type: 'success' as const, message: success };
    return null;
  };

  const message = getMessage();
  if (!message) return null;

  return (
    <div className={`mt-1 ${className}`}>
      <ValidationMessage
        type={message.type}
        message={message.message}
        className="py-2 px-3 text-xs"
      />
    </div>
  );
}
