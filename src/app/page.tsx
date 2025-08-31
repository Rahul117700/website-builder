'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import * as THREE from 'three';
import { 
  RocketLaunchIcon, 
  SparklesIcon, 
  GlobeAltIcon, 
  ChartBarIcon,
  ShoppingBagIcon,
  HeartIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  StarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  PlayIcon,
  ArrowRightIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import { 
  PlayIcon as PlayIconSolid,
  ArrowRightIcon as ArrowRightIconSolid
} from '@heroicons/react/24/solid';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
}

interface Feature {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

interface Template {
  name: string;
  category: string;
  price: number;
  image: string;
  features: string[];
  rating: number;
  reviews: number;
}

export default function HomePage() {
  const { data: session } = useSession();
  
  // Refs for animations
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const templatesRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const threeContainerRef = useRef<HTMLDivElement>(null);
  const threeSceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    particles: THREE.Group;
  } | null>(null);

  // Three.js setup
  useEffect(() => {
    if (!threeContainerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    threeContainerRef.current.appendChild(renderer.domElement);

    // Create floating particles - reduced count and opacity for subtlety
    const particles = new THREE.Group();
    const particleCount = 50; // Reduced from 100
    
    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.015, 8, 8); // Smaller particles
      const material = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.6, 0.8, 0.6),
        transparent: true,
        opacity: 0.3 // Reduced opacity from 0.6
      });
      const particle = new THREE.Mesh(geometry, material);
      
      particle.position.set(
        (Math.random() - 0.5) * 15, // Reduced spread
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15
      );
      
      particles.add(particle);
    }
    
    scene.add(particles);
    camera.position.z = 5;

    // Animation loop - slower and more subtle
    const animate = () => {
      requestAnimationFrame(animate);
      
      particles.rotation.x += 0.0005; // Slower rotation
      particles.rotation.y += 0.001;
      
      particles.children.forEach((particle, i) => {
        particle.position.y += Math.sin(Date.now() * 0.0005 + i) * 0.0005; // Slower movement
        particle.position.x += Math.cos(Date.now() * 0.0005 + i) * 0.0005;
      });
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Store references
    threeSceneRef.current = { scene, camera, renderer, particles };

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (threeContainerRef.current) {
        threeContainerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // GSAP Animations
  useEffect(() => {
    // Fallback: Ensure all content is visible by default
    const ensureVisibility = () => {
      const elements = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-buttons, .hero-logos, .hero-visual, .feature-card, .template-card, #pricing .bg-gray-50, .cta-content, footer');
      elements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }
      });
    };

    // Set initial visibility for all elements
    gsap.set('.hero-title, .hero-subtitle, .hero-buttons, .hero-logos, .hero-visual', { 
      opacity: 1, 
      y: 0 
    });
    
    gsap.set('.feature-card, .template-card, #pricing .bg-gray-50, .cta-content, footer', { 
      opacity: 1, 
      y: 0 
    });

    // Hero animations - only run once on page load with proper initial states
    const heroTl = gsap.timeline({
      onComplete: () => {
        // Ensure hero elements stay visible after animation
        gsap.set('.hero-title, .hero-subtitle, .hero-buttons, .hero-logos, .hero-visual', { 
          opacity: 1, 
          y: 0 
        });
      }
    });
    
    heroTl
      .set('.hero-title', { opacity: 0, y: 50 })
      .set('.hero-subtitle', { opacity: 0, y: 30 })
      .set('.hero-buttons', { opacity: 0, y: 20 })
      .set('.hero-logos', { opacity: 0, y: 20 })
      .set('.hero-visual', { opacity: 0, y: 30 })
      .to('.hero-title', { 
        duration: 1, 
        y: 0, 
        opacity: 1, 
        ease: 'power3.out' 
      })
      .to('.hero-subtitle', { 
        duration: 0.8, 
        y: 0, 
        opacity: 1, 
        ease: 'power2.out' 
      }, '-=0.5')
      .to('.hero-buttons', { 
        duration: 0.8, 
        y: 0, 
        opacity: 1, 
        ease: 'power2.out' 
      }, '-=0.3')
      .to('.hero-logos', { 
        duration: 0.8, 
        y: 0, 
        opacity: 1, 
        ease: 'power2.out' 
      }, '-=0.5')
      .to('.hero-visual', { 
        duration: 1, 
        y: 0, 
        opacity: 1, 
        ease: 'power2.out' 
      }, '-=0.3');

    // Features animations - simple fade in without scroll trigger
    gsap.fromTo('.feature-card', 
      { opacity: 0, y: 30 },
      {
        duration: 0.8,
        y: 0,
        opacity: 1,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 1.5,
        onComplete: () => {
          gsap.set('.feature-card', { opacity: 1, y: 0 });
        }
      }
    );

    // Templates animations - simple fade in without scroll trigger
    gsap.fromTo('.template-card', 
      { opacity: 0, y: 30 },
      {
        duration: 0.8,
        y: 0,
        opacity: 1,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 2,
        onComplete: () => {
          gsap.set('.template-card', { opacity: 1, y: 0 });
        }
      }
    );

    // Pricing animations - simple fade in without scroll trigger
    gsap.fromTo('#pricing .bg-gray-50', 
      { opacity: 0, y: 30 },
      {
        duration: 1,
        y: 0,
        opacity: 1,
        ease: 'power2.out',
        delay: 2.5,
        onComplete: () => {
          gsap.set('#pricing .bg-gray-50', { opacity: 1, y: 0 });
        }
      }
    );

    // CTA animations - simple fade in without scroll trigger
    gsap.fromTo('.cta-content', 
      { opacity: 0, y: 30 },
      {
        duration: 1,
        y: 0,
        opacity: 1,
        ease: 'power2.out',
        delay: 3,
        onComplete: () => {
          gsap.set('.cta-content', { opacity: 1, y: 0 });
        }
      }
    );

    // Footer animations - simple fade in without scroll trigger
    gsap.fromTo('footer', 
      { opacity: 0, y: 30 },
      {
        duration: 1,
        y: 0,
        opacity: 1,
        ease: 'power2.out',
        delay: 3.5,
        onComplete: () => {
          gsap.set('footer', { opacity: 1, y: 0 });
        }
      }
    );

    // Floating animation for hero visual - continuous but subtle
    gsap.to('.hero-visual', {
      duration: 4,
      y: -10,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: -1,
      delay: 4 // Start after other animations complete
    });

    // Fallback: Ensure visibility after a delay in case animations fail
    setTimeout(ensureVisibility, 5000);

    // Cleanup function
    return () => {
      ensureVisibility();
    };

  }, []);

  const features: Feature[] = [
    {
      icon: RocketLaunchIcon,
      title: 'Build with Confidence',
      description: 'Professional templates designed by experts with pixel-perfect precision.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Host Anywhere',
      description: 'Deploy your sites to any hosting provider or use our optimized hosting.'
    },
    {
      icon: UserGroupIcon,
      title: 'Collaborate Seamlessly',
      description: 'Work together with your team in real-time with advanced collaboration tools.'
    },
    {
      icon: ChartBarIcon,
      title: 'Scale with Ease',
      description: 'Built for performance and growth with enterprise-grade infrastructure.'
    }
  ];

  const templates: Template[] = [
    {
      name: 'Business Portfolio',
      category: 'Business',
      price: 49,
      image: '/templates/business-portfolio.jpg',
      features: ['Responsive Design', 'Contact Forms', 'SEO Optimized'],
      rating: 4.9,
      reviews: 24
    },
    {
      name: 'E-commerce Store',
      category: 'E-commerce',
      price: 79,
      image: '/templates/ecommerce.jpg',
      features: ['Product Catalog', 'Shopping Cart', 'Payment Integration'],
      rating: 4.8,
      reviews: 31
    },
    {
      name: 'Creative Agency',
      category: 'Creative',
      price: 69,
      image: '/templates/agency.jpg',
      features: ['Portfolio Gallery', 'Team Showcase', 'Project Management'],
      rating: 4.9,
      reviews: 27
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Custom CSS for Marquee Animations */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        @keyframes marquee-reverse {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        
        .animate-marquee-reverse {
          animation: marquee-reverse 30s linear infinite;
        }
        
        .animate-marquee:hover,
        .animate-marquee-reverse:hover {
          animation-play-state: paused;
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        .animate-dash {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: dash 2s ease-in-out forwards;
        }
      `}</style>

      {/* Three.js Background */}
      <div 
        ref={threeContainerRef} 
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight" style={{ opacity: 1, transform: 'translateY(0)' }}>
            Turn traffic into
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              {' '}revenue
            </span>
          </h1>
          <p className="hero-subtitle text-lg sm:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4" style={{ opacity: 1, transform: 'translateY(0)' }}>
            Launch pixel-perfect sites that convert visitors into customers. 
            Build with confidence using our professional templates and powerful tools.
          </p>
          <div className="hero-buttons flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4" style={{ opacity: 1, transform: 'translateY(0)' }}>
            <Link
              href="/auth/signup"
              className="group bg-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-indigo-700 transition-all transform hover:scale-105 hover:shadow-xl flex items-center justify-center w-full sm:w-auto"
            >
              Start building
              <ArrowRightIconSolid className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="border-2 border-gray-300 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:border-indigo-600 hover:text-indigo-600 transition-all transform hover:scale-105 flex items-center justify-center w-full sm:w-auto">
              <PlayIconSolid className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Watch demo
            </button>
          </div>
          
          {/* Client Logos - Sliding Marquee */}
          <div className="hero-logos px-4 overflow-hidden" style={{ opacity: 1, transform: 'translateY(0)' }}>
            <p className="text-sm text-gray-500 mb-3 sm:mb-4 text-center">Trusted by leading companies worldwide</p>
            
            {/* Sliding Container */}
            <div className="relative">
              {/* First Row - Sliding Left */}
              <div className="flex animate-marquee space-x-12 sm:space-x-16 opacity-60">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Dell</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Zendesk</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">TED</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Discord</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Reddit</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Netflix</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Spotify</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Airbnb</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Uber</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Slack</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Shopify</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Stripe</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Figma</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Notion</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Zoom</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Dropbox</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">GitHub</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Adobe</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Microsoft</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Google</div>
              </div>
              
              {/* Second Row - Sliding Right (Reverse) */}
              <div className="flex animate-marquee-reverse space-x-12 sm:space-x-16 opacity-60 mt-4">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Google</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Microsoft</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Adobe</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">GitHub</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Dropbox</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Zoom</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Notion</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Figma</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Stripe</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Shopify</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Slack</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Uber</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Airbnb</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Spotify</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Netflix</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Reddit</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Discord</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">TED</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Zendesk</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-400 whitespace-nowrap">Dell</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Visual - Revenue Growth Dashboard */}
        <div className="hero-visual mt-12 sm:mt-16 relative px-4" style={{ opacity: 1, transform: 'translateY(0)' }}>
          <div className="max-w-6xl mx-auto relative">
            {/* Background Floating Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Animated Background Circles */}
              <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
              
              {/* Floating Particles */}
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-300 rounded-full animate-bounce"></div>
              <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-1/4 right-1/4 w-2.5 h-2.5 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
            </div>

            {/* Main Revenue Dashboard */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-700/50 relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
              {/* Enhanced Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/15 via-blue-500/15 to-purple-500/15 rounded-2xl sm:rounded-3xl animate-pulse"></div>
              
              {/* Animated Border Glow */}
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-green-500/30 via-blue-500/30 to-purple-500/30 opacity-0 hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              
              {/* Dashboard Header */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 mb-6 relative shadow-lg">
                {/* Enhanced Traffic Light Buttons */}
                <div className="flex space-x-2 mb-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg animate-pulse hover:scale-110 transition-transform cursor-pointer"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg animate-pulse hover:scale-110 transition-transform cursor-pointer" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg animate-pulse hover:scale-110 transition-transform cursor-pointer" style={{ animationDelay: '0.4s' }}></div>
                </div>
                
                {/* Dashboard Title */}
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Revenue Growth Dashboard</h3>
                  <p className="text-sm text-gray-300">Track your success journey</p>
                </div>
              </div>
              
              {/* Revenue Metrics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6">
                {/* Revenue Growth Chart */}
                <div className="group bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-5 sm:p-6 shadow-xl border border-gray-600/30 hover:border-green-500/50 transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
                  {/* Enhanced Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Chart Title */}
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold text-white mb-2">Monthly Revenue</h4>
                    <div className="text-2xl font-bold text-green-400">$12,847</div>
                    <div className="text-sm text-green-300">↗ +23% from last month</div>
                  </div>
                  
                  {/* Animated Revenue Chart */}
                  <div className="h-32 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg mb-4 relative overflow-hidden">
                    {/* Chart Bars */}
                    <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-around px-2">
                      <div className="w-3 bg-green-400 rounded-t-sm h-8 animate-pulse"></div>
                      <div className="w-3 bg-green-400 rounded-t-sm h-12 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-3 bg-green-400 rounded-t-sm h-16 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      <div className="w-3 bg-green-400 rounded-t-sm h-20 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                      <div className="w-3 bg-green-400 rounded-t-sm h-24 animate-pulse" style={{ animationDelay: '0.8s' }}></div>
                      <div className="w-3 bg-green-400 rounded-t-sm h-28 animate-pulse" style={{ animationDelay: '1s' }}></div>
                      <div className="w-3 bg-green-400 rounded-t-sm h-32 animate-pulse" style={{ animationDelay: '1.2s' }}></div>
                    </div>
                    
                    {/* Growth Line */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M10,80 Q25,60 40,50 T70,30 T90,20" stroke="url(#greenGradient)" strokeWidth="2" fill="none" className="animate-dash">
                          <defs>
                            <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#10B981" stopOpacity="0.8"/>
                              <stop offset="100%" stopColor="#059669" stopOpacity="0.8"/>
                            </linearGradient>
                          </defs>
                        </path>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Success Indicator */}
                  <div className="text-center">
                    <div className="inline-flex items-center bg-green-600/20 text-green-300 px-3 py-1 rounded-full text-sm">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                      Growing Strong
                    </div>
                  </div>
                </div>
                
                {/* Traffic Growth Chart */}
                <div className="group bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-5 sm:p-6 shadow-xl border border-gray-600/30 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
                  {/* Enhanced Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Chart Title */}
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold text-white mb-2">Website Traffic</h4>
                    <div className="text-2xl font-bold text-blue-400">45,892</div>
                    <div className="text-sm text-blue-300">↗ +18% from last month</div>
                  </div>
                  
                  {/* Animated Traffic Chart */}
                  <div className="h-32 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg mb-4 relative overflow-hidden">
                    {/* Traffic Line Chart */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M10,70 Q20,50 30,45 T50,35 T70,25 T90,20" stroke="url(#blueGradient)" strokeWidth="2" fill="none" className="animate-dash">
                          <defs>
                            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8"/>
                              <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.8"/>
                            </linearGradient>
                          </defs>
                        </path>
                      </svg>
                    </div>
                    
                    {/* Traffic Dots */}
                    <div className="absolute inset-0 flex items-center justify-around">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.9s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1.2s' }}></div>
                    </div>
                  </div>
                  
                  {/* Success Indicator */}
                  <div className="text-center">
                    <div className="inline-flex items-center bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
                      Traffic Surging
                    </div>
                  </div>
                </div>
                
                {/* Conversion Rate Chart */}
                <div className="group bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-5 sm:p-6 shadow-xl border border-gray-600/30 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
                  {/* Enhanced Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Chart Title */}
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold text-white mb-2">Conversion Rate</h4>
                    <div className="text-2xl font-bold text-purple-400">3.8%</div>
                    <div className="text-sm text-purple-300">↗ +0.5% from last month</div>
                  </div>
                  
                  {/* Animated Conversion Chart */}
                  <div className="h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg mb-4 relative overflow-hidden">
                    {/* Circular Progress */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full border-4 border-purple-600/30 relative">
                        <div className="w-20 h-20 rounded-full border-4 border-transparent border-t-purple-400 border-r-purple-400 transform rotate-45 animate-spin" style={{ animationDuration: '3s' }}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-purple-300 text-sm font-bold">3.8%</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Conversion Dots */}
                    <div className="absolute top-2 right-2 w-3 h-3 bg-purple-400 rounded-full animate-ping"></div>
                    <div className="absolute bottom-2 left-2 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                  
                  {/* Success Indicator */}
                  <div className="text-center">
                    <div className="inline-flex items-center bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></span>
                      Converting Well
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Success Message */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-4 border border-green-500/30">
                  <h4 className="text-lg font-bold text-white mb-2">🚀 Your Success Story Starts Here</h4>
                  <p className="text-gray-300 text-sm">Join thousands of entrepreneurs who've transformed their online presence and revenue with our platform</p>
                </div>
              </div>
              
              {/* Enhanced Bottom Decorative Elements */}
              <div className="mt-6 flex justify-center space-x-4">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce shadow-lg"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
            
            {/* Enhanced Floating Elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-green-500/20 rounded-full blur-sm animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-blue-500/20 rounded-full blur-sm animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 -right-8 w-6 h-6 bg-purple-500/20 rounded-full blur-sm animate-pulse" style={{ animationDelay: '2s' }}></div>
            
            {/* Additional Floating Elements */}
            <div className="absolute top-1/4 -right-12 w-4 h-4 bg-emerald-500/20 rounded-full blur-sm animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-1/3 -left-8 w-10 h-10 bg-indigo-500/20 rounded-full blur-sm animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            
            {/* Animated Connection Lines */}
            <div className="absolute top-1/2 left-0 w-16 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent animate-pulse"></div>
            <div className="absolute top-1/2 right-0 w-16 h-px bg-gradient-to-l from-transparent via-blue-500/30 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 relative" style={{ zIndex: 10 }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              Launch pixel-perfect sites
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Build with confidence using our professional templates and powerful tools. 
              Host anywhere, collaborate seamlessly, and scale with ease.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="feature-card text-center p-4 sm:p-6 rounded-xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full mb-3 sm:mb-4">
                  <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section ref={templatesRef} id="templates" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white relative" style={{ zIndex: 10 }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              The best companies build on Website Builder
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Professional templates designed to convert visitors into customers. 
              Choose from our curated collection of industry-specific designs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {templates.map((template, index) => (
              <div key={index} className="template-card bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="h-40 sm:h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center relative">
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <SparklesIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                    </div>
                    <p className="text-xs sm:text-sm text-indigo-600 font-medium">{template.category}</p>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                      ${template.price}
                    </span>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{template.name}</h3>
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-xs sm:text-sm text-gray-600">{template.rating}</span>
                      <span className="ml-1 text-xs sm:text-sm text-gray-500">({template.reviews})</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {template.features.slice(0, 2).map((feature, i) => (
                      <div key={i} className="flex items-center text-xs sm:text-sm text-gray-600">
                        <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xl sm:text-2xl font-bold text-indigo-600">
                      ${template.price}
                    </div>
                    <Link
                      href="/auth/dashboard/marketplace"
                      className="bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-xs sm:text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10 sm:mt-12">
            <Link
              href="/auth/dashboard/marketplace"
              className="inline-flex items-center bg-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-indigo-700 transition-all transform hover:scale-105 hover:shadow-xl"
            >
              View All Templates
              <ChevronRightIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white relative" style={{ zIndex: 10 }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              No hidden fees, no subscriptions, no surprises. 
              Pay once and own your templates forever.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-200">
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Template Marketplace</h3>
                <p className="text-gray-600">One-time purchases, lifetime access</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                  <div className="text-center mb-4 sm:mb-6">
                    <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Basic Templates</h4>
                    <div className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2">From $29</div>
                    <p className="text-sm sm:text-base text-gray-600">Essential website templates for small businesses</p>
                  </div>
                  <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    <li className="flex items-center text-sm sm:text-base text-gray-700">
                      <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                      Responsive design
                    </li>
                    <li className="flex items-center text-sm sm:text-base text-gray-700">
                      <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                      Basic customization
                    </li>
                    <li className="flex items-center text-sm sm:text-base text-gray-700">
                      <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                      SEO optimized
                    </li>
                    <li className="flex items-center text-sm sm:text-base text-gray-700">
                      <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                      Lifetime updates
                    </li>
                  </ul>
                  <Link
                    href="/auth/dashboard/marketplace"
                    className="w-full bg-indigo-600 text-white py-3 px-4 sm:px-6 rounded-lg hover:bg-indigo-700 transition-colors text-center font-semibold block text-sm sm:text-base"
                  >
                    Browse Templates
                  </Link>
                </div>
                
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border-2 border-indigo-600 relative">
                  <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-600 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium">Most Popular</span>
                  </div>
                  <div className="text-center mb-4 sm:mb-6">
                    <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Premium Templates</h4>
                    <div className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2">From $79</div>
                    <p className="text-sm sm:text-base text-gray-600">Advanced templates with premium features</p>
                  </div>
                  <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    <li className="flex items-center text-sm sm:text-base text-gray-700">
                      <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                      Advanced animations
                    </li>
                    <li className="flex items-center text-sm sm:text-base text-gray-700">
                      <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                      E-commerce ready
                    </li>
                    <li className="flex items-center text-sm sm:text-base text-gray-700">
                      <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                      Multiple page layouts
                    </li>
                    <li className="flex items-center text-sm sm:text-base text-gray-700">
                      <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                      Priority support
                    </li>
                  </ul>
                  <Link
                    href="/auth/dashboard/marketplace"
                    className="w-full bg-indigo-600 text-white py-3 px-4 sm:px-6 rounded-lg hover:bg-indigo-700 transition-colors text-center font-semibold block text-sm sm:text-base"
                  >
                    Browse Templates
                  </Link>
                </div>
              </div>
              
              <div className="mt-6 sm:mt-8 text-center">
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  <ShieldCheckIcon className="inline h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2" />
                  30-day money-back guarantee
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  All templates include free updates and technical support
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600 relative" style={{ zIndex: 10 }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="cta-content">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
              Try it for free
            </h2>
            <p className="text-lg sm:text-xl text-indigo-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Join thousands of entrepreneurs, creators, and businesses who have 
              already transformed their online presence with our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link
                href="/auth/signup"
                className="bg-white text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 hover:shadow-xl w-full sm:w-auto"
              >
                Get started
              </Link>
              <Link
                href="/auth/dashboard/marketplace"
                className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-white hover:text-indigo-600 transition-all transform hover:scale-105 w-full sm:w-auto"
              >
                Browse Templates
              </Link>
              <Link
                href="/auth/dashboard/create-template"
                className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-white hover:text-indigo-600 transition-all transform hover:scale-105 w-full sm:w-auto"
              >
                Sell Your Template
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative" style={{ zIndex: 10 }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start mb-4">
                <RocketLaunchIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400" />
                <span className="ml-2 text-lg sm:text-xl font-bold">Website Builder</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400">
                The ultimate platform for building professional websites with premium templates.
              </p>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors text-sm sm:text-base">Features</a></li>
                <li><a href="#templates" className="hover:text-white transition-colors text-sm sm:text-base">Templates</a></li>
                <li><Link href="/auth/dashboard/marketplace" className="hover:text-white transition-colors text-sm sm:text-base">Marketplace</Link></li>
                <li><Link href="/auth/dashboard/create-template" className="hover:text-white transition-colors text-sm sm:text-base">Sell Your Template</Link></li>
              </ul>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/domain-help" className="hover:text-white transition-colors text-sm sm:text-base">Domain Help</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors text-sm sm:text-base">Community</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors text-sm sm:text-base">Terms</Link></li>
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
          </div>
          
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-sm sm:text-base">&copy; 2024 Website Builder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
