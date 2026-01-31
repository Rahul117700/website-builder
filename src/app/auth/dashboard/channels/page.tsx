'use client';

// import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import ChannelsView from '@/components/dashboard/views/ChannelsView';

export default function ChannelsPage() {
  return (
    <DashboardLayout>
      <ChannelsView />
    </DashboardLayout>
  );
}
