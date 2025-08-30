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

export default function LandingPage() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

    // Create floating particles
    const particles = new THREE.Group();
    const particleCount = 100;
    
    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.02, 8, 8);
      const material = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.6, 0.8, 0.6),
        transparent: true,
        opacity: 0.6
      });
      const particle = new THREE.Mesh(geometry, material);
      
      particle.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      
      particles.add(particle);
    }
    
    scene.add(particles);
    camera.position.z = 5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      particles.rotation.x += 0.001;
      particles.rotation.y += 0.002;
      
      particles.children.forEach((particle, i) => {
        particle.position.y += Math.sin(Date.now() * 0.001 + i) * 0.001;
        particle.position.x += Math.cos(Date.now() * 0.001 + i) * 0.001;
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
    // Hero animations
    const heroTl = gsap.timeline();
    heroTl
      .from('.hero-title', { 
        duration: 1, 
        y: 100, 
        opacity: 0, 
        ease: 'power3.out' 
      })
      .from('.hero-subtitle', { 
        duration: 0.8, 
        y: 50, 
        opacity: 0, 
        ease: 'power2.out' 
      }, '-=0.5')
      .from('.hero-buttons', { 
        duration: 0.8, 
        y: 30, 
        opacity: 0, 
        ease: 'power2.out' 
      }, '-=0.3')
      .from('.hero-logos', { 
        duration: 0.8, 
        y: 30, 
        opacity: 0, 
        ease: 'power2.out' 
      }, '-=0.5');

    // Features animations
    gsap.from('.feature-card', {
      duration: 0.8,
      y: 100,
      opacity: 0,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: featuresRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
      }
    });

    // Templates animations
    gsap.from('.template-card', {
      duration: 0.8,
      y: 100,
      opacity: 0,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: templatesRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
      }
    });

    // CTA animations
    gsap.from('.cta-content', {
      duration: 1,
      y: 100,
      opacity: 0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: ctaRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
      }
    });

    // Floating animation for hero elements
    gsap.to('.hero-visual', {
      duration: 3,
      y: -20,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: -1
    });

    // Parallax effect for background elements
    gsap.to('.parallax-bg', {
      yPercent: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

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
      {/* Three.js Background */}
      <div 
        ref={threeContainerRef} 
        className="fixed inset-0 pointer-events-none z-0"
        style={{ zIndex: -1 }}
      />

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <RocketLaunchIcon className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Website Builder</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#templates" className="text-gray-600 hover:text-indigo-600 transition-colors">Templates</a>
              <a href="#pricing" className="text-gray-600 hover:text-indigo-600 transition-colors">Pricing</a>
              <Link href="/auth/dashboard/create-template" className="text-gray-600 hover:text-indigo-600 transition-colors">Sell Your Template</Link>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <Link
                  href="/auth/dashboard"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="text-gray-600 hover:text-indigo-600 px-4 py-2 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105"
                  >
                    Get Started
                  </Link>
                </>
              )}
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-md border-t border-gray-200">
              <a href="#features" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Features</a>
              <a href="#templates" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Templates</a>
              <a href="#pricing" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Pricing</a>
              <Link href="/auth/dashboard/create-template" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Sell Your Template</Link>
              {!session && (
                <>
                  <Link href="/auth/signin" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Sign In</Link>
                  <Link href="/auth/signup" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="hero-title text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-6 leading-tight">
            Turn traffic into
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              {' '}revenue
            </span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Launch pixel-perfect sites that convert visitors into customers. 
            Build with confidence using our professional templates and powerful tools.
          </p>
          <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/auth/signup"
              className="group bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-all transform hover:scale-105 hover:shadow-xl flex items-center justify-center"
            >
              Start building
              <ArrowRightIconSolid className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-indigo-600 hover:text-indigo-600 transition-all transform hover:scale-105 flex items-center justify-center">
              <PlayIconSolid className="mr-2 h-5 w-5" />
              Watch demo
            </button>
          </div>
          
          {/* Client Logos */}
          <div className="hero-logos">
            <p className="text-sm text-gray-500 mb-4">Trusted by leading companies worldwide</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-2xl font-bold text-gray-400">Dell</div>
              <div className="text-2xl font-bold text-gray-400">Zendesk</div>
              <div className="text-2xl font-bold text-gray-400">TED</div>
              <div className="text-2xl font-bold text-gray-400">Discord</div>
              <div className="text-2xl font-bold text-gray-400">Reddit</div>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="hero-visual mt-16 relative">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl">
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="h-32 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="h-32 bg-gradient-to-br from-pink-500 to-red-600 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Launch pixel-perfect sites
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Build with confidence using our professional templates and powerful tools. 
              Host anywhere, collaborate seamlessly, and scale with ease.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="feature-card text-center p-6 rounded-xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section ref={templatesRef} id="templates" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              The best companies build on Website Builder
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional templates designed to convert visitors into customers. 
              Choose from our curated collection of industry-specific designs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template, index) => (
              <div key={index} className="template-card bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center relative">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-indigo-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <SparklesIcon className="h-8 w-8 text-indigo-600" />
                    </div>
                    <p className="text-sm text-indigo-600 font-medium">{template.category}</p>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                      ${template.price}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">{template.rating}</span>
                      <span className="ml-1 text-sm text-gray-500">({template.reviews})</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {template.features.slice(0, 2).map((feature, i) => (
                      <div key={i} className="flex items-center text-sm text-gray-600">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-indigo-600">
                      ${template.price}
                    </div>
                    <Link
                      href="/auth/dashboard/marketplace"
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              href="/auth/dashboard/marketplace"
              className="inline-flex items-center bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-all transform hover:scale-105 hover:shadow-xl"
            >
              View All Templates
              <ChevronRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <div className="cta-content">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Try it for free
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of entrepreneurs, creators, and businesses who have 
              already transformed their online presence with our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 hover:shadow-xl"
              >
                Get started
              </Link>
              <Link
                href="/auth/dashboard/marketplace"
                className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-indigo-600 transition-all transform hover:scale-105"
              >
                Browse Templates
              </Link>
              <Link
                href="/auth/dashboard/create-template"
                className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-indigo-600 transition-all transform hover:scale-105"
              >
                Sell Your Template
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <RocketLaunchIcon className="h-8 w-8 text-indigo-400" />
                <span className="ml-2 text-xl font-bold">Website Builder</span>
              </div>
              <p className="text-gray-400">
                The ultimate platform for building professional websites with premium templates.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#templates" className="hover:text-white transition-colors">Templates</a></li>
                <li><Link href="/auth/dashboard/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link href="/auth/dashboard/create-template" className="hover:text-white transition-colors">Sell Your Template</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/domain-help" className="hover:text-white transition-colors">Domain Help</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link href="/auth/signin" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/auth/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Website Builder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
