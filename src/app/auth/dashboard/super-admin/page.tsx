"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardLayout from '@/components/layouts/dashboard-layout';
import toast from 'react-hot-toast';
import TemplateAdminPanel from '@/components/dashboard/template-admin-panel';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Pagination from '@mui/material/Pagination';

function Badge({ children, color = "gray" }: { children: React.ReactNode; color?: string }) {
  const colorMap: any = {
    gray: "bg-gray-100 text-gray-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
    yellow: "bg-yellow-100 text-yellow-800",
  };
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${colorMap[color] || colorMap.gray}`}>{children}</span>;
}

// Helper to fetch all payments
async function fetchAllPayments() {
  const res = await fetch('/api/admin/payments');
  if (!res.ok) return [];
  return await res.json();
}

// Helper to retry fetch with delay
async function retryFetch(url: string, retries = 2, delay = 500) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url);
    if (res.ok) return res;
    await new Promise(r => setTimeout(r, delay));
  }
  return await fetch(url); // final try
}

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add'|'edit'>("add");
  const [userForm, setUserForm] = useState<any>({ name: '', email: '', role: 'USER', enabled: true, planId: '' });
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState<any>({ name: '', price: '', duration: '', features: '', interval: 'monthly' });
  const [planMode, setPlanMode] = useState<'add'|'edit'>('add');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [planToDelete, setPlanToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    mrr: 0,
    arr: 0,
  });

  // Plan features structure
  const defaultFeatureState = {
    websites: '',
    unlimitedWebsites: false,
    support: '',
    customDomain: false,
    advancedAnalytics: false,
    customIntegrations: false,
    teamManagement: false,
    communityAccess: false,
  };
  const [featureForm, setFeatureForm] = useState<any>({ ...defaultFeatureState });

  // Frontend content state
  const [frontendContent, setFrontendContent] = useState<any>(null);
  const [frontendLoading, setFrontendLoading] = useState(false);
  const [frontendSaving, setFrontendSaving] = useState(false);

  const [planChangeLoading, setPlanChangeLoading] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState(5);
  const [metrics, setMetrics] = useState<any>(null);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(false);

  // Users search and pagination state
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 10;
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  const paginatedUsers = filteredUsers.slice((userPage-1)*usersPerPage, userPage*usersPerPage);
  const userPageCount = Math.ceil(filteredUsers.length / usersPerPage);

  // Sites search and pagination state
  const [siteSearch, setSiteSearch] = useState('');
  const [sitePage, setSitePage] = useState(1);
  const sitesPerPage = 10;
  const filteredSites = sites.filter(s =>
    s.name.toLowerCase().includes(siteSearch.toLowerCase()) ||
    (s.user?.email || '').toLowerCase().includes(siteSearch.toLowerCase()) ||
    (s.subdomain || '').toLowerCase().includes(siteSearch.toLowerCase())
  );
  const paginatedSites = filteredSites.slice((sitePage-1)*sitesPerPage, sitePage*sitesPerPage);
  const sitePageCount = Math.ceil(filteredSites.length / sitesPerPage);
  // Plans search and pagination state
  const [planSearch, setPlanSearch] = useState('');
  const [planPage, setPlanPage] = useState(1);
  const plansPerPage = 10;
  const filteredPlans = plans.filter(p =>
    p.name.toLowerCase().includes(planSearch.toLowerCase())
  );
  const paginatedPlans = filteredPlans.slice((planPage-1)*plansPerPage, planPage*plansPerPage);
  const planPageCount = Math.ceil(filteredPlans.length / plansPerPage);
  // Templates search and pagination state
  const [templateSearch, setTemplateSearch] = useState('');
  const [templatePage, setTemplatePage] = useState(1);
  const templatesPerPage = 10;

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    setUsersLoading(true);
    setPlansLoading(true);
    setStatsLoading(true);
    
    try {
      const [users, sites, plans, userCountRes, revenueRes] = await Promise.all([
        fetch("/api/admin/users").then(r => r.ok ? r.json() : Promise.reject("Failed to fetch users")),
        fetch("/api/admin/sites").then(r => r.ok ? r.json() : Promise.reject("Failed to fetch sites")),
        fetch("/api/plans").then(r => r.ok ? r.json() : Promise.reject("Failed to fetch plans")),
        fetch("/api/admin/users?count=1").then(r => r.ok ? r.json() : { total: 0 }),
        fetch("/api/admin/revenue").then(r => r.ok ? r.json() : { total: 0 }),
      ]);
      setUsers(users);
      setSites(sites);
      setPlans(Array.isArray(plans) ? plans : plans.plans || []);
      setStats({
        totalUsers: userCountRes.total || 0,
        totalRevenue: revenueRes.total || 0,
        mrr: 0,
        arr: 0,
      });
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to load data");
    } finally {
      setLoading(false);
      setUsersLoading(false);
      setPlansLoading(false);
      setStatsLoading(false);
    }
  };

  // Load metrics for graphs
  useEffect(() => {
    async function loadMetrics() {
      setMetricsLoading(true);
      try {
        const res = await fetch('/api/admin/metrics?days=120');
        if (res.ok) setMetrics(await res.json());
      } finally {
        setMetricsLoading(false);
      }
    }
    if (status === 'authenticated' && session?.user?.role === 'SUPER_ADMIN') {
      loadMetrics();
    }
  }, [status, session]);

  // Fetch frontend content
  const fetchFrontendContent = async () => {
    setFrontendLoading(true);
    try {
      const res = await fetch('/api/admin/frontend-content');
      const data = await res.json();
      setFrontendContent(data.data || {});
    } catch (err) {
      toast.error('Failed to load frontend content');
    } finally {
      setFrontendLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "SUPER_ADMIN") {
      fetchAll();
      fetchFrontendContent();
    }
    // eslint-disable-next-line
  }, [status, session]);

  const handleSaveUser = async () => {
    setSaving(true);
    setActionError("");
    try {
      if (!userForm.name || !userForm.email) {
        setActionError("Name and Email are required.");
        setSaving(false);
        return;
      }
      const method = modalMode === 'add' ? 'POST' : 'PATCH';
      const url = modalMode === 'add' ? '/api/admin/users' : `/api/admin/users/${selectedUser?.id}`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      });
      if (!res.ok) throw new Error('Failed to save user');
      setShowUserModal(false);
      setUserForm({ name: '', email: '', role: 'USER', enabled: true, planId: '' });
      setSelectedUser(null);
      const updatedUser = await res.json();
      if (modalMode === 'add') {
        // Refetch all for add (to get subscriptions/plans)
        await fetchAll();
        toast.success('User added successfully!');
      } else {
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...userForm } : u));
        toast.success('User updated successfully!');
      }
    } catch (err) {
      setActionError('Failed to save user');
      toast.error('Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleUser = async (user: any) => {
    setActionError("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !user.enabled }),
      });
      if (!res.ok) throw new Error('Failed to update user');
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, enabled: !user.enabled } : u));
      toast.success(user.enabled ? 'User disabled.' : 'User enabled.');
    } catch (err) {
      setActionError('Failed to update user');
      toast.error('Failed to update user');
    }
  };

  const handleChangeUserPlan = async (user: any, planId: string) => {
    setActionError("");
    setPlanChangeLoading(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
  
      if (!res.ok) throw new Error('Failed to update user plan');
      
      // Wait a bit for backend to update
      await new Promise(res => setTimeout(res, 500));
  
      // Refetch both user and subscriptions for this user, with retry
      const [userRes] = await Promise.all([
        retryFetch(`/api/admin/users/${user.id}`),
        // retryFetch(`/api/admin/users/${user.id}/subscriptions`),
      ]);
  
      if (!userRes.ok ) throw new Error('Failed to refetch user or subscriptions');
  
      const updatedUser = await userRes.json();
      // const updatedSubs = await subsRes.json();
  
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
  
      toast.success('User plan updated.');
      setActionSuccess('User plan updated successfully');  // Set actionSuccess state here
    } catch (err) {
      setActionError('Failed to update user plan');
      toast.error('Failed to update user plan');
    } finally {
      setPlanChangeLoading(null);
    }
  };
  
  const handleDeleteUser = async (user: any) => {
    setActionError("");
    toast((t) => (
      <span>
        Are you sure you want to delete user <b>{user.email}</b>?<br/>
        <button
          className="mt-2 mr-2 px-3 py-1 bg-red-600 text-white rounded"
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
              if (!res.ok) throw new Error('Failed to delete user');
              setUsers(prev => prev.filter(u => u.id !== user.id));
              toast.success('User deleted.');
            } catch (err) {
              toast.error('Failed to delete user');
            }
          }}
        >Yes, Delete</button>
        <button
          className="mt-2 px-3 py-1 bg-gray-200 text-gray-700 rounded"
          onClick={() => toast.dismiss(t.id)}
        >Cancel</button>
      </span>
    ), { duration: 10000 });
  };

  const openAddUser = () => {
    setModalMode('add');
    setUserForm({ name: '', email: '', role: 'USER', enabled: true, planId: '' });
    setSelectedUser(null);
    setShowUserModal(true);
    setActionError("");
  };
  const openEditUser = (user: any) => {
    const activeSub = user.subscriptions?.find((s: any) => s.status === 'active');
    const currentPlanId = activeSub?.planId || '';
    setModalMode('edit');
    setUserForm({ name: user.name, email: user.email, role: user.role, enabled: user.enabled, planId: currentPlanId });
    setSelectedUser(user);
    setShowUserModal(true);
    setActionError("");
  };

  const openAddPlan = () => {
    setPlanMode('add');
    setPlanForm({ name: '', price: '', features: '', interval: 'monthly' });
    setFeatureForm({ ...defaultFeatureState });
    setSelectedPlan(null);
    setShowPlanModal(true);
  };
  const openEditPlan = (plan: any) => {
    setPlanMode('edit');
    setPlanForm({ name: plan.name, price: plan.price, features: '', interval: plan.interval || 'monthly' });
    setFeatureForm({
      websites: plan.unlimitedWebsites ? '' : (plan.numberOfWebsites ? String(plan.numberOfWebsites) : ''),
      unlimitedWebsites: Boolean(plan.unlimitedWebsites),
      support: plan.supportLevel || '',
      customDomain: Boolean(plan.customDomain),
      advancedAnalytics: Boolean(plan.advancedAnalytics),
      customIntegrations: Boolean(plan.customIntegrations),
      teamManagement: Boolean(plan.teamManagement),
      communityAccess: Boolean(plan.communityAccess),
    });
    setSelectedPlan(plan);
    setShowPlanModal(true);
  };
  const handleSavePlan = async () => {
    setSaving(true);
    setActionError("");
    try {
      if (!planForm.name || planForm.price === '' || planForm.price === null || planForm.price === undefined || !planForm.interval) {
        setActionError("Name, Price, and Interval are required.");
        setSaving(false);
        return;
      }
      const method = planMode === 'add' ? 'POST' : 'PATCH';
      const url = planMode === 'add' ? '/api/plans' : `/api/plans/${selectedPlan?.id}`;
      const body = {
        ...planForm,
        numberOfWebsites: featureForm.unlimitedWebsites ? null : (featureForm.websites ? Number(featureForm.websites) : null),
        unlimitedWebsites: Boolean(featureForm.unlimitedWebsites),
        supportLevel: featureForm.support || null,
        customDomain: Boolean(featureForm.customDomain),
        advancedAnalytics: Boolean(featureForm.advancedAnalytics),
        customIntegrations: Boolean(featureForm.customIntegrations),
        teamManagement: Boolean(featureForm.teamManagement),
        communityAccess: Boolean(featureForm.communityAccess),
        interval: planForm.interval,
      };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to save plan');
      setShowPlanModal(false);
      setPlanForm({ name: '', price: '', features: '', interval: 'monthly' });
      setFeatureForm({ ...defaultFeatureState });
      setSelectedPlan(null);
      const updatedPlan = await res.json();
      if (planMode === 'add') {
        // Refetch all for add
        await fetchAll();
        toast.success('Plan added successfully!');
      } else {
        setPlans(prev => prev.map(p => p.id === selectedPlan.id ? { ...p, ...planForm, ...body } : p));
        toast.success('Plan updated successfully!');
      }
    } catch (err) {
      setActionError('Failed to save plan');
      toast.error('Failed to save plan');
    } finally {
      setSaving(false);
    }
  };
  const handleDeletePlan = (plan: any) => {
    setPlanToDelete(plan);
  };

  const confirmDeletePlan = async () => {
    if (!planToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/plans/${planToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete plan');
      }
      setPlans(prev => prev.filter(p => p.id !== planToDelete.id));
      toast.success('Plan deleted.');
      setPlanToDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete plan');
    } finally {
      setDeleting(false);
    }
  };

  // Handlers for editing frontend content
  const handleFrontendChange = (section: string, value: any) => {
    setFrontendContent((prev: any) => ({ ...prev, [section]: value }));
  };

  const handleSaveFrontendContent = async () => {
    setFrontendSaving(true);
    try {
      const res = await fetch('/api/admin/frontend-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(frontendContent),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Frontend content updated!');
      fetchFrontendContent();
    } catch (err) {
      toast.error('Failed to save frontend content');
    } finally {
      setFrontendSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="py-10 text-center text-gray-500 bg-white min-h-screen w-full">Loading...</div>
      </DashboardLayout>
    );
  }
  if (status === 'authenticated' && (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com'))) {
    return (
      <DashboardLayout>
        <div className="py-10 text-center text-red-500 bg-white min-h-screen w-full">Access Denied: You do not have permission to view this page.</div>
      </DashboardLayout>
    );
  }

  // Show loading skeleton while fetching initial data (except Overview tab)
  if (loading && activeTab !== 5) {
    return (
      <DashboardLayout>
        <div className="p-6">
          {/* Stats Loading Skeleton */}
          <div className="w-full max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 mb-8">
            <SkeletonLoader type="card" className="h-32" />
            <SkeletonLoader type="card" className="h-32" />
          </div>
          
          {/* Tabs Loading Skeleton */}
          <div className="min-h-screen w-full bg-black">
            <div className="w-full ml-auto mr-auto py-10">
              <div className="mb-8 flex justify-center">
                <SkeletonLoader type="button" className="w-64 h-12" />
              </div>
              
              {/* Content Loading Skeleton */}
              <div className="w-full bg-black rounded-3xl shadow-2xl p-10 border border-gray-700">
                <div className="flex items-center justify-between mb-8">
                  <SkeletonLoader type="text" lines={1} className="w-32" />
                  <SkeletonLoader type="button" className="w-32" />
                </div>
                <SkeletonLoader type="table" lines={5} />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Main dashboard content below
  return (
    <DashboardLayout>
      {/* Super Admin Stats Summary */}
      <div className="w-full max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 mb-8">
        {/* Total Users Card */}
        <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700 flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute top-4 right-4 opacity-20 text-blue-400 text-6xl pointer-events-none select-none">
            <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' className='w-14 h-14'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-6.13a4 4 0 11-8 0 4 4 0 018 0z' /></svg>
          </div>
          {statsLoading ? (
            <div className="text-5xl font-extrabold text-blue-400 mb-2 drop-shadow-lg">
              <LoadingSpinner size="lg" color="primary" />
            </div>
          ) : (
            <div className="text-5xl font-extrabold text-blue-400 mb-2 drop-shadow-lg">{stats.totalUsers}</div>
          )}
          <div className="text-lg font-semibold text-white tracking-wide mb-1">Total Users</div>
          <div className="text-xs text-gray-400">All registered users</div>
        </div>
        {/* Total Revenue Card */}
        <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700 flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute top-4 right-4 opacity-20 text-green-400 text-6xl pointer-events-none select-none">
            <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' className='w-14 h-14'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 12v4m8-8h-4m-8 0H4' /></svg>
          </div>
          {statsLoading ? (
            <div className="text-5xl font-extrabold text-green-400 mb-2 drop-shadow-lg">
              <LoadingSpinner size="lg" color="primary" />
            </div>
          ) : (
            <div className="text-5xl font-extrabold text-green-400 mb-2 drop-shadow-lg">₹{stats.totalRevenue.toLocaleString()}</div>
          )}
          <div className="text-lg font-semibold text-white tracking-wide mb-1">Total Revenue</div>
          <div className="text-xs text-gray-400">All-time revenue</div>
        </div>
      </div>
      {/* Main Panel (Tabs, etc.) */}
      <div className="min-h-screen w-full font-sans">
        <div className="w-full ml-auto mr-auto py-10">
          {/* <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-500 to-green-400 mb-12 tracking-tight drop-shadow-lg text-center">Super Admin Panel</h1> */}
            {/* Tab Bar */}
            <div className="mb-8 flex justify-center">
              <Tabs 
                value={activeTab} 
                onChange={(_, v) => setActiveTab(v)} 
                variant="scrollable" 
                scrollButtons="auto" 
                className="bg-gray-900 rounded-xl shadow border border-gray-700"
                sx={{
                  '& .MuiTab-root': {
                    color: 'white',
                    '&.Mui-selected': {
                      color: 'white',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#3b82f6',
                  },
                }}
              >
                <Tab label="Users" />
                <Tab label="Sites" />
                <Tab label="Plans" />
                <Tab label="Templates" />
                <Tab label="Domains" />
                <Tab label="Overview" />
              </Tabs>
            </div>
            {/* Tab Panels */}
            {activeTab === 0 && (
              <div className="w-full bg-black rounded-3xl shadow-2xl p-10 flex flex-col relative border-2 border-gray-700 hover:shadow-gray-700/50 transition-shadow duration-300">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-2"><span className="inline-block w-3 h-3 bg-purple-400 rounded-full animate-pulse"></span> All Users</h2>
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="border rounded px-3 py-2 text-white bg-gray-800 border-gray-600 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                    value={userSearch}
                    onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                    style={{ minWidth: 200 }}
                  />
                  <button
                    onClick={openAddUser}
                    disabled={usersLoading}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold px-6 py-2 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 flex items-center gap-2"
                    style={{ boxShadow: '0 4px 16px 0 rgba(139,92,246,0.10)' }}
                    aria-label="Add User"
                  >
                    {usersLoading ? (
                      <>
                        <LoadingSpinner size="sm" color="white" />
                        Loading...
                      </>
                    ) : (
                      '+ Add User'
                    )}
                  </button>
                </div>
                {actionError && <div className="text-red-400 mb-2">{actionError}</div>}
                {actionSuccess && <div className="text-green-400 mb-2">{actionSuccess}</div>}
                <div className="overflow-x-auto rounded-xl border border-gray-700">
                  <table className="min-w-full bg-gray-900 rounded-xl overflow-hidden">
                    <thead className="bg-gradient-to-r from-gray-800 to-gray-700">
                      <tr>
                        <th className="px-4 py-3 border-b border-gray-700 text-left text-white text-sm font-semibold">Name</th>
                        <th className="px-4 py-3 border-b border-gray-700 text-left text-white text-sm font-semibold">Email</th>
                        <th className="px-4 py-3 border-b border-gray-700 text-left text-white text-sm font-semibold">Role</th>
                        <th className="px-4 py-3 border-b border-gray-700 text-left text-white text-sm font-semibold">Enabled</th>
                        <th className="px-4 py-3 border-b border-gray-700 text-left text-white text-sm font-semibold">Plan</th>
                        <th className="px-4 py-3 border-b border-gray-700 text-left text-white text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i} className="hover:bg-gray-800 transition-all">
                            <td className="px-4 py-2 border-b border-gray-700"><SkeletonLoader type="text" lines={1} /></td>
                            <td className="px-4 py-2 border-b border-gray-700"><SkeletonLoader type="text" lines={1} /></td>
                            <td className="px-4 py-2 border-b border-gray-700"><SkeletonLoader type="button" /></td>
                            <td className="px-4 py-2 border-b border-gray-700"><SkeletonLoader type="button" /></td>
                            <td className="px-4 py-2 border-b border-gray-700"><SkeletonLoader type="text" lines={1} /></td>
                            <td className="px-4 py-2 border-b border-gray-700"><SkeletonLoader type="button" /></td>
                          </tr>
                        ))
                      ) : paginatedUsers.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-6 text-gray-400">No users found.</td></tr>
                      ) : paginatedUsers.map((user: any) => {
                        const activeSub = user.subscriptions?.find((s: any) => s.status === 'active');
                        const currentPlanId = activeSub?.planId || '';
                        return (
                          <tr key={user.id} className="hover:bg-gray-800 transition-all group">
                            <td className="px-4 py-2 border-b border-gray-700 text-white font-medium">{user.name}</td>
                            <td className="px-4 py-2 border-b border-gray-700 text-gray-300">{user.email}</td>
                            <td className="px-4 py-2 border-b border-gray-700">
                              <Badge color={user.role === 'SUPER_ADMIN' ? 'purple' : 'blue'}>{user.role}</Badge>
                            </td>
                            <td className="px-4 py-2 border-b border-gray-700">
                              <Badge color={user.enabled ? 'green' : 'red'}>{user.enabled ? 'Enabled' : 'Disabled'}</Badge>
                              <button
                                className={`ml-2 w-10 h-6 rounded-full relative focus:outline-none border-2 border-gray-600 ${user.enabled ? 'bg-green-400' : 'bg-gray-600'} transition-all`}
                                onClick={() => handleToggleUser(user)}
                                aria-label="Toggle user enabled"
                              >
                                <span className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-200 ${user.enabled ? 'bg-white translate-x-4' : 'bg-white translate-x-0'}`}></span>
                              </button>
                            </td>
                            <td className="px-4 py-2 border-b border-gray-700">
                              <span className="block mb-1 text-sm text-white font-semibold">
                                {planChangeLoading === user.id ? (
                                  <span className="flex items-center gap-1">
                                    <LoadingSpinner size="sm" color="primary" />
                                    Updating...
                                  </span>
                                ) : (
                                  activeSub?.plan?.name || 'No Plan'
                                )}
                              </span>
                              <div className="relative">
                                <select
                                  className={`border rounded px-2 py-1 text-white bg-gray-800 border-gray-600 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 pr-8 transition-colors ${
                                    planChangeLoading === user.id 
                                      ? 'bg-gray-700 cursor-not-allowed' 
                                      : 'bg-gray-800'
                                  }`}
                                  value={currentPlanId}
                                  onChange={e => handleChangeUserPlan(user, e.target.value)}
                                  disabled={planChangeLoading === user.id}
                                >
                                  <option value="">No Plan</option>
                                  {plans.map((plan: any) => (
                                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                                  ))}
                                </select>
                                {planChangeLoading === user.id && (
                                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                    <LoadingSpinner size="sm" color="primary" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2 border-b border-gray-700 flex gap-2">
                              <button 
                                onClick={() => openEditUser(user)} 
                                disabled={saving}
                                className="text-blue-400 hover:bg-blue-900/20 px-2 py-1 rounded transition-all flex items-center gap-1"
                              >
                                {saving ? <LoadingSpinner size="sm" color="primary" /> : null}
                                Edit
                              </button>
                              <button 
                                onClick={() => router.push(`/auth/dashboard/super-admin/user/${user.id}`)} 
                                className="text-purple-400 hover:bg-purple-900/20 px-2 py-1 rounded transition-all"
                              >
                                View
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user)} 
                                disabled={deleting}
                                className="text-red-400 hover:bg-red-900/20 px-2 py-1 rounded transition-all flex items-center gap-1"
                              >
                                {deleting ? <LoadingSpinner size="sm" color="primary" /> : null}
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {userPageCount > 1 && (
                  <div className="flex justify-center mt-4">
                    <Pagination
                      count={userPageCount}
                      page={userPage}
                      onChange={(_, v) => setUserPage(v)}
                      color="primary"
                      shape="rounded"
                    />
                  </div>
                )}
              </div>
            )}
            {activeTab === 1 && (
              <div className="w-full bg-black rounded-3xl shadow-2xl p-10 flex flex-col border-2 border-gray-700 hover:shadow-gray-700/50 transition-shadow duration-300">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-2"><span className="inline-block w-3 h-3 bg-blue-400 rounded-full animate-pulse"></span> All Sites</h2>
                  <input
                    type="text"
                    placeholder="Search sites..."
                    className="border rounded px-3 py-2 text-white bg-gray-800 border-gray-600 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    value={siteSearch}
                    onChange={e => { setSiteSearch(e.target.value); setSitePage(1); }}
                    style={{ minWidth: 200 }}
                  />
                </div>
                {actionError && <div className="text-red-400 mb-2">{actionError}</div>}
                {actionSuccess && <div className="text-green-400 mb-2">{actionSuccess}</div>}
                <div className="overflow-x-auto rounded-xl border border-gray-700">
                  <table className="min-w-full bg-gray-900 rounded-xl overflow-hidden">
                    <thead className="bg-gradient-to-r from-gray-800 to-gray-700">
                      <tr>
                        <th className="px-4 py-3 border-b border-gray-700 text-left text-white text-sm font-semibold">Name</th>
                        <th className="px-4 py-3 border-b border-gray-700 text-left text-white text-sm font-semibold">Subdomain</th>
                        <th className="px-4 py-3 border-b border-gray-700 text-left text-white text-sm font-semibold">Owner</th>
                        <th className="px-4 py-3 border-b border-gray-700 text-left text-white text-sm font-semibold">Domain</th>
                        <th className="px-4 py-3 border-b border-gray-700 text-left text-white text-sm font-semibold">Domain Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSites.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-6 text-gray-400">No sites found.</td></tr>
                      ) : paginatedSites.map((site: any) => (
                        <tr key={site.id} className="hover:bg-gray-800 transition-all group">
                          <td className="px-4 py-2 border-b border-gray-700 text-white font-medium">{site.name}</td>
                          <td className="px-4 py-2 border-b border-gray-700 text-gray-300">{site.subdomain}</td>
                          <td className="px-4 py-2 border-b border-gray-700 text-gray-300">{site.user?.email || '-'}</td>
                          <td className="px-4 py-2 border-b border-gray-700 text-gray-300">{site.customDomain || '-'}</td>
                          <td className="px-4 py-2 border-b border-gray-700">
                            {/* Domain Status logic: Connected, Not Connected, Pending DNS (future) */}
                            {site.customDomain
                              ? (
                                  // Placeholder for DNS verification logic
                                  // e.g., if (site.domainVerified) ...
                                  <Badge color="green">Connected</Badge>
                                )
                              : <Badge color="gray">Not Connected</Badge>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {sitePageCount > 1 && (
                  <div className="flex justify-center mt-4">
                    <Pagination
                      count={sitePageCount}
                      page={sitePage}
                      onChange={(_, v) => setSitePage(v)}
                      color="primary"
                      shape="rounded"
                    />
                  </div>
                )}
              </div>
            )}
            {activeTab === 2 && (
              <div className="w-full bg-black rounded-3xl shadow-2xl p-10 flex flex-col border-2 border-gray-700 hover:shadow-gray-700/50 transition-shadow duration-300">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-2"><span className="inline-block w-3 h-3 bg-green-400 rounded-full animate-pulse"></span> Manage Plans</h2>
                  <input
                    type="text"
                    placeholder="Search plans..."
                    className="border rounded px-3 py-2 text-white bg-gray-800 border-gray-600 focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    value={planSearch}
                    onChange={e => { setPlanSearch(e.target.value); setPlanPage(1); }}
                    style={{ minWidth: 200 }}
                  />
                  <button onClick={openAddPlan} className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white font-bold px-6 py-2 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400">+ Add Plan</button>
                </div>
                {actionError && <div className="text-red-400 mb-2">{actionError}</div>}
                {actionSuccess && <div className="text-green-400 mb-2">{actionSuccess}</div>}
                <div className="overflow-x-auto rounded-xl border border-gray-700">
                  <table className="min-w-full bg-gray-900 rounded-xl overflow-hidden">
                    <thead className="bg-gradient-to-r from-gray-800 to-gray-700">
                      <tr>
                        <th className="px-4 py-3 border-b border-gray-700 text-left text-white text-sm font-semibold">Name</th>
                        <th className="px-4 py-3 border-b border-gray-700 text-left text-white text-sm font-semibold">Price</th>
                        <th className="px-4 py-3 border-b border-gray-700 text-left text-white text-sm font-semibold">Interval</th>
                        <th className="px-4 py-3 border-b border-gray-700 text-left text-white text-sm font-semibold">Features</th>
                        <th className="px-4 py-3 border-b border-gray-700 text-left text-white text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPlans.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-6 text-gray-400">No plans found.</td></tr>
                      ) : paginatedPlans.map((plan: any) => {
                        const features: string[] = [];
                        if (plan.unlimitedWebsites) {
                          features.push('Unlimited Websites');
                        } else if (plan.numberOfWebsites) {
                          features.push(`${plan.numberOfWebsites} Website${plan.numberOfWebsites === 1 ? '' : 's'}`);
                        }
                        if (plan.supportLevel) features.push(`${plan.supportLevel} Support`);
                        if (plan.customDomain) features.push('Custom Domain');
                        if (plan.advancedAnalytics) features.push('Advanced Analytics');
                        if (plan.customIntegrations) features.push('Custom Integrations');
                        if (plan.teamManagement) features.push('Team Management');
                        if (plan.communityAccess) features.push('Community Access');
                        return (
                          <tr key={plan.id} className="hover:bg-gray-800 transition-all group">
                            <td className="px-4 py-2 border-b border-gray-700 text-white font-medium">{plan.name}</td>
                            <td className="px-4 py-2 border-b border-gray-700 text-gray-300">{plan.price}</td>
                            <td className="px-4 py-2 border-b border-gray-700 text-gray-300 capitalize">{plan.interval}</td>
                            <td className="px-4 py-2 border-b border-gray-700 text-gray-300">{features.join(', ')}</td>
                            <td className="px-4 py-2 border-b border-gray-700 flex gap-2">
                              <button onClick={() => openEditPlan(plan)} className="text-blue-400 hover:bg-blue-900/20 px-2 py-1 rounded transition-all">Edit</button>
                              <button onClick={() => handleDeletePlan(plan)} className="text-red-400 hover:bg-red-900/20 px-2 py-1 rounded transition-all">Delete</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {planPageCount > 1 && (
                  <div className="flex justify-center mt-4">
                    <Pagination
                      count={planPageCount}
                      page={planPage}
                      onChange={(_, v) => setPlanPage(v)}
                      color="primary"
                      shape="rounded"
                    />
                  </div>
                )}
              </div>
            )}
            {activeTab === 3 && (
              <div className="w-full bg-black rounded-3xl shadow-2xl p-10 flex flex-col border-2 border-gray-700 hover:shadow-gray-700/50 transition-shadow duration-300">
                <TemplateAdminPanel
                  heading="Templates Marketplace Management"
                  description="Create, edit, approve, and delete templates for the marketplace. Set price, category, section, preview, and more."
                  search={templateSearch}
                  setSearch={setTemplateSearch}
                  page={templatePage}
                  setPage={setTemplatePage}
                  templatesPerPage={templatesPerPage}
                />
              </div>
            )}
            {activeTab === 4 && (
              <AdminDomainsTab />
            )}
            {activeTab === 5 && (
              <AdminOverviewTab metrics={metrics} loading={metricsLoading} />
            )}
          </div>

          {showUserModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border-2 border-purple-200 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{modalMode === 'add' ? 'Add User' : 'Edit User'}</h2>
                {actionError && <div className="text-red-600 mb-2">{actionError}</div>}
                <form onSubmit={e => { e.preventDefault(); handleSaveUser(); }}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-1">Name</label>
                    <input type="text" className="w-full border rounded px-3 py-2 text-black placeholder-black bg-purple-50 focus:ring-2 focus:ring-purple-400" placeholder="Enter name" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-1">Email</label>
                    <input type="email" className="w-full border rounded px-3 py-2 text-black placeholder-black bg-purple-50 focus:ring-2 focus:ring-purple-400" placeholder="Enter email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-1">Role</label>
                    <select className="w-full border rounded px-3 py-2 text-black bg-purple-50 focus:ring-2 focus:ring-purple-400" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                      <option value="USER">User</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>
                  <div className="mb-4 flex items-center gap-2">
                    <label className="block text-gray-700 mb-1">Enabled</label>
                    <button
                      type="button"
                      className={`w-12 h-6 rounded-full relative focus:outline-none border-2 border-gray-200 ${userForm.enabled ? 'bg-green-400' : 'bg-gray-300'} transition-all`}
                      onClick={() => setUserForm({ ...userForm, enabled: !userForm.enabled })}
                      aria-label="Toggle enabled"
                    >
                      <span className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-200 ${userForm.enabled ? 'bg-white translate-x-4' : 'bg-white translate-x-0'}`}></span>
                    </button>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-1">Plan</label>
                    <select className="w-full border rounded px-3 py-2 text-black bg-purple-50 focus:ring-2 focus:ring-purple-400" value={userForm.planId || ''} onChange={e => setUserForm({ ...userForm, planId: e.target.value })}>
                      <option value="">No Plan</option>
                      {plans.map((plan: any) => (
                        <option key={plan.id} value={plan.id}>{plan.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded hover:from-purple-600 hover:to-blue-600 font-bold shadow flex items-center gap-2" disabled={saving}>
                      {saving ? (
                        <>
                          <LoadingSpinner size="sm" color="white" />
                          Saving...
                        </>
                      ) : (
                        'Save'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {showPlanModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border-2 border-green-200 animate-fadeIn">
                <h2 className="text-2xl font-bold text-black mb-4">{planMode === 'add' ? 'Add Plan' : 'Edit Plan'}</h2>
                {actionError && <div className="text-red-600 mb-2">{actionError}</div>}
                <form onSubmit={e => { e.preventDefault(); handleSavePlan(); }}>
                  <div className="mb-4">
                    <label className="block text-black mb-1">Name</label>
                    <input type="text" className="w-full border rounded px-3 py-2 text-black placeholder-black bg-green-50 focus:ring-2 focus:ring-green-400" placeholder="Enter plan name" value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-black mb-1">Price</label>
                    <input type="number" className="w-full border rounded px-3 py-2 text-black placeholder-black bg-green-50 focus:ring-2 focus:ring-green-400" placeholder="Enter price" value={planForm.price} onChange={e => setPlanForm({ ...planForm, price: e.target.value })} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-black mb-1">Interval</label>
                    <select className="w-full border rounded px-3 py-2 text-black bg-green-50 focus:ring-2 focus:ring-green-400" value={planForm.interval} onChange={e => setPlanForm({ ...planForm, interval: e.target.value })} required>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-black mb-1">Number of Websites</label>
                    <div className="flex items-center gap-2">
                      <input type="number" min="1" className="w-24 border rounded px-3 py-2 text-black bg-green-50 focus:ring-2 focus:ring-green-400" placeholder="e.g. 1" value={featureForm.websites} onChange={e => setFeatureForm({ ...featureForm, websites: e.target.value, unlimitedWebsites: false })} disabled={featureForm.unlimitedWebsites} />
                      <label className="flex items-center gap-1 text-black">
                        <input type="checkbox" checked={featureForm.unlimitedWebsites} onChange={e => setFeatureForm({ ...featureForm, unlimitedWebsites: e.target.checked, websites: '' })} /> Unlimited
                      </label>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-black mb-1">Support Level</label>
                    <select className="w-full border rounded px-3 py-2 text-black bg-green-50 focus:ring-2 focus:ring-green-400" value={featureForm.support} onChange={e => setFeatureForm({ ...featureForm, support: e.target.value })}>
                      <option value="">Select</option>
                      <option value="Basic">Basic</option>
                      <option value="Priority">Priority</option>
                      <option value="Dedicated">Dedicated</option>
                    </select>
                  </div>
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 text-black">
                      <input type="checkbox" checked={featureForm.customDomain} onChange={e => setFeatureForm({ ...featureForm, customDomain: e.target.checked })} /> Custom Domain
                    </label>
                    <label className="flex items-center gap-2 text-black">
                      <input type="checkbox" checked={featureForm.advancedAnalytics} onChange={e => setFeatureForm({ ...featureForm, advancedAnalytics: e.target.checked })} /> Advanced Analytics
                    </label>
                    <label className="flex items-center gap-2 text-black">
                      <input type="checkbox" checked={featureForm.customIntegrations} onChange={e => setFeatureForm({ ...featureForm, customIntegrations: e.target.checked })} /> Custom Integrations
                    </label>
                    <label className="flex items-center gap-2 text-black">
                      <input type="checkbox" checked={featureForm.teamManagement} onChange={e => setFeatureForm({ ...featureForm, teamManagement: e.target.checked })} /> Team Management
                    </label>
                    <label className="flex items-center gap-2 text-black">
                      <input type="checkbox" checked={featureForm.communityAccess} onChange={e => setFeatureForm({ ...featureForm, communityAccess: e.target.checked })} /> Community Access
                    </label>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button type="button" onClick={() => setShowPlanModal(false)} className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-gradient-to-r from-green-400 to-blue-400 text-white rounded hover:from-green-500 hover:to-blue-500 font-bold shadow flex items-center gap-2" disabled={saving}>
                      {saving ? (
                        <>
                          <LoadingSpinner size="sm" color="white" />
                          Saving...
                        </>
                      ) : (
                        'Save'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {planToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border-2 border-red-200 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Delete Plan</h2>
                <div className="mb-4 text-gray-800">Are you sure you want to delete the plan <b>{planToDelete.name}</b>? This action cannot be undone.</div>
                <div className="flex justify-end gap-2 mt-6">
                  <button type="button" onClick={() => setPlanToDelete(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Cancel</button>
                  <button type="button" onClick={confirmDeletePlan} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded font-bold shadow flex items-center gap-2" disabled={deleting}>
                    {deleting ? (
                      <>
                        <LoadingSpinner size="sm" color="white" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      
    </DashboardLayout>
  );
} 

function AdminDomainsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<{ siteId: string; host: string }>({ siteId: '', host: '' });

  const filtered = rows.filter((r) =>
    r.host.toLowerCase().includes(search.toLowerCase()) ||
    r.site?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.site?.subdomain?.toLowerCase().includes(search.toLowerCase()) ||
    (r.ownerEmail || '').toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [domainsRes, sitesRes] = await Promise.all([
          fetch('/api/admin/domains'),
          fetch('/api/admin/sites'),
        ]);
        if (!domainsRes.ok) throw new Error('Failed to fetch domains');
        const domains = await domainsRes.json();
        setRows(domains);
        if (sitesRes.ok) setSites(await sitesRes.json());
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.siteId || !form.host) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to create');
      const created = await res.json();
      setRows((prev) => [{ ...created, site: sites.find((s:any)=>s.id===created.siteId) || created.site }, ...prev]);
      setModalOpen(false);
      setForm({ siteId: '', host: '' });
    } catch (e:any) {
      setError(e?.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string, patch: any) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/domains/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
    } catch (e:any) {
      setError(e?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this domain mapping?')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/domains/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e:any) {
      setError(e?.message || 'Failed to delete');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full bg-black rounded-3xl shadow-2xl p-10 flex flex-col border-2 border-gray-700 hover:shadow-gray-700/50 transition-shadow duration-300">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white flex items-center gap-2"><span className="inline-block w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span> Domain Mappings</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            className="border rounded px-3 py-2 text-white bg-gray-800 border-gray-600 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => setModalOpen(true)}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold px-6 py-2 rounded-full shadow-lg"
          >
            + Add Mapping
          </button>
        </div>
      </div>
      {error && <div className="text-red-400 mb-3">{error}</div>}
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-700">
          <table className="min-w-full bg-gray-900 rounded-xl overflow-hidden">
            <thead className="bg-gradient-to-r from-gray-800 to-gray-700">
              <tr>
                <th className="px-4 py-3 border-b border-gray-700 text-left text-white text-sm font-semibold">Domain</th>
                <th className="px-4 py-3 border-b border-gray-700 text-left text-white text-sm font-semibold">Site</th>
                <th className="px-4 py-3 border-b border-gray-700 text-left text-white text-sm font-semibold">Owner</th>
                <th className="px-4 py-3 border-b border-gray-700 text-left text-white text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-6 text-gray-400">No domains found.</td></tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-800 transition-all group">
                  <td className="px-4 py-2 border-b border-gray-700 text-white font-medium">
                    <input
                      className="bg-transparent border border-gray-700 rounded px-2 py-1 w-full"
                      defaultValue={r.host}
                      onBlur={(e) => {
                        const v = e.currentTarget.value.trim();
                        if (v && v !== r.host) handleUpdate(r.id, { host: v });
                      }}
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-gray-700 text-gray-300">
                    <select
                      className="bg-gray-900 border border-gray-700 rounded px-2 py-1"
                      value={r.siteId}
                      onChange={(e) => handleUpdate(r.id, { siteId: e.target.value })}
                    >
                      {sites.map((s:any) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.subdomain})</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 border-b border-gray-700 text-gray-300">{r.ownerEmail || '-'}</td>
                  <td className="px-4 py-2 border-b border-gray-700">
                    <button
                      className="text-red-400 hover:bg-red-900/20 px-2 py-1 rounded transition-all"
                      onClick={() => handleDelete(r.id)}
                      disabled={saving}
                    >Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border-2 border-yellow-200">
            <h3 className="text-xl font-bold mb-4 text-black">Add Domain Mapping</h3>
            <form onSubmit={handleCreate}>
              <label className="block text-black mb-1">Domain</label>
              <input
                className="w-full border rounded px-3 py-2 text-black bg-yellow-50 mb-4"
                placeholder="example.com"
                value={form.host}
                onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))}
                required
              />
              <label className="block text-black mb-1">Site</label>
              <select
                className="w-full border rounded px-3 py-2 text-black bg-yellow-50 mb-4"
                value={form.siteId}
                onChange={(e) => setForm((f) => ({ ...f, siteId: e.target.value }))}
                required
              >
                <option value="" disabled>Select site</option>
                {sites.map((s:any) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.subdomain})</option>
                ))}
              </select>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 bg-gray-200 text-gray-700 rounded" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminOverviewTab({ metrics, loading }: { metrics: any; loading: boolean }) {
  // Simple chart rendered with HTML/CSS bars to avoid new deps
  const series: Array<any> = metrics?.series || [];
  const labels = series.map((d: any) => d.date);
  const rev = series.map((d: any) => d.totalRevenue);
  const users = series.map((d: any) => d.users);
  const maxRev = Math.max(1, ...rev);
  const maxUsers = Math.max(1, ...users);

  return (
    <div className="w-full bg-black rounded-3xl shadow-2xl p-10 flex flex-col border-2 border-gray-700 hover:shadow-gray-700/50 transition-shadow duration-300">
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Total Users</div>
          <div className="text-3xl font-bold text-white">{metrics?.summary?.totalUsers ?? '—'}</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Total Revenue</div>
          <div className="text-3xl font-bold text-white">₹{metrics?.summary?.revenue?.total?.toFixed?.(2) ?? '0.00'}</div>
          <div className="text-xs text-gray-400 mt-1">Plans: ₹{metrics?.summary?.revenue?.plans?.toFixed?.(2) ?? '0.00'} · Commission: ₹{metrics?.summary?.revenue?.templateCommission?.toFixed?.(2) ?? '0.00'}</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Template Gross</div>
          <div className="text-3xl font-bold text-white">₹{metrics?.summary?.revenue?.templateGross?.toFixed?.(2) ?? '0.00'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Area-like chart */}
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
          <div className="text-white font-semibold mb-3">Revenue (last {labels.length} days)</div>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <div className="h-48 flex items-end gap-1">
              {rev.map((v: number, i: number) => (
                <div key={labels[i]} title={`${labels[i]}: ₹${v.toFixed(2)}`} className="flex-1 bg-gradient-to-t from-purple-700 to-purple-400 rounded-t" style={{ height: `${(v / maxRev) * 100}%` }} />
              ))}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-2">Plans + Template Commission (platform revenue)</div>
        </div>

        {/* New users chart */}
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
          <div className="text-white font-semibold mb-3">New Users (last {labels.length} days)</div>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <div className="h-48 flex items-end gap-1">
              {users.map((v: number, i: number) => (
                <div key={labels[i]} title={`${labels[i]}: ${v}`} className="flex-1 bg-gradient-to-t from-green-700 to-green-400 rounded-t" style={{ height: `${(v / maxUsers) * 100}%` }} />
              ))}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-2">Daily signups</div>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-4">Range: {metrics?.range?.since} → {metrics?.range?.until}</div>
    </div>
  );
}