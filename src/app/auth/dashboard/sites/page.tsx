'use client';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import SiteCard from '@/components/dashboard/site-card';
import CreateSiteModal from '@/components/dashboard/create-site-modal';
import EditSiteModal from '@/components/dashboard/edit-site-modal';
import ChangeTemplateModal from '@/components/dashboard/change-template-modal';
import { Site } from '@/types';
import toast from 'react-hot-toast';
import { useUserPlan } from '@/hooks/useUserPlan';
import { canCreateWebsite, getMaxWebsites } from '@/utils/planPermissions';
import PlanRestrictionBanner from '@/components/PlanRestrictionBanner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BarChartIcon from '@mui/icons-material/BarChart';
import PageviewIcon from '@mui/icons-material/Pageview';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LayersIcon from '@mui/icons-material/Layers';

export default function WebsitesPage() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [changeTemplateModalOpen, setChangeTemplateModalOpen] = useState(false);
  const [templateSite, setTemplateSite] = useState<Site | null>(null);
  const [search, setSearch] = useState('');
  const [templateFilter, setTemplateFilter] = useState('');
  const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [saleSite, setSaleSite] = useState<Site | null>(null);
  const [salePrice, setSalePrice] = useState('');
  const [salePreview, setSalePreview] = useState<string>('');
  const [saleDescription, setSaleDescription] = useState<string>('');
  const [uploadingPreview, setUploadingPreview] = useState<boolean>(false);
  const [puttingOnSale, setPuttingOnSale] = useState(false);
  const { userPlan } = useUserPlan();

  const fetchSites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sites', {
        headers: {
          'x-auth-token': localStorage.getItem('token') || '',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch sites');
      let data = await res.json();
      // For each site, fetch its main page, analytics, and sale status
      data = await Promise.all(data.map(async (site: any) => {
        try {
          const pagesRes = await fetch(`/api/pages?siteId=${site.id}`);
          const analyticsRes = await fetch(`/api/analytics?siteId=${site.id}`);
          const saleRes = await fetch(`/api/sites/on-sale?siteId=${site.id}`);
          let mainPage, visitors = 0, onSale = false;
          if (pagesRes.ok) {
            const pages = await pagesRes.json();
            mainPage = pages[0];
          }
          if (analyticsRes.ok) {
            const analytics = await analyticsRes.json();
            visitors = analytics?.summary?.totalVisitors || 0;
          }
          if (saleRes.ok) {
            const saleData = await saleRes.json();
            onSale = saleData && saleData.length > 0;
          }
          return { ...site, mainPageRenderMode: mainPage?.renderMode || 'html', visitors, onSale };
        } catch {
          return { ...site, mainPageRenderMode: undefined, visitors: 0, onSale: false };
        }
      }));
      setSites(data);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching sites');
      setError(err.message || 'Error fetching sites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchSites();
    }
  }, [status, router, fetchSites]);

  // Handle escape key for delete modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && deleteModalOpen && deletingSiteId !== siteToDelete?.id) {
        setDeleteModalOpen(false);
        setSiteToDelete(null);
      }
    };

    if (deleteModalOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [deleteModalOpen, deletingSiteId, siteToDelete]);

  const handleCreateSite = async (siteData: any) => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token') || '',
        },
        body: JSON.stringify(siteData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create site');
      }
      setModalOpen(false);
      fetchSites();
    } catch (err: any) {
      setError(err.message || 'Error creating site');
    } finally {
      setCreating(false);
    }
  };

  const handleEditSite = async (siteData: Partial<Site>) => {
    setError(null);
    try {
      const res = await fetch(`/api/sites/${siteData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token') || '',
        },
        body: JSON.stringify(siteData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update site');
      }
      setEditModalOpen(false);
      setEditingSite(null);
      fetchSites();
    } catch (err: any) {
      setError(err.message || 'Error updating site');
    }
  };

  const handleChangeTemplate = async (template: string) => {
    if (!templateSite) return;
    setError(null);
    try {
      const res = await fetch(`/api/sites/${templateSite.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token') || '',
        },
        body: JSON.stringify({ template }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update template');
      }
      setChangeTemplateModalOpen(false);
      setTemplateSite(null);
      fetchSites();
    } catch (err: any) {
      setError(err.message || 'Error updating template');
    }
  };

  const handleSiteDeleted = (site?: Site) => {
    toast.success('Website deleted successfully');
    fetchSites();
  };

  const handleDeleteSite = async (site: Site) => {
    setSiteToDelete(site);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!siteToDelete) return;

    if (!session?.user?.id) {
      toast.error('You are not authenticated. Please log in again.');
      return;
    }

    try {
      setDeletingSiteId(siteToDelete.id);
      console.log(`Attempting to delete site: ${siteToDelete.id} (${siteToDelete.name})`);
      
      const response = await fetch(`/api/sites/${siteToDelete.id}`, {
        method: 'DELETE',
      });

      console.log(`Delete response status: ${response.status}`);
      console.log(`Delete response headers:`, Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.json();
        console.log(`Delete successful:`, result);
        toast.success(`Website "${siteToDelete.name}" deleted successfully`);
        // Remove the site from the local state
        setSites(prevSites => prevSites.filter(s => s.id !== siteToDelete.id));
      } else {
        const errorData = await response.json();
        console.error(`Delete failed with status ${response.status}:`, errorData);
        toast.error(errorData.error || 'Failed to delete website');
      }
    } catch (error) {
      console.error('Error deleting site:', error);
      toast.error('Failed to delete website. Please try again.');
    } finally {
      setDeletingSiteId(null);
      setDeleteModalOpen(false);
      setSiteToDelete(null);
    }
  };

  // Filtered sites
  const filteredSites = sites.filter(site =>
    (!search || site.name.toLowerCase().includes(search.toLowerCase()) || (site.customDomain || '').toLowerCase().includes(search.toLowerCase())) &&
    (!templateFilter || site.template === templateFilter)
  );

  // Check if user can create more websites
  const canCreate = canCreateWebsite(userPlan, sites.length);
  const maxWebsites = getMaxWebsites(userPlan);

  // Show loading skeleton while fetching data
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <SkeletonLoader type="text" lines={2} className="mb-4" />
            <SkeletonLoader type="button" className="w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonLoader key={i} type="card" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Websites</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Manage your websites here. You can create, edit, or delete your sites.</p>
        
        {/* Plan Restriction Banner */}
        {!canCreate && (
          <PlanRestrictionBanner
            userPlan={userPlan}
            feature="website_limit"
            requiredPlan="Pro"
            currentWebsiteCount={sites.length}
            maxWebsites={maxWebsites}
          />
        )}
        
        {/* Summary */}
        <div className="mt-4 flex flex-wrap gap-4 items-center">
          <span className="bg-blue-50 text-blue-800 text-sm font-semibold px-4 py-2 rounded-lg">
            You have {sites.length} site{sites.length !== 1 ? 's' : ''}
            {maxWebsites > 0 && ` (${maxWebsites === -1 ? 'Unlimited' : maxWebsites} allowed)`}
          </span>
        </div>
      </div>
      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search sites..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#374151', // bg-gray-700
              color: 'white',
              '& fieldset': {
                borderColor: '#4B5563', // border-gray-600
              },
              '&:hover fieldset': {
                borderColor: '#6B7280', // border-gray-500
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8B5CF6', // border-purple-500
              },
            },
            '& .MuiInputLabel-root': {
              color: '#9CA3AF', // text-gray-400
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#A78BFA', // text-purple-400
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#9CA3AF', // text-gray-400
              opacity: 1,
            },
            '& .MuiInputAdornment-root .MuiSvgIcon-root': {
              color: '#9CA3AF', // text-gray-400
            },
          }}
        />
        <button
          className={`ml-auto font-semibold rounded-lg shadow px-6 py-2 text-base flex items-center gap-2 ${
            canCreate 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={() => canCreate && setModalOpen(true)}
          disabled={!canCreate || creating}
        >
          {creating ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              Creating...
            </>
          ) : (
            '+ Create New Site'
          )}
        </button>
      </div>
      {/* Site Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSites.map(site => (
          <div key={site.id} className="relative">
            <div className="card overflow-hidden flex flex-col">
              <div className="h-2 bg-blue-500" />
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {/* Favicon/logo or initial */}
                    {site.logo ? (
                      <Avatar src={site.logo} alt={site.name} sx={{ width: 32, height: 32 }} />
                    ) : (
                      <Avatar sx={{ width: 32, height: 32 }}>{site.name.charAt(0).toUpperCase()}</Avatar>
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {site.name}
                                                 {site.onSale && (
                           <Chip 
                             label="On Sale" 
                             size="small" 
                             sx={{ 
                               fontSize: '0.75rem', 
                               height: '20px',
                               backgroundColor: '#10B981',
                               color: 'white',
                               '& .MuiChip-label': {
                                 color: 'white'
                               }
                             }} 
                           />
                         )}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{site.template.charAt(0).toUpperCase() + site.template.slice(1)} Template</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <span className="truncate">{site.customDomain || `${window.location.origin}/s/${site.subdomain}`}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <span>Created {new Date(site.createdAt).toLocaleDateString()}</span>
                  </div>
                  {/* Last updated */}
                  <div className="flex items-center text-xs text-gray-400">Last updated: {new Date(site.updatedAt).toLocaleDateString()}</div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PageviewIcon />}
                    href={`/auth/dashboard/sites/${site.id}/pages`}
                    fullWidth
                  >
                    Manage Pages
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<BarChartIcon />}
                    href={`/auth/dashboard/analytics?siteId=${site.id}`}
                    fullWidth
                  >
                    Analytics
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setEditingSite(site);
                      setEditModalOpen(true);
                    }}
                    fullWidth
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<OpenInNewIcon />}
                    href={site.customDomain ? `https://${site.customDomain}` : `${window.location.origin}/s/${site.subdomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    fullWidth
                  >
                    Visit
                  </Button>
                                     {site.onSale ? (
                     <Button
                       variant="outlined"
                       size="small"
                       startIcon={<LayersIcon />}
                       href="/auth/dashboard/sales"
                       fullWidth
                       sx={{
                         backgroundColor: '#10B981',
                         color: 'white',
                         borderColor: '#10B981',
                         '&:hover': {
                           backgroundColor: '#059669',
                           borderColor: '#059669'
                         }
                       }}
                     >
                       View Sales
                     </Button>
                   ) : (
                     <Button
                       variant="outlined"
                       size="small"
                       startIcon={<LayersIcon />}
                       onClick={() => { setSaleSite(site); setSalePrice(''); setSaleModalOpen(true); }}
                       fullWidth
                     >
                       Put on Sale
                     </Button>
                   )}
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteSite(site)}
                    fullWidth
                    disabled={deletingSiteId === site.id}
                  >
                    {deletingSiteId === site.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* ... existing modals and logic ... */}
      <CreateSiteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreateSite={handleCreateSite}
      />
      <EditSiteModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingSite(null);
        }}
        site={editingSite}
        onEditSite={handleEditSite}
      />
      <ChangeTemplateModal
        isOpen={changeTemplateModalOpen}
        onClose={() => {
          setChangeTemplateModalOpen(false);
          setTemplateSite(null);
        }}
        site={templateSite}
        onChangeTemplate={handleChangeTemplate}
      />

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && siteToDelete && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            if (deletingSiteId !== siteToDelete.id) {
              setDeleteModalOpen(false);
              setSiteToDelete(null);
            }
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <DeleteIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Delete Website
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <div className="mb-6">
                          <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete <span className="font-semibold">&quot;{siteToDelete.name}&quot;</span>?
            </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                <strong>Subdomain:</strong> {siteToDelete.subdomain}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                This will permanently remove the website and all its pages, analytics, and other data.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outlined"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSiteToDelete(null);
                }}
                disabled={deletingSiteId === siteToDelete.id}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={confirmDelete}
                disabled={deletingSiteId === siteToDelete.id}
                startIcon={deletingSiteId === siteToDelete.id ? <LoadingSpinner size="sm" color="white" /> : <DeleteIcon />}
              >
                {deletingSiteId === siteToDelete.id ? 'Deleting...' : 'Delete Website'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Put on Sale Modal */}
      {saleModalOpen && saleSite && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setSaleModalOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md sm:max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Put &quot;{saleSite.name}&quot; on Sale</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Set a price and list this website as a template in the marketplace. A commission may be applied on each sale.</p>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Price (INR)</label>
            <input type="number" className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" value={salePrice} onChange={e => setSalePrice(e.target.value)} placeholder="e.g., 999" />

            {/* Preview Image */}
            <div className="mt-4">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Preview Image</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingPreview(true);
                    try {
                      const form = new FormData();
                      form.append('image', file);
                      const res = await fetch('/api/templates/upload-image', { method: 'POST', body: form });
                      const data = await res.json();
                      if (res.ok && data.url) {
                        setSalePreview(data.url);
                      }
                    } finally {
                      setUploadingPreview(false);
                    }
                  }}
                  className="block w-full text-sm text-gray-700 dark:text-gray-200"
                />
              </div>
              {uploadingPreview && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Uploading...</div>}
              {salePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={salePreview} alt="Preview" className="mt-2 max-h-32 rounded border border-gray-200 dark:border-gray-700" />
              )}
            </div>

            {/* Description */}
            <div className="mt-4">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Short Description</label>
              <textarea
                value={saleDescription}
                onChange={(e) => setSaleDescription(e.target.value)}
                placeholder="Tell buyers what this template includes, who it's for, and key features."
                className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                rows={3}
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              <Button variant="outlined" onClick={() => setSaleModalOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button 
                variant="contained" 
                onClick={async () => {
                  if (!saleSite || !salePrice) return;
                  setPuttingOnSale(true);
                  try {
                    const res = await fetch('/api/sites/on-sale', { 
                      method: 'POST', 
                      headers: { 'Content-Type': 'application/json' }, 
                      body: JSON.stringify({ siteId: saleSite.id, price: parseFloat(salePrice), preview: salePreview, description: saleDescription }) 
                    });
                    const data = await res.json();
                    if (res.ok) { 
                      toast.success('Site listed for sale'); 
                      setSaleModalOpen(false); 
                      setSalePreview('');
                      setSaleDescription('');
                      fetchSites(); 
                    } else { 
                      toast.error(data.error || 'Failed to list'); 
                    }
                  } catch (e: any) { 
                    toast.error(e.message || 'Failed to list'); 
                  } finally { 
                    setPuttingOnSale(false); 
                  }
                }}
                disabled={puttingOnSale}
                startIcon={puttingOnSale ? <LoadingSpinner size="sm" color="white" /> : undefined}
              >
                {puttingOnSale ? 'Putting on Sale...' : 'Put on Sale'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 