import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserPlan } from '@/utils/planPermissions';

export function useUserPlan() {
  const { data: session } = useSession();
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    const fetchUserPlan = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/subscription');
        if (!response.ok) {
          throw new Error('Failed to fetch subscription');
        }
        
        const data = await response.json();
        setUserPlan(data);
      } catch (err) {
        console.error('Error fetching user plan:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch plan');
        setUserPlan(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlan();
  }, [session?.user?.id]);

  const refreshPlan = async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        setUserPlan(data);
      }
    } catch (err) {
      console.error('Error refreshing plan:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    userPlan,
    loading,
    error,
    refreshPlan,
    hasActivePlan: userPlan?.status === 'active',
    planName: userPlan?.plan?.name || 'Free',
  };
} 