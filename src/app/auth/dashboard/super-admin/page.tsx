'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import {
  UsersIcon,
  ChartBarIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ServerIcon,
  CheckCircleIcon,
  XMarkIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignPlanModal, setShowAssignPlanModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [platformSettings, setPlatformSettings] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [metricsData, setMetricsData] = useState<any>(null);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    maxFunnels: '',
    maxProducts: '',
    maxCustomDomains: '',
    isActive: true
  });
  
  // Brand configuration state
  const [brandConfig, setBrandConfig] = useState({
    siteName: '',
    siteTagline: '',
    siteDescription: '',
    supportEmail: '',
    supportPhone: '',
    companyName: '',
    footerText: '',
    logoUrl: '',
    faviconUrl: ''
  });
  const [brandConfigSaving, setBrandConfigSaving] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user?.role !== 'SUPER_ADMIN') {
      router.push('/auth/dashboard');
      return;
    }

    loadDashboardData();
  }, [session, status, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load users data
      const usersResponse = await fetch('/api/admin/users', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users);
      } else {
        const errorData = await usersResponse.json();
        toast.error(`Users API error: ${errorData.error || 'Unknown error'}`);
      }

      // Load subscription plans
      const plansResponse = await fetch('/api/admin/subscription-plans');
      
      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setSubscriptionPlans(plansData.plans);
      } else {
        const errorData = await plansResponse.json();
        console.error('Plans API error:', errorData);
      }

      // Load analytics data
      const analyticsResponse = await fetch('/api/admin/analytics');
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalyticsData(analyticsData);
      }

      // Load platform settings
      const settingsResponse = await fetch('/api/admin/settings');
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setPlatformSettings(settingsData);
      }

      // Load brand configuration
      const brandResponse = await fetch('/api/brand-config');
      if (brandResponse.ok) {
        const brandData = await brandResponse.json();
        setBrandConfig(brandData);
      }

      // Load system health
      const healthResponse = await fetch('/api/admin/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setSystemHealth(healthData);
      }

      // Load metrics
      const metricsResponse = await fetch('/api/admin/metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetricsData(metricsData);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
      
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus })
      });

      if (response.ok) {
        toast.success(`User ${newStatus.toLowerCase()} successfully`);
        loadDashboardData(); // Reload data
      } else {
        toast.error('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const assignPlanToUser = async (userId: string) => {
    setSelectedUserId(userId);
    setShowAssignPlanModal(true);
  };

  const handleAssignPlan = async (planId: string, duration: number) => {
    try {
      const response = await fetch('/api/admin/users/assign-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: selectedUserId,
          planId,
          duration
        })
      });

      if (response.ok) {
        toast.success('Plan assigned successfully');
        setShowAssignPlanModal(false);
        setSelectedUserId(null);
        loadDashboardData(); // Reload data
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to assign plan');
      }
    } catch (error) {
      console.error('Error assigning plan:', error);
      toast.error('Failed to assign plan');
    }
  };

  // Brand Configuration Save Handler
  const handleSaveBrandConfig = async () => {
    try {
      setBrandConfigSaving(true);
      
      const response = await fetch('/api/brand-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandConfig)
      });

      if (response.ok) {
        toast.success('Brand configuration saved successfully!');
        // Reload to get updated config
        loadDashboardData();
      } else {
        toast.error('Failed to save brand configuration');
      }
    } catch (error) {
      console.error('Error saving brand config:', error);
      toast.error('Failed to save brand configuration');
    } finally {
      setBrandConfigSaving(false);
    }
  };

  // Subscription Plan CRUD Operations
  const handleCreatePlan = async () => {
    try {
      // Validation
      if (!newPlan.name || !newPlan.price || !newPlan.duration) {
        toast.error('Please fill in all required fields (Name, Price, Duration)');
        return;
      }

      const requestData = {
        name: newPlan.name,
        description: newPlan.description || '',
        price: parseFloat(newPlan.price),
        duration: parseInt(newPlan.duration),
        maxFunnels: newPlan.maxFunnels === 'unlimited' ? -1 : parseInt(newPlan.maxFunnels || '0'),
        maxProducts: newPlan.maxProducts === 'unlimited' ? -1 : parseInt(newPlan.maxProducts || '0'),
        maxCustomDomains: parseInt(newPlan.maxCustomDomains || '0'),
        isActive: newPlan.isActive
      };

      console.log('Creating plan with data:', requestData);

      const response = await fetch('/api/admin/subscription-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      console.log('Create plan response:', result);

      if (response.ok) {
        toast.success('Subscription plan created successfully');
        setShowCreatePlanModal(false);
        setNewPlan({
          name: '',
          description: '',
          price: '',
          duration: '',
          maxFunnels: '',
          maxProducts: '',
          maxCustomDomains: '',
          isActive: true
        });
        loadDashboardData(); // Reload data
      } else {
        toast.error(result.error || 'Failed to create plan');
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Failed to create plan');
    }
  };

  const handleEditPlan = async () => {
    if (!selectedPlan) return;
    
    try {
      // Validation
      if (!selectedPlan.name || !selectedPlan.price || !selectedPlan.duration) {
        toast.error('Please fill in all required fields (Name, Price, Duration)');
        return;
      }

      const requestData = {
        name: selectedPlan.name,
        description: selectedPlan.description || '',
        price: parseFloat(selectedPlan.price),
        duration: parseInt(selectedPlan.duration),
        maxFunnels: selectedPlan.maxFunnels === 'unlimited' ? -1 : parseInt(selectedPlan.maxFunnels || '0'),
        maxProducts: selectedPlan.maxProducts === 'unlimited' ? -1 : parseInt(selectedPlan.maxProducts || '0'),
        maxCustomDomains: parseInt(selectedPlan.maxCustomDomains || '0'),
        isActive: selectedPlan.isActive
      };

      console.log('Updating plan with data:', requestData);

      const response = await fetch(`/api/admin/subscription-plans/${selectedPlan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      console.log('Update plan response:', result);

      if (response.ok) {
        toast.success('Subscription plan updated successfully');
        setShowEditPlanModal(false);
        setSelectedPlan(null);
        loadDashboardData(); // Reload data
      } else {
        toast.error(result.error || 'Failed to update plan');
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update plan');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this subscription plan? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Deleting plan with ID:', planId);
      
      const response = await fetch(`/api/admin/subscription-plans/${planId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      console.log('Delete plan response:', result);

      if (response.ok) {
        toast.success('Subscription plan deleted successfully');
        loadDashboardData(); // Reload data
      } else {
        toast.error(result.error || 'Failed to delete plan');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete plan');
    }
  };

  const handleTogglePlanStatus = async (planId: string, currentStatus: boolean) => {
    try {
      console.log('Toggling plan status:', planId, 'from', currentStatus, 'to', !currentStatus);
      
      const response = await fetch(`/api/admin/subscription-plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      });

      const result = await response.json();
      console.log('Toggle plan status response:', result);

      if (response.ok) {
        toast.success(`Plan ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        loadDashboardData(); // Reload data
      } else {
        toast.error(result.error || 'Failed to update plan status');
      }
    } catch (error) {
      console.error('Error updating plan status:', error);
      toast.error('Failed to update plan status');
    }
  };

  const openEditModal = (plan: any) => {
    setSelectedPlan({
      ...plan,
      maxFunnels: plan.maxFunnels === -1 ? 'unlimited' : plan.maxFunnels.toString(),
      maxProducts: plan.maxProducts === -1 ? 'unlimited' : plan.maxProducts.toString()
    });
    setShowEditPlanModal(true);
  };

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="w-full h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full h-screen m-0 p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto scrollbar-hide px-2 sm:px-3 md:px-6">
              <div className="flex space-x-2 sm:space-x-4 md:space-x-8 min-w-max">
                {[
                  { id: 'overview', name: 'Overview', fullName: 'Platform Overview', icon: ChartBarIcon },
                  { id: 'users', name: 'Users', fullName: 'User Management', icon: UsersIcon },
                  { id: 'plans', name: 'Plans', fullName: 'Subscription Plans', icon: CreditCardIcon },
                  { id: 'analytics', name: 'Analytics', fullName: 'Detailed Analytics', icon: PresentationChartLineIcon },
                  { id: 'settings', name: 'Settings', fullName: 'Platform Settings', icon: Cog6ToothIcon },
                  { id: 'system', name: 'System', fullName: 'System Health', icon: ServerIcon }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 sm:py-3 md:py-4 px-1 sm:px-2 md:px-3 border-b-2 font-medium text-xs sm:text-sm md:text-base transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{tab.fullName}</span>
                    <span className="sm:hidden">{tab.name}</span>
                  </button>
                ))}
              </div>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-3 sm:p-4 md:p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Platform Overview</h3>
                
                {analyticsData?.overview ? (
                  <div className="space-y-6">
                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 sm:p-6 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-100 text-sm">Total Users</p>
                            <p className="text-2xl sm:text-3xl font-bold">{analyticsData.overview.totalUsers}</p>
                          </div>
                          <UsersIcon className="h-8 w-8 text-blue-200" />
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-4 sm:p-6 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-indigo-100 text-sm">Total Revenue</p>
                            <p className="text-2xl sm:text-3xl font-bold">₹{analyticsData.overview.totalRevenue.toLocaleString()}</p>
                          </div>
                          <CreditCardIcon className="h-8 w-8 text-indigo-200" />
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 sm:p-6 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-100 text-sm">Subscription Revenue</p>
                            <p className="text-2xl sm:text-3xl font-bold">₹{analyticsData.overview.subscriptionRevenue.toLocaleString()}</p>
                          </div>
                          <CreditCardIcon className="h-8 w-8 text-green-200" />
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 sm:p-6 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-emerald-100 text-sm">Transaction Revenue</p>
                            <p className="text-2xl sm:text-3xl font-bold">₹{analyticsData.overview.transactionRevenue.toLocaleString()}</p>
                          </div>
                          <ChartBarIcon className="h-8 w-8 text-emerald-200" />
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-100 text-sm">Total Funnels</p>
                            <p className="text-2xl sm:text-3xl font-bold">{analyticsData.overview.totalFunnels}</p>
                          </div>
                          <ChartBarIcon className="h-8 w-8 text-purple-200" />
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 sm:p-6 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-orange-100 text-sm">Active Users</p>
                            <p className="text-2xl sm:text-3xl font-bold">{analyticsData.overview.activeUsers}</p>
                          </div>
                          <CheckCircleIcon className="h-8 w-8 text-orange-200" />
                        </div>
                      </div>
                    </div>

                    {/* Platform Health Metrics */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Platform Health</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{analyticsData.overview.platformHealth?.activeUsersRatio?.toFixed(1) || 0}%</p>
                          <p className="text-sm text-gray-600">Active Users</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{analyticsData.overview.platformHealth?.publishedFunnelsRatio?.toFixed(1) || 0}%</p>
                          <p className="text-sm text-gray-600">Published Funnels</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">₹{analyticsData.overview.platformHealth?.averageRevenuePerUser?.toFixed(0) || 0}</p>
                          <p className="text-sm text-gray-600">Avg Revenue/User</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">{analyticsData.overview.platformHealth?.conversionRate?.toFixed(1) || 0}%</p>
                          <p className="text-sm text-gray-600">Conversion Rate</p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
                      <div className="space-y-3">
                        {analyticsData.analytics?.recentActivity?.slice(0, 5).map((activity: any, index: number) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                ₹{activity.amount} payment from {activity.customerEmail}
                              </p>
                              <p className="text-xs text-gray-500">
                                Funnel: {activity.funnel?.name} • {new Date(activity.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="text-xs text-green-600 font-medium">Completed</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading platform overview...</p>
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">User Management</h3>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription & Expiry</th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                              {loading ? 'Loading users...' : 'No users found'}
                            </td>
                          </tr>
                        ) : (
                          users.map((user: any) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-purple-600 font-medium text-xs sm:text-sm">
                                      {user.name?.charAt(0) || user.email.charAt(0)}
                                    </span>
                                  </div>
                                  <div className="ml-2 sm:ml-4">
                                    <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                                      {user.name || 'No name'}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">
                                      {user.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                                  user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                  user.status === 'DISABLED' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                {user.subscriptions && user.subscriptions.length > 0 ? (
                                  <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-900">
                                      {user.subscriptions[0].plan.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      Expires: {new Date(user.subscriptions[0].endDate).toLocaleDateString()}
                                    </span>
                                    <span className={`text-xs font-medium ${
                                      new Date(user.subscriptions[0].endDate) > new Date() 
                                        ? new Date(user.subscriptions[0].endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                          ? 'text-orange-600' // Expires within 7 days
                                          : 'text-green-600' // Active
                                        : 'text-red-600' // Expired
                                    }`}>
                                      {(() => {
                                        const expiryDate = new Date(user.subscriptions[0].endDate);
                                        const now = new Date();
                                        const diffTime = expiryDate.getTime() - now.getTime();
                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                        
                                        if (diffDays < 0) {
                                          return 'Expired';
                                        } else if (diffDays === 0) {
                                          return 'Expires Today';
                                        } else if (diffDays === 1) {
                                          return 'Expires Tomorrow';
                                        } else if (diffDays <= 7) {
                                          return `${diffDays} days left`;
                                        } else {
                                          return 'Active';
                                        }
                                      })()}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500">No Plan</span>
                                )}
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                <div>
                                  <div>{user._count?.funnels || 0} funnels</div>
                                  <div>{user._count?.products || 0} products</div>
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium space-x-1 sm:space-x-2">
                                <button
                                  onClick={() => toggleUserStatus(user.id, user.status)}
                                  className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                    user.status === 'ACTIVE' 
                                      ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                                  }`}
                                >
                                  {user.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                                </button>
                                {user.role !== 'SUPER_ADMIN' && (
                                  <button
                                    onClick={() => assignPlanToUser(user.id)}
                                    className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
                                  >
                                    {user.subscriptions && user.subscriptions.length > 0 ? 'Extend Plan' : 'Assign Plan'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Plans Tab */}
            {activeTab === 'plans' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Subscription Plans Management</h3>
                  <button
                    onClick={() => setShowCreatePlanModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Plan
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {subscriptionPlans.map((plan: any) => (
                    <div key={plan.id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900">{plan.name}</h4>
                          <p className="text-sm text-gray-600">{plan.description}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleTogglePlanStatus(plan.id, plan.isActive)}
                              className={`p-1 rounded ${
                                plan.isActive 
                                  ? 'text-red-600 hover:bg-red-100' 
                                  : 'text-green-600 hover:bg-green-100'
                              }`}
                              title={plan.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {plan.isActive ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => openEditModal(plan)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="Edit Plan"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeletePlan(plan.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Delete Plan"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                          ₹{plan.price}
                        </div>
                        <div className="text-sm text-gray-600">per {plan.duration} days</div>
                      </div>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center text-gray-700">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                          {plan.maxFunnels === -1 ? 'Unlimited' : plan.maxFunnels} Funnels
                        </div>
                        <div className="flex items-center text-gray-700">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                          {plan.maxProducts === -1 ? 'Unlimited' : plan.maxProducts} Products
                        </div>
                        <div className="flex items-center text-gray-700">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                          {plan.maxCustomDomains} Custom Domains
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {subscriptionPlans.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No subscription plans created yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Detailed Analytics</h3>
                
                {analyticsData ? (
                  <div className="space-y-6">
                    {/* Top Performing Users */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Users</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funnels</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {analyticsData.analytics?.topUsers?.slice(0, 10).map((user: any) => (
                              <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                      <span className="text-purple-600 font-medium text-sm">
                                        {user.name?.charAt(0) || user.email.charAt(0)}
                                      </span>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">{user.name || 'No name'}</div>
                                      <div className="text-sm text-gray-500">{user.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{user.metrics?.totalRevenue?.toLocaleString() || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {user.metrics?.publishedFunnels || 0}/{user.metrics?.totalFunnels || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {user.metrics?.conversionRate?.toFixed(2) || 0}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {user.metrics?.totalProducts || 0}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Top Performing Funnels */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Funnels</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funnel</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitors</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {analyticsData.analytics?.topFunnels?.slice(0, 10).map((funnel: any) => (
                              <tr key={funnel.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{funnel.name}</div>
                                  <div className="text-sm text-gray-500">{new Date(funnel.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{funnel.user?.name || 'Unknown'}</div>
                                  <div className="text-sm text-gray-500">{funnel.user?.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{funnel.revenue?.toLocaleString() || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {funnel.visitors?.toLocaleString() || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {funnel.conversions?.toLocaleString() || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    funnel.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {funnel.published ? 'Published' : 'Draft'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* System Metrics */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{analyticsData.analytics?.systemMetrics?.uptime || 99.9}%</p>
                          <p className="text-sm text-gray-600">Uptime</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{analyticsData.analytics?.systemMetrics?.averageResponseTime || 0}ms</p>
                          <p className="text-sm text-gray-600">Avg Response Time</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-red-600">{analyticsData.analytics?.systemMetrics?.errorRate || 0.1}%</p>
                          <p className="text-sm text-gray-600">Error Rate</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">{analyticsData.analytics?.systemMetrics?.totalStorage || 0}GB</p>
                          <p className="text-sm text-gray-600">Storage Used</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading analytics data...</p>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Platform Settings</h3>
                
                {platformSettings ? (
                  <div className="space-y-6">
                    {/* Platform Configuration */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Platform Configuration</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                            <input 
                              type="text" 
                              value={platformSettings.platform?.name || ''} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
                            <input 
                              type="text" 
                              value={platformSettings.platform?.version || ''} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                              readOnly
                            />
                          </div>
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              checked={platformSettings.platform?.maintenanceMode || false}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              readOnly
                            />
                            <label className="ml-2 text-sm text-gray-700">Maintenance Mode</label>
                          </div>
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              checked={platformSettings.platform?.registrationEnabled || false}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              readOnly
                            />
                            <label className="ml-2 text-sm text-gray-700">Registration Enabled</label>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Users Per Instance</label>
                            <input 
                              type="number" 
                              value={platformSettings.platform?.maxUsersPerInstance || 1} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Default Instance Port</label>
                            <input 
                              type="number" 
                              value={platformSettings.platform?.defaultInstancePort || 3001} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Brand Configuration */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Brand Configuration</h4>
                        <button
                          onClick={handleSaveBrandConfig}
                          disabled={brandConfigSaving}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                        >
                          {brandConfigSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Site Name *</label>
                            <input 
                              type="text" 
                              value={brandConfig.siteName}
                              onChange={(e) => setBrandConfig({...brandConfig, siteName: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                              placeholder="SellEarnDirect"
                            />
                            <p className="text-xs text-gray-500 mt-1">Displayed throughout the platform</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Site Tagline</label>
                            <input 
                              type="text" 
                              value={brandConfig.siteTagline}
                              onChange={(e) => setBrandConfig({...brandConfig, siteTagline: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                              placeholder="Sell Digital Products with Ease"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                            <textarea
                              value={brandConfig.siteDescription}
                              onChange={(e) => setBrandConfig({...brandConfig, siteDescription: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                              rows={3}
                              placeholder="Create sales funnels and sell digital products..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                            <input 
                              type="text" 
                              value={brandConfig.companyName}
                              onChange={(e) => setBrandConfig({...brandConfig, companyName: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                              placeholder="SellEarnDirect"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Support Email *</label>
                            <input 
                              type="email" 
                              value={brandConfig.supportEmail}
                              onChange={(e) => setBrandConfig({...brandConfig, supportEmail: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                              placeholder="support@sellearndirect.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
                            <input 
                              type="tel" 
                              value={brandConfig.supportPhone}
                              onChange={(e) => setBrandConfig({...brandConfig, supportPhone: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                              placeholder="+1 (555) 123-4567"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                            <input 
                              type="text" 
                              value={brandConfig.logoUrl}
                              onChange={(e) => setBrandConfig({...brandConfig, logoUrl: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                              placeholder="/logo.svg"
                            />
                            <p className="text-xs text-gray-500 mt-1">Path to your logo file</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Favicon URL</label>
                            <input 
                              type="text" 
                              value={brandConfig.faviconUrl}
                              onChange={(e) => setBrandConfig({...brandConfig, faviconUrl: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                              placeholder="/favicon.ico"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Footer Text</label>
                        <input 
                          type="text" 
                          value={brandConfig.footerText}
                          onChange={(e) => setBrandConfig({...brandConfig, footerText: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                          placeholder="© 2024 Company Name. All rights reserved."
                        />
                        <p className="text-xs text-gray-500 mt-1">Use {"{year}"} for dynamic year</p>
                      </div>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (seconds)</label>
                            <input 
                              type="number" 
                              value={platformSettings.security?.sessionTimeout || 3600} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                            <input 
                              type="number" 
                              value={platformSettings.security?.maxLoginAttempts || 5} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password Min Length</label>
                            <input 
                              type="number" 
                              value={platformSettings.security?.passwordMinLength || 8} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                              readOnly
                            />
                          </div>
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              checked={platformSettings.security?.requireEmailVerification || false}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              readOnly
                            />
                            <label className="ml-2 text-sm text-gray-700">Require Email Verification</label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Storage Settings */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Storage Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size (bytes)</label>
                            <input 
                              type="number" 
                              value={platformSettings.storage?.maxFileSize || 10485760} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                              readOnly
                            />
                          <p className="text-xs text-gray-500 mt-1">Current: {(platformSettings.storage?.maxFileSize || 10485760) / 1024 / 1024} MB</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Allowed File Types</label>
                          <div className="flex flex-wrap gap-2">
                            {(platformSettings.storage?.allowedFileTypes || []).map((type: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Email Settings */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Email Settings</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                            <input 
                              type="text" 
                              value={platformSettings.email?.smtpHost || ''} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                            <input 
                              type="number" 
                              value={platformSettings.email?.smtpPort || 587} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                            <input 
                              type="email" 
                              value={platformSettings.email?.fromEmail || ''} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP User</label>
                            <input 
                              type="text" 
                              value={platformSettings.email?.smtpUser || ''} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Settings are Read-Only</h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>Platform settings are currently read-only. Contact the system administrator to modify these settings.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading platform settings...</p>
                  </div>
                )}
              </div>
            )}

            {/* System Health Tab */}
            {activeTab === 'system' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">System Health</h3>
                
                {systemHealth ? (
                  <div className="space-y-6">
                    {/* System Status Overview */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">System Status</h4>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                          systemHealth.status === 'healthy' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {systemHealth.status === 'healthy' ? 'Healthy' : 'Issues Detected'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{systemHealth.platform?.totalUsers || 0}</p>
                          <p className="text-sm text-gray-600">Total Users</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{systemHealth.platform?.totalFunnels || 0}</p>
                          <p className="text-sm text-gray-600">Total Funnels</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">₹{systemHealth.platform?.totalRevenue?.toLocaleString() || 0}</p>
                          <p className="text-sm text-gray-600">Total Revenue</p>
                        </div>
                      </div>
                    </div>

                    {/* Database Health */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Database Health</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                            <span className="text-sm font-medium text-gray-900">Database Connection</span>
                          </div>
                          <span className="text-sm text-green-600 font-medium">Connected</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                            <span className="text-sm font-medium text-gray-900">Query Performance</span>
                          </div>
                          <span className="text-sm text-green-600 font-medium">Optimal</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                            <span className="text-sm font-medium text-gray-900">Data Integrity</span>
                          </div>
                          <span className="text-sm text-green-600 font-medium">Healthy</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                            <span className="text-sm font-medium text-gray-900">Backup Status</span>
                          </div>
                          <span className="text-sm text-green-600 font-medium">Up to Date</span>
                        </div>
                      </div>
                    </div>

                    {/* API Health */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">API Health</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                            <span className="text-sm font-medium text-gray-900">Authentication API</span>
                          </div>
                          <span className="text-sm text-green-600 font-medium">Operational</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                            <span className="text-sm font-medium text-gray-900">Payment Processing</span>
                          </div>
                          <span className="text-sm text-green-600 font-medium">Operational</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                            <span className="text-sm font-medium text-gray-900">File Upload Service</span>
                          </div>
                          <span className="text-sm text-green-600 font-medium">Operational</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                            <span className="text-sm font-medium text-gray-900">Analytics API</span>
                          </div>
                          <span className="text-sm text-green-600 font-medium">Operational</span>
                        </div>
                      </div>
                    </div>

                    {/* Server Metrics */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Server Metrics</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">99.9%</p>
                          <p className="text-sm text-gray-600">Uptime</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">45ms</p>
                          <p className="text-sm text-gray-600">Avg Response Time</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">2.1GB</p>
                          <p className="text-sm text-gray-600">Memory Usage</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-orange-600">15%</p>
                          <p className="text-sm text-gray-600">CPU Usage</p>
                        </div>
                      </div>
                    </div>

                    {/* System Information */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">System Information</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Server Time</span>
                            <span className="text-sm font-medium text-gray-900">
                              {new Date().toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Last Checked</span>
                            <span className="text-sm font-medium text-gray-900">
                              {systemHealth.timestamp ? new Date(systemHealth.timestamp).toLocaleString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Node Version</span>
                            <span className="text-sm font-medium text-gray-900">v18.17.0</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Environment</span>
                            <span className="text-sm font-medium text-gray-900">Production</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Database</span>
                            <span className="text-sm font-medium text-gray-900">PostgreSQL</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Framework</span>
                            <span className="text-sm font-medium text-gray-900">Next.js</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
                      <div className="flex flex-wrap gap-3">
                        <button className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                          Clear Cache
                        </button>
                        <button className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                          Run Health Check
                        </button>
                        <button className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium">
                          View Logs
                        </button>
                        <button className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium">
                          Restart Services
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading system health data...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Create Plan Modal */}
        {showCreatePlanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Create New Subscription Plan</h3>
                  <button
                    onClick={() => {
                      setShowCreatePlanModal(false);
                      setNewPlan({
                        name: '',
                        description: '',
                        price: '',
                        duration: '',
                        maxFunnels: '',
                        maxProducts: '',
                        maxCustomDomains: '',
                        isActive: true
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
                      <input
                        type="text"
                        value={newPlan.name}
                        onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                        placeholder="e.g., Professional Plan"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                      <input
                        type="number"
                        value={newPlan.price}
                        onChange={(e) => setNewPlan({...newPlan, price: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                        placeholder="999"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newPlan.description}
                      onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      rows={3}
                      placeholder="Describe what this plan includes..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
                      <input
                        type="number"
                        value={newPlan.duration}
                        onChange={(e) => setNewPlan({...newPlan, duration: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Custom Domains</label>
                      <input
                        type="number"
                        value={newPlan.maxCustomDomains}
                        onChange={(e) => setNewPlan({...newPlan, maxCustomDomains: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                        placeholder="2"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Funnels</label>
                      <select
                        value={newPlan.maxFunnels}
                        onChange={(e) => setNewPlan({...newPlan, maxFunnels: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      >
                        <option value="">Select limit</option>
                        <option value="5">5 Funnels</option>
                        <option value="25">25 Funnels</option>
                        <option value="100">100 Funnels</option>
                        <option value="unlimited">Unlimited</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Products</label>
                      <select
                        value={newPlan.maxProducts}
                        onChange={(e) => setNewPlan({...newPlan, maxProducts: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      >
                        <option value="">Select limit</option>
                        <option value="10">10 Products</option>
                        <option value="50">50 Products</option>
                        <option value="200">200 Products</option>
                        <option value="unlimited">Unlimited</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={newPlan.isActive}
                      onChange={(e) => setNewPlan({...newPlan, isActive: e.target.checked})}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                      Plan is active and available for purchase
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreatePlanModal(false);
                      setNewPlan({
                        name: '',
                        description: '',
                        price: '',
                        duration: '',
                        maxFunnels: '',
                        maxProducts: '',
                        maxCustomDomains: '',
                        isActive: true
                      });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePlan}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Plan Modal */}
        {showEditPlanModal && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Edit Subscription Plan</h3>
                  <button
                    onClick={() => {
                      setShowEditPlanModal(false);
                      setSelectedPlan(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
                      <input
                        type="text"
                        value={selectedPlan.name}
                        onChange={(e) => setSelectedPlan({...selectedPlan, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                      <input
                        type="number"
                        value={selectedPlan.price}
                        onChange={(e) => setSelectedPlan({...selectedPlan, price: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={selectedPlan.description}
                      onChange={(e) => setSelectedPlan({...selectedPlan, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
                      <input
                        type="number"
                        value={selectedPlan.duration}
                        onChange={(e) => setSelectedPlan({...selectedPlan, duration: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Custom Domains</label>
                      <input
                        type="number"
                        value={selectedPlan.maxCustomDomains}
                        onChange={(e) => setSelectedPlan({...selectedPlan, maxCustomDomains: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Funnels</label>
                      <select
                        value={selectedPlan.maxFunnels}
                        onChange={(e) => setSelectedPlan({...selectedPlan, maxFunnels: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      >
                        <option value="5">5 Funnels</option>
                        <option value="25">25 Funnels</option>
                        <option value="100">100 Funnels</option>
                        <option value="unlimited">Unlimited</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Products</label>
                      <select
                        value={selectedPlan.maxProducts}
                        onChange={(e) => setSelectedPlan({...selectedPlan, maxProducts: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      >
                        <option value="10">10 Products</option>
                        <option value="50">50 Products</option>
                        <option value="200">200 Products</option>
                        <option value="unlimited">Unlimited</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editIsActive"
                      checked={selectedPlan.isActive}
                      onChange={(e) => setSelectedPlan({...selectedPlan, isActive: e.target.checked})}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="editIsActive" className="ml-2 text-sm text-gray-700">
                      Plan is active and available for purchase
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEditPlanModal(false);
                      setSelectedPlan(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditPlan}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Update Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assign Plan Modal */}
        {showAssignPlanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Assign Subscription Plan</h3>
                  <button
                    onClick={() => {
                      setShowAssignPlanModal(false);
                      setSelectedUserId(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {subscriptionPlans.map((plan: any) => (
                    <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                          <p className="text-sm text-gray-600">{plan.description}</p>
                          <div className="mt-2">
                            <span className="text-lg font-bold text-purple-600">₹{plan.price}</span>
                            <span className="text-sm text-gray-600">/{plan.duration} days</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleAssignPlan(plan.id, 30)}
                          className="flex-1 px-3 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 text-sm font-medium"
                        >
                          30 Days
                        </button>
                        <button
                          onClick={() => handleAssignPlan(plan.id, 90)}
                          className="flex-1 px-3 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 text-sm font-medium"
                        >
                          90 Days
                        </button>
                        <button
                          onClick={() => handleAssignPlan(plan.id, 365)}
                          className="flex-1 px-3 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 text-sm font-medium"
                        >
                          1 Year
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}