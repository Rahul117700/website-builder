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
        
        // Since we're no longer using subscriptions, create a default user plan
        // that gives access to all features
        const defaultUserPlan: UserPlan = {
          purchasedTemplates: []
        };
        setUserPlan(defaultUserPlan);
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
      // Since we're no longer using subscriptions, just set the default plan
      const defaultUserPlan: UserPlan = {
        purchasedTemplates: []
      };
      setUserPlan(defaultUserPlan);
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
    // Since we're no longer using subscriptions, all users have access
    hasActivePlan: true,
    planName: 'All Features',
  };
} 