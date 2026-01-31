'use client';

// import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardLayout from '@/components/layouts/dashboard-layout';

import AnalyticsView from '@/components/dashboard/views/AnalyticsView';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <AnalyticsView />
    </DashboardLayout>
  );
}
