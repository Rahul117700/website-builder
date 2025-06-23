"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Page } from "@/types";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import AddPageModal from '@/components/dashboard/add-page-modal';
import EditPageModal from '@/components/dashboard/edit-page-modal';
import Link from 'next/link';

export default function SitePages() {
  const router = useRouter();
  const params = useParams();
  const siteId = params?.id as string;
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  useEffect(() => {
    if (!siteId) return;
    setLoading(true);
    fetch(`/api/pages?siteId=${siteId}`, {
      headers: {
        'x-auth-token': localStorage.getItem('token') || '',
      },
    })
      .then(async res => {
        if (!res.ok) {
          let msg = 'Failed to fetch pages';
          try { const err = await res.json(); msg = err.error || msg; } catch {}
          throw new Error(msg);
        }
        return res.json();
      })
      .then(data => {
        setPages(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch pages');
        setLoading(false);
      });
  }, [siteId]);

  const handleAddPage = async (data: { title: string; slug: string; content: string; isPublished: boolean }) => {
    setError(null);
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token') || '',
        },
        body: JSON.stringify({ ...data, siteId }),
      });
      if (!res.ok) {
        let msg = 'Failed to add page';
        try { const err = await res.json(); msg = err.error || msg; } catch {}
        throw new Error(msg);
      }
      // Refresh pages
      setLoading(true);
      const refreshed = await fetch(`/api/pages?siteId=${siteId}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') || '' },
      });
      if (!refreshed.ok) {
        let msg = 'Failed to fetch pages';
        try { const err = await refreshed.json(); msg = err.error || msg; } catch {}
        throw new Error(msg);
      }
      setPages(await refreshed.json());
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Error adding page');
    }
  };

  const handleEditPage = async (data: { id: string; title: string; slug: string; content: string; isPublished: boolean }) => {
    setError(null);
    try {
      const res = await fetch(`/api/pages/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token') || '',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        let msg = 'Failed to update page';
        try { const err = await res.json(); msg = err.error || msg; } catch {}
        throw new Error(msg);
      }
      // Refresh pages
      setLoading(true);
      const refreshed = await fetch(`/api/pages?siteId=${siteId}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') || '' },
      });
      if (!refreshed.ok) {
        let msg = 'Failed to fetch pages';
        try { const err = await refreshed.json(); msg = err.error || msg; } catch {}
        throw new Error(msg);
      }
      setPages(await refreshed.json());
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Error updating page');
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    setError(null);
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': localStorage.getItem('token') || '',
        },
      });
      if (!res.ok) {
        let msg = 'Failed to delete page';
        try { const err = await res.json(); msg = err.error || msg; } catch {}
        throw new Error(msg);
      }
      // Refresh pages
      setLoading(true);
      const refreshed = await fetch(`/api/pages?siteId=${siteId}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') || '' },
      });
      if (!refreshed.ok) {
        let msg = 'Failed to fetch pages';
        try { const err = await refreshed.json(); msg = err.error || msg; } catch {}
        throw new Error(msg);
      }
      setPages(await refreshed.json());
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Error deleting page');
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Pages</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Add, edit, or delete pages for your website.
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Pages</h2>
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow px-5 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            onClick={() => setAddModalOpen(true)}
          >
            Add Page
          </button>
        </div>
        {error && <div className="mb-4 text-red-600 dark:text-red-400 text-sm">{error}</div>}
        {loading ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <span className="animate-spin h-6 w-6 border-4 border-purple-400 border-t-transparent rounded-full inline-block mb-2"></span>
            <div className="text-gray-500 dark:text-gray-400">Loading pages...</div>
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No pages yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by adding a new page.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slug</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Published</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-100 dark:divide-slate-700">
                {pages.map(page => (
                  <tr key={page.id}>
                    <td className="px-4 py-2 text-gray-900 dark:text-white">{page.title}</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{page.slug}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${page.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                        {page.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        className="btn-secondary text-xs"
                        onClick={() => {
                          setEditingPage(page);
                          setEditModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-danger text-xs"
                        onClick={() => handleDeletePage(page.id)}
                      >
                        Delete
                      </button>
                      <Link
                        href={`/auth/dashboard/sites/${siteId}/pages/${page.id}/content`}
                        className="btn-secondary text-xs"
                      >
                        Manage Content
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AddPageModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddPage={handleAddPage}
      />
      <EditPageModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingPage(null);
        }}
        page={editingPage}
        onEditPage={handleEditPage}
      />
    </DashboardLayout>
  );
} 