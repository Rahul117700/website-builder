'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Redirect to new customizer with all features
export default function CustomizeFunnel() {
  const params = useParams();
  const router = useRouter();
  const funnelId = params?.id as string;

  useEffect(() => {
    if (funnelId) {
      // Redirect to new customizer page
      router.replace(`/auth/dashboard/funnels/${funnelId}/customize`);
    }
  }, [funnelId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to funnel editor...</p>
      </div>
    </div>
  );
}
