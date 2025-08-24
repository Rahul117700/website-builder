"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function DomainHelpPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    domain: '',
    issue: ''
  });

  const services = [
    {
      id: 'domain-setup',
      title: 'Custom Domain Setup',
      price: '$199',
      description: 'Professional domain connection service',
      features: [
        'DNS Configuration',
        'SSL Certificate Setup',
        'Email Configuration',
        'Priority Support',
        '30-day guarantee'
      ],
      popular: true
    },
    {
      id: 'dns-help',
      title: 'DNS Configuration Help',
      price: '$99',
      description: 'Expert DNS setup assistance',
      features: [
        'DNS Record Setup',
        'A Record Configuration',
        'CNAME Setup',
        'Email Support',
        'Screenshots included'
      ]
    },
    {
      id: 'migration',
      title: 'Domain Migration Service',
      price: '$299',
      description: 'Move your domain from another provider',
      features: [
        'Full Domain Transfer',
        'Zero Downtime',
        'Email Migration',
        'Priority Support',
        'Post-migration support'
      ]
    },
    {
      id: 'premium-support',
      title: 'Premium Support Plan',
      price: '$49/month',
      description: '24/7 priority technical support',
      features: [
        '24/7 Phone Support',
        'Priority Ticket System',
        'Video Call Support',
        'Monthly Consultation',
        'Custom Solutions'
      ]
    }
  ];

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/domain-help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...contactInfo,
          selectedService: selectedService
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Thank you! ${data.message}\n\nRequest ID: ${data.requestId}\nEstimated Response Time: ${data.estimatedResponseTime}`);
        // Reset form
        setContactInfo({
          name: '',
          email: '',
          phone: '',
          domain: '',
          issue: ''
        });
        setSelectedService(null);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to submit request. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Website Builder
              </Link>
              <span className="text-gray-500">•</span>
              <span className="text-gray-700">Domain Help Center</span>
            </div>
            <Link 
              href="/auth/dashboard" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 mb-4">
              🔧 Professional Domain Services
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Can&apos;t Connect Your Domain?
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Our expert team will help you get your domain connected quickly and professionally. 
              Choose from our range of premium services or get expert consultation.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">99%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-green-600 mb-2">24h</div>
              <div className="text-gray-600">Response Time</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600">Domains Connected</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Service
            </h2>
            <p className="text-lg text-gray-600">
              Select the service that best fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div 
                key={service.id}
                className={`relative p-6 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedService === service.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => handleServiceSelect(service.id)}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <div className="text-3xl font-bold text-blue-600 mb-4">
                    {service.price}
                  </div>
                  <p className="text-gray-600 mb-6">
                    {service.description}
                  </p>
                  
                  <ul className="text-left space-y-2 mb-6">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Get Professional Help
              </h2>
              <p className="text-lg text-gray-600">
                Fill out the form below and our expert team will contact you within 24 hours
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactInfo.domain}
                    onChange={(e) => setContactInfo({...contactInfo, domain: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., mydomain.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe Your Issue *
                </label>
                <textarea
                  required
                  rows={4}
                  value={contactInfo.issue}
                  onChange={(e) => setContactInfo({...contactInfo, issue: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the domain connection issue you're experiencing..."
                />
              </div>

              {selectedService && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800">
                    <strong>Selected Service:</strong> {services.find(s => s.id === selectedService)?.title} - {services.find(s => s.id === selectedService)?.price}
                  </p>
                </div>
              )}

              <div className="text-center">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                >
                  Get Professional Help
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Alternative Solutions */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Alternative Solutions
            </h2>
            <p className="text-lg text-gray-600">
              Don&apos;t want to wait? Try these alternatives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Use Subdomain</h3>
              <p className="text-gray-600 mb-4">
                Start with a free subdomain like yoursite.websitebuilder.com
              </p>
              <Link 
                href="/auth/dashboard/sites/create" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create Site →
              </Link>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Learn Domain Setup</h3>
              <p className="text-gray-600 mb-4">
                Read our comprehensive domain setup guide
              </p>
              <Link 
                href="/docs/domain-setup" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Read Guide →
              </Link>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Help</h3>
              <p className="text-gray-600 mb-4">
                Ask the community for help and tips
              </p>
              <Link 
                href="/auth/dashboard/community" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Join Community →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            Need immediate help? Call us at <strong>+1 (555) 123-4567</strong> or email <strong>support@websitebuilder.com</strong>
          </p>
        </div>
      </footer>
    </div>
  );
}
