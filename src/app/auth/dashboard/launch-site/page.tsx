'use client';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  RocketLaunchIcon,
  StarIcon,
  BuildingOfficeIcon,
  ShoppingCartIcon,
  GlobeAltIcon,
  CogIcon,
  CheckIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  ServerIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { gsap } from 'gsap';

export default function LaunchSite() {
  const searchParams = useSearchParams();
  const [selectedType, setSelectedType] = useState(searchParams?.get('type') || 'portfolio');
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [siteName, setSiteName] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // GSAP refs
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const plansRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(heroRef.current, 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(formRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 
      "-=0.4"
    )
    .fromTo(plansRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 
      "-=0.3"
    );
  }, []);

  const siteTypes = [
    {
      id: 'portfolio',
      name: 'Portfolio',
      description: 'Showcase your work and skills professionally',
      icon: StarIcon,
      gradient: 'from-indigo-500 to-purple-600',
      features: [
        'Responsive Design',
        'Project Gallery',
        'Contact Forms',
        'SEO Optimized',
        'Blog Support',
        'Social Media Integration'
      ],
      basePrice: 999
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Professional business website with advanced features',
      icon: BuildingOfficeIcon,
      gradient: 'from-purple-500 to-pink-600',
      features: [
        'Service Pages',
        'Team Section',
        'Testimonials',
        'Blog Support',
        'Contact Forms',
        'Appointment Booking',
        'Multi-language Support'
      ],
      basePrice: 1499
    },
    {
      id: 'ecommerce',
      name: 'E-commerce',
      description: 'Complete online store with payment processing',
      icon: ShoppingCartIcon,
      gradient: 'from-pink-500 to-rose-600',
      features: [
        'Product Catalog',
        'Shopping Cart',
        'Payment Gateway',
        'Inventory Management',
        'Order Tracking',
        'Customer Reviews',
        'Shipping Calculator',
        'Tax Calculation'
      ],
      basePrice: 2499
    },
    {
      id: 'blog',
      name: 'Blog',
      description: 'Content-focused website for writers and creators',
      icon: CogIcon,
      gradient: 'from-blue-500 to-indigo-600',
      features: [
        'Article Management',
        'Category System',
        'Comment System',
        'Social Sharing',
        'Newsletter Integration',
        'Analytics Dashboard',
        'SEO Tools',
        'Monetization Options'
      ],
      basePrice: 799
    }
  ];

  const hostingPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 0,
      features: [
        'Shared Hosting',
        '5GB Storage',
        '10GB Bandwidth',
        'Basic SSL',
        'Email Support'
      ],
      recommended: false
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 299,
      features: [
        'VPS Hosting',
        '20GB Storage',
        '100GB Bandwidth',
        'Premium SSL',
        'Priority Support',
        'Daily Backups',
        'CDN Included'
      ],
      recommended: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 599,
      features: [
        'Dedicated Server',
        '100GB Storage',
        'Unlimited Bandwidth',
        'Advanced SSL',
        '24/7 Support',
        'Hourly Backups',
        'Global CDN',
        'DDoS Protection'
      ],
      recommended: false
    }
  ];

  const addons = [
    {
      id: 'custom-domain',
      name: 'Custom Domain',
      description: 'Use your own domain name',
      price: 199,
      icon: GlobeAltIcon
    },
    {
      id: 'ssl-certificate',
      name: 'Premium SSL',
      description: 'Advanced security certificate',
      price: 99,
      icon: ShieldCheckIcon
    },
    {
      id: 'backup-service',
      name: 'Daily Backups',
      description: 'Automated daily backups',
      price: 149,
      icon: ServerIcon
    },
    {
      id: 'performance',
      name: 'Performance Boost',
      description: 'CDN and optimization',
      price: 199,
      icon: BoltIcon
    }
  ];

  const selectedSiteType = siteTypes.find(type => type.id === selectedType);
  const selectedHostingPlan = hostingPlans.find(plan => plan.id === selectedPlan);
  
  const basePrice = selectedSiteType?.basePrice || 0;
  const hostingPrice = selectedHostingPlan?.price || 0;
  const totalPrice = basePrice + hostingPrice;

  const handleLaunch = async () => {
    if (!siteName.trim()) {
      alert('Please enter a site name');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual site creation logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Redirect to success page or dashboard
      alert('Site launched successfully!');
    } catch (error) {
      console.error('Error launching site:', error);
      alert('Failed to launch site. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-12">
        {/* Hero Section */}
        <div 
          ref={heroRef}
          className="text-center relative overflow-hidden"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Launch Your
            <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Digital Presence
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose your site type, configure hosting, and launch your professional website in minutes. 
            Start building your online empire today.
          </p>
        </div>

        {/* Site Type Selection */}
        <div 
          ref={formRef}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Site Type
            </h2>
            <p className="text-lg text-gray-600">
              Select the perfect template for your business needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {siteTypes.map((type) => (
              <div
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`relative cursor-pointer transition-all duration-300 transform hover:-translate-y-2 ${
                  selectedType === type.id 
                    ? 'ring-4 ring-indigo-500 ring-opacity-50 scale-105' 
                    : 'hover:scale-105'
                }`}
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl border border-gray-100 h-full">
                  {selectedType === type.id && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                      <CheckIcon className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  <div className={`p-4 rounded-xl bg-gradient-to-r ${type.gradient} mb-4`}>
                    <type.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {type.name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {type.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {type.features.slice(0, 4).map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{type.basePrice}
                    </span>
                    <p className="text-sm text-gray-500">one-time</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hosting Plan Selection */}
        <div 
          ref={plansRef}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Hosting Plan
            </h2>
            <p className="text-lg text-gray-600">
              Select the hosting solution that fits your needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hostingPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative cursor-pointer transition-all duration-300 transform hover:-translate-y-2 ${
                  selectedPlan === plan.id 
                    ? 'ring-4 ring-indigo-500 ring-opacity-50 scale-105' 
                    : 'hover:scale-105'
                }`}
              >
                <div className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl border border-gray-100 h-full ${
                  plan.recommended ? 'ring-2 ring-indigo-500' : ''
                }`}>
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Recommended
                      </span>
                    </div>
                  )}
                  
                  {selectedPlan === plan.id && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                      <CheckIcon className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="text-3xl font-bold text-gray-900">
                      ₹{plan.price}
                      <span className="text-lg font-normal text-gray-500">/month</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckIcon className="h-4 w-4 text-green-500 mr-3" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add-ons */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Optional Add-ons
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {addons.map((addon) => (
              <div
                key={addon.id}
                className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <addon.icon className="h-6 w-6 text-indigo-600" />
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{addon.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{addon.description}</p>
                <p className="text-lg font-bold text-gray-900">₹{addon.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Total Investment
              </h2>
              <p className="text-indigo-100">
                Launch your site and start building your online business
              </p>
            </div>
            
            <div className="text-center lg:text-right mt-6 lg:mt-0">
              <div className="text-4xl font-bold mb-2">
                ₹{totalPrice.toLocaleString()}
              </div>
              <div className="text-indigo-100">
                {basePrice > 0 && <span>Site: ₹{basePrice}</span>}
                {hostingPrice > 0 && <span className="ml-2">Hosting: ₹{hostingPrice}/mo</span>}
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <button
              onClick={handleLaunch}
              disabled={loading || !siteName.trim()}
              className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-2xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-2"></div>
                  Launching...
                </>
              ) : (
                <>
                  <RocketLaunchIcon className="h-5 w-5 mr-2" />
                  Launch My Site
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
