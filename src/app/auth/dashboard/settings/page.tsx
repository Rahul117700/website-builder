'use client';

// import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import SettingsView from '@/components/dashboard/views/SettingsView';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <SettingsView />
    </DashboardLayout>
  );
}