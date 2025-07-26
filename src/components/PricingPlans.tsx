"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: string;
  numberOfWebsites?: number;
  unlimitedWebsites: boolean;
  supportLevel?: string;
  customDomain: boolean;
  advancedAnalytics: boolean;
  customIntegrations: boolean;
  teamManagement: boolean;
  communityAccess: boolean;
}

export default function PricingPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans');
        if (response.ok) {
          const data = await response.json();
          setPlans(data);
        } else {
          console.error('Failed to fetch plans');
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('free')) return '✓';
    if (name.includes('pro')) return '★';
    if (name.includes('business')) return '■';
    return '●';
  };

  const getPlanColor = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('free')) return 'green';
    if (name.includes('pro')) return 'orange';
    if (name.includes('business')) return 'blue';
    return 'purple';
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getFeatures = (plan: Plan) => {
    const features = [];
    
    if (plan.unlimitedWebsites) {
      features.push('Unlimited Websites');
    } else if (plan.numberOfWebsites) {
      features.push(`${plan.numberOfWebsites} Website${plan.numberOfWebsites > 1 ? 's' : ''}`);
    } else {
      features.push('1 Website');
    }

    if (plan.supportLevel) {
      features.push(`${plan.supportLevel} Support`);
    } else {
      features.push('Basic Support');
    }

    if (plan.customDomain) {
      features.push('Custom Domain');
    }

    if (plan.advancedAnalytics) {
      features.push('Advanced Analytics');
    }

    if (plan.customIntegrations) {
      features.push('Custom Integrations');
    }

    if (plan.teamManagement) {
      features.push('Team Management');
    }

    if (plan.communityAccess) {
      features.push('Community Access');
    }

    return features;
  };

  const handlePlanSelect = (plan: Plan) => {
    if (status === 'loading' || redirecting) return; // Wait for session to load or prevent double clicks
    
    setRedirecting(true);
    
    if (!session) {
      // User not logged in - redirect to signup
      router.push('/auth/signup');
      return;
    }
    
    if (plan.price === 0) {
      // Free plan - redirect to billing page to activate
      router.push('/auth/dashboard/billing');
    } else {
      // Paid plan - redirect to billing page
      router.push('/auth/dashboard/billing');
    }
  };

  if (loading) {
    return (
      <div id="pricing" className="py-20 bg-black dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <SkeletonLoader type="text" lines={2} className="mb-12" />
            <div className="flex flex-col lg:flex-row justify-center items-center space-y-8 lg:space-y-0 lg:space-x-8">
              {[1, 2, 3].map((i) => (
                <SkeletonLoader key={i} type="card" className="w-80 h-96" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div id="pricing" className="py-20 bg-black dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Pricing Plans</h2>
            <p className="text-white">No pricing plans available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="pricing" className="py-20 bg-black dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Pricing Plans</h2>
          <p className="text-xl text-white mb-12">Choose the perfect plan for your business</p>
          
          <div className="flex flex-col lg:flex-row justify-center items-center space-y-8 lg:space-y-0 lg:space-x-8">
            {plans.map((plan, index) => {
              const isPopular = plan.name.toLowerCase().includes('pro');
              const color = getPlanColor(plan.name);
              const icon = getPlanIcon(plan.name);
              
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-lg shadow-lg p-8 w-full max-w-sm ${
                    isPopular ? 'ring-2 ring-orange-500 scale-105' : ''
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-${color}-100 text-${color}-600 mb-4`}>
                      <span className="text-xl font-bold">{icon}</span>
                    </div>
                    <h3 className="text-black font-semibold mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-black mb-2">
                      {formatPrice(plan.price, plan.currency)}
                    </div>
                    <p className="text-black">per {plan.interval}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {getFeatures(plan).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-black">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePlanSelect(plan)}
                    disabled={redirecting || status === 'loading'}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
                      plan.price === 0
                        ? 'bg-green-600 hover:bg-green-700'
                        : color === 'orange'
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : color === 'blue'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    } ${(redirecting || status === 'loading') ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {redirecting ? (
                      <>
                        <LoadingSpinner size="sm" color="white" />
                        Redirecting...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {plan.price === 0 ? 'Get Started' : 'Choose Plan'}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 