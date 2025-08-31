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
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "/api/placeholder/150/150",
      bio: "Former Google engineer with 15+ years in web development. Passionate about democratizing website creation.",
      expertise: ["Product Strategy", "Team Leadership", "Web Development"]
    },
    {
      name: "Michael Chen",
      role: "CTO & Lead Developer",
      image: "/api/placeholder/150/150",
      bio: "Full-stack developer with expertise in React, Node.js, and cloud architecture. Built scalable systems for millions of users.",
      expertise: ["System Architecture", "React Development", "Cloud Infrastructure"]
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Design",
      image: "/api/placeholder/150/150",
      bio: "Award-winning designer with experience at Airbnb and Figma. Specializes in user experience and visual design.",
      expertise: ["UX Design", "Visual Design", "Design Systems"]
    },
    {
      name: "David Kim",
      role: "Head of Marketing",
      image: "/api/placeholder/150/150",
      bio: "Growth marketing expert with 10+ years scaling SaaS companies. Previously led marketing at Shopify and Stripe.",
      expertise: ["Growth Marketing", "Brand Strategy", "Customer Acquisition"]
    }
  ];

  const companyValues = [
    {
      icon: HeartIcon,
      title: "Customer First",
      description: "Every decision we make is driven by what's best for our customers. We listen, learn, and iterate based on their feedback."
    },
    {
      icon: LightBulbIcon,
      title: "Innovation",
      description: "We constantly push boundaries and explore new technologies to deliver cutting-edge solutions that give our users an edge."
    },
    {
      icon: ShieldCheckIcon,
      title: "Trust & Security",
      description: "Your data and success are our top priorities. We maintain the highest standards of security and privacy protection."
    },
    {
      icon: UsersIcon,
      title: "Community",
      description: "We believe in the power of community. We foster connections between creators, developers, and entrepreneurs."
    },
    {
      icon: ChartBarIcon,
      title: "Results-Driven",
      description: "We measure success by the tangible results our users achieve. Every feature is designed to drive real business growth."
    },
    {
      icon: StarIcon,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from code quality to customer support to user experience."
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section ref={aboutRef} className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="about-title text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Building the Future of
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              {' '}Web Creation
            </span>
          </h1>
          <p className="about-subtitle text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            We're on a mission to democratize website creation, making it possible for anyone to build 
            professional, high-converting websites that drive real business results.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section ref={missionRef} className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              To empower entrepreneurs, creators, and businesses with the tools they need to succeed online.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="mission-card text-center p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <GlobeAltIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Reach</h3>
              <p className="text-gray-600">We serve creators and businesses in over 150 countries, helping them build their online presence.</p>
            </div>
            
            <div className="mission-card text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-blue-50 border border-green-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <SparklesIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation First</h3>
              <p className="text-gray-600">We continuously innovate with cutting-edge technology to stay ahead of the curve.</p>
            </div>
            
            <div className="mission-card text-center p-6 rounded-xl bg-gradient-to-br from-pink-50 to-red-50 border border-pink-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
                <UsersIcon className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community Driven</h3>
              <p className="text-gray-600">Our success is built on the success of our community of creators and entrepreneurs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section ref={teamRef} className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Meet Our Team
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate minds behind Website Builder, dedicated to revolutionizing web creation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <UsersIcon className="h-10 w-10 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-indigo-600 font-medium">{member.role}</p>
                </div>
                <p className="text-gray-600 text-sm mb-4 text-center">{member.bio}</p>
                <div className="space-y-2">
                  {member.expertise.map((skill, i) => (
                    <div key={i} className="flex items-center text-xs text-gray-500">
                      <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
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
      <section ref={valuesRef} className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Our Values
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do and every decision we make.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companyValues.map((value, index) => (
              <div key={index} className="value-card bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
                  <value.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Join Our Mission
          </h2>
          <p className="text-lg sm:text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Be part of the revolution in web creation. Start building your success story today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-indigo-600 transition-all transform hover:scale-105"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start mb-4">
                <RocketLaunchIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400" />
                <span className="ml-2 text-lg sm:text-xl font-bold">Website Builder</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400">
                Empowering creators and entrepreneurs to build successful online businesses.
              </p>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/#features" className="hover:text-white transition-colors text-sm sm:text-base">Features</a></li>
                <li><a href="/#templates" className="hover:text-white transition-colors text-sm sm:text-base">Templates</a></li>
                <li><Link href="/auth/dashboard/marketplace" className="hover:text-white transition-colors text-sm sm:text-base">Marketplace</Link></li>
                <li><Link href="/auth/dashboard/create-template" className="hover:text-white transition-colors text-sm sm:text-base">Sell Your Template</Link></li>
              </ul>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors text-sm sm:text-base">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors text-sm sm:text-base">Contact</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors text-sm sm:text-base">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors text-sm sm:text-base">Privacy</Link></li>
              </ul>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/auth/signup" className="hover:text-white transition-colors text-sm sm:text-base">Sign Up</Link></li>
                <li><Link href="/auth/signin" className="hover:text-white transition-colors text-sm sm:text-base">Sign In</Link></li>
                <li><Link href="/auth/dashboard" className="hover:text-white transition-colors text-sm sm:text-base">Dashboard</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-sm sm:text-base">&copy; 2024 Website Builder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 