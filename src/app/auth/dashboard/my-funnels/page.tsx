'use client';

import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useState, useRef, useEffect } from 'react';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  GlobeAltIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  FireIcon,
  StarIcon,
  ArrowPathIcon,
  BoltIcon,
  PresentationChartLineIcon,
  BanknotesIcon,
  UsersIcon,
  EyeSlashIcon,
  ShareIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  ComputerDesktopIcon,
  PhotoIcon,
  VideoCameraIcon,
  CodeBracketIcon,
  DocumentIcon,
  CloudArrowUpIcon,
  PaintBrushIcon,
  EyeIcon as EyeIconSolid
} from '@heroicons/react/24/outline';
import { gsap } from 'gsap';

interface FunnelTemplate {
  id: string;
  name: string;
  type: 'software' | 'images' | 'videos' | 'code' | 'documents';
  description: string;
  previewUrl: string;
  htmlSchema: any;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  fileUrl: string;
  createdAt: string;
}

interface Funnel {
  id: string;
  name: string;
  userId: string;
  templateId: string;
  template: FunnelTemplate;
  productId?: string;
  product?: Product;
  customizations?: any;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  url?: string;
}

export default function MyFunnelsDashboard() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [templates, setTemplates] = useState<FunnelTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'status' | 'type'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FunnelTemplate | null>(null);
  const [deletingFunnelId, setDeletingFunnelId] = useState<string | null>(null);

  // GSAP refs
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const funnelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(heroRef.current, 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(statsRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 
      "-=0.4"
    )
    .fromTo(funnelsRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 
      "-=0.3"
    );

    loadFunnels();
    loadTemplates();
  }, []);

  const loadFunnels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/funnels/my');
      if (response.ok) {
        const data = await response.json();
        setFunnels(data);
      }
    } catch (error) {
      console.error('Error loading funnels:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleDeleteFunnel = async (funnelId: string, funnelName: string) => {
    if (!confirm(`Are you sure you want to delete "${funnelName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingFunnelId(funnelId);
      const response = await fetch(`/api/funnels/${funnelId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove funnel from state
        setFunnels(funnels.filter(f => f.id !== funnelId));
        
        // Show success message
        const tempToast = document.createElement('div');
        tempToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        tempToast.textContent = '✅ Funnel deleted successfully!';
        document.body.appendChild(tempToast);
        setTimeout(() => tempToast.remove(), 3000);
      } else {
        const error = await response.json();
        alert(`Failed to delete funnel: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting funnel:', error);
      alert('Failed to delete funnel. Please try again.');
    } finally {
      setDeletingFunnelId(null);
    }
  };

  const handleSort = (field: 'name' | 'createdAt' | 'status' | 'type') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedFunnels = funnels
    .filter(funnel => {
      const matchesSearch = funnel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          funnel.template.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || (statusFilter === 'published' ? funnel.published : !funnel.published);
      const matchesType = !typeFilter || funnel.template.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'status':
          aValue = a.published ? 1 : 0;
          bValue = b.published ? 1 : 0;
          break;
        case 'type':
          aValue = a.template.type;
          bValue = b.template.type;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'software': return <ComputerDesktopIcon className="h-5 w-5" />;
      case 'images': return <PhotoIcon className="h-5 w-5" />;
      case 'videos': return <VideoCameraIcon className="h-5 w-5" />;
      case 'code': return <CodeBracketIcon className="h-5 w-5" />;
      case 'documents': return <DocumentIcon className="h-5 w-5" />;
      default: return <FunnelIcon className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'software': return 'bg-blue-100 text-blue-800';
      case 'images': return 'bg-green-100 text-green-800';
      case 'videos': return 'bg-purple-100 text-purple-800';
      case 'code': return 'bg-orange-100 text-orange-800';
      case 'documents': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalFunnels = funnels.length;
  const publishedFunnels = funnels.filter(f => f.published).length;
  const draftFunnels = funnels.filter(f => !f.published).length;
  const totalRevenue = funnels.reduce((sum, funnel) => sum + (funnel.product?.price || 0), 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div ref={heroRef} className="text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-medium mb-6">
            <SparklesIcon className="h-4 w-4 mr-2" />
            Ready to sell your digital products?
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Products</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            Create high-converting sales pages for your digital products. Choose from pre-made templates and start selling in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setShowTemplateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RocketLaunchIcon className="h-5 w-5 mr-2" />
              Sell New Product →
            </button>
            <button className="bg-white text-purple-600 border-2 border-purple-200 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105">
              <EyeIconSolid className="h-5 w-5 mr-2" />
              View Analytics →
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-blue-900">{totalFunnels}</p>
                <p className="text-xs text-blue-500 mt-1">Start building +12%</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-lg">
                <FunnelIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Published</p>
                <p className="text-3xl font-bold text-green-900">{publishedFunnels}</p>
                <p className="text-xs text-green-500 mt-1">Live products</p>
              </div>
              <div className="p-3 bg-green-200 rounded-lg">
                <GlobeAltIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Drafts</p>
                <p className="text-3xl font-bold text-purple-900">{draftFunnels}</p>
                <p className="text-xs text-purple-500 mt-1">In progress</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Total Value</p>
                <p className="text-3xl font-bold text-orange-900">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-orange-500 mt-1">Product value</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-lg">
                <BanknotesIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Ready to Start Selling?</h3>
            <p className="text-purple-100">Choose your product type and start building your sales page</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <button 
              onClick={() => {
                const softwareTemplate = templates.find(t => t.type === 'software');
                if (softwareTemplate) {
                  setSelectedTemplate(softwareTemplate);
                  setShowCreateModal(true);
                }
              }}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 flex flex-col items-center justify-center"
            >
              <ComputerDesktopIcon className="h-8 w-8 mb-2" />
              <span className="text-sm">Software</span>
            </button>
            <button 
              onClick={() => {
                const imageTemplate = templates.find(t => t.type === 'images');
                if (imageTemplate) {
                  setSelectedTemplate(imageTemplate);
                  setShowCreateModal(true);
                }
              }}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 flex flex-col items-center justify-center"
            >
              <PhotoIcon className="h-8 w-8 mb-2" />
              <span className="text-sm">Images</span>
            </button>
            <button 
              onClick={() => {
                const videoTemplate = templates.find(t => t.type === 'videos');
                if (videoTemplate) {
                  setSelectedTemplate(videoTemplate);
                  setShowCreateModal(true);
                }
              }}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 flex flex-col items-center justify-center"
            >
              <VideoCameraIcon className="h-8 w-8 mb-2" />
              <span className="text-sm">Videos</span>
            </button>
            <button 
              onClick={() => {
                const codeTemplate = templates.find(t => t.type === 'code');
                if (codeTemplate) {
                  setSelectedTemplate(codeTemplate);
                  setShowCreateModal(true);
                }
              }}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 flex flex-col items-center justify-center"
            >
              <CodeBracketIcon className="h-8 w-8 mb-2" />
              <span className="text-sm">Code</span>
            </button>
            <button 
              onClick={() => {
                const docTemplate = templates.find(t => t.type === 'documents');
                if (docTemplate) {
                  setSelectedTemplate(docTemplate);
                  setShowCreateModal(true);
                }
              }}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 flex flex-col items-center justify-center"
            >
              <DocumentIcon className="h-8 w-8 mb-2" />
              <span className="text-sm">Documents</span>
            </button>
          </div>
        </div>

        {/* Controls and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="flex items-center space-x-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="software">Software</option>
                  <option value="images">Images</option>
                  <option value="videos">Videos</option>
                  <option value="code">Code</option>
                  <option value="documents">Documents</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowTemplateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Sell New Product
            </button>
          </div>
        </div>

        {/* Funnels Table */}
        <div ref={funnelsRef} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center hover:text-purple-600 transition-colors"
                    >
                      Product Name
                      {sortBy === 'name' && (
                        sortOrder === 'asc' ? 
                          <ArrowUpIcon className="h-4 w-4 ml-1" /> : 
                          <ArrowDownIcon className="h-4 w-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                    <button
                      onClick={() => handleSort('type')}
                      className="flex items-center hover:text-purple-600 transition-colors"
                    >
                      Type
                      {sortBy === 'type' && (
                        sortOrder === 'asc' ? 
                          <ArrowUpIcon className="h-4 w-4 ml-1" /> : 
                          <ArrowDownIcon className="h-4 w-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center hover:text-purple-600 transition-colors"
                    >
                      Status
                      {sortBy === 'status' && (
                        sortOrder === 'asc' ? 
                          <ArrowUpIcon className="h-4 w-4 ml-1" /> : 
                          <ArrowDownIcon className="h-4 w-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Product</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">URL</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                    <button
                      onClick={() => handleSort('createdAt')}
                      className="flex items-center hover:text-purple-600 transition-colors"
                    >
                      Created
                      {sortBy === 'createdAt' && (
                        sortOrder === 'asc' ? 
                          <ArrowUpIcon className="h-4 w-4 ml-1" /> : 
                          <ArrowDownIcon className="h-4 w-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedFunnels.map((funnel) => (
                  <tr key={funnel.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <h3 className="font-medium text-gray-900">{funnel.name}</h3>
                        <p className="text-sm text-gray-600">{funnel.template.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(funnel.template.type)}`}>
                        {getTypeIcon(funnel.template.type)}
                        <span className="ml-1 capitalize">{funnel.template.type}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        funnel.published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {funnel.published ? (
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <ClockIcon className="h-4 w-4 mr-1" />
                        )}
                        <span>{funnel.published ? 'Published' : 'Draft'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {funnel.product ? (
                        <div>
                          <p className="font-medium text-gray-900">{funnel.product.name}</p>
                          <p className="text-sm text-gray-600">₹{funnel.product.price}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No product</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {funnel.published && funnel.url ? (
                        <div className="flex items-center text-sm">
                          <GlobeAltIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <a 
                            href={funnel.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-800"
                          >
                            View Live
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not published</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(funnel.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {funnel.published && funnel.url && (
                          <button
                            onClick={() => window.open(funnel.url, '_blank')}
                            className="p-1 text-purple-600 hover:text-purple-800 transition-colors"
                            title="View Funnel"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {/* Edit funnel */}}
                          className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                          title="Edit Funnel"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {/* Share funnel */}}
                          className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                          title="Share Funnel"
                        >
                          <ShareIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFunnel(funnel.id, funnel.name)}
                          disabled={deletingFunnelId === funnel.id}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={deletingFunnelId === funnel.id ? "Deleting..." : "Delete Funnel"}
                        >
                          {deletingFunnelId === funnel.id ? (
                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
                          ) : (
                            <TrashIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedFunnels.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FunnelIcon className="mx-auto h-16 w-16" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter || typeFilter
                  ? 'Try adjusting your search or filters'
                  : 'Get started by selling your first digital product'
                }
              </p>
              {!searchTerm && !statusFilter && !typeFilter && (
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Sell Your First Product
                </button>
              )}
            </div>
          )}
        </div>

        {/* Template Selection Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Choose a Product Template</h3>
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <div 
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowTemplateModal(false);
                        setShowCreateModal(true);
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(template.type)}`}>
                          {getTypeIcon(template.type)}
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(template.type)}`}>
                          {template.type}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                      <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                        Use This Template
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Funnel Modal */}
        {showCreateModal && selectedTemplate && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Create New Product</h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedTemplate(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                    <input
                      type="text"
                      placeholder="Enter product name..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-lg mr-3 ${getTypeColor(selectedTemplate.type)}`}>
                        {getTypeIcon(selectedTemplate.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedTemplate.name}</p>
                        <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setSelectedTemplate(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        // Create funnel logic here
                        setShowCreateModal(false);
                        setSelectedTemplate(null);
                        loadFunnels();
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700"
                    >
                      Create Product
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
