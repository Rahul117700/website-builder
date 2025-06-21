'use client';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function WebsitesPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

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
          <Link href="#" className="btn-primary">Create New Site</Link>
        </div>
        <div className="text-center py-12 bg-gray-50 dark:bg-slate-700 rounded-lg">
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No websites yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new website.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
} 