'use client';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number;
  features: string[];
  maxFunnels: number;
  maxProducts: number;
  maxCustomDomains: number;
  priority: number;
  isActive: boolean;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/user/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriod = (duration: number) => {
    if (duration === 365) return 'year';
    if (duration === 30) return 'month';
    if (duration === 7) return 'week';
    return `${duration} days`;
  };

  const getCTA = (price: number) => {
    if (price === 0) return 'Start Free';
    return 'Get Started';
  };

  const isPopular = (plan: SubscriptionPlan) => {
    // Mark the plan with highest priority as popular
    const maxPriority = Math.max(...plans.map(p => p.priority));
    return plan.priority === maxPriority && maxPriority > 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No subscription plans available at the moment.</p>
            <p className="text-gray-500 text-sm mt-2">Please check back later or contact support.</p>
          </div>
        ) : (
          <div className={`grid gap-8 ${
            plans.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' :
            plans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' :
            plans.length === 3 ? 'md:grid-cols-3' :
            'md:grid-cols-2 lg:grid-cols-4'
          }`}>
            {plans.map((plan) => {
              const popular = isPopular(plan);
              const period = getPeriod(plan.duration);
              const cta = getCTA(plan.price);
              
              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl shadow-xl overflow-hidden border-2 ${
                    popular ? 'border-purple-500 relative' : 'border-gray-200'
                  }`}
                >
                  {popular && (
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-2 text-sm font-semibold">
                      Most Popular
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-6">{plan.description || 'Choose this plan to get started'}</p>
                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">{plan.currency} {plan.price}</span>
                        <span className="text-gray-600 ml-2">/{period}</span>
                      </div>
                    </div>
                    <Link
                      href={plan.price === 0 ? '/auth/signup' : '/auth/signup?plan=' + plan.name.toLowerCase()}
                      className={`block w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors ${
                        popular
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {cta}
                    </Link>
                  </div>
                  <div className="px-6 pb-6">
                    <ul className="space-y-3">
                      {plan.features && plan.features.length > 0 ? (
                        plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start text-sm text-gray-700">
                            <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-start text-sm text-gray-700">
                            <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            {plan.maxFunnels === -1 ? 'Unlimited' : `${plan.maxFunnels}`} Active Funnels
                          </li>
                          <li className="flex items-start text-sm text-gray-700">
                            <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            {plan.maxProducts === -1 ? 'Unlimited' : `${plan.maxProducts}`} Products
                          </li>
                          {plan.maxCustomDomains > 0 && (
                            <li className="flex items-start text-sm text-gray-700">
                              <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                              {plan.maxCustomDomains} Custom Domain{plan.maxCustomDomains > 1 ? 's' : ''}
                            </li>
                          )}
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA for signup */}
        <div className="mt-16 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 border-2 border-purple-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Start Selling?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of creators who are already making money with their digital products
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Get Started Now
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <FAQItem
              question="Can I change plans later?"
              answer="Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit/debit cards, UPI, net banking, and wallets through Razorpay."
            />
            <FAQItem
              question="Is there a free trial?"
              answer="Yes! Our Free Starter plan is available forever. Paid plans come with a 14-day free trial."
            />
            <FAQItem
              question="Do you charge transaction fees?"
              answer="No! We don't charge any transaction fees. You keep 100% of your sales (minus payment processor fees)."
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, items }: any) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <Icon className="h-10 w-10 text-purple-600 mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <ul className="space-y-2">
        {items.map((item: string, i: number) => (
          <li key={i} className="flex items-start text-sm text-gray-700">
            <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductTypeCard({ icon: Icon, title }: any) {
  return (
    <div className="bg-white rounded-lg p-4 text-center shadow hover:shadow-lg transition-shadow border border-gray-200">
      <Icon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
      <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
    </div>
  );
}

function FAQItem({ question, answer }: any) {
  return (
    <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
      <h4 className="font-bold text-gray-900 mb-2">{question}</h4>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}

