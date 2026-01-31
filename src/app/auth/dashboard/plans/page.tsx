'use client';

// import DashboardLayout from '@/components/dashboard/DashboardLayout';
// import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import PlansView from '@/components/dashboard/views/PlansView';

export default function PlansPage() {
  return (
    <DashboardLayout>
      <PlansView />
    </DashboardLayout>
  );
}
