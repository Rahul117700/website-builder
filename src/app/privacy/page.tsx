'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  ShieldCheckIcon,
  EyeIcon,
  LockClosedIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import gsap from 'gsap';
import Header from '@/components/Header';
import Logo from '@/components/Logo';
import InlineAd from '@/components/ads/InlineAd';

export default function PrivacyPage() {
  const { data: session } = useSession();

  const privacyRef = useRef(null);
  const sectionsRef = useRef(null);

  // GSAP Animations
  useEffect(() => {
    gsap.registerPlugin();

    // Set initial visibility
    gsap.set('.privacy-title, .privacy-subtitle, .privacy-section', { 
      opacity: 1, 
      y: 0 
    });

    // Privacy section animations
    const privacyTl = gsap.timeline();
    privacyTl
      .set('.privacy-title', { opacity: 0, y: 50 })
      .set('.privacy-subtitle', { opacity: 0, y: 30 })
      .to('.privacy-title', { 
        duration: 1, 
        y: 0, 
        opacity: 1, 
        ease: 'power3.out' 
      })
      .to('.privacy-subtitle', { 
        duration: 0.8, 
        y: 0, 
        opacity: 1, 
        ease: 'power2.out' 
      }, '-=0.5');

    // Sections animations
    gsap.fromTo('.privacy-section', 
      { opacity: 0, y: 30 },
      {
        duration: 0.8,
        y: 0,
        opacity: 1,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 1
      }
    );

  }, []);

  const privacySections = [
    {
      title: "Information We Collect",
      content: `We collect information you provide directly to us, such as when you create an account, purchase templates, or contact support. This may include your name, email address, payment information, and any other information you choose to provide.`,
      icon: DocumentTextIcon,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "How We Use Your Information",
      content: `We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.`,
      icon: EyeIcon,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Information Sharing",
      content: `We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with service providers who assist us in operating our platform.`,
      icon: ShieldCheckIcon,
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Data Security",
      content: `We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.`,
      icon: LockClosedIcon,
      color: "from-orange-500 to-red-600"
    },
    {
      title: "Cookies and Tracking",
      content: `We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookie settings through your browser preferences, though disabling cookies may affect site functionality.`,
      icon: DocumentTextIcon,
      color: "from-indigo-500 to-purple-600"
    },
    {
      title: "Third-Party Services",
      content: `Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any information.`,
      icon: ExclamationTriangleIcon,
      color: "from-teal-500 to-cyan-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section ref={privacyRef} className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto text-center">
          {/* Ad Section */}
          <div className="mb-8">
            <InlineAd slot="" />
          </div>
          <h1 className="privacy-title text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Privacy
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              {' '}Policy
            </span>
          </h1>
          <p className="privacy-subtitle text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            We are committed to protecting your privacy and ensuring the security of your personal information. 
            This policy explains how we collect, use, and safeguard your data.
          </p>
          <div className="mt-8 flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span>Last updated: December 2024</span>
            <span>•</span>
            <span>Version 2.0</span>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section ref={sectionsRef} className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="privacy-section mb-12">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-100">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Your Privacy Matters</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                At SellEarnDirect, we understand the importance of privacy and are committed to protecting your personal information. 
                This Privacy Policy explains how we collect, use, and safeguard your data when you use our services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using our platform, you agree to the collection and use of information in accordance with this policy. 
                We will not use or share your information with anyone except as described in this Privacy Policy.
              </p>
            </div>
          </div>

          {/* Privacy Sections */}
          <div className="grid gap-8 md:grid-cols-2">
            {privacySections.map((section, index) => (
              <div key={index} className="privacy-section">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${section.color} mb-4`}>
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{section.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Privacy Information */}
          <div className="privacy-section mt-16">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-8 border border-gray-200">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Additional Privacy Information</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Retention</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We retain your personal information for as long as necessary to provide our services and fulfill the purposes 
                    outlined in this policy. We may retain certain information for longer periods as required by law.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Rights</h3>
                  <p className="text-gray-700 leading-relaxed">
                    You have the right to access, update, or delete your personal information. You can also opt out of certain 
                    communications and request information about how we process your data.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Children&apos;s Privacy</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Our services are not intended for children under 13 years of age. We do not knowingly collect personal 
                    information from children under 13. If you are a parent or guardian, please contact us immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="privacy-section mt-16 text-center">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Privacy?</h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about this Privacy Policy or our data practices, please contact us.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 