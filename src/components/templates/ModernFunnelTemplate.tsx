'use client';

import React from 'react';
import {
    CheckCircleIcon,
    ShieldCheckIcon,
    BoltIcon,
    EnvelopeIcon,
    PhoneIcon,
    GlobeAltIcon,
    ShareIcon,
    SparklesIcon,
    CurrencyDollarIcon,
    ClockIcon,
    UserGroupIcon,
    StarIcon,
    CreditCardIcon,
    PlayCircleIcon
} from '@heroicons/react/24/solid';
import VideoPreviewPlayer from '@/components/VideoPreviewPlayer';
import CountdownTimer from '@/components/CountdownTimer';
import Image from 'next/image';

interface ModernFunnelTemplateProps {
    funnel: any;
    customizations: any;
    sellerInfo: any;
    productDetails: any;
    onPurchase?: () => void;
    isPreview?: boolean;
}

export default function ModernFunnelTemplate({
    funnel,
    customizations,
    sellerInfo,
    productDetails,
    onPurchase,
    isPreview = false,
}: ModernFunnelTemplateProps) {
    // Defaults
    const primaryColor = customizations.primaryColor || '#8B5CF6';
    const secondaryColor = customizations.secondaryColor || '#EC4899';
    const fontFamily = customizations.fontFamily || 'Inter';
    const headline = customizations.headline || productDetails?.name || funnel?.name || 'Your Product Name';
    const subheadline = customizations.subheadline || productDetails?.description || funnel?.description || 'Premium digital product';
    const ctaText = customizations.cta || 'Get Started Now';
    const buttonColor = customizations.buttonColor || '#F4CE14';
    const previewImage = customizations.previewImage || '';

    const productFeatures = customizations.productFeatures || [
        'Professional quality and design',
        'Instant download after purchase',
        'Lifetime access and updates',
        '24/7 customer support'
    ];

    const isVideoProduct = funnel?.template?.type === 'VIDEOS' || productDetails?.type === 'VIDEOS';
    const fileUrl = productDetails?.fileUrl || (funnel as any)?.product?.fileUrl;

    // Pricing Logic
    const price = Number(productDetails.price) || 99;
    const discountPercent = Number(customizations.discountPercent) || 0;
    // If discount exists, calculate "original" price such that current price is the discounted one. 
    // Or simpler: current price is THE price, "original" is just a higher anchor.
    // Logic: If customizations.discountPercent > 0, Original = Price / (1 - percent/100)
    // Fallback: Price * 1.5 if no explicit discount but we want to show a sale.
    const originalPrice = discountPercent > 0
        ? Math.round(price / (1 - discountPercent / 100))
        : Math.round(price * 1.5);

    // Reviews Logic
    const showReviews = customizations.showReviews !== false; // Default to true if undefined? No, default false in editor.
    const reviewsRating = Number(customizations.reviewsRating) || 4.9;
    const reviewsCount = Number(customizations.reviewsCount) || 120;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-purple-100 selection:text-purple-900 overflow-x-hidden" style={{ fontFamily }}>

            {/* 1. Modern Glassmorphic Header */}
            <header className="sticky top-0 z-50 transition-all duration-300 backdrop-blur-md bg-white/80 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 @sm:px-6 @lg:px-8">
                    <div className="flex justify-between items-center h-16 @md:h-20">
                        {/* Brand */}
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="relative flex-shrink-0">
                                {sellerInfo.avatar ? (
                                    <Image src={sellerInfo.avatar} alt={sellerInfo.name || "User"} width={40} height={40} className="w-8 h-8 @md:w-10 @md:h-10 rounded-full object-cover ring-2 ring-offset-2 ring-gray-100" unoptimized />
                                ) : (
                                    <div
                                        className="w-8 h-8 @md:w-10 @md:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm @md:text-lg shadow-lg"
                                        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                                    >
                                        {(sellerInfo.name || 'S').charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 bg-green-500 w-2.5 h-2.5 @md:w-3 @md:h-3 rounded-full border-2 border-white"></div>
                            </div>
                            <div className="min-w-0">
                                <h1 className="font-bold text-base @md:text-lg leading-tight tracking-tight truncate">{sellerInfo.name || 'Digital Store'}</h1>
                                <p className="text-[10px] @md:text-xs text-gray-500 font-medium tracking-wide uppercase truncate">{funnel?.template?.type || 'Digital'} Product</p>
                            </div>
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden @md:flex items-center gap-8">
                            {['Product', 'Features', 'About'].map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    className="text-sm font-medium text-gray-600 hover:text-black transition-colors relative group"
                                >
                                    {item}
                                    <span
                                        className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                                        style={{ backgroundColor: primaryColor }}
                                    ></span>
                                </a>
                            ))}
                        </nav>

                        {/* CTA - Hidden on Mobile, Fixed at bottom instead? Or just hidden until scroll */}
                        <button
                            onClick={onPurchase}
                            className="hidden @md:flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm text-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
                            style={{ backgroundColor: buttonColor }}
                        >
                            <span>{ctaText}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* 2. Immersive Hero Section */}
            <section id="product" className="relative pt-12 pb-20 @lg:pt-20 @lg:pb-28 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-purple-200/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pink-200/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 @sm:px-6 @lg:px-8">
                    <div className="grid @lg:grid-cols-2 gap-12 @lg:gap-20 items-center">

                        {/* Left Content: Text & Form */}
                        <div className="order-2 @lg:order-1 space-y-6 @lg:space-y-8 animate-fade-in-up flex flex-col items-center @lg:items-start">

                            {/* Urgency: Countdown Timer */}
                            {customizations.showCountdown && customizations.countdownDate && (
                                <div className="mb-2">
                                    <div className="inline-flex flex-col items-center @lg:items-start gap-2">
                                        <p className="text-xs font-bold text-red-500 uppercase tracking-widest animate-pulse">Offer Ends In:</p>
                                        <CountdownTimer targetDate={customizations.countdownDate} theme="light" />
                                    </div>
                                </div>
                            )}

                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-semibold tracking-wide uppercase text-gray-600">
                                <SparklesIcon className="w-4 h-4 text-yellow-500" />
                                <span>Premium Content</span>
                            </div>

                            <h1 className="text-3xl @sm:text-4xl @lg:text-5xl @xl:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight text-center @lg:text-left">
                                {headline}
                            </h1>

                            <p className="text-base @sm:text-lg text-gray-600 leading-relaxed max-w-lg mx-auto @lg:mx-0 text-center @lg:text-left">
                                {subheadline}
                            </p>

                            {/* Price Tag */}
                            <div className="flex items-baseline gap-2 justify-center @lg:justify-start">
                                <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                                    ₹{price}
                                </span>
                                <span className="text-lg text-gray-400 line-through font-medium">
                                    ₹{originalPrice}
                                </span>
                                {discountPercent > 0 && (
                                    <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-xs font-bold">
                                        {discountPercent}% OFF
                                    </span>
                                )}
                                {customizations.discountCode && (
                                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-xs font-mono font-bold border border-purple-200">
                                        CODE: {customizations.discountCode}
                                    </span>
                                )}
                            </div>

                            {/* Checkout Form */}
                            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full transition-all duration-300" style={{ backgroundColor: primaryColor }}></div>
                                <div className="space-y-4 relative z-10">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email Address</label>
                                        <div className="relative">
                                            <EnvelopeIcon className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                placeholder="name@example.com"
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:bg-white transition-all outline-none"
                                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={onPurchase}
                                        className="w-full py-4 rounded-xl font-bold text-base @md:text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group-hover:brightness-105"
                                        style={{ backgroundColor: buttonColor, color: '#1a1a1a' }}
                                    >
                                        {isVideoProduct ? 'Unlock Full Video' : ctaText}
                                        <ArrowRightIcon className="w-5 h-5" />
                                    </button>

                                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2">
                                        <span className="flex items-center gap-1"><ShieldCheckIcon className="w-3 h-3 text-green-500" /> Secure Payment</span>
                                        <span className="flex items-center gap-1"><BoltIcon className="w-3 h-3 text-blue-500" /> Instant Access</span>
                                    </div>
                                </div>
                            </div>

                            {/* Social Proof */}
                            {customizations.showReviews && (
                                <div className="flex items-center gap-4 pt-2">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div
                                                key={i}
                                                className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 bg-cover bg-center"
                                                style={{ backgroundImage: `url(https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${40 + i}.jpg)` }}
                                            ></div>
                                        ))}
                                    </div>
                                    <div>
                                        <div className="flex text-yellow-500">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <StarIcon
                                                    key={i}
                                                    className={`w-4 h-4 ${i <= Math.round(reviewsRating) ? 'text-yellow-500' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">
                                            <span className="font-bold">{reviewsRating}/5</span> from {reviewsCount}+ creators
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Content: Media/Hero Image */}
                        <div className="order-1 @lg:order-2 relative">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform rotate-1 hover:rotate-0 transition-transform duration-500">
                                {isVideoProduct && fileUrl ? (
                                    <VideoPreviewPlayer
                                        videoUrl={fileUrl}
                                        previewDuration={60}
                                        isPaid={false}
                                        productName={headline}
                                        productPrice={Number(productDetails.price) || 0}
                                        currency="INR"
                                    />
                                ) : (
                                    previewImage ? (
                                        <Image src={previewImage} alt={headline} width={600} height={400} className="w-full h-auto object-cover" unoptimized />
                                    ) : (
                                        <div className="aspect-[4/3] bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                                            <PlayCircleIcon className="w-20 h-20 mb-4 opacity-50" />
                                            <p className="font-medium">Video Preview</p>
                                        </div>
                                    )
                                )}

                                {/* Floating Badge */}
                                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-800">Live Preview</span>
                                </div>
                            </div>

                            {/* Decorative Elements behind image */}
                            <div className="absolute -z-10 top-10 -right-10 w-full h-full border-2 rounded-3xl opacity-20 transform rotate-6" style={{ borderColor: primaryColor }}></div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 3. Features Grid */}
            <section id="features" className="py-20 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 @sm:px-6 @lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl @md:text-4xl font-bold text-gray-900 mb-4">Everything you need included</h2>
                        <p className="text-lg text-gray-600">We've packed this product with everything you need to succeed. No hidden fees, no extra upsells.</p>
                    </div>

                    <div className="grid @md:grid-cols-3 gap-8">
                        {productFeatures.map((feature: string, idx: number) => (
                            <div key={idx} className="bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 group">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-white shadow-md group-hover:scale-110 transition-transform"
                                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                                >
                                    <CheckCircleIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.split(' ').slice(0, 3).join(' ')}...</h3>
                                <p className="text-gray-600 leading-relaxed">{feature}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. About & Seller Section */}
            <section id="about" className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-3xl p-8 @md:p-12 shadow-xl border border-gray-100">
                        <div className="flex flex-col @md:flex-row items-center gap-8 @md:gap-12">
                            <div className="relative shrink-0">
                                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-pink-500 shadow-lg">
                                    <Image
                                        src={sellerInfo.avatar || `https://ui-avatars.com/api/?name=${sellerInfo.name}&background=random`}
                                        alt={sellerInfo.name || "Seller"}
                                        width={128}
                                        height={128}
                                        className="w-full h-full rounded-full object-cover border-4 border-white"
                                        unoptimized
                                    />
                                </div>
                                <div className="absolute bottom-1 right-1 bg-blue-500 text-white p-1.5 rounded-full border-4 border-white shadow-sm" title="Verified Seller">
                                    <CheckCircleIcon className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="text-center @md:text-left flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Meet the Creator</h2>
                                <p className="text-lg font-semibold text-gray-800 mb-4">{sellerInfo.name}</p>
                                <p className="text-gray-600 leading-relaxed mb-6 italic">
                                    "{sellerInfo.bio || 'I transform complex ideas into simple, actionable digital products that help you grow.'}"
                                </p>

                                <div className="flex flex-wrap justify-center @md:justify-start gap-4">
                                    {sellerInfo.website && (
                                        <a href={sellerInfo.website} target="_blank" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors bg-gray-100 px-4 py-2 rounded-full hover:bg-purple-50">
                                            <GlobeAltIcon className="w-4 h-4" /> Website
                                        </a>
                                    )}
                                    <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors bg-gray-100 px-4 py-2 rounded-full hover:bg-purple-50">
                                        <EnvelopeIcon className="w-4 h-4" /> Contact
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Minimal Footer */}
            <footer className="bg-white border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                        {/* Payment Icons */}
                        <div className="h-8 w-12 bg-gray-200 rounded"></div>
                        <div className="h-8 w-12 bg-gray-200 rounded"></div>
                        <div className="h-8 w-12 bg-gray-200 rounded"></div>
                    </div>
                    <p className="text-sm text-gray-500">© {new Date().getFullYear()} {sellerInfo.name}. All rights reserved.</p>
                    <p className="text-xs text-gray-400 mt-2">Powered by YourPlatform</p>
                </div>
            </footer>

            {/* Helper Icons */}
            <ArrowRightIcon className="hidden" />
        </div>
    );
}

function ArrowRightIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
    );
}
