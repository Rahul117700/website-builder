'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  DocumentTextIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import gsap from 'gsap';
import Header from '@/components/Header';
import Logo from '@/components/Logo';

export default function TermsPage() {
  const { data: session } = useSession();

  const termsRef = useRef(null);
  const sectionsRef = useRef(null);

  // GSAP Animations
  useEffect(() => {
    gsap.registerPlugin();

    // Set initial visibility
    gsap.set('.terms-title, .terms-subtitle, .terms-section', { 
      opacity: 1, 
      y: 0 
    });

    // Terms section animations
    const termsTl = gsap.timeline();
    termsTl
      .set('.terms-title', { opacity: 0, y: 50 })
      .set('.terms-subtitle', { opacity: 0, y: 30 })
      .to('.terms-title', { 
        duration: 1, 
        y: 0, 
        opacity: 1, 
        ease: 'power3.out' 
      })
      .to('.terms-subtitle', { 
        duration: 0.8, 
        y: 0, 
        opacity: 1, 
        ease: 'power2.out' 
      }, '-=0.5');

    // Sections animations
    gsap.fromTo('.terms-section', 
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

  const termsSections = [
    {
      title: "Acceptance of Terms",
      content: `By accessing and using sedStudios's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`,
      icon: CheckCircleIcon,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Description of Service",
      content: `sedStudios provides a platform for creating sales funnels and selling digital products. Our services include funnel templates, payment processing (Razorpay), analytics, and automated digital product delivery. We reserve the right to modify, suspend, or discontinue any aspect of our service at any time.`,
      icon: DocumentTextIcon,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "User Accounts",
      content: `You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. You must be at least 18 years old to use our services.`,
      icon: ShieldCheckIcon,
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Acceptable Use",
      content: `You agree not to use our services for any unlawful purpose or in any way that could damage, disable, overburden, or impair our servers. This includes but is not limited to: spamming, hacking, distributing malware, or violating intellectual property rights.`,
      icon: ExclamationTriangleIcon,
      color: "from-orange-500 to-red-600"
    },
    {
      title: "Intellectual Property",
      content: `All content, features, and functionality of our platform are owned by sedStudios and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our content without explicit permission.`,
      icon: DocumentTextIcon,
      color: "from-indigo-500 to-purple-600"
    },
    {
      title: "Privacy Policy",
      content: `Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using our services, you agree to our Privacy Policy, which is incorporated into these terms by reference.`,
      icon: ShieldCheckIcon,
      color: "from-teal-500 to-cyan-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section ref={termsRef} className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="terms-title text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Terms and
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              {' '}Conditions
            </span>
          </h1>
          <p className="terms-subtitle text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Please read these terms carefully before using our services. By using sedStudios, 
            you agree to be bound by these terms and conditions.
          </p>
          <div className="mt-8 flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span>Last updated: December 2024</span>
            <span>•</span>
            <span>Version 2.0</span>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section ref={sectionsRef} className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="terms-section mb-12">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-100">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Important Notice</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms and Conditions govern your use of sedStudios&apos;s services. By accessing or using our platform, 
                you acknowledge that you have read, understood, and agree to be bound by these terms.
              </p>
              <p className="text-gray-700 leading-relaxed">
                If you do not agree with any part of these terms, you must not use our services. We reserve the right to 
                modify these terms at any time, and your continued use of our services constitutes acceptance of any changes.
              </p>
            </div>
          </div>

          {/* Terms Sections */}
          <div className="grid gap-8 md:grid-cols-2">
            {termsSections.map((section, index) => (
              <div key={index} className="terms-section">
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

          {/* Additional Terms */}
          <div className="terms-section mt-16">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-8 border border-gray-200">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Additional Terms</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Limitation of Liability</h3>
                  <p className="text-gray-700 leading-relaxed">
                    sedStudios shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                    including but not limited to loss of profits, data, or use, incurred by you or any third party.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Termination</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We may terminate or suspend your account and access to our services at any time, with or without cause, 
                    with or without notice, effective immediately.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Governing Law</h3>
                  <p className="text-gray-700 leading-relaxed">
                    These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which 
                    sedStudios operates, without regard to its conflict of law provisions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="terms-section mt-16 text-center">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About These Terms?</h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about these Terms and Conditions, please contact us.
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