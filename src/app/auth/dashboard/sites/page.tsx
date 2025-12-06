'use client';

import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useState, useRef, useEffect } from 'react';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  GlobeAltIcon,
  ServerStackIcon,
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
  RocketLaunchIcon,
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
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { gsap } from 'gsap';

interface Funnel {
  id: string;
  name: string;
  description: string;
  type: 'lead-capture' | 'sales' | 'webinar' | 'product-launch' | 'email-sequence';
  status: 'active' | 'draft' | 'paused' | 'archived';
  subdomain: string;
  customDomain?: string;
  createdAt: string;
  updatedAt: string;
  lastDeployed?: string;
  performance?: {
    visitors: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    leads: number;
    emailSubscribers: number;
  };
  funnelSteps: {
    id: string;
    name: string;
    type: 'landing' | 'checkout' | 'thank-you' | 'upsell' | 'downsell';
    visitors: number;
    conversions: number;
    conversionRate: number;
  }[];
}

interface Instance {
  id: string;
  port: number;
  url: string;
  status: 'AVAILABLE' | 'ALLOCATED' | 'IN_USE' | 'MAINTENANCE';
  assignedUserId?: string;
  domains: Array<{
    id: string;
    domain: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Domain {
  id: string;
  domain: string;
  instanceId: string;
  userId: string;
  instance: {
    id: string;
    port: number;
    url: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function FunnelManagement() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [assignedInstances, setAssignedInstances] = useState<Instance[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'status' | 'performance'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [selectedFunnel, setSelectedFunnel] = useState<Funnel | null>(null);
  const [newDomain, setNewDomain] = useState('');

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
  }, []);

  const loadFunnels = async () => {
    try {
      setLoading(true);
      const [funnelsRes, domainsRes, instancesRes] = await Promise.all([
        fetch('/api/sites/my-sites'),
        fetch('/api/domains'),
        fetch('/api/instances/my-instances')
      ]);
      
      if (funnelsRes.ok) {
        const funnelsData = await funnelsRes.json();
        setFunnels(funnelsData);
      }
      
      if (domainsRes.ok) {
        const domainsData = await domainsRes.json();
        setDomains(domainsData);
      }

      if (instancesRes.ok) {
        const instancesData = await instancesRes.json();
        setAssignedInstances(instancesData);
      }
    } catch (error) {
      console.error('Error loading funnels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: 'name' | 'createdAt' | 'status' | 'performance') => {
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
                          funnel.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          funnel.subdomain.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || funnel.status === statusFilter;
      const matchesType = !typeFilter || funnel.type === typeFilter;
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
          aValue = a.status;
          bValue = b.status;
          break;
        case 'performance':
          aValue = a.performance?.conversionRate || 0;
          bValue = b.performance?.conversionRate || 0;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-4 w-4" />;
      case 'draft': return <DocumentTextIcon className="h-4 w-4" />;
      case 'paused': return <PauseIcon className="h-4 w-4" />;
      case 'archived': return <ArchiveBoxIcon className="h-4 w-4" />;
      default: return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const [selectedInstanceForDomain, setSelectedInstanceForDomain] = useState<Instance | null>(null);

  const handleAddDomain = async () => {
    if (!newDomain || !selectedInstanceForDomain) return;
    
    try {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: newDomain,
          instanceId: selectedInstanceForDomain.id
        })
      });
      
      if (response.ok) {
        setNewDomain('');
        setShowDomainModal(false);
        setSelectedInstanceForDomain(null);
        loadFunnels(); // Reload to get updated data
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add domain');
      }
    } catch (error) {
      console.error('Error adding domain:', error);
      alert('An error occurred while adding the domain');
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm('Are you sure you want to delete this domain?')) return;
    
    try {
      const response = await fetch(`/api/domains/${domainId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadFunnels(); // Reload to get updated data
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete domain');
      }
    } catch (error) {
      console.error('Error deleting domain:', error);
      alert('An error occurred while deleting the domain');
    }
  };

  const totalFunnels = funnels.length;
  const activeFunnels = funnels.filter(f => f.status === 'active').length;
  const totalVisitors = funnels.reduce((sum, funnel) => sum + (funnel.performance?.visitors || 0), 0);
  const totalConversions = funnels.reduce((sum, funnel) => sum + (funnel.performance?.conversions || 0), 0);
  const totalRevenue = funnels.reduce((sum, funnel) => sum + (funnel.performance?.revenue || 0), 0);
  const totalLeads = funnels.reduce((sum, funnel) => sum + (funnel.performance?.leads || 0), 0);
  const averageConversionRate = funnels.reduce((sum, funnel) => sum + (funnel.performance?.conversionRate || 0), 0) / Math.max(activeFunnels, 1);

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
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-medium mb-6">
            <SparklesIcon className="h-4 w-4 mr-2" />
            Welcome back! Ready to build something amazing?
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Funnel</span> Command Center
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            Build, launch, and scale your digital sales funnels with our powerful suite of tools. From lead capture to revenue optimization - everything you need to succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105">
              <RocketLaunchIcon className="h-5 w-5 mr-2" />
              Launch New Funnel →
            </button>
            <button className="bg-white text-purple-600 border-2 border-purple-200 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105">
              <SparklesIcon className="h-5 w-5 mr-2" />
              Browse Templates →
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Funnels</p>
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
                <p className="text-sm font-medium text-green-600 mb-1">Active Funnels</p>
                <p className="text-3xl font-bold text-green-900">{activeFunnels}</p>
                <p className="text-xs text-green-500 mt-1">No active funnels 99.9%</p>
              </div>
              <div className="p-3 bg-green-200 rounded-lg">
                <EyeIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Conversions</p>
                <p className="text-3xl font-bold text-purple-900">{totalConversions.toLocaleString()}</p>
                <p className="text-xs text-purple-500 mt-1">No conversions +5 new</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-lg">
                <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Revenue</p>
                <p className="text-3xl font-bold text-orange-900">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-orange-500 mt-1">No revenue yet +23%</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-lg">
                <BanknotesIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Funnel Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600 mb-1">Conversion Rate</p>
                <p className="text-2xl font-bold text-indigo-900">{averageConversionRate.toFixed(1)}%</p>
                <p className="text-xs text-indigo-500 mt-1">Average across all funnels</p>
              </div>
              <div className="p-3 bg-indigo-200 rounded-lg">
                <ChartPieIcon className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border border-pink-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-600 mb-1">Total Leads</p>
                <p className="text-2xl font-bold text-pink-900">{totalLeads.toLocaleString()}</p>
                <p className="text-xs text-pink-500 mt-1">Email subscribers captured</p>
              </div>
              <div className="p-3 bg-pink-200 rounded-lg">
                <UsersIcon className="h-6 w-6 text-pink-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-600 mb-1">Total Visitors</p>
                <p className="text-2xl font-bold text-teal-900">{totalVisitors.toLocaleString()}</p>
                <p className="text-xs text-teal-500 mt-1">Across all funnel pages</p>
              </div>
              <div className="p-3 bg-teal-200 rounded-lg">
                <EyeIcon className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Ready to Scale Your Business?</h3>
            <p className="text-purple-100">Choose your next step to maximize your funnel performance</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 flex items-center justify-center">
              <RocketLaunchIcon className="h-5 w-5 mr-2" />
              Create New Funnel
            </button>
            <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 flex items-center justify-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              View Analytics
            </button>
            <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 flex items-center justify-center">
              <SparklesIcon className="h-5 w-5 mr-2" />
              Browse Templates
            </button>
          </div>
        </div>

        {/* Assigned Instances Section */}
        {assignedInstances.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Your Allocated Instances</h3>
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800">
                {assignedInstances.length} Instance{assignedInstances.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {assignedInstances.map((instance) => {
                const instanceDomains = domains.filter(d => d.instanceId === instance.id);
                return (
                  <div key={instance.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">Instance {instance.port}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        instance.status === 'IN_USE' ? 'bg-green-100 text-green-800' :
                        instance.status === 'ALLOCATED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {instance.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <ServerStackIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">Port: </span>
                        <span className="text-sm font-medium text-gray-900 ml-1">{instance.port}</span>
                      </div>
                      <div className="flex items-center">
                        <GlobeAltIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">URL: </span>
                        <span className="text-sm font-medium text-gray-900 ml-1">{instance.url}</span>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-medium text-gray-700">Connected Domains</h5>
                          <button
                            onClick={() => {
                              setSelectedInstanceForDomain(instance);
                              setShowDomainModal(true);
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-800"
                          >
                            + Add Domain
                          </button>
                        </div>
                        <div className="space-y-2">
                          {instanceDomains.length > 0 ? (
                            instanceDomains.map((domain) => (
                              <div key={domain.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center">
                                  <GlobeAltIcon className="h-3 w-3 text-gray-400 mr-2" />
                                  <span className="text-xs font-medium text-gray-900">{domain.domain}</span>
                                </div>
                                <button
                                  onClick={() => handleDeleteDomain(domain.id)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete Domain"
                                >
                                  <TrashIcon className="h-3 w-3" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500">No domains connected</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Instances Message */}
        {assignedInstances.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="text-center py-8">
              <ServerStackIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Instances Allocated</h3>
              <p className="text-gray-500 mb-4">
                You don't have any instances allocated yet. Contact your administrator to get an instance assigned.
              </p>
              <div className="text-sm text-gray-400">
                <p>Once you have an instance, you can:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Connect custom domains</li>
                  <li>• Deploy your websites</li>
                  <li>• Monitor performance</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Controls and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search funnels..."
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
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
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
                  <option value="lead-capture">Lead Capture</option>
                  <option value="sales">Sales</option>
                  <option value="webinar">Webinar</option>
                  <option value="product-launch">Product Launch</option>
                  <option value="email-sequence">Email Sequence</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
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
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Type</th>
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
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Domain</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Performance</th>
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
                        <p className="text-sm text-gray-600">{funnel.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full capitalize">
                        {funnel.type.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(funnel.status)}`}>
                        {getStatusIcon(funnel.status)}
                        <span className="ml-1 capitalize">{funnel.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <GlobeAltIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-gray-900">{funnel.subdomain}.yourdomain.com</span>
                        </div>
                        {funnel.customDomain && (
                          <div className="flex items-center text-sm">
                            <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-gray-600">{funnel.customDomain}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {funnel.performance ? (
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-gray-600">Conv Rate: </span>
                            <span className="font-medium text-gray-900">{funnel.performance.conversionRate.toFixed(1)}%</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Revenue: </span>
                            <span className="font-medium text-gray-900">₹{funnel.performance.revenue.toLocaleString()}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Leads: </span>
                            <span className="font-medium text-gray-900">{funnel.performance.leads.toLocaleString()}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No data</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(funnel.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(`http://${funnel.subdomain}.yourdomain.com`, '_blank')}
                          className="p-1 text-purple-600 hover:text-purple-800 transition-colors"
                          title="View Funnel"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setSelectedFunnel(funnel)}
                          className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                          title="Edit Funnel"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {/* Toggle funnel status */}}
                          className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
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
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Funnel"
                        >
                          <TrashIcon className="h-4 w-4" />
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Funnels Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter || typeFilter
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first sales funnel'
                }
              </p>
              {!searchTerm && !statusFilter && !typeFilter && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Create Your First Funnel
                </button>
              )}
            </div>
          )}
        </div>

        {/* Domain Connection Modal */}
        {showDomainModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Connect Custom Domain</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Domain</label>
                    <input
                      type="text"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., myshop.com"
                    />
                  </div>
                  {selectedInstanceForDomain && (
                    <div className="text-sm text-gray-600">
                      <p>This domain will be connected to your instance:</p>
                      <p className="font-medium">{selectedInstanceForDomain.url} (Port: {selectedInstanceForDomain.port})</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowDomainModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddDomain}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                  >
                    Connect Domain
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 