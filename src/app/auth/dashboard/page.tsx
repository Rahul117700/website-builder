'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import SiteCard from '@/components/dashboard/site-card';
import CreateSiteModal from '@/components/dashboard/create-site-modal-fixed';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Site, CreateSiteInput } from '@/types';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchSites = async () => {
      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/sites');
          if (response.ok) {
            const data = await response.json();
            setSites(data.sites);
          } else {
            console.error('Failed to fetch sites');
          }
        } catch (error) {
          console.error('Error fetching sites:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchSites();
  }, [status]);

  const handleCreateSite = async (newSite: CreateSiteInput) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSite),
      });

      if (response.ok) {
        const data = await response.json();
        setSites((prevSites) => [...prevSites, data.site]);
        setIsCreateModalOpen(false);
        router.push(`/auth/dashboard/sites/${data.site.id}`);
      } else {
        const error = await response.json();
        console.error('Failed to create site:', error);
      }
    } catch (error) {
      console.error('Error creating site:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Welcome back, {session?.user?.name || 'User'}! Manage your websites and view analytics.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Your Websites</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Create New Site
          </button>
        </div>

        {sites?.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No websites yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new website.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary"
              >
                Create New Website
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sites?.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {sites?.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No recent activity to display.
              </p>
            ) : (
              sites?.slice(0, 3).map((site) => (
                <div key={site.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-md">
                  <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-400 font-medium">
                      {site.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{site.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last updated: {new Date(site.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Websites</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{sites?.length}</p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Visitors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sites?.length > 0 ? '1,234' : '0'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Templates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sites?.length > 0 
                  ? new Set(sites.map(site => site.template)).size 
                  : '0'
                }
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Custom Domains</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sites?.filter(site => site.customDomain).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <CreateSiteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSite={handleCreateSite}
      />
    </DashboardLayout>
  );
}
