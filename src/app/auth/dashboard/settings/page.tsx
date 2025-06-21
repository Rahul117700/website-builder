'use client';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SettingsPage() {
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Manage your account and website settings here. (Coming soon)
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6 mb-8">
        <div className="text-center py-12 bg-gray-50 dark:bg-slate-700 rounded-lg">
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Settings page coming soon!</h3>
        </div>
      </div>
    </DashboardLayout>
  );
} 