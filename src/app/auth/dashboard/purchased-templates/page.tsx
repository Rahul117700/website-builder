'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { 
  ArrowDownTrayIcon, 
  EyeIcon, 
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useCurrency } from '@/components/CurrencySelector';

interface PurchasedTemplate {
  id: string;
  purchasedAt: string;
  template: {
    id: string;
    name: string;
    slug: string;
    price: number;
    category: string;
    description: string;
    preview: string | null;
  };
}

export default function PurchasedTemplatesPage() {
  const { data: session } = useSession();
  const { convertCurrency, formatAmount } = useCurrency();
  const [templates, setTemplates] = useState<PurchasedTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchPurchasedTemplates();
    }
  }, [session]);

  const fetchPurchasedTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates/purchased');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error fetching purchased templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPreview = (slug: string) => {
    window.open(`/api/templates/${slug}/preview`, '_blank');
  };

  const handleDownload = async (template: PurchasedTemplate) => {
    try {
      const response = await fetch(`/api/templates/${template.template.slug}/download`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.template.slug}-template.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download template. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Purchased Templates</h1>
                      <p className="text-gray-600">
              Access and download all the templates you&apos;ve purchased
            </p>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <CheckCircleIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates purchased yet</h3>
            <p className="text-gray-600 mb-6">
              Start building your collection by browsing our template marketplace
            </p>
            <a
              href="/auth/dashboard/marketplace"
              className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Browse Templates
            </a>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Purchased</p>
                    <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CalendarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Latest Purchase</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {templates.length > 0 ? formatDate(templates[0].purchasedAt) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ArrowDownTrayIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Ready to Download</p>
                    <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((purchasedTemplate) => (
                <div key={purchasedTemplate.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Template Preview */}
                  <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center relative">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-indigo-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold text-lg">
                          {purchasedTemplate.template.name.charAt(0)}
                        </span>
                      </div>
                      <p className="text-sm text-indigo-600 font-medium">{purchasedTemplate.template.category}</p>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                        Purchased
                      </span>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {purchasedTemplate.template.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {purchasedTemplate.template.description}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Purchased {formatDate(purchasedTemplate.purchasedAt)}
                    </div>
                    
                    <div className="flex gap-2">
                      {purchasedTemplate.template.preview && (
                        <button
                          onClick={() => openPreview(purchasedTemplate.template.slug)}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <EyeIcon className="h-4 w-4" />
                          Preview
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDownload(purchasedTemplate)}
                        className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                                                 <ArrowDownTrayIcon className="h-4 w-4" />
                         Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 