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
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { gsap } from 'gsap';

interface Site {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'active' | 'pending' | 'suspended' | 'maintenance';
  subdomain: string;
  customDomain?: string;
  port: number;
  ipAddress: string;
  createdAt: string;
  updatedAt: string;
  lastDeployed?: string;
  performance?: {
    loadTime: number;
    uptime: number;
    visitors: number;
  };
}

export default function SitesManagement() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'status' | 'performance'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  // GSAP refs
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const sitesRef = useRef<HTMLDivElement>(null);

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
    .fromTo(sitesRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 
      "-=0.3"
    );

    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sites/my-sites');
      if (response.ok) {
        const sitesData = await response.json();
        setSites(sitesData);
      }
    } catch (error) {
      console.error('Error loading sites:', error);
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

  const filteredAndSortedSites = sites
    .filter(site => {
      const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          site.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          site.subdomain.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || site.status === statusFilter;
      const matchesType = !typeFilter || site.type === typeFilter;
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
          aValue = a.performance?.loadTime || 0;
          bValue = b.performance?.loadTime || 0;
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'suspended': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'maintenance': return <CogIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const totalSites = sites.length;
  const activeSites = sites.filter(s => s.status === 'active').length;
  const totalVisitors = sites.reduce((sum, site) => sum + (site.performance?.visitors || 0), 0);
  const averageLoadTime = sites.reduce((sum, site) => sum + (site.performance?.loadTime || 0), 0) / Math.max(activeSites, 1);

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
            Sites Management
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Manage all your deployed websites, monitor performance, and control domains from one central dashboard.
          </p>
        </div>

        {/* Stats Overview */}
        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ServerStackIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sites</p>
                <p className="text-2xl font-bold text-gray-900">{totalSites}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Sites</p>
                <p className="text-2xl font-bold text-gray-900">{activeSites}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                <p className="text-2xl font-bold text-gray-900">{totalVisitors.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ArrowUpIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Load Time</p>
                <p className="text-2xl font-bold text-gray-900">{averageLoadTime.toFixed(1)}s</p>
              </div>
            </div>
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
                  placeholder="Search sites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="flex items-center space-x-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="business">Business</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="funnel">Funnel</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add New Site
            </button>
          </div>
        </div>

        {/* Sites Table */}
        <div ref={sitesRef} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center hover:text-indigo-600 transition-colors"
                    >
                      Site Name
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
                      className="flex items-center hover:text-indigo-600 transition-colors"
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
                      className="flex items-center hover:text-indigo-600 transition-colors"
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
                {filteredAndSortedSites.map((site) => (
                  <tr key={site.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <h3 className="font-medium text-gray-900">{site.name}</h3>
                        <p className="text-sm text-gray-600">{site.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full capitalize">
                        {site.type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(site.status)}`}>
                        {getStatusIcon(site.status)}
                        <span className="ml-1 capitalize">{site.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <GlobeAltIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-gray-900">{site.subdomain}.yourdomain.com</span>
                        </div>
                        {site.customDomain && (
                          <div className="flex items-center text-sm">
                            <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-gray-600">{site.customDomain}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {site.performance ? (
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-gray-600">Load: </span>
                            <span className="font-medium text-gray-900">{site.performance.loadTime}s</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Uptime: </span>
                            <span className="font-medium text-gray-900">{site.performance.uptime}%</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Visitors: </span>
                            <span className="font-medium text-gray-900">{site.performance.visitors.toLocaleString()}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No data</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(site.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(`http://${site.subdomain}.yourdomain.com`, '_blank')}
                          className="p-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                          title="View Site"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setSelectedSite(site)}
                          className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                          title="Edit Site"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {/* Toggle site status */}}
                          className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                          title={site.status === 'active' ? 'Pause Site' : 'Activate Site'}
                        >
                          {site.status === 'active' ? (
                            <PauseIcon className="h-4 w-4" />
                          ) : (
                            <PlayIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {/* Delete site */}}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Site"
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

          {filteredAndSortedSites.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <ServerStackIcon className="mx-auto h-16 w-16" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Sites Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter || typeFilter
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first website'
                }
              </p>
              {!searchTerm && !statusFilter && !typeFilter && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Create Your First Site
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 