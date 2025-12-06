'use client';

import { Fragment } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false
}: ModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning':
      case 'confirm':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
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
      default:
        return 'bg-blue-100';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${getIconBgColor()} sm:mx-0 sm:h-10 sm:w-10`}>
                {getIcon()}
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {message}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              className={`inline-flex w-full justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm sm:w-auto ${
                type === 'error' || type === 'confirm'
                  ? 'bg-red-600 hover:bg-red-700'
                  : type === 'warning'
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : type === 'success'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {confirmText}
            </button>
            {(showCancel || type === 'confirm') && (
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                {cancelText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

