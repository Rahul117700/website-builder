'use client';
import Link from 'next/link';
import Image from 'next/image';
import Carousel from 'react-material-ui-carousel';
import { Paper, Button, Grid } from '@mui/material';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

import { 
  ArrowRightIcon, 
  CheckCircleIcon, 
  GlobeAltIcon, 
  ChartBarIcon, 
  CreditCardIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  CubeIcon,
  ShoppingBagIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightStartOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useSession, signOut } from 'next-auth/react';
import { useState ,useEffect ,useRef} from 'react';
import gsap from "gsap";
import React from 'react';

export default function HomePage() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic frontend content state
  const [frontendContent, setFrontendContent] = useState<any>(null);
  useEffect(() => {
    fetch('/api/admin/frontend-content')
      .then(res => res.ok ? res.json() : Promise.reject('Failed'))
      .then(data => setFrontendContent(data.data || {}))
      .catch(() => setFrontendContent(null));
  }, []);

  // Fallbacks if no dynamic content
  const heroTitle = frontendContent?.heroTitle || 'Everything you need to launch your \nbusiness website';
  const heroSubtitle = frontendContent?.heroSubtitle || 'Up to 75% off — in minutes\nCutting-edge templates powered by modern tech like Three.js, VR, AR & more';
  const heroTagline = frontendContent?.heroTagline || 'Investing in the Future of Startups';
  const heroCTA = frontendContent?.heroCTA || 'Start now';
  const features = frontendContent?.features || [
    {
      name: 'Multiple Templates',
      description: 'Choose from a variety of professionally designed templates for different industries.',
      icon: CubeIcon,
    },
    {
      name: 'Custom Domains',
      description: 'Connect your own domain or use our free subdomain for your website.',
      icon: GlobeAltIcon,
    },
    {
      name: 'Analytics Dashboard',
      description: 'Track visitors, page views, and user behavior with built-in analytics.',
      icon: ChartBarIcon,
    },
    {
      name: 'Mobile Responsive',
      description: 'All websites are fully responsive and look great on any device.',
      icon: DevicePhoneMobileIcon,
    },
    {
      name: 'Secure Hosting',
      description: 'Your website is hosted on secure, reliable servers with 99.9% uptime.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Affordable Plans',
      description: 'Flexible pricing plans to fit your needs, from free to premium.',
      icon: CreditCardIcon,
    },
  ];
  const testimonials = frontendContent?.testimonials || [
    {
      content: 'This platform made creating a website for my restaurant so easy. I was able to set up online reservations in just a few hours!',
      author: 'Sarah Johnson',
      role: 'Restaurant Owner',
      image: '/testimonials/sarah.jpg',
    },
    {
      content: 'As a small pharmacy owner, I needed a professional website without the hassle. This platform delivered exactly what I needed.',
      author: 'Dr. Michael Chen',
      role: 'Pharmacy Owner',
      image: '/testimonials/michael.jpg',
    },
    {
      content: 'The analytics features have been invaluable for understanding my customers and improving my business.',
      author: 'Alex Rodriguez',
      role: 'Marketing Consultant',
      image: '/testimonials/alex.jpg',
    },
  ];

  const templates = [
    {
      id: 'general',
      name: 'General Business',
      description: 'Perfect for small businesses, consultants, and service providers.',
      image: '/templates/general.jpg',
      color: 'blue',
    },
    {
      id: 'restaurant',
      name: 'Restaurant',
      description: 'Showcase your menu, take reservations, and highlight your culinary offerings.',
      image: '/templates/restaurant.jpg',
      color: 'orange',
    },
    {
      id: 'pharma',
      name: 'Pharmacy',
      description: 'Ideal for pharmacies, medical clinics, and healthcare providers.',
      image: '/templates/pharma.jpg',
      color: 'indigo',
    },
  ];

