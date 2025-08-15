'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { HeartIcon, EyeIcon, CheckCircleIcon, PlusIcon, GlobeAltIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Site } from '@/types';
import toast from 'react-hot-toast';

interface PurchasedTemplate {
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

export default function PurchasedTemplatesPage() {
  const { data: session, status } = useSession();
  const [purchasedTemplates, setPurchasedTemplates] = useState<PurchasedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // New state for enhanced functionality
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PurchasedTemplate | null>(null);
  const [existingSites, setExistingSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
  const [isCreatingSite, setIsCreatingSite] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchPurchasedTemplates();
      fetchExistingSites();
    }
  }, [status, session]);

  const fetchPurchasedTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates/purchased');
      if (!response.ok) {
        throw new Error('Failed to fetch purchased templates');
      }
      const data = await response.json();
      console.log('Fetched purchased templates:', data);
      setPurchasedTemplates(data);
    } catch (err) {
      console.error('Error fetching purchased templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch purchased templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingSites = async () => {
    try {
      const response = await fetch('/api/sites');
      if (response.ok) {
        const data = await response.json();
        const sitesArr = Array.isArray(data) ? data : data.sites;
        setExistingSites(sitesArr);
      }
    } catch (err) {
      console.error('Error fetching existing sites:', err);
    }
  };

  // Extract unique categories from purchased templates
  const categories = ['All', ...Array.from(new Set(purchasedTemplates.map(t => t.category).filter(Boolean)))];

  // Filter templates based on search and category
  const filteredTemplates = purchasedTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
                         (template.description && template.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get available pages for a template
  const getAvailablePages = (template: PurchasedTemplate) => {
    if (!template.pages) return [];
    
    const pages = template.pages as Record<string, any>;
    const pageTitles: Record<string, string> = { 
      home: 'Home', 
      about: 'About', 
      contact: 'Contact', 
      services: 'Services', 
      product: 'Product' 
    };
    
    return Object.keys(pages).map(key => ({
      key,
      title: pageTitles[key] || key.charAt(0).toUpperCase() + key.slice(1)
    }));
  };

  // Handle template preview
  const handlePreview = (template: PurchasedTemplate) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  // Handle apply template to existing site
  const handleApplyToExisting = (template: PurchasedTemplate) => {
    setSelectedTemplate(template);
    setSelectedSiteId('');
    setShowApplyModal(true);
  };

  // Handle create new site with template
  const handleCreateNewSite = async (template: PurchasedTemplate) => {
    if (!template.pages || typeof template.pages !== 'object') {
      toast.error('Template data is incomplete. Cannot create site.');
      return;
    }

    setIsCreatingSite(true);
    try {
      // Redirect to create site page with template ID
      window.location.href = `/auth/dashboard/sites/create?template=${template.id}`;
    } catch (error) {
      console.error('Error creating site:', error);
      toast.error('Failed to create site. Please try again.');
    } finally {
      setIsCreatingSite(false);
    }
  };

  // Apply template to existing site
  const handleApplyTemplate = async () => {
    if (!selectedTemplate || !selectedSiteId) {
      toast.error('Please select both a template and a site.');
      return;
    }

    setIsApplyingTemplate(true);
    try {
      const response = await fetch(`/api/sites/${selectedSiteId}/apply-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
        }),
      });

      if (response.ok) {
        toast.success('Template applied successfully!');
        setShowApplyModal(false);
        setSelectedTemplate(null);
        setSelectedSiteId('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply template');
      }
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to apply template');
    } finally {
      setIsApplyingTemplate(false);
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
    return (
      <DashboardLayout>
        <div className="py-10 text-center text-red-500 bg-white min-h-screen w-full">
          Please sign in to view your purchased templates.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  My Purchased Templates
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  View and manage all the templates you've purchased from the marketplace.
                </p>
              </div>
              
              {/* Marketplace Button */}
              <div className="flex gap-3">
                <a
                  href="/auth/dashboard/marketplace"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Browse More Templates
                </a>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="relative w-full md:w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full md:w-56 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-400 focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <HeartIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Purchased</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{purchasedTemplates.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ready to Use</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {purchasedTemplates.filter(t => t.pages && typeof t.pages === 'object').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <EyeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(purchasedTemplates.map(t => t.category).filter(Boolean)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <span className="ml-3 text-gray-500 text-lg">Loading your templates...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="text-red-500 text-lg mb-4">{error}</div>
              <button
                onClick={fetchPurchasedTemplates}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-500 dark:text-gray-400 text-lg mb-6">
                {search || selectedCategory !== 'All' 
                  ? 'No templates match your search criteria.' 
                  : 'You haven\'t purchased any templates yet.'}
              </div>
              {search || selectedCategory !== 'All' ? (
                <button
                  onClick={() => { setSearch(''); setSelectedCategory('All'); }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Clear Filters
                </button>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-500 text-sm max-w-md mx-auto">
                    Start building amazing websites with our professionally designed templates. 
                    Browse our collection and find the perfect template for your next project.
                  </p>
                  <a
                    href="/auth/dashboard/marketplace"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Explore Templates
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTemplates.map((template) => {
                const availablePages = getAvailablePages(template);
                const hasPages = template.pages && typeof template.pages === 'object';
                
                return (
                  <div key={template.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    {/* Template Image */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                      {template.preview ? (
                        <img
                          src={template.preview}
                          alt={template.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      {template.category && (
                        <span className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          {template.category}
                        </span>
                      )}
                      
                      {/* Purchase Date Badge */}
                      <span className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        {new Date(template.purchasedAt).toLocaleDateString()}
                      </span>
                      
                      {/* Price Badge */}
                      <div className="absolute bottom-3 right-3 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-lg">
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          ₹{template.price}
                        </span>
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {template.name}
                      </h3>
                      
                      {template.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {template.description}
                        </p>
                      )}

                      {/* Pages Info */}
                      <div className="mb-6">
                        {hasPages ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Pages:</span>
                              <span className="text-purple-600 dark:text-purple-400 font-semibold">
                                {availablePages.length} pages
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {availablePages.map(page => (
                                <span
                                  key={page.key}
                                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium border border-purple-200 dark:border-purple-800"
                                >
                                  {page.title}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            ⚠️ Template data may be incomplete
                          </div>
                        )}
                      </div>

                      {/* Enhanced Actions */}
                      <div className="space-y-3">
                        {/* Create New Site Button */}
                        <button
                          className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          onClick={() => handleCreateNewSite(template)}
                          disabled={!hasPages || isCreatingSite}
                          title={!hasPages ? 'Template data incomplete' : 'Create a new website with this template'}
                        >
                          {isCreatingSite ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                              Creating...
                            </>
                          ) : (
                            <>
                              <PlusIcon className="h-4 w-4" />
                              Create New Site
                            </>
                          )}
                        </button>

                        {/* Apply to Existing Site Button */}
                        <button
                          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          onClick={() => handleApplyToExisting(template)}
                          disabled={!hasPages || existingSites.length === 0}
                          title={!hasPages ? 'Template data incomplete' : existingSites.length === 0 ? 'No existing sites to apply to' : 'Apply this template to an existing website'}
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                          Apply to Existing Site
                        </button>

                        {/* Preview Button */}
                        <button
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-purple-400 dark:hover:border-purple-400 transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2"
                          onClick={() => handlePreview(template)}
                        >
                          <EyeIcon className="h-4 w-4" />
                          Preview Template
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Preview: {selectedTemplate.name}
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {selectedTemplate.preview ? (
                <div className="space-y-4">
                  <img
                    src={selectedTemplate.preview}
                    alt={selectedTemplate.name}
                    className="w-full rounded-lg shadow-lg"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Template Details</h4>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p><span className="font-medium">Category:</span> {selectedTemplate.category}</p>
                        <p><span className="font-medium">Price:</span> ₹{selectedTemplate.price}</p>
                        <p><span className="font-medium">Pages:</span> {getAvailablePages(selectedTemplate).length}</p>
                        <p><span className="font-medium">Purchased:</span> {new Date(selectedTemplate.purchasedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Available Pages</h4>
                      <div className="flex flex-wrap gap-2">
                        {getAvailablePages(selectedTemplate).map(page => (
                          <span
                            key={page.key}
                            className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                          >
                            {page.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {selectedTemplate.description && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                      <p className="text-gray-600 dark:text-gray-400">{selectedTemplate.description}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>No preview available for this template</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Apply to Existing Site Modal */}
      {showApplyModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Apply Template to Existing Site
              </h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Select an existing website to apply the <strong>{selectedTemplate.name}</strong> template to:
                </p>
                <select
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-400 focus:outline-none"
                >
                  <option value="">Select a website...</option>
                  {existingSites.map(site => (
                    <option key={site.id} value={site.id}>
                      {site.name} ({site.subdomain})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleApplyTemplate}
                  disabled={!selectedSiteId || isApplyingTemplate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isApplyingTemplate ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Applying...
                    </>
                  ) : (
                    <>
                      <ArrowPathIcon className="h-4 w-4" />
                      Apply Template
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 