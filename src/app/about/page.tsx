'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  RocketLaunchIcon, 
  UsersIcon, 
  GlobeAltIcon, 
  SparklesIcon,
  CheckCircleIcon,
  StarIcon,
  HeartIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import gsap from 'gsap';
import Header from '@/components/Header';
import Logo from '@/components/Logo';
import InlineAd from '@/components/ads/InlineAd';

export default function AboutPage() {
  const { data: session } = useSession();
  const aboutRef = useRef(null);
  const missionRef = useRef(null);
  const teamRef = useRef(null);
  const valuesRef = useRef(null);

  // GSAP Animations
  useEffect(() => {
    gsap.registerPlugin();

    // Set initial visibility
    gsap.set('.about-title, .about-subtitle, .mission-card, .team-member, .value-card', { 
      opacity: 1, 
      y: 0 
    });

    // About section animations
    const aboutTl = gsap.timeline();
    aboutTl
      .set('.about-title', { opacity: 0, y: 50 })
      .set('.about-subtitle', { opacity: 0, y: 30 })
      .to('.about-title', { 
        duration: 1, 
        y: 0, 
        opacity: 1, 
        ease: 'power3.out' 
      })
      .to('.about-subtitle', { 
        duration: 0.8, 
        y: 0, 
        opacity: 1, 
        ease: 'power2.out' 
      }, '-=0.5');

    // Mission cards animations
    gsap.fromTo('.mission-card', 
      { opacity: 0, y: 30 },
      {
        duration: 0.8,
        y: 0,
        opacity: 1,
        stagger: 0.2,
        ease: 'power2.out',
        delay: 1
      }
    );

    // Team members animations
    gsap.fromTo('.team-member', 
      { opacity: 0, y: 30 },
      {
        duration: 0.8,
        y: 0,
        opacity: 1,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 1.5
      }
    );

    // Values animations
    gsap.fromTo('.value-card', 
      { opacity: 0, y: 30 },
      {
        duration: 0.8,
        y: 0,
        opacity: 1,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 2
      }
    );

  }, []);

  const teamMembers = [
    {
      name: "Rahul Kumar",
      role: "Founder & CEO",
      image: "/api/placeholder/150/150",
      bio: "Entrepreneur passionate about helping creators monetize their digital products through powerful sales funnels.",
      expertise: ["Sales Funnels", "Digital Products", "SaaS Development"]
    },
    {
      name: "Development Team",
      role: "Engineering",
      image: "/api/placeholder/150/150",
      bio: "Expert developers building scalable funnel infrastructure with modern technologies like Next.js and Prisma.",
      expertise: ["Full-Stack Development", "Payment Systems", "Cloud Infrastructure"]
    },
    {
      name: "Design Team",
      role: "UX/UI Design",
      image: "/api/placeholder/150/150",
      bio: "Creating beautiful, conversion-focused funnel templates that drive results for digital entrepreneurs.",
      expertise: ["Funnel Design", "Conversion Optimization", "User Experience"]
    },
    {
      name: "Support Team",
      role: "Customer Success",
      image: "/api/placeholder/150/150",
      bio: "Dedicated to helping sellers succeed with personalized support, training, and optimization strategies.",
      expertise: ["Customer Support", "Funnel Strategy", "Sales Training"]
    }
  ];

  const companyValues = [
    {
      icon: HeartIcon,
      title: "Seller Success",
      description: "We're committed to helping digital entrepreneurs succeed. Your revenue growth is our top priority."
    },
    {
      icon: LightBulbIcon,
      title: "Simplicity",
      description: "Building sales funnels should be easy. We remove complexity so you can focus on selling your products."
    },
    {
      icon: ShieldCheckIcon,
      title: "Secure Payments",
      description: "Your earnings are protected with industry-leading payment security and fraud prevention."
    },
    {
      icon: UsersIcon,
      title: "Support First",
      description: "We provide exceptional support to help you optimize your funnels and maximize conversions."
    },
    {
      icon: ChartBarIcon,
      title: "Data-Driven",
      description: "Make informed decisions with powerful analytics that show what's working and what needs improvement."
    },
    {
      icon: StarIcon,
      title: "Quality Templates",
      description: "Every funnel template is designed by conversion experts to maximize your sales potential."
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section ref={aboutRef} className="relative pt-20 pb-12 px-4 bg-gradient-to-br from-white via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          {/* Ad Section */}
          <div className="mb-8">
            <InlineAd slot="" />
          </div>
          <h1 className="about-title text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Empowering Digital
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              {' '}Entrepreneurs
            </span>
          </h1>
          <p className="about-subtitle text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We're on a mission to help creators and entrepreneurs sell their digital products with high-converting sales funnels. No technical skills required.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section ref={missionRef} className="py-12 sm:py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Our Mission
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              To make it easy for anyone to sell digital products online with professional sales funnels, secure payments, and automated delivery.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="mission-card text-center p-4 sm:p-5 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-indigo-100 rounded-full mb-3">
                <GlobeAltIcon className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Easy to Use</h3>
              <p className="text-xs sm:text-sm text-gray-600">Build sales funnels in minutes with our intuitive drag-and-drop builder.</p>
            </div>
            
            <div className="mission-card text-center p-4 sm:p-5 rounded-lg bg-gradient-to-br from-green-50 to-blue-50 border border-green-100">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full mb-3">
                <SparklesIcon className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-xs sm:text-sm text-gray-600">Accept payments securely with Razorpay integration directly to your account.</p>
            </div>
            
            <div className="mission-card text-center p-4 sm:p-5 rounded-lg bg-gradient-to-br from-pink-50 to-red-50 border border-pink-100">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-pink-100 rounded-full mb-3">
                <UsersIcon className="h-6 w-6 sm:h-7 sm:w-7 text-pink-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Automated Delivery</h3>
              <p className="text-xs sm:text-sm text-gray-600">Digital products are delivered automatically after successful payment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section ref={teamRef} className="py-12 sm:py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Meet Our Team
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              The passionate minds behind SellEarnDirect.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member bg-white rounded-lg p-4 sm:p-5 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="text-center mb-3">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <UsersIcon className="h-8 w-8 sm:h-9 sm:w-9 text-indigo-600" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-xs sm:text-sm text-indigo-600 font-medium">{member.role}</p>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 text-center line-clamp-3">{member.bio}</p>
                <div className="space-y-1.5">
                  {member.expertise.slice(0, 2).map((skill, i) => (
                    <div key={i} className="flex items-center text-xs text-gray-500">
                      <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1.5 flex-shrink-0" />
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section ref={valuesRef} className="py-12 sm:py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Our Values
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {companyValues.map((value, index) => (
              <div key={index} className="value-card bg-white rounded-lg p-4 sm:p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-full mb-3">
                  <value.icon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 px-4 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Start Selling Today
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-indigo-100 mb-6 max-w-xl mx-auto">
            Join thousands of digital entrepreneurs who are selling their products with high-converting funnels.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-100 transition-all shadow-md hover:shadow-lg"
            >
              Create Your Funnel Free
            </Link>
            <Link
              href="/auth/signin"
              className="border-2 border-white text-white px-6 py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-white hover:text-indigo-600 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center sm:text-left">
              <Logo 
                variant="white" 
                size="lg"
                href=""
              />
              <p className="text-xs sm:text-sm text-gray-400 mt-2">
                Create sales funnels and sell digital products with ease.
              </p>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-sm sm:text-base font-semibold mb-3">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/#features" className="hover:text-white transition-colors text-xs sm:text-sm">Features</a></li>
                <li><a href="/#templates" className="hover:text-white transition-colors text-xs sm:text-sm">Templates</a></li>
                <li><Link href="/auth/dashboard/marketplace" className="hover:text-white transition-colors text-xs sm:text-sm">Marketplace</Link></li>
              </ul>
            </div>
            
          <div className="text-center sm:text-left">
            <h3 className="text-sm sm:text-base font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/contact" className="hover:text-white transition-colors text-xs sm:text-sm">Contact Us</Link></li>
              <li><Link href="/auth/dashboard" className="hover:text-white transition-colors text-xs sm:text-sm">Dashboard</Link></li>
            </ul>
          </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-sm sm:text-base font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors text-xs sm:text-sm">About</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors text-xs sm:text-sm">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors text-xs sm:text-sm">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
            <p className="text-xs sm:text-sm">&copy; 2025 SellEarnDirect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 