'use client';

import React from 'react';
import {
    CheckCircleIcon,
    ShieldCheckIcon,
    BoltIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    SparklesIcon,
    StarIcon,
    PlayCircleIcon,
    ArrowRightIcon,
    HomeIcon,
    ShoppingBagIcon,
    NewspaperIcon,
    InformationCircleIcon
} from '@heroicons/react/24/solid';
import VideoPreviewPlayer from '@/components/VideoPreviewPlayer';
import CountdownTimer from '@/components/CountdownTimer';
import Image from 'next/image';
import Link from 'next/link';

interface ModernFunnelTemplateProps {
    funnel: any;
    customizations: any;
    sellerInfo: any;
    productDetails: any;
    relatedProducts?: any[];
    onPurchase?: () => void;
    isPreview?: boolean;
    email?: string;
    onEmailChange?: (email: string) => void;
}

export default function ModernFunnelTemplate({
    funnel,
    customizations,
    sellerInfo,
    productDetails,
    relatedProducts = [],
    onPurchase,
    isPreview = false,
    email,
    onEmailChange,
    isSubscribed = false, // Added prop
}: ModernFunnelTemplateProps & { isSubscribed?: boolean }) {
    const [localEmail, setLocalEmail] = React.useState('');
    const effectiveEmail = email !== undefined ? email : localEmail;

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalEmail(val);
        onEmailChange?.(val);
    };

    // Defaults
    const primaryColor = customizations.primaryColor || '#8B5CF6';
    const secondaryColor = customizations.secondaryColor || '#EC4899';
    const buttonColor = customizations.buttonColor || '#FACC15';
    const fontFamily = customizations.fontFamily || 'Inter, sans-serif';

    const headline = customizations.headline || productDetails.name || 'Amazing Digital Product';
    const subheadline = customizations.subheadline || productDetails.description || 'Get instant access to this premium digital product';
    const cta = customizations.cta || customizations.buttonText || 'Buy Now';

    const fileUrl = productDetails.fileUrl || '';
    const isVideoProduct = productDetails.type === 'VIDEOS' || productDetails.type === 'VIDEO';
    const previewImage = customizations.previewImage || '';

    const showCountdown = customizations.showCountdown && customizations.countdownDate;
    const showReviews = customizations.showReviews;
    const reviewsCount = customizations.reviewsCount || 120;
    const reviewsRating = customizations.reviewsRating || 5;

    // Parse features from funnel.features or use default
    const features = funnel?.features ? JSON.parse(funnel.features) : [
        'Professional quality and design',
        'Instant download after purchase',
        'Lifetime access and updates',
        '24/7 customer support'
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans @container" style={{ fontFamily }}>

            {/* Enhanced Navigation Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 @lg:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo/Brand */}
                        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            {sellerInfo.avatar ? (
                                <Image src={sellerInfo.avatar} alt={sellerInfo.name || "Seller"} width={40} height={40} className="w-10 h-10 rounded-full object-cover" unoptimized />
                            ) : (
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                                    {(sellerInfo.name || 'S').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <h1 className="font-bold text-lg leading-tight">{sellerInfo.name || 'Digital Store'}</h1>
                                <p className="text-xs text-gray-500">Premium Digital Products</p>
                            </div>
                        </Link>

                        {/* Navigation Links - Hidden on mobile */}
                        <nav className="hidden @md:flex items-center gap-6">
                            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1">
                                <HomeIcon className="w-4 h-4" />
                                Home
                            </Link>
                            <Link href="/shop" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1">
                                <ShoppingBagIcon className="w-4 h-4" />
                                Shop
                            </Link>
                            <Link href="/blog" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1">
                                <NewspaperIcon className="w-4 h-4" />
                                Blog
                            </Link>
                            <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1">
                                <InformationCircleIcon className="w-4 h-4" />
                                About
                            </Link>
                            {sellerInfo.website && (
                                <a href={sellerInfo.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1">
                                    <GlobeAltIcon className="w-4 h-4" />
                                    Website
                                </a>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Amazon-Style Product Layout */}
            <main className="max-w-7xl mx-auto px-4 @lg:px-6 py-4 @lg:py-8">

                {/* Two-Column Grid: Image Left, Details Right on Desktop */}
                <div className="@lg:grid @lg:grid-cols-2 @lg:gap-8 space-y-4 @lg:space-y-0">

                    {/* LEFT: Product Image/Video */}
                    <div className="@lg:sticky @lg:top-20 self-start">
                        <div className="relative rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
                            <div className="relative aspect-square @lg:aspect-[4/3]" onClick={onPurchase}>
                                {isVideoProduct && fileUrl ? (
                                    <VideoPreviewPlayer
                                        videoUrl={fileUrl}
                                    />
                                ) : previewImage ? (
                                    <Image
                                        src={previewImage}
                                        alt={headline}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                                        <SparklesIcon className="w-24 h-24 text-white opacity-50" />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                                    🔴 LIVE
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Product Details */}
                    <div className="space-y-4">

                        {/* Urgency Badges */}
                        {showCountdown && customizations.countdownDate && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-red-800 text-xs font-medium mb-2">
                                    <BoltIcon className="w-4 h-4" />
                                    <span className="font-semibold">OFFER ENDS IN:</span>
                                </div>
                                <CountdownTimer
                                    targetDate={customizations.countdownDate}
                                />
                            </div>
                        )}

                        {/* Product Title */}
                        <div>
                            <h1 className="text-2xl @md:text-3xl @lg:text-4xl font-bold leading-tight mb-2">{headline}</h1>
                            <p className="text-sm @md:text-base text-gray-600">{subheadline}</p>
                        </div>

                        {/* Reviews */}
                        {showReviews && (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon
                                            key={i}
                                            className={`w-5 h-5 ${i < reviewsRating ? 'text-yellow-400' : 'text-gray-300'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-blue-600 hover:underline cursor-pointer">{reviewsCount} ratings</span>
                            </div>
                        )}

                        {/* Pricing - HIDDEN per user request */}
                        {/* <div className="border-t border-b border-gray-200 py-3">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl @lg:text-4xl font-bold text-red-600">₹{productDetails.price}</span>
                                {customizations.discountPercent > 0 && (
                                    <>
                                        <span className="text-lg text-gray-500 line-through">₹{Math.round(productDetails.price * (1 + customizations.discountPercent / 100))}</span>
                                        <span className="text-sm font-semibold text-green-600">Save ₹{Math.round(productDetails.price * customizations.discountPercent / 100)} ({customizations.discountPercent}% off)</span>
                                    </>
                                )}
                            </div>
                        </div> */}

                        {/* Buy Section */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                            {/* Email Input - Only show if not free/subscribed? Kept for now as it aids lead gen */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={effectiveEmail}
                                        onChange={handleEmailChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={onPurchase}
                                className="w-full py-3 px-6 text-base font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                style={{ backgroundColor: buttonColor, color: '#000' }}
                            >
                                {productDetails.price === 0 ? "Download Now" : (cta === 'Buy Now' ? 'Subscribe' : cta)}
                                <ArrowRightIcon className="w-5 h-5" />
                            </button>
                            <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                    <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                                    <span>Secure transaction</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <BoltIcon className="w-4 h-4 text-blue-600" />
                                    <span>Instant delivery</span>
                                </div>
                            </div>
                        </div>

                        {/* What's Included */}
                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="font-bold text-lg mb-3">What's Included:</h3>
                            <div className="space-y-2">
                                {features.map((feature: string, index: number) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Seller Info */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <Image
                                    src={sellerInfo.avatar || '/placeholder-avatar.png'}
                                    alt={sellerInfo.name}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-full"
                                    unoptimized
                                />
                                <div>
                                    <p className="font-semibold text-sm">{sellerInfo.name}</p>
                                    <p className="text-xs text-gray-500">Verified Seller</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <section className="mt-16 border-t border-gray-200 pt-12">
                        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
                        <div className="grid grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 gap-4">
                            {relatedProducts.map((product: any) => (
                                <Link
                                    key={product.id}
                                    href={`/f/${product.funnelId || product.id}`}
                                    className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    <div className="relative aspect-square bg-gray-100">
                                        {product.customizations?.previewImage ? (
                                            <Image
                                                src={product.customizations.previewImage}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                                                <ShoppingBagIcon className="w-12 h-12 text-gray-400" />
                                            </div>
                                        )}

                                        {/* Discount Badge */}
                                        {product.customizations?.discountPercent > 0 && (
                                            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                                                {product.customizations.discountPercent}% OFF
                                            </div>
                                        )}

                                        {/* Countdown Badge */}
                                        {product.customizations?.showCountdown && product.customizations?.countdownDate && (
                                            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                                <BoltIcon className="w-3 h-3" />
                                                LIVE
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{product.name || 'Digital Product'}</h3>
                                        <div className="flex items-baseline gap-2">
                                            {/* Logic: If free -> Show Free. If paid -> Show nothing or 'Subscribe' button context (here just hiding price as requested) */}
                                            {(product.product?.price === 0 || product.price === 0) ? (
                                                <p className="text-lg font-bold text-green-600">Free</p>
                                            ) : (
                                                // User asked to just show "Free" or option to subscribe. 
                                                // Use a small subscribe button or badge?
                                                // "in below cards i do not want to shjow the price , jsut show free . or option to subscribe"
                                                <div className="flex items-center gap-2 w-full">
                                                    <span className="hidden">Subscribe</span>
                                                    {/* We can't put a button inside the main Link (invalid HTML).
                                                        The whole card is a link to the product page where they can subscribe.
                                                        So we just label it appropriately. */}
                                                    <p className="text-sm font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">Subscribe</p>
                                                </div>
                                            )}
                                            {/* Hide Discount info if price is hidden */}
                                            {/* {product.customizations?.discountPercent > 0 && (
                                                <p className="text-xs text-gray-500 line-through">
                                                    ₹{Math.round((product.product?.price || product.price || 0) * (1 + product.customizations.discountPercent / 100))}
                                                </p>
                                            )} */}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* Enhanced Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 mt-16">
                <div className="max-w-7xl mx-auto px-4 @lg:px-6 py-12">
                    <div className="grid grid-cols-1 @md:grid-cols-3 gap-8">
                        {/* About Column */}
                        <div>
                            <h3 className="font-bold text-sm mb-3">About {sellerInfo.name || 'Store'}</h3>
                            <p className="text-xs text-gray-600 mb-3">
                                {sellerInfo.bio || 'Premium digital products and resources to help you succeed online.'}
                            </p>
                            <p className="text-xs text-gray-500">
                                Created with ❤️ using our platform
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="font-bold text-sm mb-3">Quick Links</h3>
                            <ul className="space-y-2 text-xs">
                                <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="text-gray-600 hover:text-gray-900">Terms of Service</Link></li>
                                <li><Link href="/refund" className="text-gray-600 hover:text-gray-900">Refund Policy</Link></li>
                                <li><Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact Us</Link></li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h3 className="font-bold text-sm mb-3">Get in Touch</h3>
                            <ul className="space-y-2 text-xs text-gray-600">
                                {sellerInfo.email && (
                                    <li className="flex items-center gap-2">
                                        <EnvelopeIcon className="w-4 h-4" />
                                        <a href={`mailto:${sellerInfo.email}`} className="hover:text-gray-900">{sellerInfo.email}</a>
                                    </li>
                                )}
                                {sellerInfo.website && (
                                    <li className="flex items-center gap-2">
                                        <GlobeAltIcon className="w-4 h-4" />
                                        <a href={sellerInfo.website} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">{sellerInfo.website}</a>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 py-4">
                    <div className="max-w-7xl mx-auto px-4 @lg:px-6">
                        <p className="text-center text-xs text-gray-500">
                            © {new Date().getFullYear()} {sellerInfo.name || 'Digital Store'}. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
