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
      // For each site, fetch its main page and attach renderMode
      data = await Promise.all(data.map(async (site: any) => {
        try {
          const pagesRes = await fetch(`/api/pages?siteId=${site.id}`);
          if (!pagesRes.ok) return { ...site, mainPageRenderMode: undefined };
          const pages = await pagesRes.json();
          const mainPage = pages[0];
          return { ...site, mainPageRenderMode: mainPage?.renderMode || 'html' };
        } catch {
          return { ...site, mainPageRenderMode: undefined };
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

  const handleSiteDeleted = () => {
    toast.success('Website deleted successfully');
    fetchSites();
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Websites</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Manage your websites here. You can create, edit, or delete your sites.
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Websites</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow px-5 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Create New Site
          </button>
        </div>
        {error && (
          <div className="mb-4 text-red-600 dark:text-red-400 text-sm">{error}</div>
        )}
        {loading ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <span className="animate-spin h-6 w-6 border-4 border-purple-400 border-t-transparent rounded-full inline-block mb-2"></span>
            <div className="text-gray-500 dark:text-gray-400">Loading websites...</div>
          </div>
        ) : sites.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No websites yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new website.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site: Site) => (
              <SiteCard
                key={site.id}
                site={site}
                mainPageRenderMode={site.mainPageRenderMode}
                onEdit={(s) => {
                  setEditingSite(s);
                  setEditModalOpen(true);
                }}
                onChangeTemplate={(s) => {
                  setTemplateSite(s);
                  setChangeTemplateModalOpen(true);
                }}
                onDelete={handleSiteDeleted}
              />
            ))}
          </div>
        )}
      </div>
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
    </DashboardLayout>
  );
} 