// GSAAP
 const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const logoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const taglineRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    tl.fromTo("#loadingScreen", { opacity: 0 }, { opacity: 1, duration: 0.6 })
      .fromTo(
        logoRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1 }
      )
      .fromTo(
        taglineRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1 },
        "-=0.6"
      )
      .to("#loadingScreen", {
        opacity: 0,
        duration: 1,
        delay: 1,
        onComplete: () => setLoading(false),
      });

    if (!loading) {
      const heroTl = gsap.timeline({ defaults: { ease: "power2.out" } });

      heroTl.fromTo(
        heroRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2 }
      )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1 },
          "-=0.8"
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1 },
          "-=0.7"
        )
        .fromTo(
          buttonsRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 1 },
          "-=0.6"
        );
    }
  }, [loading]);


  return (
    <div className="bg-white dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white text-black shadow-md sticky top-0 z-50">
  <div className="w-full px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      <div className="flex items-center gap-3">
        <div className="rounded-full border-2 border-gray-300 p-1 flex items-center justify-center h-10 w-10 bg-gray-100">
          <span className="font-bold text-lg text-black">B</span>
        </div>
        <span className="hidden sm:inline-block font-semibold text-lg">Website Builder</span>
      </div>
      <nav className="hidden md:flex gap-8 text-sm font-medium">
        <Link href="#features" className="hover:text-purple-600 transition">Features</Link>
        <Link href="#templates" className="hover:text-purple-600 transition">Templates</Link>
        <Link href="#pricing" className="hover:text-purple-600 transition">Pricing</Link>
      </nav>
      <div className="hidden md:flex items-center gap-4">
        {session?.user ? (
          <div className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-full border border-gray-200 shadow-sm">
            <Link href="/auth/dashboard" className="bg-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:opacity-90 transition-shadow shadow-md hover:shadow-lg">Dashboard</Link>
            {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name || session.user.email || 'User'}
                className="h-9 w-9 rounded-full border border-gray-300"
              />
            )}
            <div className="text-sm leading-tight text-left">
              <p className="font-semibold text-black truncate max-w-[150px]">{session.user.name}</p>
              <p className="text-xs text-gray-500 truncate max-w-[150px]">{session.user.email}</p>
            </div>
            <button onClick={() => signOut()} className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:opacity-90 transition-shadow shadow-md hover:shadow-lg flex items-center gap-2">
              <span>Sign out</span>
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <>
            <Link href="/auth/signin" className="hover:text-purple-600 transition">Sign in</Link>
            <Link href="/auth/signup" className="bg-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:opacity-90">Get Started</Link>
          </>
        )}
      </div>
      <button
        className="md:hidden p-2 rounded hover:bg-gray-100 transition"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
    </div>
  </div>
  {mobileMenuOpen && (
    <div className="fixed inset-0 z-50 bg-white flex justify-end">
      <div className="w-3/4 max-w-xs bg-white text-black h-full shadow-lg p-6 flex flex-col">
        <button
          className="self-end mb-6 p-2 rounded hover:bg-gray-100 transition"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <nav className="flex flex-col gap-4 mb-6">
          <Link href="#features" className="hover:text-purple-600" onClick={() => setMobileMenuOpen(false)}>Features</Link>
          <Link href="#templates" className="hover:text-purple-600" onClick={() => setMobileMenuOpen(false)}>Templates</Link>
          <Link href="#pricing" className="hover:text-purple-600" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
        </nav>
        <div className="flex flex-col gap-3">
          {session?.user ? (
            <>
              <Link href="/auth/dashboard" className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold text-center" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || session.user.email || 'User'}
                  className="h-9 w-9 rounded-full self-center border"
                />
              )}
              <div className="text-center">
                <p className="font-medium text-black">{session.user.name}</p>
                <p className="text-xs text-gray-500">{session.user.email}</p>
              </div>
              <button onClick={() => { setMobileMenuOpen(false); signOut(); }} className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold text-center flex items-center gap-2">
                <span>Sign out</span>
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="hover:text-purple-600" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
              <Link href="/auth/signup" className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold text-center" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      </div>
      <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
    </div>
  )}
