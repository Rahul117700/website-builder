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
  ClockIcon
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

      {/* Hero Section - Sleek Premium Split Design */}
      <section ref={heroRef} className="relative pt-12 sm:pt-20 pb-12 px-4 sm:px-6 lg:px-12 bg-white overflow-hidden">
        <div className="max-w-[1500px] mx-auto relative z-10">

          {/* Live Activity Feed */}
          {feedItems.length > 0 && (
            <div className="mb-8 md:mb-12 bg-white/80 backdrop-blur-md border border-gray-100 rounded-xl p-3 shadow-sm flex items-center gap-4 overflow-hidden max-w-4xl mx-auto">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold whitespace-nowrap">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                LIVE
              </div>
              <div className="flex-1 overflow-hidden relative h-6">
                <div className="animate-marquee whitespace-nowrap flex gap-8 items-center text-sm text-gray-600 absolute top-0">
                  {feedItems.slice(0, 5).map((p, i) => (
                    <span key={`ticker-${i}`} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gray-100 relative overflow-hidden">
                        <Image src={p.channelAvatar || '/hero/avatar.svg'} alt="" fill className="object-cover" />
                      </span>
                      <span className="font-medium text-gray-900">{p.channelName}</span>
                      <span>just uploaded</span>
                      <span className="font-medium text-indigo-600">{p.title}</span>
                      <span className="text-gray-300">•</span>
                    </span>
                  ))}
                  {/* Duplicate for infinite scroll effect */}
                  {feedItems.slice(0, 5).map((p, i) => (
                    <span key={`ticker-dup-${i}`} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gray-100 relative overflow-hidden">
                        <Image src={p.channelAvatar || '/hero/avatar.svg'} alt="" fill className="object-cover" />
                      </span>
                      <span className="font-medium text-gray-900">{p.channelName}</span>
                      <span>just uploaded</span>
                      <span className="font-medium text-indigo-600">{p.title}</span>
                      <span className="text-gray-300">•</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* LEFT COLUMN: Premium Value Proposition */}
            <div className="w-full lg:w-[45%] space-y-12">
              <div className="text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wider mb-6 border border-orange-100">
                  <RocketLaunchIcon className="w-3.5 h-3.5" />
                  Start Earning Today
                </div>
                <h1 className="hero-title text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-gray-900 mb-6 leading-[1.05]" style={{ opacity: 1, transform: 'translateY(0)' }} data-tour="hero-title">
                  Start Selling Online.
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mt-1">
                    Earn Money From Your Skills.
                  </span>
                </h1>
                <p className="hero-subtitle text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl" style={{ opacity: 1, transform: 'translateY(0)' }} data-tour="hero-subtitle">
                  Sell your courses, PDFs, and videos online. No technical knowledge needed. Setup in 5 minutes and <span className="text-gray-900 font-bold underline decoration-indigo-500 underline-offset-4">keep 100% money - zero fees!</span>
                </p>

                {/* Selling Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-2 pb-8 border-y border-gray-100 mb-8">
                  {[
                    { label: "No Fees", sub: "100% money is yours", icon: CurrencyDollarIcon },
                    { label: "Very Easy", sub: "Start in 5 minutes", icon: BoltIcon },
                    { label: "Get Paid", sub: "Money to your bank", icon: BanknotesIcon }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-indigo-600">
                        <item.icon className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-tight text-gray-900">{item.label}</span>
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium">{item.sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process Flowchart - Vertical for Desktop Column */}
              <div className="relative space-y-6">
                <p className="text-[10px] font-black text-gray-400 mb-6 tracking-[0.2em] uppercase">How It Works</p>

                <div className="absolute left-7 top-10 bottom-4 w-0.5 bg-gray-100" style={{ zIndex: 0 }}>
                  <div className="process-progress-line-mobile absolute top-0 left-0 w-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full" style={{ height: '100%' }}></div>
                </div>

                <div className="space-y-6 relative" style={{ zIndex: 1 }}>
                  {[
                    { id: 1, icon: UserCircleIcon, title: "Create Your Store", desc: "Make your own online shop", color: "indigo" },
                    { id: 2, icon: ShoppingBagIcon, title: "Upload Products", desc: "Add your courses, PDFs or videos", color: "blue" },
                    { id: 3, icon: Cog6ToothIcon, title: "Make It Yours", desc: "Choose colors and design", color: "emerald" },
                    { id: 4, icon: GlobeAltIcon, title: "Share & Sell", desc: "Share link and start selling", color: "orange" },
                    { id: 5, icon: CurrencyDollarIcon, title: "Get Money", desc: "100% payment directly to your bank", color: "yellow", success: true }
                  ].map((step, idx) => (
                    <div key={step.id} className={`process-step flex items-center gap-6 group ${step.success ? 'process-step-success' : ''}`}>
                      <div className="relative flex-shrink-0">
                        <div className={`process-step-icon relative w-12 h-12 rounded-xl bg-white border-2 border-gray-50 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300 group-hover:border-${step.color}-500 overflow-hidden`}>
                          <step.icon className={`w-6 h-6 text-gray-700 group-hover:text-${step.color}-600 transition-colors`} />
                          <div className={`absolute inset-0 bg-${step.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity`} />
                        </div>
                      </div>
                      <div className="process-step-text">
                        <h4 className={`font-bold text-[15px] ${step.success ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-600' : 'text-gray-900'} mb-0.5`}>{step.title}</h4>
                        <p className="text-xs text-gray-500 font-semibold">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hero-buttons flex flex-col sm:flex-row gap-4 pt-4" style={{ opacity: 1, transform: 'translateY(0)' }}>
                <CTAButton
                  onClick={() => router.push(session ? "/auth/dashboard/my-channel" : "/auth/signin?callbackUrl=/auth/dashboard/my-channel")}
                  className="group text-base font-bold shadow-xl hover:shadow-2xl px-10 py-5"
                >
                  Start Selling Now - It's Free!
                  <RocketLaunchIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </CTAButton>

                <div className="hidden sm:flex flex-col justify-center gap-1">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center overflow-hidden">
                        <img
                          src="/hero/avatar.svg"
                          alt="user"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<span class="text-[10px] font-bold text-indigo-600">U</span>';
                            }
                          }}
                        />
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">+2k</div>
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Joined this week</p>
                </div>
              </div>

              {/* Trust Badges - Improved Visibility */}
              <div className="flex flex-wrap gap-4 pt-2">
                {["No Credit Card", "14-Day Free Trial", "Cancel Anytime"].map(badge => (
                  <div key={badge} className="flex items-center gap-2 text-[11px] font-black text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 uppercase tracking-wider">
                    <span className="text-green-500 font-bold">✓</span> {badge}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: Cinematic Creator Workstation */}
            <div className="w-full lg:w-[55%] relative">
              <div className="hero-visual relative" style={{ opacity: 1, transform: 'translateY(0)' }} data-tour="hero-visual">
                <CinematicAd className="w-full" trendingProducts={feedItems} />
              </div>
            </div>
          </div>
        </div>
      </section>

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


      {/* Reach Millions Section - Global Impact */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-8 leading-tight">
            Reach <span className="text-indigo-600">Millions</span> Around the Globe
          </h2>
          <p className="text-xl sm:text-2xl text-gray-600 mb-16 max-w-4xl mx-auto font-medium">
            Your expertise has no boundaries. Our platform connects you with millions of learners and customers worldwide, ensuring your content reaches every corner of the planet.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
              <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                <GlobeAltIcon className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Global Network</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Instantly deploy your content to a global CDN for lightning-fast access anywhere in the world.</p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
              <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-8 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                <UserGroupIcon className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Million+ Community</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Tap into a thriving ecosystem of creators and learners looking for high-quality digital assets.</p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
              <div className="w-20 h-20 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 mb-8 group-hover:bg-pink-600 group-hover:text-white transition-all duration-500">
                <ChartBarIcon className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Viral Growth</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Built-in sharing tools and SEO optimization to help your content go viral and attract new customers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Type Showcase - Sell Anything */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl font-black text-gray-900 mb-8 tracking-tight">
              Sell Any <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Digital Asset</span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-medium leading-relaxed">
              Whatever your expertise, we have the tools to help you monetize it. From structured courses to high-quality videos and quick-read PDFs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Courses */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl overflow-hidden min-h-[450px] flex flex-col hover:-translate-y-2 transition-all duration-500">
                <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-10 border border-indigo-100 shadow-inner">
                  <BookOpenIcon className="h-10 w-10" />
                </div>
                <h3 className="text-4xl font-black text-gray-900 mb-6">Video Courses</h3>
                <p className="text-gray-600 mb-auto text-lg font-medium leading-relaxed">
                  Build comprehensive learning experiences. Batch-upload videos, create modules, and track student progress with ease.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-full border border-indigo-100">Multi-Lesson</span>
                  <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-full border border-indigo-100">Progress Tracking</span>
                </div>
              </div>
            </div>

            {/* Videos */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl overflow-hidden min-h-[450px] flex flex-col hover:-translate-y-2 transition-all duration-500">
                <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-10 border border-purple-100 shadow-inner">
                  <VideoCameraIcon className="h-10 w-10" />
                </div>
                <h3 className="text-4xl font-black text-gray-900 mb-6">Exclusive Videos</h3>
                <p className="text-gray-600 mb-auto text-lg font-medium leading-relaxed">
                  Market-leading video player for your tutorials, masterclasses, and entertainment content. Adaptive streaming for all devices.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="px-4 py-1.5 bg-purple-50 text-purple-600 text-xs font-black uppercase tracking-widest rounded-full border border-purple-100">4K Streaming</span>
                  <span className="px-4 py-1.5 bg-purple-50 text-purple-600 text-xs font-black uppercase tracking-widest rounded-full border border-purple-100">DRM Protected</span>
                </div>
              </div>
            </div>

            {/* PDFs/E-books */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-pink-600 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl overflow-hidden min-h-[450px] flex flex-col hover:-translate-y-2 transition-all duration-500">
                <div className="w-20 h-20 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 mb-10 border border-pink-100 shadow-inner">
                  <DocumentTextIcon className="h-10 w-10" />
                </div>
                <h3 className="text-4xl font-black text-gray-900 mb-6">PDFs & E-books</h3>
                <p className="text-gray-600 mb-auto text-lg font-medium leading-relaxed">
                  Sell guides, checklists, and e-books. Securely deliver digital files instantly to your customers after payment.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="px-4 py-1.5 bg-pink-50 text-pink-600 text-xs font-black uppercase tracking-widest rounded-full border border-pink-100">Instant Download</span>
                  <span className="px-4 py-1.5 bg-pink-50 text-pink-600 text-xs font-black uppercase tracking-widest rounded-full border border-pink-100">Mobile Friendly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden" style={{ zIndex: 10 }}>
        <div className="max-w-7xl mx-auto">
          {/* Background Focus Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 select-none pointer-events-none opacity-5">
            <span className="text-[15rem] sm:text-[25rem] font-black text-orange-500 leading-none">DIRECT</span>
          </div>

          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-400/10 rounded-full blur-3xl"></div>

          {/* Live Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6 opacity-0 payment-live-indicator">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Live Direct Processing</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 tracking-tight leading-[1] mb-6">
            Accept Payments
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-600 to-orange-500">
              Directly
            </span>
          </h2>
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full border border-orange-200 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-ping"></span>
            <p className="text-orange-800 font-black text-xs sm:text-sm uppercase tracking-[0.2em]">No Middleman Fees</p>
          </div>
        </div>

        {/* Description Card - Clean Design */}
        <div className="max-w-4xl mx-auto mb-12 payment-desc-card">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-gray-100 shadow-sm transform transition-all duration-500 hover:shadow-md">
            <p className="text-center text-base sm:text-lg text-gray-700 leading-relaxed">
              Get paid directly to your bank account. <span className="font-bold text-gray-900">No platform fees, no hidden charges.</span> Keep 100% of your revenue minus standard payment processing fees.
            </p>
          </div>
        </div>

        {/* Payment Methods - Ultra Modern Glass Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 relative">
          {/* Background Glows */}
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-400/10 rounded-full blur-[100px] pointer-events-none"></div>

          {[
            {
              title: "Credit/Debit Cards",
              subtitle: "Direct Processing",
              description: "Accept Visa, Mastercard, Amex, and more. Secure end-to-end encrypted processing.",
              details: "Supports 135+ Currencies",
              icon: <CurrencyDollarIcon className="w-10 h-10" />,
              accentColor: "blue",
              gradient: "from-blue-500 to-indigo-600"
            },
            {
              title: "UPI / Net Banking",
              subtitle: "Local Payments",
              description: "Direct settlements via PhonePe, GPay, Paytm, and all major Indian banks.",
              details: "Instant QR Settlements",
              icon: <BoltIcon className="w-10 h-10" />,
              accentColor: "green",
              gradient: "from-emerald-500 to-teal-600"
            },
            {
              title: "Direct Bank Payouts",
              subtitle: "Account to Account",
              description: "Automatic daily payouts to any Indian bank account with detailed reconciliation.",
              details: "T+1 Settlement Cycle",
              icon: <BanknotesIcon className="w-10 h-10" />,
              accentColor: "purple",
              gradient: "from-purple-500 to-pink-600"
            }
          ].map((method, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 overflow-hidden payment-method-card"
            >
              {/* Decorative Accent */}
              <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${method.gradient} opacity-5 group-hover:opacity-10 transition-opacity blur-2xl`}></div>

              {/* Icon Section */}
              <div className="relative mb-8">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] bg-gradient-to-br ${method.gradient} text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  {method.icon}
                </div>
              </div>

              {/* Content */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-${method.accentColor}-600`}>
                    {method.subtitle}
                  </span>
                  <div className={`h-1 w-1 rounded-full bg-${method.accentColor}-600`}></div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-all">
                  {method.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                  {method.description}
                </p>

                {/* Footer Tag */}
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">{method.details}</span>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
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

          {/* Desktop View (Workflow Design) */}
          <div className="hidden md:grid grid-cols-3 gap-12 relative pt-10">
            {/* Connection Line - Professional Gradient */}
            <div className="absolute top-[108px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" style={{ zIndex: 0 }}></div>
            <div className="absolute top-[108px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" style={{ zIndex: 1 }}></div>

            {[
              {
                number: "01",
                title: "Create Your Channel",
                description: "Launch your brand with a professional, high-converting storefront in minutes.",
                icon: RocketLaunchIcon,
                gradient: "from-indigo-600 to-blue-600"
              },
              {
                number: "02",
                title: "Add Payment Method",
                description: "Securely connect your bank account. No middlemen, no platform tax.",
                icon: CurrencyDollarIcon,
                gradient: "from-orange-500 to-amber-600"
              },
              {
                number: "03",
                title: "Start Earning",
                description: "Receive instant payouts directly. Keep 100% of what you earn.",
                icon: BanknotesIcon,
                gradient: "from-emerald-500 to-teal-600"
              }
            ].map((step, index) => (
              <div
                key={index}
                className="group text-center relative z-10 payment-workflow-step"
              >
                {/* Step Number Badge */}
                <div className="mb-8 relative inline-block">
                  <div className="absolute -inset-4 bg-gray-50 rounded-full blur-xl group-hover:bg-orange-50 transition-colors"></div>
                  <div className="w-44 h-44 rounded-full border-2 border-gray-100 bg-white flex items-center justify-center relative shadow-sm group-hover:border-orange-200 group-hover:shadow-xl transition-all duration-500">
                    <div className={`w-36 h-36 rounded-full bg-gradient-to-tr ${step.gradient} flex items-center justify-center transform group-hover:scale-95 transition-transform duration-500`}>
                      <step.icon className="h-16 w-16 text-white" />
                    </div>
                    {/* Floating Number */}
                    <div className="absolute -top-2 -right-2 w-14 h-14 bg-white border-4 border-gray-50 rounded-full flex items-center justify-center shadow-lg group-hover:border-orange-100">
                      <span className="text-xl font-black text-gray-900">{step.number}</span>
                    </div>
                  </div>
                </div>

                <h4 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                  {step.title}
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed max-w-[240px] mx-auto font-medium">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile View (Vertical Timeline) - "Cool" Animated Look */}
          <div className="md:hidden relative px-4 space-y-12">
            {/* Vertical Connecting Line */}
            <div className="absolute left-[39px] top-8 bottom-12 w-1 bg-gradient-to-b from-orange-200 via-amber-400 to-orange-200" style={{ zIndex: 0 }}></div>

            {[
              {
                number: "1",
                title: "Create Channel",
                subtitle: "Sign up & start building",
                icon: RocketLaunchIcon,
                gradient: "from-indigo-500 to-purple-500",
                shadow: "shadow-indigo-200"
              },
              {
                number: "2",
                title: "Add Product",
                subtitle: "Upload your digital file",
                icon: ShoppingBagIcon, // Use ShoppingIcon if defined
                fallbackIcon: CurrencyDollarIcon, // Fallback if ShoppingIcon isn't available
                gradient: "from-blue-500 to-cyan-500",
                shadow: "shadow-blue-200"
              },
              {
                number: "3",
                title: "Customize",
                subtitle: "Design your page",
                icon: Cog6ToothIcon,  // Use Cog icon
                fallbackIcon: RocketLaunchIcon,
                gradient: "from-emerald-500 to-teal-500",
                shadow: "shadow-emerald-200"
              },
              {
                number: "4",
                title: "Start Earning",
                subtitle: "Go live instantly",
                icon: BanknotesIcon,
                gradient: "from-orange-500 to-amber-500",
                shadow: "shadow-orange-200"
              }
            ].map((step, index) => (
              <div key={index} className="relative z-10 flex items-center gap-6 group">
                {/* Left Icon/Number Box */}
                <div className="relative shrink-0">
                  <div className={`w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-xl ${step.shadow} flex items-center justify-center transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                    <step.icon className={`h-6 w-6 text-gray-700`} />
                    {/* Number Badge */}
                    <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-r ${step.gradient} flex items-center justify-center text-white font-bold text-sm shadow-md ring-4 ring-white`}>
                      {step.number}
                    </div>
                  </div>
                </div>

                {/* Right Content */}
                <div className="flex-1 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:translate-x-2">
                  <h4 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h4>
                  <p className="text-gray-500 text-sm">{step.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section - Modern Design */}
        <div className="text-center">
          <Link
            href={session ? "/auth/dashboard/my-channel" : "/auth/signin?callbackUrl=/auth/dashboard/my-channel"}
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

            {/* Left Column - Text Content - Ultra Premium Design */}
            <div className="text-center lg:text-left relative py-10">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

              {/* Content Header */}
              <div className="relative mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full border border-indigo-100 mb-6">
                  <StarIcon className="h-4 w-4 text-indigo-600" />
                  <span className="text-indigo-900 font-black text-xs uppercase tracking-widest">Global Success Stories</span>
                </div>

                <h2 className="text-5xl sm:text-6xl md:text-8xl font-black text-gray-900 mb-8 leading-[0.9] tracking-tight">
                  Real People,
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                    Real Success
                  </span>
                </h2>

                <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium italic border-l-4 border-indigo-600 pl-6 bg-gradient-to-r from-indigo-50/50 to-transparent py-4 rounded-r-xl">
                  "I was a freelancer struggling to find stable income. sedStudios helped me build a scalable digital business in just 48 hours."
                </p>

                <p className="text-base text-gray-500 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                  Join 10,000+ digital entrepreneurs who've traded their 9-to-5 for a life of freedom and automated revenue.
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
                    <div className={`text-xl sm:text-2xl font-black bg-gradient-to-r ${stat.color === 'indigo' ? 'from-indigo-600 to-indigo-700' :
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

            {/* Right Column - Premium Dashboard Carousel */}
            <div className="relative h-[650px]">
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

              <div className="relative h-full bg-gray-50/50 backdrop-blur-xl rounded-[3rem] p-4 sm:p-8 border-2 border-white shadow-2xl overflow-hidden">
                {storiesWithImages.map((story, index) => (
                  <div
                    key={index}
                    className={`absolute inset-4 sm:inset-8 transition-all duration-1000 ease-out ${currentStorySlide === index ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'
                      }`}
                  >
                    {/* Top Profile Card */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 mb-6 group hover:shadow-2xl transition-all duration-500">
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-indigo-50 shadow-inner bg-indigo-50 flex items-center justify-center">
                            <img
                              src={story.imageUrl}
                              alt={story.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<span class="text-3xl font-black text-indigo-200">${story.name.charAt(0)}</span>`;
                                }
                              }}
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-4 border-white shadow-lg">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-gray-900 leading-none mb-2">{story.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider rounded-md border border-indigo-100">
                              {story.business}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Stats Card */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 border border-white shadow-lg text-center transform hover:scale-105 transition-transform">
                        <div className="text-3xl font-black text-indigo-600 mb-1">{story.revenue}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Revenue</div>
                      </div>
                      <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 border border-white shadow-lg text-center transform hover:scale-105 transition-transform">
                        <div className="text-3xl font-black text-gray-900 mb-1">{story.timePeriod}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time Period</div>
                      </div>
                    </div>

                    {/* Quote Card */}
                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden mb-6">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
                      <p className="text-lg font-bold leading-relaxed relative z-10 italic">
                        "{story.quote}"
                      </p>
                    </div>

                    {/* Before/After Progress Ribbon */}
                    <div className="bg-white rounded-full p-2 border border-gray-100 shadow-lg flex items-center justify-between px-6">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Before</span>
                        <span className="text-xs font-bold text-gray-500">{story.before}</span>
                      </div>
                      <div className="h-1 flex-1 mx-6 bg-gray-100 rounded-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 w-full animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Today</span>
                        <span className="text-xs font-black text-indigo-600">{story.after}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Navigation Indicators */}
                <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2">
                  {storiesWithImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentStorySlide(i)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${currentStorySlide === i ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-200 hover:bg-gray-300'}`}
                      aria-label={`Go to story ${i + 1}`}
                    />
                  ))}
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
