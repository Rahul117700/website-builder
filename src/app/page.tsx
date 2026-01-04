'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import * as THREE from 'three';
import {
  RocketLaunchIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  HeartIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  PlayIcon,
  ArrowRightIcon,
  BoltIcon,
  BanknotesIcon,
  StarIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import Header from '@/components/Header';
import Logo from '@/components/Logo';
import ScreenshotShowcase from '@/components/ScreenshotShowcase';
import dynamic from 'next/dynamic';
import { blogPosts } from '@/data/blogs';
import InlineAd from '@/components/ads/InlineAd';

// SaleNotifications removed - flagged as deceptive content by Google Search Console
// const SaleNotifications = dynamic(() => import('@/components/SaleNotifications'), { ssr: false });
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


export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showScreenshotShowcase, setShowScreenshotShowcase] = useState(false);

  // Refs for animations
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const threeContainerRef = useRef<HTMLDivElement>(null);
  const threeSceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    particles: THREE.Group;
  } | null>(null);

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 4;

  // Chart data for earning education
  const revenueGrowthData = [
    { month: "Month 1", revenue: 45, sales: 12 },
    { month: "Month 2", revenue: 62, sales: 18 },
    { month: "Month 3", revenue: 78, sales: 24 },
    { month: "Month 4", revenue: 95, sales: 32 },
    { month: "Month 5", revenue: 115, sales: 41 },
    { month: "Month 6", revenue: 142, sales: 52 }
  ];

  const categoryEarningsData = [
    { category: "Courses", earnings: 185 },
    { category: "Software", earnings: 245 },
    { category: "Code", earnings: 132 },
    { category: "Digital", earnings: 98 }
  ];

  const salesGrowthData = [
    { week: "Week 1", sales: 8, revenue: 32 },
    { week: "Week 2", sales: 15, revenue: 58 },
    { week: "Week 3", sales: 24, revenue: 89 },
    { week: "Week 4", sales: 35, revenue: 142 }
  ];

  const liveTrackingData = [
    { time: "9 AM", sales: 2, revenue: 8 },
    { time: "12 PM", sales: 5, revenue: 18 },
    { time: "3 PM", sales: 8, revenue: 32 },
    { time: "6 PM", sales: 12, revenue: 48 },
    { time: "9 PM", sales: 15, revenue: 62 }
  ];

  // Main Carousel Categories Data
  const mainCarouselSlides = [
    {
      category: "Wellness / Education / Success",
      title: "Transform Lives Through Wellness",
      description: "Share your knowledge in yoga, meditation, fitness, and personal development. Help others achieve their wellness goals while building a sustainable income.",
      highlights: ["Online Courses", "Wellness Programs", "Coaching Services", "Educational Content"],
      image: "https://images.pexels.com/photos/4473608/pexels-photo-4473608.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop",
      gradient: "from-green-500 to-emerald-600",
      icon: "🧘"
    },
    {
      category: "Tech / Business Tools",
      title: "Build Business Solutions",
      description: "Create and sell software, SaaS tools, and business applications. From productivity apps to enterprise solutions, monetize your technical expertise.",
      highlights: ["SaaS Products", "Business Software", "Productivity Tools", "Enterprise Solutions"],
      image: "https://images.pexels.com/photos/2116721/pexels-photo-2116721.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop",
      gradient: "from-blue-500 to-indigo-600",
      icon: "💼"
    },
    {
      category: "Code",
      title: "Share Your Code Expertise",
      description: "Sell code templates, frameworks, libraries, and development resources. Help fellow developers build faster while earning from your creations.",
      highlights: ["Code Templates", "Frameworks", "Libraries", "Dev Tools"],
      image: "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop",
      gradient: "from-purple-500 to-pink-600",
      icon: "💻"
    },
    {
      category: "Photography / Creativity",
      title: "Monetize Your Creative Vision",
      description: "Sell photography, design assets, creative templates, and digital art. Turn your creative passion into a profitable business.",
      highlights: ["Photography", "Design Assets", "Creative Templates", "Digital Art"],
      image: "https://images.pexels.com/photos/1854897/pexels-photo-1854897.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop",
      gradient: "from-orange-500 to-red-600",
      icon: "📸"
    }
  ];

  // Success Stories Carousel state
  const [currentStorySlide, setCurrentStorySlide] = useState(0);

  // Top Channel Carousel state
  const [currentChannelSlide, setCurrentChannelSlide] = useState(0);

  // Top Channel data with images
  const topChannels = [
    {
      name: "Video Course",
      visitors: 3247,
      revenue: 84500,
      imageUrl: "https://images.pexels.com/photos/1854897/pexels-photo-1854897.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      backgroundImage: "https://images.pexels.com/photos/516541/pexels-photo-516541.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop"
    },
    {
      name: "Premium Software",
      visitors: 2890,
      revenue: 124500,
      imageUrl: "https://images.pexels.com/photos/2116721/pexels-photo-2116721.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      backgroundImage: "https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop"
    },
    {
      name: "Code Templates",
      visitors: 2156,
      revenue: 98700,
      imageUrl: "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      backgroundImage: "https://images.pexels.com/photos/1181359/pexels-photo-1181359.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop"
    },
    {
      name: "Online Course",
      visitors: 1823,
      revenue: 76500,
      imageUrl: "https://images.pexels.com/photos/4473608/pexels-photo-4473608.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      backgroundImage: "https://images.pexels.com/photos/317155/pexels-photo-317155.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop"
    }
  ];

  // Success Stories data - only includes testimonials with unique images
  const allStories = [
    {
      name: "Priya Sharma",
      business: "Online Yoga Courses",
      revenue: "₹15 Lakhs",
      timePeriod: "6 months",
      quote: "I started selling my yoga courses as a side hustle. Now it's my full-time business! SellEarnDirect made everything so simple.",
      before: "Part-time instructor",
      after: "Full-time entrepreneur",
      avatar: "🧘‍♀️",
      imageUrl: "https://images.pexels.com/photos/7208625/pexels-photo-7208625.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
      bgGradient: "from-purple-500 to-pink-600",
      backgroundImage: "https://images.pexels.com/photos/4473608/pexels-photo-4473608.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop",
      accentImage: "https://images.pexels.com/photos/317155/pexels-photo-317155.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
    },
    {
      name: "Arjun Kapoor",
      business: "Premium Software Tools",
      revenue: "₹45 Lakhs",
      timePeriod: "12 months",
      quote: "My software development business exploded after I started selling through SellEarnDirect. Best decision I ever made!",
      before: "Freelance developer",
      after: "SaaS founder",
      avatar: "💻",
      imageUrl: "https://images.pexels.com/photos/709188/pexels-photo-709188.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
      bgGradient: "from-blue-500 to-indigo-600",
      backgroundImage: "https://images.pexels.com/photos/2116721/pexels-photo-2116721.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop",
      accentImage: "https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
    },
    {
      name: "Vikram Singh",
      business: "Code Templates & Scripts",
      revenue: "₹32 Lakhs",
      timePeriod: "8 months",
      quote: "My code templates started selling like hotcakes. The automated delivery system is a game-changer!",
      before: "Software engineer",
      after: "Product creator",
      avatar: "⚡",
      imageUrl: "https://images.pexels.com/photos/7581126/pexels-photo-7581126.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
      bgGradient: "from-green-500 to-emerald-600",
      backgroundImage: "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop",
      accentImage: "https://images.pexels.com/photos/1181359/pexels-photo-1181359.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
    },
    {
      name: "Rahul Reddy",
      business: "Online Photography Course",
      revenue: "₹18 Lakhs",
      timePeriod: "7 months",
      quote: "From hobby photographer to profitable course creator. SellEarnDirect gave me the tools to monetize my passion.",
      before: "Photography enthusiast",
      after: "Course instructor",
      avatar: "📸",
      imageUrl: "https://images.pexels.com/photos/2753381/pexels-photo-2753381.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
      bgGradient: "from-indigo-500 to-blue-600",
      backgroundImage: "https://images.pexels.com/photos/1854897/pexels-photo-1854897.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop",
      accentImage: "https://images.pexels.com/photos/516541/pexels-photo-516541.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
    }
  ];

  // Filter to only show stories with images (no duplicates)
  const storiesWithImages = allStories.filter((story) => story.imageUrl);
  const totalStorySlides = storiesWithImages.length;

  // Ensure currentStorySlide stays within bounds
  useEffect(() => {
    if (currentStorySlide >= totalStorySlides) {
      setCurrentStorySlide(0);
    }
  }, [totalStorySlides, currentStorySlide]);


  // Three.js setup
  useEffect(() => {
    if (typeof window === 'undefined' || !threeContainerRef.current) return;

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

  // Auto-carousel effect
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-rotate Success Stories carousel
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const interval = setInterval(() => {
      setCurrentStorySlide((prev) => (prev + 1) % totalStorySlides);
    }, 6000); // Change story every 6 seconds

    return () => clearInterval(interval);
  }, [totalStorySlides]);

  // Auto-rotate Top Channel carousel
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const interval = setInterval(() => {
      setCurrentChannelSlide((prev) => (prev + 1) % topChannels.length);
    }, 5000); // Change channel every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // GSAP Animations
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Fallback: Ensure all content is visible by default
    const ensureVisibility = () => {
      const elements = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-buttons, .hero-logos, .hero-visual, .feature-card, footer');
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

    gsap.set('.feature-card, footer', {
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


    // Footer animations - simple fade in without scroll trigger
    gsap.fromTo('footer',
      { opacity: 0, y: 30 },
      {
        duration: 1,
        y: 0,
        opacity: 1,
        ease: 'power2.out',
        delay: 2.5,
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
      delay: 2.5 // Start after other animations complete
    });

    // Process Steps Sequential Animation - Exciting Journey to Success
    const processSteps = document.querySelectorAll('.process-step');
    const progressLine = document.querySelector('.process-progress-line');
    const progressLineMobile = document.querySelector('.process-progress-line-mobile');
    
    if (processSteps.length > 0) {
      const processTl = gsap.timeline({
        delay: 1.2, // Start after hero animations
        onComplete: () => {
          // Add continuous pulse to success step
          gsap.to('.process-step-success .process-step-icon', {
            scale: 1.05,
            duration: 1.5,
            ease: 'power2.inOut',
            yoyo: true,
            repeat: -1
          });
        }
      });

      // Animate each step sequentially
      processSteps.forEach((step, index) => {
        const isLast = index === processSteps.length - 1;
        const stepIcon = step.querySelector('.process-step-icon');
        const stepBadge = step.querySelector('.process-step-badge');
        const stepText = step.querySelector('.process-step-text');
        
        // Step entrance animation - different for mobile vs desktop
        const isMobile = window.innerWidth < 640;
        processTl
          .to(step, {
            opacity: 1,
            y: isMobile ? 0 : 0,
            x: isMobile ? 0 : 0,
            duration: 0.6,
            ease: 'back.out(1.7)'
          }, index * 0.4)
          // Icon bounce in
          .fromTo(stepIcon, 
            { scale: 0, rotation: -180 },
            { 
              scale: 1, 
              rotation: 0,
              duration: 0.5,
              ease: 'back.out(2)'
            },
            index * 0.4 + 0.1
          )
          // Badge pop in
          .to(stepBadge, {
            scale: 1,
            duration: 0.3,
            ease: 'back.out(2.5)'
          }, index * 0.4 + 0.3)
          // Text fade in
          .fromTo(stepText,
            { opacity: 0, y: 10 },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: 'power2.out'
            },
            index * 0.4 + 0.2
          );

        // Special success animation for last step
        if (isLast) {
          processTl
            // Success icon celebration
            .to(stepIcon, {
              scale: 1.2,
              rotation: 360,
              duration: 0.8,
              ease: 'power2.out'
            }, '+=0.2')
            .to(stepIcon, {
              scale: 1,
              rotation: 0,
              duration: 0.4,
              ease: 'power2.inOut'
            })
            // Sparkles appear
            .to('.success-sparkle-1', {
              opacity: 1,
              scale: 1.5,
              rotation: 360,
              duration: 0.5,
              ease: 'power2.out'
            }, '-=0.2')
            .to('.success-sparkle-2', {
              opacity: 1,
              scale: 1.5,
              rotation: -360,
              duration: 0.5,
              ease: 'power2.out'
            }, '-=0.4')
            .to('.success-sparkle-3', {
              opacity: 1,
              scale: 1.5,
              rotation: 360,
              duration: 0.5,
              ease: 'power2.out'
            }, '-=0.3')
            // Sparkles pulse
            .to('.success-sparkle-1, .success-sparkle-2, .success-sparkle-3', {
              scale: 1.2,
              duration: 0.6,
              ease: 'power2.inOut',
              yoyo: true,
              repeat: 3
            }, '-=0.2');
        }

        // Update progress line
        const progressPercent = ((index + 1) / processSteps.length) * 100;
        if (window.innerWidth >= 640) {
          // Desktop horizontal line
          processTl.to(progressLine, {
            width: `${progressPercent}%`,
            duration: 0.5,
            ease: 'power2.out'
          }, index * 0.4 + 0.2);
        } else {
          // Mobile vertical line
          processTl.to(progressLineMobile, {
            height: `${progressPercent}%`,
            duration: 0.5,
            ease: 'power2.out'
          }, index * 0.4 + 0.2);
        }
      });
    }

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
      title: 'Channel Builder',
      description: 'Create high-converting channels with our easy-to-use builder. No coding required.'
    },
    {
      icon: ShoppingBagIcon,
      title: 'Sell Digital Products',
      description: 'Upload and sell software, courses, videos, ebooks, code, and more with secure delivery.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Payment Integration',
      description: 'Accept payments with Razorpay integration. Get paid directly to your account.'
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics & Insights',
      description: 'Track visitor behavior, conversions, revenue, and optimize your channels for better results.'
    }
  ];


  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Sale Notifications removed - flagged as deceptive content by Google */}
      
      {/* Custom CSS for Marquee Animations and Carousel */}
      <style dangerouslySetInnerHTML={{
        __html: `
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

        .carousel-slide {
          opacity: 0;
          transform: translateX(100%);
          transition: opacity 0.6s ease-in-out, transform 0.6s ease-in-out;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .carousel-slide-active {
          opacity: 1;
          transform: translateX(0);
          position: absolute;
          z-index: 2;
        }

        .carousel-slide-prev {
          opacity: 0;
          transform: translateX(-100%);
          z-index: 1;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .carousel-slide-enter {
          animation: slideIn 0.6s ease-in-out forwards;
        }

        /* Company Logo Marquee Animation */
        .logo-marquee {
          display: flex;
          animation: scroll 30s linear infinite;
          gap: 2rem;
        }

        .logo-marquee:hover {
          animation-play-state: paused;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .company-logo {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.875rem;
          color: #64748b;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .company-logo::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
          transition: left 0.5s;
        }

        .company-logo:hover {
          transform: translateY(-2px) scale(1.02);
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
          border-color: #3b82f6;
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }

        .company-logo:hover::before {
          left: 100%;
        }

        .logo-container {
          position: relative;
          overflow: hidden;
          background: linear-gradient(90deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%);
          border-radius: 1rem;
          padding: 1rem 0;
        }

        .logo-container::before,
        .logo-container::after {
          content: '';
          position: absolute;
          top: 0;
          width: 4rem;
          height: 100%;
          z-index: 2;
          pointer-events: none;
        }

        .logo-container::before {
          left: 0;
          background: linear-gradient(to right, #ffffff, transparent);
        }

        .logo-container::after {
          right: 0;
          background: linear-gradient(to left, #ffffff, transparent);
        }

        /* Direct Payment Hero Section */
        .payment-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%);
          position: relative;
          overflow: hidden;
        }

        .payment-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
          animation: backgroundShift 10s ease-in-out infinite;
        }

        @keyframes backgroundShift {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .payment-badge {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .money-icon {
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }

        .payment-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .payment-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.6s;
        }

        .payment-card:hover {
          transform: translateY(-8px) scale(1.02);
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .payment-card:hover::before {
          left: 100%;
        }

        .payment-icon {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          animation: iconFloat 3s ease-in-out infinite;
        }

        @keyframes iconFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(10deg); }
        }

        .process-step {
          position: relative;
          transition: all 0.3s ease;
        }

        .process-step:hover {
          transform: translateX(10px);
        }

        .process-number {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          animation: numberGlow 2s ease-in-out infinite;
        }

        @keyframes numberGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }
          50% { box-shadow: 0 0 30px rgba(245, 158, 11, 0.6); }
        }

        .cta-button {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s;
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(16, 185, 129, 0.4);
        }

        .cta-button:hover::before {
          left: 100%;
        }

        .floating-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }

        .particle:nth-child(1) {
          width: 4px;
          height: 4px;
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }

        .particle:nth-child(2) {
          width: 6px;
          height: 6px;
          top: 60%;
          left: 80%;
          animation-delay: 2s;
        }

        .particle:nth-child(3) {
          width: 3px;
          height: 3px;
          top: 80%;
          left: 30%;
          animation-delay: 4s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
        }

        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(200%) translateY(200%) rotate(45deg); }
        }

        .animate-shine {
          animation: shine 1.5s ease-in-out;
        }

        /* Process Steps Animation Styles */
        .process-step {
          opacity: 0;
          transform: translateY(20px);
        }

        .process-step-icon {
          transform: scale(0);
        }

        .process-step-badge {
          transform: scale(0);
        }

        .process-step-text {
          opacity: 0;
          transform: translateY(10px);
        }

        .process-progress-line {
          transition: width 0.5s ease-out;
        }

        .process-progress-line-mobile {
          transition: height 0.5s ease-out;
        }

        @keyframes successPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .process-step-success .process-step-icon {
          animation: successPulse 2s ease-in-out infinite;
        }

        /* Mobile Optimizations */
        @media (max-width: 768px) {
          .payment-hero {
            padding: 3rem 1rem;
          }

          .payment-badge {
            padding: 0.75rem 1rem;
            font-size: 0.75rem;
            margin-bottom: 1.5rem;
          }

          .money-icon {
            width: 4rem;
            height: 4rem;
            margin-right: 0;
            margin-bottom: 1rem;
          }

          .money-icon svg {
            width: 2rem;
            height: 2rem;
          }

          .payment-hero h2 {
            font-size: 2rem;
            line-height: 1.2;
            margin-bottom: 1rem;
          }

          .payment-hero .subtitle {
            font-size: 1rem;
            margin-bottom: 2rem;
          }

          .payment-card {
            padding: 1.5rem;
            margin-bottom: 1rem;
          }

          .payment-icon {
            width: 3rem;
            height: 3rem;
            margin-bottom: 1rem;
          }

          .payment-icon svg {
            width: 1.5rem;
            height: 1.5rem;
          }

          .payment-card h3 {
            font-size: 1.25rem;
            margin-bottom: 0.75rem;
          }

          .payment-card p {
            font-size: 0.875rem;
            line-height: 1.4;
          }

          .process-step {
            margin-bottom: 1.5rem;
          }

          .process-number {
            width: 3rem;
            height: 3rem;
            font-size: 1rem;
            margin-bottom: 0.75rem;
          }

          .process-step h4 {
            font-size: 1rem;
            margin-bottom: 0.5rem;
          }

          .process-step p {
            font-size: 0.75rem;
          }

          .cta-button {
            padding: 1rem 2rem;
            font-size: 1rem;
            width: 100%;
            max-width: 300px;
          }

          .floating-particles {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .payment-hero {
            padding: 2rem 0.75rem;
          }

          .payment-badge {
            padding: 0.5rem 0.75rem;
            font-size: 0.6875rem;
            text-align: center;
            line-height: 1.3;
          }

          .payment-hero h2 {
            font-size: 1.75rem;
            text-align: center;
          }

          .payment-hero .subtitle {
            font-size: 0.875rem;
            text-align: center;
          }

          .payment-card {
            padding: 1rem;
          }

          .payment-card h3 {
            font-size: 1.125rem;
          }

          .payment-card p {
            font-size: 0.8125rem;
          }

          .process-number {
            width: 2.5rem;
            height: 2.5rem;
            font-size: 0.875rem;
          }

          .process-step h4 {
            font-size: 0.875rem;
          }

          .process-step p {
            font-size: 0.6875rem;
          }

          .cta-button {
            padding: 0.875rem 1.5rem;
            font-size: 0.875rem;
          }
        }
      `}}></style>

      {/* Three.js Background */}
      <div
        ref={threeContainerRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Navigation */}
      <Header />

      {/* Hero Section - Sleek Premium Design */}
      <section ref={heroRef} className="relative pt-16 pb-6 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="w-full text-center relative z-10">
          <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-2 leading-tight" style={{ opacity: 1, transform: 'translateY(0)' }} data-tour="hero-title">
            Convert Your Traffic Into
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              {' '}Revenue
            </span>
          </h1>
          <div className="hero-subtitle text-base sm:text-lg md:text-xl text-gray-600 mb-4 leading-relaxed px-4 sm:px-8 lg:px-16" style={{ opacity: 1, transform: 'translateY(0)' }} data-tour="hero-subtitle">
            Create channels that turn your website visitors into paying customers. A channel is your branded space to share content and build your audience - no technical skills needed!
          </div>

          {/* Process Flowchart - Mobile Optimized with Animations */}
          <div className="max-w-6xl mx-auto mb-6 px-4">
            {/* Subtitle */}
            <p className="text-center text-xs sm:text-sm font-medium text-gray-500 mb-4 sm:mb-5 tracking-wide uppercase">How It Works</p>

            <div className="relative">
              {/* Connection Line - Horizontal for desktop, vertical for mobile */}
              <div className="hidden sm:block absolute top-7 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent" style={{ zIndex: 0 }}>
                {/* Animated progress line */}
                <div className="process-progress-line absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full" style={{ width: '0%' }}></div>
              </div>
              
              {/* Vertical connection line for mobile */}
              <div className="sm:hidden absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-gray-200 to-transparent" style={{ zIndex: 0 }}>
                {/* Animated progress line for mobile */}
                <div className="process-progress-line-mobile absolute top-0 left-0 w-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full" style={{ height: '0%' }}></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-4 relative" style={{ zIndex: 1 }}>
                {/* Step 1 - Create */}
                <div className="process-step flex flex-row sm:flex-col items-start sm:items-center group opacity-0">
                  <div className="relative mb-0 sm:mb-4 mr-4 sm:mr-0 flex-shrink-0">
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Main card - Sleek compact size */}
                    <div className="process-step-icon relative w-14 h-14 sm:w-14 sm:h-14 rounded-xl bg-white border-2 border-gray-200 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-md group-hover:border-indigo-500 transition-all duration-300">
                      <RocketLaunchIcon className="w-7 h-7 sm:w-6 sm:h-6 text-gray-700 group-hover:text-indigo-600 transition-colors" />
                    </div>

                    {/* Step number badge */}
                    <div className="process-step-badge absolute -top-1.5 -right-1.5 w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px] sm:text-[10px] font-bold flex items-center justify-center shadow-sm scale-0">
                      1
                    </div>
                  </div>

                  <div className="process-step-text text-left sm:text-center space-y-0.5 pt-0.5">
                    <h4 className="font-semibold text-sm sm:text-xs text-gray-900">Create Channel</h4>
                    <p className="text-xs sm:text-[10px] text-gray-500">Sign up & start building</p>
                  </div>
                </div>

                {/* Step 2 - Add Product */}
                <div className="process-step flex flex-row sm:flex-col items-start sm:items-center group opacity-0">
                  <div className="relative mb-0 sm:mb-4 mr-4 sm:mr-0 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="process-step-icon relative w-14 h-14 sm:w-14 sm:h-14 rounded-xl bg-white border-2 border-gray-200 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-md group-hover:border-blue-500 transition-all duration-300">
                      <ShoppingBagIcon className="w-7 h-7 sm:w-6 sm:h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
                    </div>

                    <div className="process-step-badge absolute -top-1.5 -right-1.5 w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm scale-0">
                      2
                    </div>
                  </div>

                  <div className="process-step-text text-left sm:text-center space-y-0.5 pt-0.5">
                    <h4 className="font-semibold text-sm sm:text-xs text-gray-900">Add Product</h4>
                    <p className="text-xs sm:text-[10px] text-gray-500">Upload your digital file</p>
                  </div>
                </div>

                {/* Step 3 - Customize */}
                <div className="process-step flex flex-row sm:flex-col items-start sm:items-center group opacity-0">
                  <div className="relative mb-0 sm:mb-4 mr-4 sm:mr-0 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="process-step-icon relative w-14 h-14 sm:w-14 sm:h-14 rounded-xl bg-white border-2 border-gray-200 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-md group-hover:border-emerald-500 transition-all duration-300">
                      <Cog6ToothIcon className="w-7 h-7 sm:w-6 sm:h-6 text-gray-700 group-hover:text-emerald-600 transition-colors" />
                    </div>

                    <div className="process-step-badge absolute -top-1.5 -right-1.5 w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm scale-0">
                      3
                    </div>
                  </div>

                  <div className="process-step-text text-left sm:text-center space-y-0.5 pt-0.5">
                    <h4 className="font-semibold text-sm sm:text-xs text-gray-900">Customize</h4>
                    <p className="text-xs sm:text-[10px] text-gray-500">Design your page</p>
                  </div>
                </div>

                {/* Step 4 - Publish */}
                <div className="process-step flex flex-row sm:flex-col items-start sm:items-center group opacity-0">
                  <div className="relative mb-0 sm:mb-4 mr-4 sm:mr-0 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="process-step-icon relative w-14 h-14 sm:w-14 sm:h-14 rounded-xl bg-white border-2 border-gray-200 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-md group-hover:border-orange-500 transition-all duration-300">
                      <GlobeAltIcon className="w-7 h-7 sm:w-6 sm:h-6 text-gray-700 group-hover:text-orange-600 transition-colors" />
                    </div>

                    <div className="process-step-badge absolute -top-1.5 -right-1.5 w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm scale-0">
                      4
                    </div>
                  </div>

                  <div className="process-step-text text-left sm:text-center space-y-0.5 pt-0.5">
                    <h4 className="font-semibold text-sm sm:text-xs text-gray-900">Publish</h4>
                    <p className="text-xs sm:text-[10px] text-gray-500">Go live instantly</p>
                  </div>
                </div>

                {/* Step 5 - Earn - Success Step */}
                <div className="process-step process-step-success flex flex-row sm:flex-col items-start sm:items-center group opacity-0">
                  <div className="relative mb-0 sm:mb-4 mr-4 sm:mr-0 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/30 to-amber-500/30 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="process-step-icon relative w-14 h-14 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-md group-hover:border-yellow-400 transition-all duration-300">
                      <CurrencyDollarIcon className="w-7 h-7 sm:w-6 sm:h-6 text-yellow-600 group-hover:text-yellow-700 transition-colors" />
                    </div>

                    <div className="process-step-badge absolute -top-1.5 -right-1.5 w-6 h-6 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-sm scale-0">
                      ✓
                    </div>

                    {/* Sparkle effects - hidden on mobile */}
                    <div className="success-sparkle-1 hidden sm:block absolute -top-1 -left-1 text-lg opacity-0">✨</div>
                    <div className="success-sparkle-2 hidden sm:block absolute -top-1 -right-1 text-lg opacity-0">⭐</div>
                    <div className="success-sparkle-3 hidden sm:block absolute -bottom-1 left-1 text-lg opacity-0">💫</div>
                  </div>

                  <div className="process-step-text text-left sm:text-center space-y-0.5 pt-0.5">
                    <h4 className="font-bold text-sm sm:text-xs bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">Get Sales</h4>
                    <p className="text-xs sm:text-[10px] text-gray-500 font-medium">Start earning!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-buttons flex flex-col sm:flex-row gap-2 justify-center mb-4" style={{ opacity: 1, transform: 'translateY(0)' }}>
            <Link
              href={session ? "/auth/dashboard" : "/auth/signin"}
              data-tour="create-channel"
              className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-lg text-sm sm:text-base font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center shadow-md hover:shadow-lg"
            >
              Start Selling Now
              <ArrowRightIconSolid className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => setShowScreenshotShowcase(true)}
              className="group border-2 border-indigo-600 text-indigo-600 px-5 py-2 rounded-lg text-sm sm:text-base font-semibold hover:bg-indigo-50 transition-all flex items-center justify-center shadow-sm hover:shadow-md"
            >
              <PlayIcon className="mr-2 h-4 w-4" />
              See How It Works
            </button>
          </div>
        </div>

        {/* Hero Visual - Auto Carousel */}
        <div className="hero-visual mt-6 sm:mt-8 relative" style={{ opacity: 1, transform: 'translateY(0)' }} data-tour="hero-visual">
          <div className="w-full relative px-4 sm:px-8 lg:px-16">
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

            {/* Carousel Container - 50/50 Split Design - Sleek Premium Height */}
            <div className="relative min-h-[320px] sm:min-h-[380px] overflow-hidden bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200">
              {/* Carousel Slides */}
              {mainCarouselSlides.map((slide, index) => {
                // Get chart data based on slide index
                let chartData, chartType;
                if (index === 0) {
                  chartData = revenueGrowthData;
                  chartType = 'revenue';
                } else if (index === 1) {
                  chartData = categoryEarningsData;
                  chartType = 'category';
                } else if (index === 2) {
                  chartData = salesGrowthData;
                  chartType = 'sales';
                } else {
                  chartData = liveTrackingData;
                  chartType = 'live';
                }

                return (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${currentSlide === index
                      ? 'opacity-100 translate-x-0 z-10'
                      : 'opacity-0 translate-x-full z-0'
                      }`}
                  >
                    <div className="h-full flex flex-col lg:flex-row">
                      {/* Image Section - 50% - Only render if image exists */}
                      {slide.image && (
                        <div className="w-full lg:w-1/2 h-40 sm:h-56 lg:h-full relative overflow-hidden">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                            loading={index === 0 ? "eager" : "lazy"}
                            style={{ display: 'block' }}
                          />
                          {/* Gradient Overlay */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-20`}></div>
                          {/* Category Badge */}
                          <div className="absolute top-4 left-4">
                            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
                              <span className="text-sm font-semibold text-gray-900">{slide.category}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Chart Section - 50% (or full width if no image) - Premium White Design */}
                      <div className={`w-full ${slide.image ? 'lg:w-1/2' : ''} flex flex-col justify-start p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white`}>
                        <div className="flex flex-col">
                          {/* Title */}
                          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                            {slide.title}
                          </h3>

                          {/* Description */}
                          <p className="text-sm sm:text-base text-gray-600 mb-3 leading-relaxed">
                            {slide.description}
                          </p>

                          {/* Chart Container */}
                          <div className="mb-4">
                            {chartData && chartType === 'revenue' && (
                              <>
                                <div className="mb-2">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${slide.gradient}`}></div>
                                      <span className="text-xs font-semibold text-gray-700">Revenue Growth (₹K)</span>
                                    </div>
                                    <div className="text-xs text-gray-500">Live Tracking</div>
                                  </div>
                                  <div className="h-[140px] sm:h-[160px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                        <defs>
                                          <linearGradient id={`colorRevenue${index}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                          </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="month" stroke="#6b7280" fontSize={11} />
                                        <YAxis stroke="#6b7280" fontSize={11} />
                                        <Tooltip
                                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                          formatter={(value: any) => [`₹${value}K`, 'Revenue']}
                                        />
                                        <Area
                                          type="monotone"
                                          dataKey="revenue"
                                          stroke="#10b981"
                                          strokeWidth={2}
                                          fillOpacity={1}
                                          fill={`url(#colorRevenue${index})`}
                                        />
                                      </AreaChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-600 text-center">
                                  <span className="font-semibold text-green-600">+215%</span> growth in 6 months
                                </div>
                              </>
                            )}

                            {chartData && chartType === 'category' && (
                              <>
                                <div className="mb-2">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${slide.gradient}`}></div>
                                      <span className="text-xs font-semibold text-gray-700">Earnings by Category (₹K)</span>
                                    </div>
                                  </div>
                                  <div className="h-[140px] sm:h-[160px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis type="number" stroke="#6b7280" fontSize={11} />
                                        <YAxis dataKey="category" type="category" stroke="#6b7280" fontSize={11} width={65} />
                                        <Tooltip
                                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                          formatter={(value: any) => [`₹${value}K`, 'Earnings']}
                                        />
                                        <Bar dataKey="earnings" radius={[0, 8, 8, 0]}>
                                          {chartData.map((entry, idx) => (
                                            <Cell key={`cell-${idx}`} fill={['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'][idx]} />
                                          ))}
                                        </Bar>
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-600 text-center">
                                  <span className="font-semibold text-blue-600">Software/SaaS</span> leads with highest earnings
                                </div>
                              </>
                            )}

                            {chartData && chartType === 'sales' && (
                              <>
                                <div className="mb-2">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${slide.gradient}`}></div>
                                      <span className="text-xs font-semibold text-gray-700">Sales & Revenue Growth</span>
                                    </div>
                                  </div>
                                  <div className="h-[140px] sm:h-[160px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 35 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="week" stroke="#6b7280" fontSize={11} />
                                        <YAxis stroke="#6b7280" fontSize={11} />
                                        <Tooltip
                                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                          formatter={(value: any, name: string) => [
                                            name === 'sales' ? `${value} sales` : `₹${value}K`,
                                            name === 'sales' ? 'Sales' : 'Revenue'
                                          ]}
                                        />
                                        <Legend
                                          verticalAlign="bottom"
                                          height={30}
                                          wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                                          iconType="line"
                                          iconSize={10}
                                        />
                                        <Line
                                          type="monotone"
                                          dataKey="sales"
                                          stroke="#8b5cf6"
                                          strokeWidth={2}
                                          dot={{ fill: '#8b5cf6', r: 4 }}
                                          name="Sales"
                                        />
                                        <Line
                                          type="monotone"
                                          dataKey="revenue"
                                          stroke="#ec4899"
                                          strokeWidth={2}
                                          dot={{ fill: '#ec4899', r: 4 }}
                                          name="Revenue (₹K)"
                                        />
                                      </LineChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-600 text-center">
                                  <span className="font-semibold text-purple-600">4x increase</span> in just one month
                                </div>
                              </>
                            )}

                            {chartData && chartType === 'live' && (
                              <>
                                <div className="mb-2">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                      <span className="text-xs font-semibold text-gray-700">Live Sales Tracking</span>
                                    </div>
                                    <div className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold border border-green-200">LIVE</div>
                                  </div>
                                  <div className="h-[140px] sm:h-[160px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 35 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="time" stroke="#6b7280" fontSize={11} />
                                        <YAxis stroke="#6b7280" fontSize={11} />
                                        <Tooltip
                                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                          formatter={(value: any, name: string) => [
                                            name === 'sales' ? `${value} sales` : `₹${value}K`,
                                            name === 'sales' ? 'Sales' : 'Revenue'
                                          ]}
                                        />
                                        <Legend
                                          verticalAlign="bottom"
                                          height={30}
                                          wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                                          iconSize={10}
                                        />
                                        <Bar dataKey="sales" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Sales" />
                                        <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} name="Revenue (₹K)" />
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-600 text-center">
                                  <span className="font-semibold text-green-600">Real-time</span> tracking of your earnings
                                </div>
                              </>
                            )}
                          </div>

                          {/* Educational Info */}
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {slide.highlights.map((highlight, idx) => (
                              <div
                                key={idx}
                                className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm"
                              >
                                <div className="flex items-center space-x-2">
                                  <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${slide.gradient} flex-shrink-0`}></div>
                                  <span className="text-xs font-medium text-gray-700 truncate">{highlight}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* CTA Button */}
                          <Link
                            href={session ? "/auth/dashboard" : "/auth/signin"}
                            className={`mt-3 inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r ${slide.gradient} hover:opacity-90 transition-all shadow-md hover:shadow-lg text-sm`}
                          >
                            Start Earning Now
                            <ArrowRightIconSolid className="ml-2 h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Carousel Indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {mainCarouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index
                    ? 'bg-indigo-500 w-8'
                    : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
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

      {/* Premium Direct Payment Feature Section - Complete Redesign */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden" style={{ zIndex: 10 }}>
        {/* Subtle background pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Top Banner - Modern Design */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-lg">
              <BoltIcon className="h-5 w-5 text-white" />
              <span className="text-white font-bold text-sm sm:text-base">
                <span className="hidden sm:inline">100% DIRECT PAYMENTS - ZERO MIDDLEMAN FEES</span>
                <span className="sm:hidden">DIRECT PAYMENTS</span>
              </span>
            </div>
          </div>

          {/* Main Heading - Modern Typography */}
          <div className="text-center mb-10">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-3 leading-[1.1] tracking-tight">
              Accept Payments
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">
                Directly
              </span>
            </h2>
            <div className="inline-block mt-2 px-4 py-1.5 bg-orange-100 rounded-lg">
              <p className="text-orange-700 font-bold text-lg sm:text-xl">No Middleman Fees</p>
            </div>
          </div>

          {/* Description Card - Clean Design */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-gray-100 shadow-sm">
              <p className="text-center text-base sm:text-lg text-gray-700 leading-relaxed">
                Get paid directly to your bank account. <span className="font-bold text-gray-900">No platform fees, no hidden charges.</span> Keep 100% of your revenue minus standard payment processing fees.
              </p>
            </div>
          </div>

          {/* Payment Methods - Modern Card Design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: "Credit/Debit Cards",
                description: "Accept Visa, Mastercard, Amex, and more. Secure payment processing with industry-standard encryption.",
                icon: "💳",
                bgColor: "bg-blue-50",
                borderColor: "border-blue-200",
                hoverColor: "hover:border-blue-400"
              },
              {
                title: "UPI Payments",
                description: "Instant UPI payments via PhonePe, Google Pay, Paytm, and all UPI apps. Real-time transaction processing.",
                icon: "📱",
                bgColor: "bg-green-50",
                borderColor: "border-green-200",
                hoverColor: "hover:border-green-400"
              },
              {
                title: "Bank Transfers",
                description: "Direct bank transfers to ANY INDIAN BANK ACCOUNT. Lower fees, faster processing, simplified reconciliation.",
                icon: "🏦",
                bgColor: "bg-purple-50",
                borderColor: "border-purple-200",
                hoverColor: "hover:border-purple-400"
              }
            ].map((method, index) => (
              <div
                key={index}
                className={`group relative ${method.bgColor} rounded-2xl p-6 border-2 ${method.borderColor} ${method.hoverColor} transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
              >
                {/* Icon Container */}
                <div className="mb-5">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl text-5xl bg-white border-2 ${method.borderColor} shadow-md transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    {method.icon}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {method.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {method.description}
                </p>
              </div>
            ))}
          </div>

          {/* 3 Steps Process - Modern Design */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 mb-10 border-2 border-gray-100 shadow-lg">
            <div className="text-center mb-10">
              <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
                Start Earning in
              </h3>
              <div className="inline-block px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full">
                <p className="text-white font-bold text-2xl">3 Simple Steps</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connection Line */}
              <div className="hidden md:block absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-orange-200 via-amber-200 to-orange-200 rounded-full" style={{ zIndex: 0 }}></div>

              {[
                {
                  number: "1",
                  title: "Create Your Channel",
                  description: "Build your branded channel with our easy-to-use builder",
                  icon: RocketLaunchIcon,
                  iconColor: "bg-indigo-600"
                },
                {
                  number: "2",
                  title: "Add Payment Method",
                  description: "Connect your bank account for payment payouts",
                  icon: CurrencyDollarIcon,
                  iconColor: "bg-blue-600"
                },
                {
                  number: "3",
                  title: "Start Earning",
                  description: "Receive payments directly - no platform fees",
                  icon: BanknotesIcon,
                  iconColor: "bg-green-600"
                }
              ].map((step, index) => (
                <div 
                  key={index} 
                  className="group text-center relative z-10"
                >
                  {/* Step Number Circle */}
                  <div className="relative inline-block mb-6">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-all duration-300">
                      <span className="text-5xl font-black text-white">{step.number}</span>
                    </div>
                    {/* Icon Badge */}
                    <div className={`absolute -bottom-2 -right-2 w-14 h-14 ${step.iconColor} rounded-full flex items-center justify-center border-4 border-white shadow-lg`}>
                      <step.icon className="h-7 w-7 text-white" />
                    </div>
                  </div>

                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section - Modern Design */}
          <div className="text-center">
            <Link
              href={session ? "/auth/dashboard" : "/auth/signin"}
              className="group inline-flex items-center justify-center px-10 py-4 rounded-2xl font-black text-lg sm:text-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg"
            >
              <span className="hidden sm:inline">Start Earning Directly Now</span>
              <span className="sm:hidden">Start Earning Now</span>
              <ArrowRightIconSolid className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Link>
            
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
              <span className="text-2xl">✨</span>
              <p className="text-gray-700 text-sm font-medium">
                No credit card required • Free to start • Keep 100% of your revenue
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section - Premium White Design */}
      <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden" style={{ zIndex: 10 }}>
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-20 w-96 h-96 bg-indigo-200/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-purple-200/15 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* Left Column - Text Content - Modern Design */}
            <div className="text-center lg:text-left relative">
              {/* Content Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6 border-2 border-gray-200 shadow-sm">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
                  Real People,
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                    Real Success
                  </span>
                </h2>
                <p className="text-base sm:text-lg text-gray-600 mb-3 leading-relaxed">
                  Join thousands of digital entrepreneurs who've transformed their ideas into thriving online businesses with our platform.
                </p>
                <p className="text-sm text-gray-500">
                  From software creators to course instructors, discover how our customers are building sustainable revenue streams and growing their digital empires.
                </p>
              </div>

              {/* Stats - Modern Design */}
              <div className="flex items-center justify-center lg:justify-start gap-4">
                {[
                  { value: '₹2.5Cr+', label: 'Total Revenue', color: 'indigo' },
                  { value: '10K+', label: 'Active Sellers', color: 'purple' },
                  { value: '4.9/5', label: 'Avg Rating', color: 'pink' }
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="group relative bg-white rounded-xl p-4 border-2 border-gray-200 transition-all duration-300 hover:border-indigo-300 hover:shadow-lg hover:scale-105 min-w-[100px]"
                  >
                    <div className={`text-xl sm:text-2xl font-black bg-gradient-to-r ${
                      stat.color === 'indigo' ? 'from-indigo-600 to-indigo-700' : 
                      stat.color === 'purple' ? 'from-purple-600 to-purple-700' : 
                      'from-pink-600 to-pink-700'
                    } bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                    <div className="text-gray-600 mt-1 text-xs font-semibold">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Carousel - Complete Redesign */}
            <div className="relative">
              <div className="bg-white rounded-3xl overflow-hidden border-2 border-gray-200 shadow-xl">
                {/* Carousel Container - Modern Height */}
                <div className="carousel-container relative h-[600px] sm:h-[580px]">
                  {/* Success Story Slides */}
                  <div className="carousel-wrapper">
                    {storiesWithImages.map((story, index) => (
                      <div
                        key={index}
                        className={`success-story-slide absolute inset-0 transition-all duration-700 ease-in-out ${currentStorySlide === index ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                          }`}
                      >
                        {/* Card Container */}
                        <div className="h-full flex flex-col bg-white">
                          {/* Header Section with Background Image */}
                          <div className="relative h-48 sm:h-56 overflow-hidden">
                            {story.backgroundImage ? (
                              <>
                                <img
                                  src={story.backgroundImage}
                                  alt={story.name}
                                  className="w-full h-full object-cover"
                                  loading="eager"
                                  style={{ display: 'block' }}
                                />
                                {/* Dark Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
                                
                                {/* Profile Section Overlay */}
                                <div className="absolute bottom-4 left-4 right-4 z-10">
                                  <div className="flex items-center gap-3">
                                    {/* Profile Picture */}
                                    {story.imageUrl ? (
                                      <div className="relative">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-white shadow-xl">
                                          <img
                                            src={story.imageUrl}
                                            alt={story.name}
                                            className="w-full h-full object-cover"
                                            loading="eager"
                                            style={{ display: 'block' }}
                                            onError={(e) => {
                                              e.currentTarget.style.display = 'none';
                                              const fallback = e.currentTarget.parentElement;
                                              if (fallback) {
                                                fallback.innerHTML = `<div class="text-2xl flex items-center justify-center h-full bg-gradient-to-br from-purple-500 to-pink-500 text-white">${story.avatar}</div>`;
                                              }
                                            }}
                                          />
                                        </div>
                                        {/* Verified Badge */}
                                        <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full p-1 border-2 border-white">
                                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-4 border-white shadow-xl">
                                        <span className="text-2xl">{story.avatar}</span>
                                      </div>
                                    )}
                                    
                                    {/* Name & Business */}
                                    <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg flex-1">
                                      <h3 className="text-lg sm:text-xl font-black text-gray-900 leading-tight">{story.name}</h3>
                                      <p className="text-xs sm:text-sm text-gray-600 font-semibold mt-0.5">{story.business}</p>
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br ${story.bgGradient} flex items-center justify-center relative`}>
                                <div className="absolute inset-0 bg-black/30"></div>
                                <div className="relative z-10 text-center">
                                  {story.imageUrl ? (
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mx-auto mb-3">
                                      <img src={story.imageUrl} alt={story.name} className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className="text-5xl mb-3">{story.avatar}</div>
                                  )}
                                  <h3 className="text-2xl font-black text-white">{story.name}</h3>
                                  <p className="text-white/90 font-semibold">{story.business}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Content Section */}
                          <div className="flex-1 p-5 sm:p-6 flex flex-col bg-white">
                            {/* Stats Cards - Modern Design */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="bg-gray-50 rounded-xl p-4 text-center border-2 border-gray-200">
                                <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">{story.revenue}</div>
                                <div className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Total Revenue</div>
                              </div>
                              <div className="bg-gray-50 rounded-xl p-4 text-center border-2 border-gray-200">
                                <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">{story.timePeriod}</div>
                                <div className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Time Period</div>
                              </div>
                            </div>

                            {/* Quote Section - Clean Design */}
                            <div className="bg-gray-50 rounded-xl p-5 mb-4 flex-1 border-2 border-gray-200 relative">
                              {/* Quote Icon */}
                              <div className="absolute top-3 left-4 text-4xl text-gray-300 font-serif">"</div>
                              <p className="text-gray-800 text-sm sm:text-base leading-relaxed font-medium relative z-10 pt-2">
                                {story.quote}
                              </p>
                            </div>

                            {/* Before/After - Modern Design */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 text-center">
                                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Before</div>
                                  <div className="text-sm font-bold text-gray-700 bg-white rounded-lg py-2 px-3 border-2 border-gray-200">{story.before}</div>
                                </div>
                                <div className="flex-shrink-0">
                                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full p-2 shadow-md">
                                    <ArrowRightIcon className="h-4 w-4 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1 text-center">
                                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">After</div>
                                  <div className="text-sm font-bold bg-white rounded-lg py-2 px-3 border-2 border-indigo-300">
                                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                      {story.after}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Arrows - Modern Design */}
                <button
                  onClick={() => setCurrentStorySlide(currentStorySlide === 0 ? totalStorySlides - 1 : currentStorySlide - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg border-2 border-gray-200 transition-all duration-300 z-10 group hover:scale-110"
                  aria-label="Previous story"
                >
                  <ArrowRightIcon className="h-5 w-5 text-gray-700 rotate-180 group-hover:text-indigo-600" />
                </button>
                <button
                  onClick={() => setCurrentStorySlide(currentStorySlide === totalStorySlides - 1 ? 0 : currentStorySlide + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg border-2 border-gray-200 transition-all duration-300 z-10 group hover:scale-110"
                  aria-label="Next story"
                >
                  <ArrowRightIcon className="h-5 w-5 text-gray-700 group-hover:text-indigo-600" />
                </button>

                {/* Pagination Dots - Modern Design */}
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 z-10">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border border-gray-200">
                    {Array.from({ length: totalStorySlides }, (_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentStorySlide(index)}
                        className={`h-2 rounded-full transition-all duration-300 mx-1 ${currentStorySlide === index
                          ? 'w-8 bg-gradient-to-r from-indigo-600 to-purple-600'
                          : 'w-2 bg-gray-300 hover:bg-gray-400'
                          }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Premium White Design */}
      <section id="features" ref={featuresRef} className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden" style={{ zIndex: 10 }}>
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-200/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3" data-tour="features-title">
              Everything You Need to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"> Build & Sell</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful tools to create, manage, and optimize your channels - all in one platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card group relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-500 hover:scale-105"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(229, 231, 235, 0.5)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                }}
                data-tour={`feature-${index + 1}`}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))`,
                    filter: 'blur(20px)',
                    zIndex: -1
                  }}
                ></div>

                {/* Icon with premium white background */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div 
                    className="relative inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl text-white"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.9))',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <feature.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
                  <div className="absolute -inset-10 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section - Premium White Design */}
      <section id="blog" className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden" style={{ zIndex: 10 }}>
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-200/15 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Latest from Our <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Blog</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn how to sell digital products, create channels, and build a successful online business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {blogPosts
              .sort((a, b) => {
                // Featured posts first, then by date
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
              })
              .slice(0, 6)
              .map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105"
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(229, 231, 235, 0.5)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                  }}
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))',
                      filter: 'blur(20px)',
                      zIndex: -1
                    }}
                  ></div>

                  <div className="p-5 relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <span 
                        className="px-3 py-1 text-purple-700 text-xs font-semibold rounded-full"
                        style={{
                          background: 'rgba(237, 233, 254, 0.8)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          border: '1px solid rgba(167, 139, 250, 0.3)',
                          boxShadow: '0 2px 8px rgba(167, 139, 250, 0.2)'
                        }}
                      >
                        {post.category}
                      </span>
                      {post.featured && (
                        <span 
                          className="px-3 py-1 text-yellow-700 text-xs font-semibold rounded-full"
                          style={{
                            background: 'rgba(254, 243, 199, 0.8)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            boxShadow: '0 2px 8px rgba(251, 191, 36, 0.2)'
                          }}
                        >
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-3 text-sm">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { timeZone: 'UTC' })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>{post.readTime} min</span>
                        </div>
                      </div>
                      <div 
                        className="p-2 rounded-lg transition-all duration-300 group-hover:translate-x-1"
                        style={{
                          background: 'rgba(168, 85, 247, 0.1)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)'
                        }}
                      >
                        <ArrowRightIcon className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
                    <div className="absolute -inset-10 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine"></div>
                  </div>
                </Link>
              ))}
          </div>

          <div className="text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
            >
              View All Articles
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-4 sm:px-6 lg:px-8" style={{ zIndex: 10 }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <Logo size="md" />
              <p className="mt-3 text-sm">Convert your traffic into revenue with powerful channels.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} SellEarnDirect. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Screenshot Showcase Modal */}
      <ScreenshotShowcase
        isOpen={showScreenshotShowcase}
        onClose={() => setShowScreenshotShowcase(false)}
      />

    </div>
  );
}