</header>


      {/* Hero Section */}
      {loading && (
        <div id="loadingScreen" className="loadingScreen">
          <div id="logo" ref={logoRef} className="logo">
            Website builder
          </div>
          <div id="tagline" ref={taglineRef} className="tagline">
            Investing in the Future of Startups
          </div>
        </div>
      )}
{!loading && <div>
  <section ref={heroRef} className="w-full pt-20 pb-24 bg-white">
  <div className="w-full px-6 lg:px-20 flex flex-col lg:flex-row items-center justify-between gap-12">
    {/* Left Content */}
    {/* <div className="w-full lg:w-1/2 relative">
      <div className="relative bg-[#f5f5ff] rounded-2xl p-6 shadow-xl">
        <div className="absolute top-[-20px] left-8 bg-purple-300 h-6 w-24 rounded-t-md" />
        <div className="absolute top-3 right-4 bg-white border border-gray-300 rounded-md px-3 py-1 text-sm flex items-center gap-1">
          <span className="text-green-500">🔒</span>.COM
        </div>

        <div className="mt-8">
          <div className="text-indigo-600 text-sm font-medium mb-1">Text</div>
          <div className="border-2 border-blue-400 p-4 rounded-md">
            <p className="text-3xl font-bold text-purple-700">Three. Two. Online</p>
            <p className="text-sm text-gray-500 mt-2">Curated portfolio</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-300 h-24 rounded-md" />
            <div className="bg-gray-400 h-24 rounded-md" />
          </div>
        </div>

        <div className="absolute bottom-[-50px] right-[-20px] bg-gradient-to-tr from-violet-600 to-indigo-500 p-1 rounded-xl rotate-2 shadow-xl">
          <div className="bg-white rounded-md overflow-hidden p-2 w-36 text-center">
            <Image src="/testimonials/pranay.jpg" width={140} height={140} className="rounded-md" alt="Client" />
            <p className="text-xs font-semibold mt-2 text-black leading-tight">Rahul<br/>founder</p>
          </div>
        </div>
      </div>
    </div> */}
<div className="w-full lg:w-1/2 relative">
  <div className="relative bg-[#f5f5ff] rounded-2xl p-6 shadow-xl">
    <div className="absolute top-[-20px] left-8 bg-purple-300 h-6 w-24 rounded-t-md" />
    <div className="absolute top-3 right-4 bg-white border border-gray-300 rounded-md px-3 py-1 text-sm flex items-center gap-1">
      <span className="text-green-500">🔒</span>.COM
    </div>

    <div className="mt-8">
      <div className="text-indigo-600 text-sm font-medium mb-1">Your Business. Your Website.</div>
      <div className="border-2 border-blue-400 p-4 rounded-md">
        <p className="text-2xl sm:text-3xl font-bold text-purple-700">Launch in Minutes.</p>
        <p className="text-sm text-gray-500 mt-2">High-converting, next-gen templates powered by Three.js, VR & AR</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* Embedded YouTube video 1 */}
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            className="w-full h-full rounded-md"
            src="https://www.youtube.com/embed/y62DGF7AeXQ?autoplay=1&mute=1&controls=0&loop=1&playlist=y62DGF7AeXQ"
            title="Tech Demo 1"
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        </div>

        {/* Embedded YouTube video 2 */}
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            className="w-full h-full rounded-md"
            src="https://www.youtube.com/embed/Ap49PvUMpu4?autoplay=1&mute=1&controls=0&loop=1&playlist=Ap49PvUMpu4"
            title="Tech Demo 2"
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>

    <div className="absolute bottom-[-50px] right-[-20px] bg-gradient-to-tr from-violet-600 to-indigo-500 p-1 rounded-xl rotate-2 shadow-xl">
  <div className="bg-white rounded-md overflow-hidden p-2 w-36 text-center">
    <Image src="https://media.licdn.com/dms/image/v2/D5603AQEFgaWqdPsvwg/profile-displayphoto-shrink_800_800/B56ZRjy6ShHoAc-/0/1736841080391?e=1756339200&v=beta&t=t9QVyZfrVP6BAeob4L0NHMdifSZ_HFEdJucIHvnWkPA" width={140} height={140} className="rounded-md" alt="Client" />
    <p className="text-xs font-semibold mt-2 text-black leading-tight">Rahul<br />Founder</p>
    <p className="text-[10px] text-gray-500 mt-1 italic">"Building tools for modern businesses."</p>
    <p className="text-[10px] text-green-600 mt-1 font-medium">🚀 250+ websites created</p>
  </div>
</div>
  </div>
