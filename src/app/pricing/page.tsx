import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Pricing - Sell Earn Direct | Affordable Plans for Every Creator',
  description: 'Transparent pricing for Sell Earn Direct. Choose the perfect plan for your digital product business. Start free, upgrade as you grow.',
};

export default function PricingPage() {
  const plans = [
    {
      name: 'Free Starter',
      price: 0,
      period: 'forever',
      description: 'Perfect for testing and getting started',
      features: [
        '2 Active Funnels',
        'Up to 5 Products',
        'Basic Analytics',
        'Email Support',
        'Standard Templates',
        '1,000 visitors/month'
      ],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Starter',
      price: 499,
      period: 'month',
      description: 'For serious creators getting started',
      features: [
        '5 Active Funnels',
        'Up to 10 Products',
        'Advanced Analytics',
        'Priority Support',
        'All Templates',
        '5,000 visitors/month',
        'Custom Branding'
      ],
      cta: 'Start Trial',
      popular: false
    },
    {
      name: 'Professional',
      price: 999,
      period: 'month',
      description: 'Most popular for growing businesses',
      features: [
        '25 Active Funnels',
        'Up to 50 Products',
        'Advanced Analytics',
        'Priority Email Support',
        'All Premium Templates',
        '25,000 visitors/month',
        'Custom Branding',
        'A/B Testing',
        '2 Custom Domains'
      ],
      cta: 'Start Trial',
      popular: true
    },
    {
      name: 'Business',
      price: 1999,
      period: 'month',
      description: 'Unlimited everything for enterprises',
      features: [
        'Unlimited Funnels',
        'Unlimited Products',
        'Unlimited Analytics',
        'Priority Phone & Email',
        'All Premium Templates',
        'Unlimited visitors',
        'White Label',
        'API Access',
        'Dedicated Manager',
        '5 Custom Domains'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden border-2 ${
                plan.popular ? 'border-purple-500 relative' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-2 text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                    <span className="text-gray-600 ml-2">/{plan.period}</span>
                  </div>
                </div>
                <Link
                  href={plan.price === 0 ? '/auth/signup' : '/auth/signup?plan=' + plan.name.toLowerCase()}
                  className={`block w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors ${
                    plan.popular
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
              <div className="px-6 pb-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-700">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Annual Billing */}
        <div className="mt-16 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              💰 Save 20% with Annual Billing
            </h3>
            <p className="text-gray-600 mb-6">
              Pay annually and get 2 months free on any paid plan!
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              View Annual Plans
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

