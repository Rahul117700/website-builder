import DashboardLayout from '@/components/layouts/dashboard-layout';

export default function CreateTemplatePage() {
  return (
    <DashboardLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Template</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Design and save your own website templates.
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-purple-600 mb-2">Coming Soon!</h2>
        <p className="text-gray-500">You will be able to create and manage your own templates here.</p>
      </div>
    </DashboardLayout>
  );
} 