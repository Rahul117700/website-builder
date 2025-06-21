'use client';

import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { CreateSiteInput, TemplateType } from '@/types';

interface CreateSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSite: (site: CreateSiteInput) => Promise<void>;
}

export default function CreateSiteModal({ isOpen, onClose, onCreateSite }: CreateSiteModalProps) {
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState<TemplateType>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subdomainError, setSubdomainError] = useState('');
  const [subdomainAvailable, setSubdomainAvailable] = useState(false);
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setSubdomain('');
      setDescription('');
      setTemplate('general');
      setSubdomainError('');
      setSubdomainAvailable(false);
    }
  }, [isOpen]);

  const handleSubdomainChange = (value: string) => {
    // Convert to lowercase and remove special characters
    const formatted = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubdomain(formatted);

    if (formatted) {
      checkSubdomainAvailability(formatted);
    } else {
      setSubdomainError('');
      setSubdomainAvailable(false);
    }
  };

  const checkSubdomainAvailability = async (subdomain: string) => {
    if (subdomain.length < 3) {
      setSubdomainError('Subdomain must be at least 3 characters');
      setSubdomainAvailable(false);
      return;
    }

    try {
      setIsCheckingSubdomain(true);
      const response = await fetch(`/api/check-subdomain?subdomain=${subdomain}`);
      const data = await response.json();

      if (data.available) {
        setSubdomainError('');
        setSubdomainAvailable(true);
      } else {
        setSubdomainError('This subdomain is already taken');
        setSubdomainAvailable(false);
      }
    } catch (error) {
      console.error('Error checking subdomain:', error);
      setSubdomainError('Error checking subdomain availability');
    } finally {
      setIsCheckingSubdomain(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !subdomain || !template) {
      return;
    }

    if (!subdomainAvailable) {
      setSubdomainError('Please choose an available subdomain');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      await onCreateSite({
        name,
        subdomain,
        description: description || null,
        template,
        userId: session.user.id as string,
        customDomain: null,
        logo: null,
        favicon: null,
        googleAnalyticsId: null,
      });
    } catch (error) {
      console.error('Error creating site:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-slate-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-slate-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                      Create a New Website
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Fill out the form below to create your new website. You can customize it further after creation.
                      </p>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <div>
                    <label htmlFor="name" className="label">
                      Website Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field mt-1"
                      placeholder="My Awesome Website"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="subdomain" className="label">
                      Subdomain
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        id="subdomain"
                        name="subdomain"
                        value={subdomain}
                        onChange={(e) => handleSubdomainChange(e.target.value)}
                        className={`input-field rounded-r-none ${
                          subdomainError ? 'ring-red-500' : subdomainAvailable && subdomain ? 'ring-green-500' : ''
                        }`}
                        placeholder="mysite"
                        required
                      />
                      <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-3 text-gray-500 dark:text-gray-400 sm:text-sm">
                        .example.com
                      </span>
                    </div>
                    {isCheckingSubdomain && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Checking availability...</p>
                    )}
                    {subdomainError && <p className="mt-1 text-sm text-red-600 dark:text-red-500">{subdomainError}</p>}
                    {subdomainAvailable && subdomain && !isCheckingSubdomain && (
                      <p className="mt-1 text-sm text-green-600 dark:text-green-500">Subdomain is available!</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="label">
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="input-field mt-1"
                      rows={3}
                      placeholder="Describe your website"
                    />
                  </div>

                  <div>
                    <label htmlFor="template" className="label">
                      Template
                    </label>
                    <select
                      id="template"
                      name="template"
                      value={template}
                      onChange={(e) => setTemplate(e.target.value as TemplateType)}
                      className="input-field mt-1"
                      required
                    >
                      <option value="general">General Business</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="pharma">Pharmacy</option>
                    </select>
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting || !subdomainAvailable || !name || !subdomain}
                      className="btn-primary sm:col-start-2"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                          Creating...
                        </span>
                      ) : (
                        'Create Website'
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary mt-3 sm:col-start-1 sm:mt-0"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
