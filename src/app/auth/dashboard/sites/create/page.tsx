'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { PlusIcon, GlobeAltIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { CreateSiteInput, TemplateType } from '@/types';
import toast from 'react-hot-toast';

interface Template {
  id: string;
  name: string;
  slug: string;
  html: string;
  css: string;
  js: string;
  pages: any;
  category: string;
  description: string;
  preview: string;
  price: number;
  createdBy: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
  purchasedAt: string;
}

export default function CreateSitePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams?.get('template') || null;
  
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState<TemplateType>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subdomainError, setSubdomainError] = useState('');
  const [subdomainAvailable, setSubdomainAvailable] = useState(false);
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  const BASE_URL = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (templateId) {
      fetchTemplateDetails();
    }
  }, [templateId]);

  const fetchTemplateDetails = async () => {
    if (!templateId) return;
    
    setIsLoadingTemplate(true);
    try {
      console.log('=== TEMPLATE FETCH DEBUG ===');
      console.log('Fetching template details for ID:', templateId);
      const response = await fetch(`/api/templates/${templateId}`);
      
      console.log('Template fetch response status:', response.status);
      console.log('Template fetch response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Template data received:', data);
        console.log('Template data type:', typeof data);
        console.log('Template pages field:', data.pages);
        console.log('Template pages type:', typeof data.pages);
        console.log('Template pages keys:', data.pages ? Object.keys(data.pages) : 'No pages');
        console.log('Template pages structure:', data.pages);
        
        // Validate the template data structure
        if (!data.pages || typeof data.pages !== 'object') {
          console.error('Template data is invalid - missing or malformed pages field');
          toast.error('Template data is incomplete. Please try again or contact support.');
          return;
        }
        
        const pageKeys = Object.keys(data.pages);
        if (pageKeys.length === 0) {
          console.error('Template has no pages');
          toast.error('Template has no pages. Please try again or contact support.');
          return;
        }
        
        console.log(`Template validation passed. Found ${pageKeys.length} pages: ${pageKeys.join(', ')}`);
        console.log('Sample page content:', data.pages[pageKeys[0]]);
        
        setSelectedTemplate(data);
        
        // Map template category to TemplateType enum
        let templateType: TemplateType = 'general';
        if (data.category) {
          const category = data.category.toLowerCase().trim();
          console.log('Processing template category:', category);
          
          // Restaurant/food related categories
          if (['restaurant', 'food', 'dining', 'cafe', 'catering', 'bakery', 'pizzeria', 'bar', 'pub', 'fast-food'].includes(category)) {
            templateType = 'restaurant';
          } 
          // Pharmacy/healthcare related categories
          else if (['pharma', 'pharmacy', 'medical', 'healthcare', 'health', 'medicine', 'drugstore', 'clinic', 'hospital', 'dental', 'optical'].includes(category)) {
            templateType = 'pharma';
          } 
          // General business categories (default)
          else if (['general', 'business', 'corporate', 'portfolio', 'personal', 'blog', 'ecommerce', 'agency', 'consulting', 'education', 'nonprofit'].includes(category)) {
            templateType = 'general';
          }
          // If category doesn't match any known patterns, default to general
          else {
            console.warn(`Unknown template category: "${category}". Defaulting to 'general'.`);
            templateType = 'general';
          }
        } else {
          console.warn('Template has no category. Defaulting to "general".');
        }
        
        setTemplate(templateType);
        
        console.log('Template category mapping:', {
          originalCategory: data.category,
          processedCategory: data.category ? data.category.toLowerCase().trim() : 'none',
          mappedTemplateType: templateType,
          isValidTemplateType: ['general', 'restaurant', 'pharma'].includes(templateType)
        });
        
        // Pre-fill the form with template info
        setName(`${data.name} Website`);
        setDescription(data.description || '');
        
        console.log('=== TEMPLATE FETCH COMPLETE ===');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Template fetch failed:', response.status, errorData);
        toast.error(`Failed to fetch template details: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      toast.error('Failed to fetch template details');
    } finally {
      setIsLoadingTemplate(false);
    }
  };

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
      toast.error('Please fill in all required fields');
      return;
    }

    if (!subdomainAvailable) {
      setSubdomainError('Please choose an available subdomain');
      return;
    }

    // Validate template type before submission
    const validTemplateTypes: TemplateType[] = ['general', 'restaurant', 'pharma'];
    if (!validTemplateTypes.includes(template)) {
      console.error('Invalid template type detected:', template);
      console.log('Falling back to general template type');
      setTemplate('general');
      toast.error('Template type was invalid. Defaulting to general business template.');
      return;
    }

    // If we have a template ID but the template hasn't loaded yet, wait
    if (templateId && !selectedTemplate && isLoadingTemplate) {
      toast.error('Please wait for the template to load before creating the site');
      return;
    }

    // If we have a template ID but no template data, show error
    if (templateId && !selectedTemplate) {
      toast.error('Failed to load template data. Please refresh the page and try again.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const siteData: CreateSiteInput = {
        name,
        subdomain,
        description: description || null,
        template,
        userId: session.user.id as string,
        customDomain: null,
        logo: null,
        favicon: null,
        googleAnalyticsId: null,
      };

      console.log('=== SITE CREATION DEBUG ===');
      console.log('Site data being sent:', siteData);
      console.log('Template type being sent:', template);
      console.log('Template type validation:', {
        isValid: validTemplateTypes.includes(template),
        allowedValues: validTemplateTypes,
        currentValue: template
      });

             // If we have a template, create the site and then apply the template
       if (selectedTemplate) {
         console.log('=== TEMPLATE APPLICATION DEBUG ===');
         console.log('Selected template:', selectedTemplate);
         console.log('Template ID being sent:', selectedTemplate.id);
         console.log('Template pages:', selectedTemplate.pages);
         console.log('Template pages type:', typeof selectedTemplate.pages);
         console.log('Template pages keys:', selectedTemplate.pages ? Object.keys(selectedTemplate.pages) : 'No pages');
         console.log('Sample page content:', selectedTemplate.pages ? Object.values(selectedTemplate.pages)[0] : 'No pages');
         
         // Validate template data before proceeding
         if (!selectedTemplate.pages || typeof selectedTemplate.pages !== 'object') {
           throw new Error('Template data is incomplete. Cannot create site.');
         }
         
         const pageKeys = Object.keys(selectedTemplate.pages);
         if (pageKeys.length === 0) {
           throw new Error('Template has no pages. Cannot create site.');
         }
         
         console.log(`Template validation passed. Found ${pageKeys.length} pages: ${pageKeys.join(', ')}`);
         
         // First create the site
         const createResponse = await fetch('/api/sites', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify(siteData),
         });

         if (!createResponse.ok) {
           const errorData = await createResponse.json();
           console.error('Site creation failed:', errorData);
           throw new Error(errorData.error || 'Failed to create site');
         }

         const newSite = await createResponse.json();
         console.log('Site created successfully:', newSite.id);
         console.log('New site data:', newSite);
         
         // Then apply the template to the new site
         console.log('Applying template to site:', newSite.id);
         console.log('Request body for apply-template:', {
           templateId: selectedTemplate.id,
         });
         
         const applyResponse = await fetch(`/api/sites/${newSite.id}/apply-template`, {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({
             templateId: selectedTemplate.id,
           }),
         });

         console.log('Apply template response status:', applyResponse.status);
         console.log('Apply template response headers:', Object.fromEntries(applyResponse.headers.entries()));

         if (!applyResponse.ok) {
           const errorData = await applyResponse.json();
           console.error('Template application failed:', errorData);
           throw new Error(errorData.error || 'Failed to apply template');
         }

         const applyResult = await applyResponse.json();
         console.log('Template application result:', applyResult);
         console.log('=== TEMPLATE APPLICATION COMPLETE ===');
         
         // Show success message with template details
         const successMessage = `Site "${newSite.name}" created successfully with template "${selectedTemplate.name}"! Created ${applyResult.totalPages} pages.`;
         toast.success(successMessage, { duration: 5000 });
         
         // Redirect to the site's pages after successful creation
         if (applyResult.appliedPages && applyResult.appliedPages.length > 0) {
           // Find the home page or use the first page
           const homePage = applyResult.appliedPages.find((p: any) => p.slug === 'home') || applyResult.appliedPages[0];
           if (homePage) {
             router.push(`/auth/dashboard/sites/${newSite.id}/pages/${homePage.id}/content?templateApplied=true`);
           } else {
             router.push(`/auth/dashboard/sites/${newSite.id}/pages`);
           }
         } else {
           router.push(`/auth/dashboard/sites/${newSite.id}/pages`);
         }
      } else {
        // Create site without template
        const response = await fetch('/api/sites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(siteData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create site');
        }

        const newSite = await response.json();
        toast.success('Site created successfully!');
        router.push('/auth/dashboard/sites');
      }
    } catch (error) {
      console.error('Error creating site:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create site');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect
  }

  return (
    <DashboardLayout>
      <div className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create New Website
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isLoadingTemplate 
                ? 'Loading template details... Please wait.'
                : selectedTemplate 
                ? `Create a new website using the "${selectedTemplate.name}" template`
                : 'Fill out the form below to create your new website. You can customize it further after creation.'
              }
            </p>
          </div>

          {/* Template Preview Card */}
          {isLoadingTemplate && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
                <span className="text-gray-600 dark:text-gray-400">Loading template...</span>
              </div>
            </div>
          )}
          {selectedTemplate && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
              <div className="flex items-start gap-4">
                {selectedTemplate.preview && (
                  <img
                    src={selectedTemplate.preview}
                    alt={selectedTemplate.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {selectedTemplate.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full">
                      {selectedTemplate.category}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Template Selected
                    </span>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                      Type: {template}
                    </span>
                  </div>
                  {selectedTemplate.pages && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                        This template will create the following pages:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(selectedTemplate.pages).map((pageKey) => (
                          <span
                            key={pageKey}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          >
                            {pageKey.charAt(0).toUpperCase() + pageKey.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              </div>
            </div>
          )}
          {templateId && !selectedTemplate && !isLoadingTemplate && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Template Loading Issue
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>There was an issue loading the template. This could be due to:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Template data being corrupted or incomplete</li>
                      <li>Network connectivity issues</li>
                      <li>Template no longer being available</li>
                    </ul>
                    <p className="mt-2">Please try refreshing the page or contact support if the issue persists.</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={fetchTemplateDetails}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create Site Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedTemplate ? 'Create Website with Template' : 'Create New Website'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {selectedTemplate 
                    ? `Fill out the details below to create your website using the "${selectedTemplate.name}" template. The template will automatically create all necessary pages with professional content.`
                    : 'Fill out the form below to create your new website. You can customize it further after creation.'
                  }
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    placeholder="My Awesome Website"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subdomain
                  </label>
                  <div className="flex rounded-lg shadow-sm">
                    <input
                      type="text"
                      id="subdomain"
                      name="subdomain"
                      value={subdomain}
                      onChange={(e) => handleSubdomainChange(e.target.value)}
                      className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-400 focus:outline-none ${
                        subdomainError ? 'ring-red-500' : subdomainAvailable && subdomain ? 'ring-green-500' : ''
                      }`}
                      placeholder="mysite"
                      required
                    />
                    <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm">
                      {`${BASE_URL}/s/${subdomain || 'yoursite'}`}
                    </span>
                  </div>
                  {isCheckingSubdomain && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Checking availability...</p>
                  )}
                  {subdomainError && <p className="mt-1 text-sm text-red-600 dark:text-red-500">{subdomainError}</p>}
                  {subdomainAvailable && subdomain && !isCheckingSubdomain && (
                    <p className="mt-1 text-sm text-green-600 dark:text-green-500">Subdomain is available!</p>
                  )}
                  {templateId && selectedTemplate && !selectedTemplate.pages && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                      Warning: This template appears to be incomplete. Please contact support.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    rows={3}
                    placeholder="Describe your website"
                  />
                </div>

                {!selectedTemplate && (
                  <div>
                    <label htmlFor="template" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Template
                    </label>
                    <select
                      id="template"
                      name="template"
                      value={template}
                      onChange={(e) => setTemplate(e.target.value as TemplateType)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-400 focus:outline-none"
                      required
                    >
                      <option value="general">General Business</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="pharma">Pharmacy</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || !subdomainAvailable || !name || !subdomain || isLoadingTemplate}
                    className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        {selectedTemplate ? 'Creating Site with Template...' : 'Creating Site...'}
                      </>
                    ) : isLoadingTemplate ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Loading Template...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-5 w-5" />
                        {selectedTemplate ? 'Create Site with Template' : 'Create Website'}
                      </>
                    )}
                  </button>
                  {selectedTemplate && (
                    <div className="col-span-2 mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Template Application Process
                          </h3>
                          <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                            <p>When you create this site, the system will:</p>
                            <ol className="list-decimal list-inside mt-1 space-y-1">
                              <li>Create a new website with your chosen name and subdomain</li>
                              <li>Apply the &quot;{selectedTemplate.name}&quot; template to create all necessary pages</li>
                              <li>Set up proper navigation between pages</li>
                              <li>Make all pages ready for immediate use</li>
                            </ol>
                            <p className="mt-2">This process typically takes a few seconds.</p>
                            <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-800 rounded border border-blue-200 dark:border-blue-700">
                              <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                                Template Type: <span className="font-bold">{template}</span>
                                {selectedTemplate.category && (
                                  <span className="ml-2 text-blue-600 dark:text-blue-300">
                                    (mapped from &quot;{selectedTemplate.category}&quot;)
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
                {(!subdomainAvailable || !name || !subdomain || isLoadingTemplate) && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          Form Requirements
                        </h3>
                        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                          <p>To create your website, please ensure:</p>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {!name && <li>Website name is filled in</li>}
                            {!subdomain && <li>Subdomain is filled in</li>}
                            {subdomain && !subdomainAvailable && <li>Subdomain is available (check the availability above)</li>}
                            {isLoadingTemplate && <li>Template is fully loaded</li>}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 