</div>

    {/* Right Content */}
    <div className="max-w-xl text-left">
      <h1 ref={titleRef} className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
      {heroTitle}
      </h1>
      <p className="mt-4 text-lg text-gray-700">
        {heroSubtitle}
      </p>

      <ul className="mt-6 space-y-2 text-gray-600">
       
        <li className="flex items-center gap-2">
        ✅ Choose from stunning tech-driven templates
        </li>
        <li className="flex items-center gap-2">
        ✅ Free subdomain setup
        </li>
        <li className="flex items-center gap-2">
        ✅ Custom domain support
        </li>
      </ul>

      <div className="mt-6">

       
        <p className="text-3xl font-extrabold text-gray-900"> 🔥 {heroCTA} <span className="text-sm font-normal">— includes website, dashboard, analytics & more</span></p>
        {/* <p className="text-green-600 font-medium mt-1">+2 months free</p> */}
      </div>

      <div className="mt-6 flex gap-4 flex-wrap">
        <Link href="/auth/signup" className="bg-purple-600 text-white px-6 py-3 rounded-md font-semibold text-base shadow-md hover:bg-purple-700">
          {heroCTA}
        </Link>
        <div className="bg-purple-100 text-purple-700 px-4 py-3 rounded-md font-mono text-sm">
          01 : 01 : 50 : 54
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-500">30-day money-back guarantee 💰</p>
    </div>
  </div>
