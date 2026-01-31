'use client';

import { Fragment, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message?: string;
  children?: React.ReactNode;
  type?: 'info' | 'warning' | 'error' | 'success' | 'confirm' | 'custom';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  children,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
  size = 'lg'
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning':
      case 'confirm':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'custom':
        return null;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-600" />;
    }
  };

  const getIconBgColor = () => {
    switch (type) {
      case 'warning':
      case 'confirm':
        return 'bg-yellow-100';
      case 'error':
        return 'bg-red-100';
      case 'success':
        return 'bg-green-100';
      case 'custom':
        return '';
      default:
        return 'bg-blue-100';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'sm:max-w-sm';
      case 'md': return 'sm:max-w-md';
      case 'lg': return 'sm:max-w-lg';
      case 'xl': return 'sm:max-w-xl';
      case '2xl': return 'sm:max-w-2xl';
      case '3xl': return 'sm:max-w-4xl';
      case 'full': return 'sm:max-w-[95%] sm:h-[90vh]';
      default: return 'sm:max-w-lg';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
          onClick={onClose}
        ></div>

        <div className={`relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full ${getSizeClass()} animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300 flex flex-col`}>
          <div className={`bg-white px-6 pb-6 pt-6 sm:p-8 flex-1 overflow-y-auto ${size === 'full' ? 'min-h-0' : ''}`}>
            <div className="sm:flex sm:items-start">
              {type !== 'custom' && (
                <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${getIconBgColor()} sm:mx-0 sm:h-12 sm:w-12`}>
                  {getIcon()}
                </div>
              )}
              <div className={`mt-3 text-center sm:mt-0 sm:text-left flex-1 ${type !== 'custom' ? 'sm:ml-6' : ''}`}>
                <h3 className="text-2xl font-black leading-tight text-gray-900 tracking-tight" id="modal-title">
                  {title}
                </h3>
                <div className="mt-4 text-left">
                  {children ? children : (
                    <p className="text-base text-gray-600 leading-relaxed">
                      {message}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all hover:rotate-90 duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {(onConfirm || showCancel || type === 'confirm') && (
            <div className="bg-gray-50/50 px-6 py-4 sm:flex sm:flex-row-reverse sm:px-8 gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleConfirm}
                className={`inline-flex w-full justify-center rounded-xl px-6 py-2.5 text-sm font-black text-white shadow-lg sm:w-auto transition-all hover:scale-105 active:scale-95 ${type === 'error' || type === 'confirm'
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                  : type === 'warning'
                    ? 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-200'
                    : type === 'success'
                      ? 'bg-green-600 hover:bg-green-700 shadow-green-200'
                      : 'bg-gray-900 hover:bg-black shadow-gray-200'
                  }`}
              >
                {confirmText}
              </button>
              {(showCancel || type === 'confirm') && (
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-all"
                >
                  {cancelText}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
