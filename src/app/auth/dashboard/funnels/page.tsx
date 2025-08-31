'use client';

import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useState, useRef, useEffect } from 'react';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChartBarIcon,
  FunnelIcon,
  DocumentTextIcon,
  PhotoIcon,
  PlayIcon,
  PauseIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon as FunnelIconSolid
} from '@heroicons/react/24/outline';
import { gsap } from 'gsap';

interface Funnel {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  type: 'lead-generation' | 'sales' | 'webinar' | 'product-launch';
  steps: FunnelStep[];
  createdAt: string;
  updatedAt: string;
  stats: {
    visitors: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  };
}

interface FunnelStep {
  id: string;
  name: string;
  type: 'landing' | 'checkout' | 'thank-you' | 'upsell';
  order: number;
  status: 'active' | 'inactive';
}

interface DigitalProduct {
  id: string;
  name: string;
  description: string;
  type: 'pdf' | 'course' | 'template' | 'software';
  price: number;
  status: 'active' | 'inactive';
  downloads: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
}

export default function FunnelsPage() {
  const [activeTab, setActiveTab] = useState<'funnels' | 'products' | 'analytics'>('funnels');
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateFunnel, setShowCreateFunnel] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [selectedFunnel, setSelectedFunnel] = useState<Funnel | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<DigitalProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // GSAP refs
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
    .fromTo(contentRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 
      "-=0.3"
    );

    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load funnels and digital products
      const [funnelsRes, productsRes] = await Promise.all([
        fetch('/api/funnels'),
        fetch('/api/digital-products')
      ]);

      if (funnelsRes.ok) {
        const funnelsData = await funnelsRes.json();
        setFunnels(funnelsData);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-4 w-4" />;
      case 'paused': return <PauseIcon className="h-4 w-4" />;
      case 'draft': return <ClockIcon className="h-4 w-4" />;
      case 'inactive': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <DocumentTextIcon className="h-5 w-5" />;
      case 'course': return <PlayIcon className="h-5 w-5" />;
      case 'template': return <PhotoIcon className="h-5 w-5" />;
      case 'software': return <FunnelIcon className="h-5 w-5" />;
      default: return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  const totalFunnels = funnels.length;
  const activeFunnels = funnels.filter(f => f.status === 'active').length;
  const totalProducts = products.length;
  const totalRevenue = funnels.reduce((sum, f) => sum + f.stats.revenue, 0) + 
                      products.reduce((sum, p) => sum + p.revenue, 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div ref={heroRef} className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Funnels & Digital Products
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Create high-converting sales funnels and sell digital products. Track performance, optimize conversions, and grow your revenue.
          </p>
        </div>

        {/* Stats Overview */}
        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FunnelIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Funnels</p>
                <p className="text-2xl font-bold text-gray-900">{totalFunnels}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Funnels</p>
                <p className="text-2xl font-bold text-gray-900">{activeFunnels}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Digital Products</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'funnels', name: 'Sales Funnels', icon: FunnelIcon },
                { id: 'products', name: 'Digital Products', icon: DocumentTextIcon },
                { id: 'analytics', name: 'Analytics', icon: ChartBarIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div ref={contentRef} className="p-6">
            {/* Funnels Tab */}
            {activeTab === 'funnels' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Sales Funnels</h3>
                  <button
                    onClick={() => setShowCreateFunnel(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Funnel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {funnels.map((funnel) => (
                    <div key={funnel.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">{funnel.name}</h4>
                          <p className="text-sm text-gray-600 mb-3">{funnel.description}</p>
                          <div className="flex items-center space-x-2 mb-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(funnel.status)}`}>
                              {getStatusIcon(funnel.status)}
                              <span className="ml-1 capitalize">{funnel.status}</span>
                            </span>
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full capitalize">
                              {funnel.type.replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Steps:</span>
                          <span className="font-medium text-gray-900">{funnel.steps.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Visitors:</span>
                          <span className="font-medium text-gray-900">{funnel.stats.visitors.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Conversions:</span>
                          <span className="font-medium text-gray-900">{funnel.stats.conversions.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Revenue:</span>
                          <span className="font-medium text-gray-900">₹{funnel.stats.revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Conv. Rate:</span>
                          <span className="font-medium text-gray-900">{funnel.stats.conversionRate}%</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedFunnel(funnel)}
                          className="flex-1 p-2 text-indigo-600 hover:text-indigo-800 transition-colors text-sm font-medium"
                          title="Edit Funnel"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => {/* View funnel */}}
                          className="flex-1 p-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
                          title="View Funnel"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => {/* Toggle status */}}
                          className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                          title={funnel.status === 'active' ? 'Pause Funnel' : 'Activate Funnel'}
                        >
                          {funnel.status === 'active' ? (
                            <PauseIcon className="h-4 w-4" />
                          ) : (
                            <PlayIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {/* Delete funnel */}}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Funnel"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {funnels.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <FunnelIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Funnels Created Yet</h3>
                      <p className="text-gray-500 mb-6">Start building your first sales funnel to convert visitors into customers</p>
                      <button
                        onClick={() => setShowCreateFunnel(true)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                      >
                        Create Your First Funnel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Digital Products</h3>
                  <button
                    onClick={() => setShowCreateProduct(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Product
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getTypeIcon(product.type)}
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full capitalize">
                              {product.type}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-2">{product.name}</h4>
                          <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                          <div className="flex items-center space-x-2 mb-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                              {getStatusIcon(product.status)}
                              <span className="ml-1 capitalize">{product.status}</span>
                            </span>
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                              ₹{product.price}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Downloads:</span>
                          <span className="font-medium text-gray-900">{product.downloads.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Revenue:</span>
                          <span className="font-medium text-gray-900">₹{product.revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Created:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="flex-1 p-2 text-indigo-600 hover:text-indigo-800 transition-colors text-sm font-medium"
                          title="Edit Product"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => {/* View product */}}
                          className="flex-1 p-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
                          title="View Product"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => {/* Toggle status */}}
                          className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                          title={product.status === 'active' ? 'Deactivate Product' : 'Activate Product'}
                        >
                          {product.status === 'active' ? (
                            <PauseIcon className="h-4 w-4" />
                          ) : (
                            <PlayIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {/* Delete product */}}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Product"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {products.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Digital Products Yet</h3>
                      <p className="text-gray-500 mb-6">Start selling digital products like PDFs, courses, templates, and software</p>
                      <button
                        onClick={() => setShowCreateProduct(true)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                      >
                        Add Your First Product
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Funnel Performance */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Top Performing Funnels</h4>
                    <div className="space-y-3">
                      {funnels
                        .sort((a, b) => b.stats.revenue - a.stats.revenue)
                        .slice(0, 5)
                        .map((funnel) => (
                          <div key={funnel.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div>
                              <p className="font-medium text-gray-900">{funnel.name}</p>
                              <p className="text-sm text-gray-600">{funnel.type.replace('-', ' ')}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">₹{funnel.stats.revenue.toLocaleString()}</p>
                              <p className="text-sm text-gray-600">{funnel.stats.conversionRate}% conv.</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Product Performance */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Top Selling Products</h4>
                    <div className="space-y-3">
                      {products
                        .sort((a, b) => b.revenue - a.revenue)
                        .slice(0, 5)
                        .map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-600">{product.type}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">₹{product.revenue.toLocaleString()}</p>
                              <p className="text-sm text-gray-600">{product.downloads} downloads</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Revenue Chart Placeholder */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Revenue Over Time</h4>
                  <div className="h-64 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Chart placeholder - Revenue trends</p>
                      <p className="text-sm text-gray-400">Monthly revenue from funnels and products</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


