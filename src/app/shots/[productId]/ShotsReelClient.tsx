'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    ChevronLeftIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
    PlayIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    ShareIcon,
    ArrowPathRoundedSquareIcon,
    MusicalNoteIcon,
    XMarkIcon,
    PaperAirplaneIcon,
    LockClosedIcon,
    StarIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    FilmIcon
} from '@heroicons/react/24/solid';
import { 
    HeartIcon 
} from '@heroicons/react/24/solid';
import { 
    HeartIcon as HeartOutlineIcon 
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface ShotsReelClientProps {
    product: any;
    hasAccess: boolean;
    isLiked: boolean;
    isFollowing?: boolean;
    userId?: string;
    userImage?: string | null;
    userName?: string | null;
    userEmail?: string | null;
}

const SHOT_DURATION = 30; // 30 seconds per shot

export default function ShotsReelClient({ product, hasAccess: initialHasAccess, isLiked: initialLiked, isFollowing: initialFollowing, userId, userImage, userName, userEmail }: ShotsReelClientProps) {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    
    // Core state
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentShot, setCurrentShot] = useState(0);
    const currentShotRef = useRef(0);
    const [totalShots, setTotalShots] = useState(1);
    const [isFitMode, setIsFitMode] = useState(false);
    const [hasAccess, setHasAccess] = useState(initialHasAccess);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    
    // Check 5 guest shots limit
    useEffect(() => {
        if (!userId) {
            try {
                const viewedShots = JSON.parse(localStorage.getItem('unauth_shot_ids') || '[]');
                if (!viewedShots.includes(product.id)) {
                    viewedShots.push(product.id);
                    localStorage.setItem('unauth_shot_ids', JSON.stringify(viewedShots));
                }
                if (viewedShots.length > 5) {
                    setShowLoginPrompt(true);
                    setIsPlaying(false);
                    if (videoRef.current) {
                        videoRef.current.pause();
                    }
                }
            } catch (e) {
                console.error('Failed to parse unauth_shot_ids', e);
            }
        }
    }, [userId, product.id]);

    // Following
    const [isFollowing, setIsFollowing] = useState<boolean>(initialFollowing || false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    
    // Likes
    const [isLiked, setIsLiked] = useState<boolean>(initialLiked || false);
    const [likesCount, setLikesCount] = useState<number>(product.likes?.length || 0);

    // Comments State
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    // Interaction UX
    const [isDragging, setIsDragging] = useState(false);

    // Initial load video properties
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            let vidDuration = videoRef.current.duration;
            
            // Handle Chrome Infinity duration bug for long streams
            if (vidDuration === Infinity && videoRef.current.seekable.length > 0) {
                vidDuration = videoRef.current.seekable.end(0);
            }
            
            // If duration is fundamentally missing or still loading, don't incorrectly lock to 1 shot.
            if (!vidDuration || isNaN(vidDuration) || vidDuration === Infinity) return;
            
            setDuration(vidDuration);
            setTotalShots(Math.max(1, Math.ceil(vidDuration / SHOT_DURATION)));
        }
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const currentTime = videoRef.current.currentTime;
        let vidDuration = videoRef.current.duration;
        const synchronousShot = currentShotRef.current;
        
        if (vidDuration === Infinity && videoRef.current.seekable.length > 0) {
            vidDuration = videoRef.current.seekable.end(0);
        }

        // Catch dynamically late-resolving durations!
        if (vidDuration && !isNaN(vidDuration) && vidDuration !== Infinity) {
            const calculatedShots = Math.max(1, Math.ceil(vidDuration / SHOT_DURATION));
            setTotalShots(prev => prev !== calculatedShots ? calculatedShots : prev);
            setDuration(prev => prev !== vidDuration ? vidDuration : prev);
        }

        if (!vidDuration || isNaN(vidDuration)) return;

        const shotStartTime = synchronousShot * SHOT_DURATION;
        const shotEndTime = (synchronousShot + 1) * SHOT_DURATION;

        if (currentTime >= shotEndTime || (currentTime >= vidDuration - 0.2)) {
            // Synchronously lock out duplicate firings
            if (synchronousShot < totalShots - 1) {
                currentShotRef.current = synchronousShot + 1;
                changeShot(synchronousShot + 1);
            } else {
                currentShotRef.current = 0;
                changeShot(0);
            }
        } else if (currentTime < shotStartTime - 0.5) {
            videoRef.current.currentTime = shotStartTime;
        }

        if (progressBarRef.current) {
            const activeDuration = Math.min(SHOT_DURATION, vidDuration - shotStartTime);
            const relativeTime = currentTime - shotStartTime;
            const pct = Math.min(100, Math.max(0, (relativeTime / activeDuration) * 100));
            progressBarRef.current.style.width = `${pct}%`;
        }
    };

    const goToNextShot = () => {
        if (currentShotRef.current < totalShots - 1) {
            changeShot(currentShotRef.current + 1);
        }
    };

    const goToPrevShot = () => {
        if (currentShotRef.current > 0) {
            changeShot(currentShotRef.current - 1);
        }
    };

    const changeShot = (index: number) => {
        currentShotRef.current = index;
        setCurrentShot(index);
        
        if (index >= 10 && product.isSubscriberOnly && !hasAccess) {
            if (videoRef.current) videoRef.current.pause();
            setIsPlaying(false);
            return;
        }
        
        if (videoRef.current) {
            videoRef.current.currentTime = index * SHOT_DURATION;
            videoRef.current.play().catch(console.error);
            setIsPlaying(true);
        }
    };

    const togglePlay = () => {
        if (isDragging) return; 
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play().catch(console.error);
                setIsPlaying(true);
            }
        }
    };

    const toggleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!userId) {
            router.push('/auth/signin');
            return;
        }
        
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

        try {
            await fetch(`/api/channels/${product.channelId}/products/${product.id}/like`, { method: 'POST' });
        } catch {
            setIsLiked(isLiked);
            setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (e.deltaY > 0) goToNextShot();
        else if (e.deltaY < 0) goToPrevShot();
    };

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await fetch(`/api/channels/${product.channelId}/products/${product.id}/comments`);
                const data = await res.json();
                if (data.comments) setComments(data.comments);
            } catch (err) {
                console.error("Failed to load comments", err);
            }
        };
        fetchComments();
    }, [product.channelId, product.id]);

    const postComment = async () => {
        if (!newComment.trim() || isSubmittingComment || !userId) return;
        setIsSubmittingComment(true);
        
        try {
            const res = await fetch(`/api/channels/${product.channelId}/products/${product.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment })
            });
            const data = await res.json();
            if (data.success) {
                setComments([data.comment, ...comments]);
                setNewComment("");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().then(() => setIsPlaying(true)).catch(e => {
                console.log("Autoplay blocked:", e);
                setIsPlaying(false);
            });
        }
    }, [product.videoUrl]);

    const formatPrice = (price: any, currency: string = 'INR') => {
        if (!price || parseFloat(price) === 0) return 'Free';
        const numPrice = parseFloat(price);
        if (currency === 'USD') return `$${numPrice.toFixed(2)}`;
        if (currency === 'EUR') return `€${numPrice.toFixed(2)}`;
        return `₹${numPrice.toFixed(2)}`;
    };

    // Handle Direct Razorpay Subscription Payment
    const handleSubscribe = async () => {
        if (!userId) {
            router.push('/auth/signin');
            return;
        }

        if (!product.channel?.id || isSubscribing) return;

        setIsSubscribing(true);
        try {
            const response = await fetch(`/api/channels/${product.channel.id}/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ duration: '1month' }),
            });

            if (!response.ok) throw new Error('Failed to create order');
            const data = await response.json();

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
                    amount: Math.round(data.amount * 100),
                    currency: data.currency,
                    name: product.channel.name,
                    description: 'Channel Subscription',
                    order_id: data.orderId,
                    handler: async function (paymentResponse: any) {
                        const verifyRes = await fetch(`/api/channels/${product.channel.id}/subscribe/verify`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: paymentResponse.razorpay_order_id,
                                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                                razorpay_signature: paymentResponse.razorpay_signature,
                            }),
                        });

                        if (verifyRes.ok) {
                            setHasAccess(true);
                            // If they just paid on shot 10, resume playback seamlessly!
                            if (videoRef.current) videoRef.current.play();
                            setIsPlaying(true);
                        } else {
                            alert('Payment verification failed.');
                        }
                    },
                    prefill: { email: userEmail || '', name: userName || '' },
                    theme: { color: '#3b82f6' },
                };
                const razorpay = (window as any).Razorpay(options);
                razorpay.open();
            };
            document.body.appendChild(script);
        } catch (error) {
            console.error('Error subscribing:', error);
            alert('Failed to initialize subscription check-out.');
        } finally {
            setIsSubscribing(false);
        }
    };

    // Handle Follow
    const handleFollow = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!userId) {
            router.push('/auth/signin');
            return;
        }

        if (!product.channel?.id || isFollowLoading) return;

        setIsFollowLoading(true);
        try {
            const response = await fetch(`/api/channels/${product.channel.id}/follow`, {
                method: 'POST',
            });
            if (response.ok) {
                const data = await response.json();
                setIsFollowing(data.isFollowing);
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        } finally {
            setIsFollowLoading(false);
        }
    };

    const isNextLocked = (currentShot + 1 >= 10) && product.isSubscriberOnly && !hasAccess;
    const overlayVisible = currentShot >= 10 && product.isSubscriberOnly && !hasAccess;

    const channelFallbackAvatar = "/hero/avatar.svg";
    const creatorName = product.channel?.name || "Channel";
    const creatorHandle = `@${product.channel?.slug || 'creator'}`;

    return (
        <div 
            className="fixed inset-0 bg-[#0f0f0f] z-[100] flex justify-center items-center overflow-hidden" 
            onWheel={handleWheel}
        >
            {/* Initial Swipe Instruction Overlay */}
            {/* No absolute swipe overlay - shown inline in the HUD instead */}


            {/* Header (Mute Button) */}
            <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-50 flex justify-between items-center pointer-events-none">
                <button 
                    onClick={(e) => { e.stopPropagation(); router.back() }}
                    className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white pointer-events-auto hover:bg-white/20 transition-all shadow-lg hidden sm:block"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div className="flex-1"></div>
                <div className="flex gap-4 pointer-events-auto">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted) }}
                        className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all shadow-lg border border-white/10"
                    >
                        {isMuted ? <SpeakerXMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <SpeakerWaveIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </button>
                    {/* Mobile Back Button built into header on mobile for easy reach */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); router.back() }}
                        className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all shadow-lg border border-white/10 sm:hidden"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Framer Motion Video Container for Drag Snap sliding */}
            <motion.div 
                ref={containerRef}
                drag={!showComments ? "y" : false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.4}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={(event, info) => {
                    setTimeout(() => setIsDragging(false), 50);
                    const threshold = 50; 
                    if (info.offset.y < -threshold) goToNextShot();
                    else if (info.offset.y > threshold) goToPrevShot();
                }}
                className="relative w-full h-[100dvh] sm:w-[480px] sm:h-[95dvh] sm:max-h-[900px] sm:rounded-2xl bg-black flex-shrink-0 cursor-pointer shadow-black/50 shadow-2xl overflow-hidden"
                onClick={() => !showComments && togglePlay()}
            >
                {/* Instant visual flash to fake changing to "next video" */}
                <AnimatePresence>
                    <motion.div
                        key={`flash-${currentShot}`}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="absolute inset-0 bg-black z-40 pointer-events-none"
                    />
                </AnimatePresence>

                {/* Video Sub-container fixed to 100% */}
                <div className="absolute inset-0 w-full h-full bg-black">
                    <video
                        ref={videoRef}
                        src={product.videoUrl}
                        className={`w-full h-full ${isFitMode ? 'object-contain' : 'object-cover'} transition-all duration-300`}
                        loop={false}
                        muted={isMuted}
                        playsInline
                        autoPlay
                        onLoadedMetadata={handleLoadedMetadata}
                        onDurationChange={handleLoadedMetadata}
                        onCanPlay={handleLoadedMetadata}
                        onTimeUpdate={handleTimeUpdate}
                        poster={product.previewImage}
                    />
                </div>

                {/* YouTube Shorts Gradient Screen Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-t from-black via-black/30 to-transparent z-10 pointer-events-none"></div>

                {/* Left Side Navigation Dots Indicator (Desktop only) */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex-col gap-1.5 z-40 px-1 py-3 hidden sm:flex">
                    {Array.from({ length: Math.min(15, totalShots) }).map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`w-1 rounded-full transition-all ${currentShot === idx ? 'h-5 bg-white shadow-md' : 'h-1.5 bg-white/30'}`}
                            title={`Shot ${idx + 1}`}
                        />
                    ))}
                    {totalShots > 15 && <div className="w-1.5 h-1.5 rounded-full bg-white/30 mt-1"/>}
                </div>

                <AnimatePresence>
                    {overlayVisible && (
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center p-8 text-center"
                            onClick={(e) => e.stopPropagation()} 
                        >
                            <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-red-500/20">
                                <PlayIcon className="w-10 h-10 text-white translate-x-1" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-3">Premium Content</h2>
                            <p className="text-gray-300 text-base mb-8 max-w-sm font-medium">
                                You have viewed your 10 free shots! Subscribe to unlock the remaining shots and exclusive content.
                            </p>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleSubscribe(); }}
                                disabled={isSubscribing}
                                className="w-full sm:w-auto px-10 py-3.5 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all text-sm uppercase tracking-wide disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubscribing ? 'Processing...' : (
                                    <>
                                        Subscribe to {product.channel?.name}
                                        <span className="bg-black/10 px-2 py-0.5 rounded-md text-xs font-black">
                                            {formatPrice(product.channel?.subscriptionPrice, product.channel?.subscriptionCurrency)} / month
                                        </span>
                                    </>
                                )}
                            </button>
                        </motion.div>
                    )}

                    {showLoginPrompt && (
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute inset-0 z-[60] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                            onClick={(e) => e.stopPropagation()} 
                        >
                            <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/20">
                                <LockClosedIcon className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-3">Login to Continue</h2>
                            <p className="text-gray-300 text-lg mb-8 max-w-sm font-medium">
                                You have viewed your 5 free shots! Please log in to your account to continue exploring amazing content.
                            </p>
                            <button 
                                onClick={(e) => { e.stopPropagation(); router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/shots/${product.id}`)}`); }}
                                className="w-full sm:w-auto px-10 py-4 bg-white text-black font-black rounded-full hover:bg-gray-200 transition-all text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
                            >
                                Log in or Sign up
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- Bottom Left Content Container (YT Shorts Style) --- */}
                <div className="absolute bottom-4 left-3 sm:left-4 right-20 z-30 flex flex-col gap-2.5 pointer-events-none items-start">
                    
                    {/* Status Badges Row */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        {/* Sequence Tracker */}
                        <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white border border-white/20 shadow-lg tracking-wide uppercase">
                            Part {currentShot + 1} / {totalShots}
                        </div>
                        
                        {/* Paywall / Premium Status */}
                        {product.isSubscriberOnly && !hasAccess && (
                            <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-red-500 border border-white/20 flex items-center gap-1 shadow-lg tracking-wide uppercase">
                                <LockClosedIcon className="w-3 h-3 text-red-500" />
                                10 Free Parts
                            </div>
                        )}
                        {product.isSubscriberOnly && hasAccess && (
                            <div className="bg-gradient-to-r from-amber-500 to-yellow-400 px-2.5 py-1 rounded-full text-[11px] font-black text-black flex items-center gap-1 shadow-[0_0_15px_rgba(251,191,36,0.4)] tracking-wide uppercase">
                                <StarIcon className="w-3 h-3" />
                                Premium User
                            </div>
                        )}
                    </div>

                    {/* User Info row */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/channel/${product.channel?.slug}`} className="flex items-center gap-2 pointer-events-auto group shrink-0">
                            <div className="w-[36px] h-[36px] rounded-full overflow-hidden border border-white/20 bg-[#2a2a2a] relative shrink-0">
                                <Image 
                                    src={product.channel?.profileImage || product.channel?.user?.image || channelFallbackAvatar} 
                                    alt="Creator" 
                                    fill 
                                    sizes="36px"
                                    className="object-cover" 
                                />
                            </div>
                            <span className="text-white font-bold text-[14px] drop-shadow-md tracking-tight leading-none group-hover:underline max-w-[80px] truncate">
                                {creatorHandle}
                            </span>
                        </Link>
                        
                        {/* Follow Button */}
                        <button
                            onClick={handleFollow}
                            disabled={isFollowLoading}
                            className={`h-[28px] px-3 rounded-full font-bold text-[11px] pointer-events-auto transition-all flex items-center gap-1 shrink-0 ${
                                isFollowing 
                                ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-md'
                                : 'bg-white text-black hover:bg-gray-100'
                            }`}
                        >
                            {isFollowLoading ? '...' : (isFollowing ? '✓ Following' : '+ Follow')}
                        </button>
                        
                        {/* View Channel pill */}
                        <Link
                            href={`/channel/${product.channel?.slug}`}
                            className="h-[28px] px-3 bg-white/10 text-white border border-white/20 rounded-full font-bold text-[11px] pointer-events-auto hover:bg-white/20 transition-all backdrop-blur-md flex items-center shrink-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Channel →
                        </Link>

                        {/* Swipe Up inline hint — shown only on first shot */}
                        {currentShot === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.5 }}
                                className="flex items-center gap-1 pointer-events-none ml-1"
                            >
                                <ChevronUpIcon className="w-3.5 h-3.5 text-white/50 animate-bounce" />
                                <span className="text-white/40 text-[10px] font-black tracking-widest uppercase">Swipe</span>
                            </motion.div>
                        )}
                    </div>

                    {/* Video Title / Description */}
                    <h2 className="text-white font-medium text-[15px] sm:text-[15px] line-clamp-2 drop-shadow-md leading-normal tracking-wide pr-2">
                        {product.title} {product.tags?.length > 0 ? <span className="text-gray-300 font-normal">#{product.tags[0]}</span> : ''}
                    </h2>

                    {/* Original Sound Indicator */}
                    <div className="flex items-center gap-2 text-white bg-black/40 backdrop-blur-sm w-max px-3 py-1.5 rounded-full text-[12px] font-medium mt-1">
                        <MusicalNoteIcon className="w-3.5 h-3.5 animate-pulse" />
                        <span>Original sound - {creatorName}</span>
                    </div>
                </div>

                {/* --- Bottom Right / Vertical Actions Container (YT Shorts Style) --- */}
                <div className="absolute bottom-5 right-2 sm:right-3 flex flex-col gap-5 sm:gap-6 items-center z-40">
                    
                    {/* Like Button */}
                    <button 
                        className="flex flex-col items-center gap-1 group w-12"
                        onClick={toggleLike}
                    >
                        <div className="w-11 h-11 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center transition-transform active:scale-90 group-hover:bg-black/60 shadow-lg">
                            {isLiked ? (
                                <HeartIcon className="w-6 h-6 text-red-500 drop-shadow-lg" />
                            ) : (
                                <HeartOutlineIcon className="w-6 h-6 text-white drop-shadow-md" />
                            )}
                        </div>
                        <span className="text-white text-[13px] font-medium drop-shadow-md font-sans">{likesCount}</span>
                    </button>

                    {/* Comments Button */}
                    <button 
                        className="flex flex-col items-center gap-1 group w-12"
                        onClick={(e) => { e.stopPropagation(); setShowComments(true); }} 
                    >
                        <div className="w-11 h-11 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center transition-transform active:scale-90 group-hover:bg-black/60 shadow-lg">
                            <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                        <span className="text-white text-[13px] font-medium drop-shadow-md font-sans">{comments.length}</span>
                    </button>

                    {/* Share Button */}
                    <button 
                        className="flex flex-col items-center gap-1 group w-12"
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            if (navigator.share) navigator.share({ title: product.title, url: window.location.href }); 
                        }}
                    >
                        <div className="w-11 h-11 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center transition-transform active:scale-90 group-hover:bg-black/60 shadow-lg">
                            <ShareIcon className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                        <span className="text-white text-[13px] font-medium drop-shadow-md font-sans">Share</span>
                    </button>
                    
                    {/* View/Fit Toggle Button */}
                    <button 
                        className="flex flex-col items-center gap-1 group w-12"
                        onClick={(e) => { e.stopPropagation(); setIsFitMode(!isFitMode); }} 
                    >
                        <div className="w-11 h-11 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center transition-transform active:scale-90 group-hover:bg-black/60 shadow-lg">
                            {isFitMode ? (
                                <ArrowsPointingOutIcon className="w-6 h-6 text-white drop-shadow-md" />
                            ) : (
                                <ArrowsPointingInIcon className="w-6 h-6 text-white drop-shadow-md" />
                            )}
                        </div>
                        <span className="text-white text-[13px] font-medium drop-shadow-md font-sans">
                            {isFitMode ? 'Fill' : 'Fit'}
                        </span>
                    </button>

                    {/* View Full Video (Product Mode) button - appears when subscribed OR part 11+ */}
                    {(hasAccess || currentShot >= 10) && (
                        <Link
                            href={`/channel/${product.channel?.slug}/products/${product.id}`}
                            className="flex flex-col items-center gap-1 group w-12 pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-11 h-11 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center transition-transform active:scale-90 group-hover:bg-black/60 shadow-lg border border-white/10">
                                <FilmIcon className="w-5 h-5 text-white drop-shadow-md" />
                            </div>
                            <span className="text-white text-[10px] font-medium drop-shadow-md font-sans text-center leading-tight">Full<br/>Video</span>
                        </Link>
                    )}

                    {/* Turntable / Album Cover */}
                    <div className="w-10 h-10 rounded-md border-2 border-white/20 overflow-hidden relative mt-1 bg-[#1a1a1a] shadow-xl">
                        <Image 
                            src={product.previewImage || product.channel?.profileImage || channelFallbackAvatar} 
                            alt="Sound" 
                            fill 
                            sizes="40px"
                            className="object-cover" 
                        />
                    </div>
                </div>

                {/* Progress Bar Bottom */}
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/20 z-50">
                    <div 
                        ref={progressBarRef}
                        className="h-full bg-red-600 transition-none"
                        style={{ width: '0%' }}
                    ></div>
                </div>

                {/* Central Play/Pause Icon (Flashes subtly) */}
                <AnimatePresence>
                    {!isPlaying && !overlayVisible && (
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.2, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center z-30 pointer-events-none shadow-2xl"
                        >
                            <PlayIcon className="w-10 h-10 text-white translate-x-1" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Comments Drawer (Animated native bottom sheet) */}
                <AnimatePresence>
                    {showComments && (
                        <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="absolute inset-x-0 bottom-0 top-[30%] bg-[#1c1c1c] border-t border-white/10 z-[100] flex flex-col rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] cursor-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1c1c1c]/90 backdrop-blur-lg rounded-t-3xl shrink-0">
                                <h3 className="text-white font-bold text-lg">Comments <span className="text-gray-400 font-normal text-sm ml-1">{comments.length}</span></h3>
                                <button className="p-2 bg-black/40 rounded-full hover:bg-white/10 transition-colors" onClick={() => setShowComments(false)}>
                                    <XMarkIcon className="w-5 h-5 text-white" />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                                {comments.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                                        <ChatBubbleOvalLeftEllipsisIcon className="w-12 h-12 mb-3" />
                                        <p>No comments yet. Be the first!</p>
                                    </div>
                                ) : (
                                    comments.map((comment: any) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-gray-800 relative">
                                                <Image src={comment.user?.image || channelFallbackAvatar} alt={comment.user?.name || "User"} fill sizes="32px" className="object-cover" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-gray-400 font-bold text-xs">@{comment.user?.name || "user"}</span>
                                                    <span className="text-gray-600 text-[10px]">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-white text-[14px] leading-snug">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-3 border-t border-white/10 shrink-0 bg-[#1c1c1c] pb-safe flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-gray-800 relative">
                                    <Image src={userImage || channelFallbackAvatar} alt="You" fill sizes="32px" className="object-cover" />
                                </div>
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        placeholder={userId ? "Add a comment..." : "Sign in to comment"}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        disabled={!userId || isSubmittingComment}
                                        onKeyDown={(e) => { if(e.key === 'Enter') postComment(); }}
                                        className="w-full bg-[#2a2a2a] text-white rounded-full py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
                                    />
                                    <button 
                                        onClick={postComment}
                                        disabled={!newComment.trim() || isSubmittingComment || !userId}
                                        className="absolute right-1 top-1 bottom-1 px-2.5 bg-red-600 rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-red-500 transition-colors"
                                    >
                                        <PaperAirplaneIcon className="w-4 h-4 text-white -rotate-45 translate-x-px -translate-y-px" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Desktop Side Controls (Clean YT style) */}
            <div className="hidden sm:flex flex-col gap-4 ml-6 items-center">
                <button 
                    onClick={goToPrevShot} 
                    disabled={currentShot === 0}
                    className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl"
                >
                    <ChevronUpIcon className="w-7 h-7" />
                </button>
                <button 
                    onClick={goToNextShot}
                    disabled={currentShot === totalShots - 1} 
                    className="p-4 bg-white hover:bg-gray-200 text-black rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl"
                >
                    <ChevronDownIcon className="w-7 h-7" />
                </button>
                
                {/* Shots Pagination Context */}
                {isNextLocked && (
                    <div className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-xs text-red-500 font-bold">Locked</p>
                    </div>
                )}
            </div>
        </div>
    );
}
