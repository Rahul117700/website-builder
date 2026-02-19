'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { gsap } from 'gsap';
import Image from 'next/image';
import { getRecommendedProducts, ProductCardData } from '@/app/actions/homepage';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import * as THREE from 'three';
import {
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  BookOpenIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  RocketLaunchIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  HeartIcon,
  UserGroupIcon,
  UserCircleIcon,
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
  ClockIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import Header from '@/components/Header';
import Logo from '@/components/Logo';
import ScreenshotShowcase from '@/components/ScreenshotShowcase';
import dynamic from 'next/dynamic';
import { blogPosts } from '@/data/blogs';
import CinematicAd from '@/components/CinematicAd';
import ProductCard from '@/components/product/ProductCard';

// SaleNotifications removed - flagged as deceptive content by Google Search Console
// const SaleNotifications = dynamic(() => import('@/components/SaleNotifications'), { ssr: false });
import {
  PlayIcon as PlayIconSolid,
  ArrowRightIcon as ArrowRightIconSolid
} from '@heroicons/react/24/solid';
import CTAButton from '@/components/CTAButton';
import ExitIntentPopup from '@/components/ExitIntentPopup';
import StickyBuyNow from '@/components/StickyBuyNow';
import { generateProductSchema, getSchemaScript } from '@/utils/seo';
import { storiesWithImages } from './stories';

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

  // Live Feed State
  const [feedItems, setFeedItems] = useState<ProductCardData[]>([]);

  useEffect(() => {
    async function fetchFeed() {
      try {
        // Fetch recommended products for the feed (public or personalized)
        const products = await getRecommendedProducts(session?.user?.id);
        setFeedItems(products);
      } catch (error) {
        console.error("Failed to fetch activity feed", error);
      }
    }
    fetchFeed();
  }, [session?.user?.id]);

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
      imageUrl: "",
      backgroundImage: ""
    },
    {
      name: "Premium Software",
      visitors: 2890,
      revenue: 124500,
      imageUrl: "",
      backgroundImage: ""
    },
    {
      name: "Code Templates",
      visitors: 2156,
      revenue: 98700,
      imageUrl: "",
      backgroundImage: ""
    },
    {
      name: "Online Course",
      visitors: 1823,
      revenue: 76500,
      imageUrl: "",
      backgroundImage: ""
    }
  ];

  // Success Stories data - only includes testimonials with unique images
  const allStories = [
    {
      name: "Priya Sharma",
      business: "Online Yoga Courses",
      revenue: "₹15 Lakhs",
      timePeriod: "6 months",
      quote: "I started selling my yoga courses as a side hustle. Now it's my full-time business! sedStudios made everything so simple.",
      before: "Part-time instructor",
      after: "Full-time entrepreneur",
      avatar: "🧘‍♀️",
      imageUrl: "/hero/avatar.svg",
      bgGradient: "from-purple-500 to-pink-600",
      backgroundImage: "",
      accentImage: ""
    },
    {
      name: "Arjun Kapoor",
      business: "Premium Software Tools",
      revenue: "₹45 Lakhs",
      timePeriod: "12 months",
      quote: "My software development business exploded after I started selling through sedStudios. Best decision I ever made!",
      before: "Freelance developer",
      after: "SaaS founder",
      avatar: "💻",
      imageUrl: "/hero/avatar.svg",
      bgGradient: "from-blue-500 to-indigo-600",
      backgroundImage: "",
      accentImage: ""
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
      imageUrl: "/hero/avatar.svg",
      bgGradient: "from-green-500 to-emerald-600",
      backgroundImage: "",
      accentImage: ""
    },
    {
      name: "Rahul Reddy",
      business: "Online Photography Course",
      revenue: "₹18 Lakhs",
      timePeriod: "7 months",
      quote: "From hobby photographer to profitable course creator. sedStudios gave me the tools to monetize my passion.",
      before: "Photography enthusiast",
      after: "Course instructor",
      avatar: "📸",
      imageUrl: "/hero/avatar.svg",
      bgGradient: "from-indigo-500 to-blue-600",
      backgroundImage: "",
      accentImage: ""
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


  // Three.js setup with error handling
  useEffect(() => {
    if (typeof window === 'undefined' || !threeContainerRef.current) return;

    try {
      // Test if WebGL is available
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

      if (!gl) {
        console.warn('WebGL not available, skipping Three.js initialization');
        return;
      }

      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      } catch (rendererError) {
        console.warn('Failed to create WebGL renderer:', rendererError);
        return;
      }

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);

      if (threeContainerRef.current) {
        threeContainerRef.current.appendChild(renderer.domElement);
      }

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
      let animationFrameId: number;
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

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

        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }

        if (renderer) {
          renderer.dispose();
        }

        if (threeContainerRef.current && renderer && renderer.domElement) {
          try {
            threeContainerRef.current.removeChild(renderer.domElement);
          } catch (e) {
            // Element might already be removed
          }
        }
      };
    } catch (error) {
      console.warn('Three.js initialization failed:', error);
      // Gracefully degrade - the page will still work without 3D effects
      return;
    }
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

    // Payment Section Scroll Animations
    gsap.fromTo('.payment-header',
      { opacity: 0, y: 50 },
      {
        scrollTrigger: {
          trigger: '.payment-header',
          start: 'top 80%',
        },
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out'
      }
    );

    gsap.to('.payment-live-indicator', {
      scrollTrigger: {
        trigger: '.payment-header',
        start: 'top 80%',
      },
      opacity: 1,
      duration: 0.8,
      delay: 0.5,
      ease: 'power2.out'
    });

    gsap.fromTo('.payment-desc-card',
      { opacity: 0, scale: 0.95 },
      {
        scrollTrigger: {
          trigger: '.payment-desc-card',
          start: 'top 85%',
        },
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'back.out(1.7)'
      }
    );

    gsap.fromTo('.payment-method-card',
      { opacity: 0, y: 40, rotationX: -15 },
      {
        scrollTrigger: {
          trigger: '.payment-method-card',
          start: 'top 80%',
        },
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out'
      }
    );

    gsap.fromTo('.payment-workflow-step',
      { opacity: 0, x: -20 },
      {
        scrollTrigger: {
          trigger: '.payment-workflow-step',
          start: 'top 85%',
        },
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: 'power2.out'
      }
    );

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
      title: 'Easy Store Setup',
      description: 'Create your online shop in minutes. Very simple - no technical skills needed.'
    },
    {
      icon: ShoppingBagIcon,
      title: 'Sell Your Products',
      description: 'Upload courses, PDFs, videos, ebooks and start selling. We handle everything.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Get Paid Easily',
      description: 'Accept payments online. Money goes directly to your bank account.'
    },
    {
      icon: ChartBarIcon,
      title: 'See Your Sales',
      description: 'Check how many people visited, bought your products, and how much you earned.'
    }
  ];


  const productSchema = generateProductSchema({
    name: 'sedStudios Platform',
    description: 'Create and sell digital products online. Build sales funnels, manage customers, and grow your revenue.',
    image: 'https://sedstudios.com/logo/logo.gif',
    price: 0,
    url: 'https://sedstudios.com',
    rating: { value: 4.8, count: 1250 }
  });

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <ExitIntentPopup discount="51%" />
      <StickyBuyNow />
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

      {/* Hero Section - Sleek Premium Split Design - DARK MODE */}
      <section ref={heroRef} className="relative pt-20 lg:pt-24 pb-4 px-4 sm:px-6 lg:px-8 bg-black overflow-hidden min-h-[calc(100vh-60px)] flex items-center">
        <div className="max-w-[1400px] mx-auto relative z-10 w-full">

          {/* Live Activity Feed */}
          {feedItems.length > 0 && (
            <div className="mb-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1.5 shadow-sm flex items-center gap-3 overflow-hidden max-w-3xl mx-auto">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 text-green-400 rounded-lg text-[10px] font-bold whitespace-nowrap border border-green-500/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
                LIVE
              </div>
              <div className="flex-1 overflow-hidden relative h-5">
                <div className="animate-marquee whitespace-nowrap flex gap-6 items-center text-xs text-gray-400 absolute top-0">
                  {feedItems.slice(0, 5).map((p, i) => (
                    <span key={`ticker-${i}`} className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-gray-800 relative overflow-hidden">
                        <Image src={p.channelAvatar || '/hero/avatar.svg'} alt="" fill className="object-cover" />
                      </span>
                      <span className="font-medium text-gray-200">{p.channelName}</span>
                      <span>just uploaded</span>
                      <span className="font-medium text-indigo-400">{p.title}</span>
                      <span className="text-gray-600">•</span>
                    </span>
                  ))}
                  {/* Duplicate for infinite scroll effect */}
                  {feedItems.slice(0, 5).map((p, i) => (
                    <span key={`ticker-dup-${i}`} className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-gray-800 relative overflow-hidden">
                        <Image src={p.channelAvatar || '/hero/avatar.svg'} alt="" fill className="object-cover" />
                      </span>
                      <span className="font-medium text-gray-200">{p.channelName}</span>
                      <span>just uploaded</span>
                      <span className="font-medium text-indigo-400">{p.title}</span>
                      <span className="text-gray-600">•</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">

            {/* LEFT COLUMN: Premium Value Proposition */}
            <div className="w-full lg:w-[45%] space-y-4">
              <div className="text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-[9px] font-bold uppercase tracking-wider mb-2 border border-orange-500/20">
                  <RocketLaunchIcon className="w-3 h-3" />
                  Start Earning Today
                </div>
                <h1 className="hero-title text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 leading-none tracking-tight" style={{ opacity: 1, transform: 'translateY(0)' }} data-tour="hero-title">
                  Start Selling Online.
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mt-1">
                    Earn from Your Skills.
                  </span>
                </h1>
                <p className="hero-subtitle text-sm sm:text-base text-gray-400 mb-3 leading-relaxed max-w-lg" style={{ opacity: 1, transform: 'translateY(0)' }} data-tour="hero-subtitle">
                  Sell courses, PDFs, and videos. Setup in 5 mins. <span className="text-white font-bold underline decoration-indigo-500 underline-offset-2">Keep 100% money - zero fees!</span>
                </p>

                {/* Selling Highlights - Compact */}
                <div className="flex gap-4 py-2 border-y border-white/10 mb-3">
                  {[
                    { label: "No Fees", sub: "100% yours", icon: CurrencyDollarIcon },
                    { label: "Very Easy", sub: "5 min setup", icon: BoltIcon },
                    { label: "Get Paid", sub: "Direct to bank", icon: BanknotesIcon }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-indigo-400">
                        <item.icon className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-tight text-white">{item.label}</span>
                      </div>
                      <span className="text-[9px] text-gray-500 font-medium leading-tight">{item.sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process Flowchart - Horizontal & Compact */}
              <div className="relative space-y-2">
                <p className="text-[9px] font-black text-gray-400 mb-1 tracking-[0.2em] uppercase">How It Works</p>

                <div className="relative z-10 grid grid-cols-5 gap-2">
                  {[
                    { id: 1, icon: UserCircleIcon, title: "Create", color: "indigo" },
                    { id: 2, icon: ShoppingBagIcon, title: "Upload", color: "blue" },
                    { id: 3, icon: Cog6ToothIcon, title: "Style", color: "emerald" },
                    { id: 4, icon: GlobeAltIcon, title: "Share", color: "orange" },
                    { id: 5, icon: CurrencyDollarIcon, title: "Earn", color: "yellow", success: true }
                  ].map((step, idx) => (
                    <div key={step.id} className="flex flex-col items-center text-center gap-1 group">
                      <div className={`relative w-8 h-8 rounded-lg bg-white/5 border border-white/10 shadow-sm flex items-center justify-center group-hover:scale-110 transition-all duration-300 group-hover:border-${step.color}-500 overflow-hidden`}>
                        <step.icon className={`w-4 h-4 text-gray-400 group-hover:text-${step.color}-400 transition-colors`} />
                      </div>
                      <span className={`text-[9px] font-bold ${step.success ? 'text-amber-400' : 'text-gray-400'}`}>{step.title}</span>
                      {idx < 4 && (
                        <div className="hidden sm:block absolute top-4 left-[calc(20%*(${idx}+1)-10px)] w-[calc(20%-20px)] h-[1px] bg-white/10 -z-10"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="hero-buttons flex flex-col sm:flex-row gap-3 pt-1" style={{ opacity: 1, transform: 'translateY(0)' }}>
                <CTAButton
                  onClick={() => router.push(session ? "/auth/dashboard/my-channel" : "/auth/signin?callbackUrl=/auth/dashboard/my-channel")}
                  className="group text-sm font-bold shadow-lg hover:shadow-xl px-6 py-3 bg-white text-black hover:bg-gray-100"
                >
                  Start Selling - Free!
                  <RocketLaunchIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </CTAButton>

                <div className="hidden sm:flex flex-col justify-center gap-0.5">
                  <div className="flex -space-x-2">
                    {/* User Avatars - Hero Section */}
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-indigo-900 flex items-center justify-center overflow-hidden relative">
                        <div className="w-full h-full bg-gray-700 animate-pulse"></div>
                      </div>
                    ))}
                    <div className="w-6 h-6 rounded-full border-2 border-black bg-indigo-600 flex items-center justify-center text-[8px] text-white font-bold">+2k</div>
                  </div>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Joined this week</p>
                </div>
              </div>


              {/* Trust Badges - Improved Visibility */}
              <div className="flex flex-wrap gap-3 pt-1">
                {["No Credit Card", "Free Trial", "Cancel Anytime"].map(badge => (
                  <div key={badge} className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 bg-white/5 px-2 py-1 rounded-md border border-white/10 uppercase tracking-wider">
                    <span className="text-green-400 font-bold">✓</span> {badge}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: Cinematic Creator Workstation */}
            <div className="w-full lg:w-[55%] relative">
              <div className="hero-visual relative flex justify-center" style={{ opacity: 1, transform: 'translateY(0)' }} data-tour="hero-visual">
                <CinematicAd className="w-full max-w-[500px] h-[400px] sm:h-[450px]" trendingProducts={feedItems} />
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Featured Products Section - Display View Cards */}
      {
        feedItems.length > 0 && (
          <section className="py-20 bg-white border-y border-gray-100">
            <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider mb-4 border border-indigo-100">
                  <ShoppingBagIcon className="w-3.5 h-3.5" />
                  Trending Now
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">Explore Community Creations</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">Discover the amazing digital products our creators are selling right now.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
                {feedItems.slice(0, 8).map((product) => (
                  <div key={product.id} className="h-full">
                    <ProductCard {...product} />
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <CTAButton
                  onClick={() => router.push(session ? "/auth/dashboard/my-channel" : "/auth/signin")}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white text-gray-900 border-2 border-gray-100 rounded-xl font-bold hover:border-gray-900 transition-all hover:-translate-y-1 shadow-sm hover:shadow-lg"
                >
                  Start Selling Your Own
                  <ArrowRightIcon className="w-4 h-4" />
                </CTAButton>
              </div>
            </div>
          </section>
        )
      }


      {/* GLOBAL SCALE SECTION - Dark Mode */}
      <section className="py-24 sm:py-32 bg-[#0A0A0A] relative overflow-hidden">
        {/* Abstract background mesh */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-blue-500/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-16 sm:mb-24 max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter mb-6 sm:mb-8 leading-[0.95] sm:leading-[0.9]">
              Built for <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">Global Scale.</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 font-medium leading-relaxed px-4">
              Infrastructure that scales with you. From your first sale to your millionth, we ensure lightning-fast delivery worldwide.
            </p>
          </div>

          {/* Bento Grid Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Card 1: Global CDN (Large) */}
            <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-10 relative overflow-hidden group hover:border-white/20 transition-colors">
              <div className="relative z-10">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-indigo-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 border border-indigo-500/30 text-indigo-400">
                  <GlobeAltIcon className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">Edge Network</h3>
                <p className="text-gray-400 text-sm sm:text-lg max-w-md leading-relaxed">Content delivered from 280+ cities globally. Low latency, high reliability, zero configuration.</p>
              </div>
              {/* Decorative Map/Globe Effect */}
              <div className="absolute -right-8 -top-8 sm:-right-16 sm:-top-16 w-48 h-48 sm:w-80 sm:h-80 bg-indigo-600/20 rounded-full blur-[40px] sm:blur-[80px] group-hover:bg-indigo-600/30 transition-all"></div>
            </div>

            {/* Card 2: Community (Tall) */}
            <div className="md:row-span-2 bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-10 relative overflow-hidden group hover:border-white/20 transition-colors flex flex-col">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-pink-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 border border-pink-500/30 text-pink-400">
                <UserGroupIcon className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">Million+ Community</h3>
              <p className="text-gray-400 text-sm sm:text-lg mb-6 sm:mb-8 leading-relaxed">Join a thriving ecosystem of creators redefining the digital economy.</p>

              <div className="mt-auto flex -space-x-3 sm:-space-x-4 overflow-hidden py-2 sm:py-4 pl-2 sm:pl-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-[#0A0A0A] bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 relative z-10 overflow-hidden">
                    <div className="w-full h-full bg-gray-700 animate-pulse"></div>
                  </div>
                ))}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-[#0A0A0A] bg-gray-800 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white z-20">
                  +1M
                </div>
              </div>
            </div>

            {/* Card 3: Viral Tools */}
            <div className="bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-10 relative overflow-hidden group hover:border-white/20 transition-colors">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-emerald-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 border border-emerald-500/30 text-emerald-400">
                <ChartBarIcon className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Viral Engines</h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">Built-in SEO & social sharing tools.</p>
            </div>

            {/* Card 4: Uptime */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-10 relative overflow-hidden flex items-center justify-between group">
              <div>
                <p className="text-white/80 font-medium mb-1 text-sm sm:text-base">Uptime Guarantee</p>
                <h3 className="text-2xl sm:text-4xl font-black text-white">99.99%</h3>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                <CheckBadgeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ASSET TYPES - White, Clean, "Apple" Aesthetic */}
      <section className="py-24 sm:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-16 sm:mb-20">
            <span className="text-indigo-600 font-bold tracking-widest uppercase text-xs sm:text-sm mb-4 block">Product Suite</span>
            <h2 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tight mb-6 leading-tight">
              Sell <span className="line-through text-gray-300 decoration-4 decoration-indigo-500 decoration-wavy">Anything.</span> <br />
              Everything.
            </h2>
            <p className="text-xl sm:text-2xl text-gray-500 max-w-2xl font-medium leading-relaxed">From masterclasses to micro-resources. If it's digital, you can sell it here.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1: Courses */}
            <div className="group rounded-[2.5rem] bg-gray-50 p-8 hover:bg-white border border-gray-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
              <div className="h-48 sm:h-64 bg-indigo-100 rounded-[2rem] mb-6 sm:mb-8 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500 isolate">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center">
                  <BookOpenIcon className="w-20 h-20 sm:w-24 sm:h-24 text-indigo-300/50" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-white/90 backdrop-blur rounded-xl p-3 sm:p-4 shadow-sm border border-white/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] sm:text-xs font-bold text-gray-900 uppercase tracking-wide">Module 1: Active</span>
                  </div>
                  <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-indigo-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Video Courses</h3>
              <p className="text-gray-500 font-medium leading-relaxed">Create structured curriculums, drip content, and track student completion rates.</p>
            </div>

            {/* Card 2: Videos (Featured) */}
            <div className="group rounded-[2.5rem] bg-gray-900 p-8 text-white shadow-2xl shadow-gray-900/20 transform md:-translate-y-8 border border-gray-800">
              <div className="h-48 sm:h-64 bg-gray-800 rounded-[2rem] mb-6 sm:mb-8 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500 border border-gray-700 isolate">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                  <PlayIcon className="w-20 h-20 sm:w-24 sm:h-24 text-white/10" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                    <PlayIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1" />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Exclusive Content</h3>
              <p className="text-gray-400 font-medium leading-relaxed">Member-only videos, behind-the-scenes, and premium streaming with 4K support.</p>
            </div>

            {/* Card 3: Files */}
            <div className="group rounded-[2.5rem] bg-gray-50 p-8 hover:bg-white border border-gray-100 hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-500">
              <div className="h-48 sm:h-64 bg-pink-100 rounded-[2rem] mb-6 sm:mb-8 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500 isolate">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-white flex items-center justify-center">
                  <DocumentTextIcon className="w-20 h-20 sm:w-24 sm:h-24 text-pink-300/50" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-36 sm:w-32 sm:h-40 bg-white shadow-xl rounded-xl -rotate-6 group-hover:-rotate-12 transition-transform duration-500 flex flex-col p-4 border border-gray-100">
                  <div className="w-full h-2 bg-gray-100 rounded mb-2"></div>
                  <div className="w-2/3 h-2 bg-gray-100 rounded mb-4"></div>
                  <div className="w-full h-12 sm:h-16 bg-pink-50 rounded mt-auto flex items-center justify-center text-pink-500 text-xs font-bold ring-1 ring-pink-100">PDF</div>
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Digital Downloads</h3>
              <p className="text-gray-500 font-medium leading-relaxed">Secure delivery for PDFs, software, presets, and templates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINANCIAL INFRASTRUCTURE - Fintech Aesthetic */}
      <section className="py-24 sm:py-32 bg-gray-50 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

          {/* Section Header */}
          <div className="text-center mb-20 sm:mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 rounded-full border border-green-100 mb-6 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-green-700 font-bold text-xs uppercase tracking-widest">Live Settlements</span>
            </div>
            <h2 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tighter mb-6 leading-tight">
              Accept Payments.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Keep the Profit.</span>
            </h2>
            <p className="text-xl sm:text-2xl text-gray-500 max-w-3xl mx-auto font-medium">
              Direct-to-bank payouts. 135+ currencies. 0% platform fees on your revenue.
            </p>
          </div>

          {/* Direct Payment Visualization */}
          <div className="mb-24 relative hidden md:block">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
            <div className="grid grid-cols-3 gap-8 relative z-10">
              {/* Customer */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center mb-6">
                  <UserGroupIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Customer</h3>
                <p className="text-gray-500 text-sm">Pays ₹4,999</p>
              </div>

              {/* The Flow */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-full font-bold text-sm border border-emerald-100 shadow-sm flex items-center gap-2">
                  <CheckBadgeIcon className="w-5 h-5" />
                  Direct Transfer
                </div>
                <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">No Middlemen</p>
              </div>

              {/* You */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-500 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center mb-6">
                  <BanknotesIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Your Bank</h3>
                <p className="text-gray-500 text-sm">Receives ₹4,999 (- processing fee)</p>
              </div>
            </div>
          </div>

          {/* Payment Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-24">
            {[
              {
                title: "Cards & Global",
                icon: <ComputerDesktopIcon className="w-8 h-8" />,
                desc: "Accept Visa, Mastercard, Amex in 135+ currencies.",
                color: "blue"
              },
              {
                title: "UPI & Wallets",
                icon: <DevicePhoneMobileIcon className="w-8 h-8" />,
                desc: "Instant QR payments via GPay, PhonePe, Paytm.",
                color: "green"
              },
              {
                title: "Instant Payouts",
                icon: <BoltIcon className="w-8 h-8" />,
                desc: "T+1 settlement cycle directly to your bank account.",
                color: "amber"
              }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 group">
                <div className={`w-16 h-16 rounded-2xl bg-${item.color}-50 flex items-center justify-center text-${item.color}-600 mb-6 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* STEPS TO EARN */}
          <div className="bg-[#0A0A0A] rounded-[3rem] p-8 sm:p-20 relative overflow-hidden text-center sm:text-left">
            {/* Background Shapes */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tight">
                  Start Earning in <br />
                  <span className="text-indigo-400">Minutes.</span>
                </h2>
                <p className="text-gray-400 text-xl mb-10 max-w-md">No coding. No complex setup. Just upload and sell.</p>

                <CTAButton
                  onClick={() => router.push(session ? "/auth/dashboard/my-channel" : "/auth/signin")}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-black text-lg hover:bg-gray-100 transition-all hover:scale-105"
                >
                  Launch Your Store
                  <ArrowRightIcon className="w-5 h-5" />
                </CTAButton>
              </div>

              <div className="space-y-8">
                {[
                  { num: "01", title: "Create Channel", desc: "Claim your unique URL and customize your store." },
                  { num: "02", title: "Add Products", desc: "Upload videos, courses, or files." },
                  { num: "03", title: "Get Paid", desc: "Share your link and watch the sales roll in." }
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-6 group">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                      <span className="text-2xl font-black text-white/50 group-hover:text-white transition-colors">{step.num}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{step.title}</h3>
                      <p className="text-gray-400 font-medium">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES - Dark Mode Wall of Love */}
      <section className="py-24 sm:py-32 bg-[#0A0A0A] relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-20">
            <span className="text-indigo-400 font-bold tracking-widest uppercase text-xs sm:text-sm mb-4 block">Success Stories</span>
            <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tight mb-8">
              Real People.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Real Results.</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-12 mt-12 border-y border-white/10 py-8">
              {[
                { label: "Total Revenue", val: "₹2.5Cr+" },
                { label: "Active Sellers", val: "10,000+" },
                { label: "Creator Rating", val: "4.9/5" },
              ].map((stat, i) => (
                <div key={i} className="text-center px-4">
                  <div className="text-3xl sm:text-4xl font-black text-white mb-1">{stat.val}</div>
                  <div className="text-gray-500 text-xs uppercase tracking-widest font-bold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials Grid (Simulated Masonry/Wall) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Jenkins",
                business: "Fitness Coach",
                revenue: "₹1.2Cr",
                after: "+320%",
                quote: "I moved all my workout plans to this platform. The direct payments changed everything."
              },
              {
                name: "David Chen",
                business: "Digital Artist",
                revenue: "₹85L",
                after: "+150%",
                quote: "Finally, a place where I keep 100% of my earnings. The bento grid layout is beautiful."
              },
              {
                name: "Priya Sharma",
                business: "Marketing Consultant",
                revenue: "₹2.1Cr",
                after: "+410%",
                quote: "The funnel templates saved me months of dev time. My conversion rate doubled overnight."
              }
            ].map((story, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 hover:bg-white/10 transition-colors duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden relative border border-white/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-400">{story.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg leading-none">{story.name}</h4>
                    <span className="text-gray-500 text-xs uppercase tracking-wide">{story.business}</span>
                  </div>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">"{story.quote}"</p>
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Revenue</p>
                    <p className="text-indigo-400 font-bold">{story.revenue}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Growth</p>
                    <p className="text-green-400 font-bold">{story.after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES - Clean White Aesthetic */}
      <section id="features" ref={featuresRef} className="py-24 sm:py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight mb-6">
              Everything You Need to <span className="text-indigo-600">Scale.</span>
            </h2>
            <p className="text-xl text-gray-500 font-medium">
              Powerful tools to create, manage, and optimize your channels - all in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative rounded-[2rem] p-8 border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG - Clean Aesthetic */}
      <section id="blog" className="py-24 sm:py-32 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-16 gap-8">
            <div className="text-center sm:text-left">
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">
                From the <span className="text-indigo-600">Blog</span>
              </h2>
              <p className="text-lg text-gray-500 font-medium max-w-xl">
                Learn how to sell digital products and build a successful online business.
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full font-bold text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              View All Articles
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts
              .sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
              })
              .slice(0, 6)
              .map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group relative bg-white rounded-[2rem] overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="p-8 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider rounded-full border border-indigo-100">
                        {post.category}
                      </span>
                      {post.featured && (
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-100">
                          Featured
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 mb-8 line-clamp-3 font-medium flex-grow">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                      <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>•</span>
                        <span>{post.readTime} min read</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <ArrowRightIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

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
            <p>&copy; {new Date().getFullYear()} sedStudios. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <ScreenshotShowcase
        isOpen={showScreenshotShowcase}
        onClose={() => setShowScreenshotShowcase(false)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
    </div >
  );
}