</section>

 {/* Features Section */}
 <section id="features" className="py-24 bg-white">
  <div className="w-full px-6 lg:px-20">
    <div className="text-left max-w-3xl">
      <h2 className="text-4xl font-extrabold text-gray-900">
        Everything You Need to Succeed Online
      </h2>
      <p className="mt-4 text-lg text-gray-600">
        Our platform provides all the tools you need to create a professional website and grow your online presence.
      </p>
    </div>

    <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
      {features.map((feature: any, idx: number) => (
        <div
          key={feature.name + idx}
          className="bg-[#f5f5ff] rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition"
        >
          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              {(feature.icon ? feature.icon : CubeIcon) &&
                React.createElement(feature.icon ? feature.icon : CubeIcon, { className: "h-6 w-6 text-purple-600", "aria-hidden": "true" })}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {feature.name}
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

{/* Templates Section */}
<section id="templates" className="py-24 bg-gray-50">
  <div className="w-full px-6 lg:px-20">
    <div className="text-left max-w-3xl">
      <h2 className="text-4xl font-extrabold text-gray-900">
        Beautiful Templates for Every Industry
      </h2>
      <p className="mt-4 text-lg text-gray-600">
        Choose from our professionally designed templates and customize them to match your brand.
      </p>
      <div className="mt-4">
        <Link
          href="/templates"
          className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center"
        >
          Go to Templates
          <ArrowRightIcon className="ml-2 h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>

    <div className="mt-16">
      <Carousel
        autoPlay
        animation="slide"
        indicators={false}
        navButtonsAlwaysVisible
        cycleNavigation
        interval={5000}
      >
        {Array.from({ length: Math.ceil(templates.length / 2) }, (_, i) => (
          <Grid container spacing={4} key={i} justifyContent="center">
            {templates.slice(i * 2, i * 2 + 2).map((template) => (
              <Grid item xs={12} sm={6} key={template.id} style={{ display: 'flex', justifyContent: 'center' }}>
                <Paper style={{ width: '100%', maxWidth: 520 }} className="p-4">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-xl transition overflow-hidden">
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      <span className="text-lg font-medium text-purple-600">{template.name} Preview</span>
                    </div>
                    <div className="p-6 flex flex-col justify-between h-full">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{template.name}</h3>
                        <p className="mt-2 text-sm text-gray-600">{template.description}</p>
                      </div>
                      <div className="mt-4">
                        <Link
                          href={`/auth/dashboard?template=${template.id}`}
                          className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium"
                        >
                          Select Template
                          <ArrowRightIcon className="ml-2 h-4 w-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ))}
      </Carousel>
    </div>
  </div>
</section>




{/* Testimonials Section */}
<section className="py-24 bg-white dark:bg-slate-900">
  <div className="w-full px-6 lg:px-20">
    <div className="text-left max-w-3xl mx-auto">
      <h2 className="text-4xl font-extrabold text-purple-600 dark:text-purple-400">
        What Our Customers Say
      </h2>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
        Don't just take our word for it. Here's what our customers have to say about our platform.
      </p>
    </div>
    <div className="mt-16 grid gap-8 md:grid-cols-3">
      {testimonials.map((testimonial: any, index: number) => (
        <div key={index} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 text-xs">{testimonial.author?.charAt(0)}</span>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">{testimonial.author}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{testimonial.role}</p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.content}"</p>
        </div>
      ))}
    </div>
  </div>
</section>

{/* Pricing Section */}
<section id="pricing" className="py-24 bg-gray-50 dark:bg-slate-800">
  <div className="w-full px-6 lg:px-20">
    <div className="text-left max-w-3xl mx-auto">
      <h2 className="text-4xl font-extrabold text-purple-600 dark:text-purple-400">
        Simple, Transparent Pricing
      </h2>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
        Choose the plan that's right for you. All plans include a 14-day free trial.
      </p>
    </div>
    <div className="mt-16 grid gap-8 md:grid-cols-3">
      {/* Free Plan */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6">
          <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Free</h3>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Perfect for getting started</p>
          <p className="mt-8">
            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">₹0</span>
            <span className="text-base font-medium text-gray-500 dark:text-gray-400">/month</span>
          </p>
          <ul className="mt-6 space-y-4">
            {['1 website', 'Subdomain included', 'Basic analytics', 'Community support'].map((item, i) => (
              <li key={i} className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                <p className="ml-3 text-base text-gray-600 dark:text-gray-300">{item}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link href="/auth/signup" className="w-full text-purple-600 hover:text-purple-800 font-medium">
              Start for Free
            </Link>
          </div>
        </div>
      </div>

      {/* Pro Plan */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border-2 border-purple-600 dark:border-purple-400 overflow-hidden">
        <div className="p-6">
          <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Pro</h3>
          <p className="mt-4 text-gray-600 dark:text-gray-300">For growing businesses</p>
          <p className="mt-8">
            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">₹999</span>
            <span className="text-base font-medium text-gray-500 dark:text-gray-400">/month</span>
          </p>
          <ul className="mt-6 space-y-4">
            {['5 websites', 'Custom domain', 'Advanced analytics', 'Priority support', 'Booking system'].map((item, i) => (
              <li key={i} className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                <p className="ml-3 text-base text-gray-600 dark:text-gray-300">{item}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link href="/auth/signup?plan=pro" className="w-full text-purple-600 hover:text-purple-800 font-medium">
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>

      {/* Business Plan */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6">
          <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Business</h3>
          <p className="mt-4 text-gray-600 dark:text-gray-300">For larger organizations</p>
          <p className="mt-8">
            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">₹2499</span>
            <span className="text-base font-medium text-gray-500 dark:text-gray-400">/month</span>
          </p>
          <ul className="mt-6 space-y-4">
            {['Unlimited websites', 'Multiple custom domains', 'Advanced analytics & reporting', 'Dedicated support', 'API access'].map((item, i) => (
              <li key={i} className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                <p className="ml-3 text-base text-gray-600 dark:text-gray-300">{item}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link href="/auth/signup?plan=business" className="w-full text-purple-600 hover:text-purple-800 font-medium">
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* CTA Section */}
<section className="py-24 bg-purple-600 dark:bg-purple-700">
  <div className="w-full px-6 lg:px-20">
    <div className="text-center max-w-3xl mx-auto">
      <h2 className="text-4xl font-extrabold text-white">
        Ready to build your website?
      </h2>
      <p className="mt-4 text-xl text-purple-100">
        Get started today with our easy-to-use platform and create a website you'll be proud of.
      </p>
      <div className="mt-8">
        <Link
          href="/auth/signup"
          className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50 md:text-lg"
        >
          Get Started for Free
          <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  </div>
</section>

</div>
}

     

      <style jsx>{`
        .loadingScreen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .logo {
          color: black;
          font-size: 3rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .tagline {
          color: black;
          font-size: 1.5rem;
        }
      `}</style>
     

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link href="#features" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#templates" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Support</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link href="#" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link href="#" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link href="#" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 dark:border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-base text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Website Builder SaaS. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
