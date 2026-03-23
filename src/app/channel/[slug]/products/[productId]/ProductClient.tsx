'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import {
  PlayIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  VideoCameraIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  HeartIcon,
  ShareIcon,
  BookmarkIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  FolderIcon,
  FlagIcon,
  FilmIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  StarIcon as StarIconSolid,
  FlagIcon as FlagIconSolid
} from '@heroicons/react/24/solid';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import SaveToPlaylistModal from '@/components/modals/SaveToPlaylistModal';
import ShareModal from '@/components/modals/ShareModal';
import OptimizedMediaLoader from '@/components/ui/OptimizedMediaLoader';
import StreamVideoPlayer from '@/components/ui/StreamVideoPlayer';
import CatLoader from '@/components/loaders/CatLoader';
// Utility for formatting numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export default function ProductClient() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [product, setProduct] = useState<any>(null);
  const [channel, setChannel] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [otherChannelProducts, setOtherChannelProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string>('auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [normalizedVideoUrl, setNormalizedVideoUrl] = useState<string | null>(null);

  // Reviews and Comments
  const [reviews, setReviews] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSubscribersList, setShowSubscribersList] = useState(false);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(4);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(5);

  // Success/Error Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Reporting
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate content');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Scroll tracking for header offset
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if user is owner
  const isOwner = session?.user?.id === channel?.userId;

  useEffect(() => {
    const fetchData = async () => {
      if (!params?.slug || !params?.productId) {
        return;
      }

      // Extract productId as string (handle both string and string[] cases)
      const productId = Array.isArray(params.productId) ? params.productId[0] : params.productId;
      const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

      try {
        // Fetch channel
        const channelResponse = await fetch(`/api/channels/public/${slug}`);
        if (!channelResponse.ok) {
          throw new Error('Channel not found');
        }
        const channelData = await channelResponse.json();
        setChannel(channelData);

        // Check subscription status if user is logged in
        if (session?.user?.id && channelData.subscriptionEnabled) {
          try {
            const subResponse = await fetch(`/api/channels/${channelData.id}/subscription/check`);
            if (subResponse.ok) {
              const subData = await subResponse.json();
              setHasActiveSubscription(subData.hasActiveSubscription || false);
            }
          } catch (error) {
            console.error('Error checking subscription:', error);
            setHasActiveSubscription(false);
          }
        } else {
          setHasActiveSubscription(false);
        }

        // Check follow status if user is logged in
        if (session?.user?.id) {
          try {
            const followResponse = await fetch(`/api/channels/${channelData.id}/follow`);
            if (followResponse.ok) {
              const followData = await followResponse.json();
              setIsFollowing(followData.isFollowing || false);
            }
          } catch (error) {
            console.error('Error checking follow status:', error);
            setIsFollowing(false);
          }
        }

        // Find the product
        const productData = channelData.products?.find(
          (p: any) => p.id === productId
        );

        if (!productData) {
          // Try fetching directly
          const productResponse = await fetch(`/api/channels/${channelData.id}/products`);
          if (productResponse.ok) {
            const products = await productResponse.json();
            const foundProduct = products.find((p: any) => p.id === productId);
            if (foundProduct) {
              setProduct(foundProduct);
              // Get related products (same channel, different products)
              const related = products
                .filter((p: any) => p.id !== productId && p.published)
                .slice(0, 10);
              setRelatedProducts(related);

              // Fetch products from other channels for exploration
              try {
                const exploreRes = await fetch(`/api/products/explore?excludeChannelId=${channelData.id}&limit=8`);
                if (exploreRes.ok) {
                  const exploreData = await exploreRes.json();
                  setOtherChannelProducts(exploreData.products || []);
                }
              } catch (err) {
                console.error('Error fetching other channel products:', err);
              }

              // Track product view
              try {
                await fetch(`/api/channels/${channelData.id}/products/${productId}`, {
                  method: 'POST',
                });
              } catch (error) {
                console.error('Error tracking product view:', error);
              }

              // Fetch reviews and comments
              await fetchReviewsAndComments(channelData.id, productId);

              // Check if user liked the product
              if (session?.user?.id) {
                await checkUserLike(channelData.id, productId);
              }
            }
          }
        } else {
          setProduct(productData);
          // Get related products
          const related = channelData.products
            .filter((p: any) => p.id !== productId && p.published)
            .slice(0, 10);
          setRelatedProducts(related);

          // Fetch products from other channels for exploration
          try {
            const exploreRes = await fetch(`/api/products/explore?excludeChannelId=${channelData.id}&limit=8`);
            if (exploreRes.ok) {
              const exploreData = await exploreRes.json();
              setOtherChannelProducts(exploreData.products || []);
            }
          } catch (err) {
            console.error('Error fetching other channel products:', err);
          }

          // Track product view
          try {
            await fetch(`/api/channels/${channelData.id}/products/${productId}`, {
              method: 'POST',
            });
          } catch (error) {
            console.error('Error tracking product view:', error);
          }

          // Fetch reviews and comments
          await fetchReviewsAndComments(channelData.id, productId);

          // Check if user liked the product
          if (session?.user?.id) {
            await checkUserLike(channelData.id, productId);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params?.slug && params?.productId) {
      fetchData();
    }
  }, [params?.slug, params?.productId, session?.user?.id]);

  // Fetch products from other channels for discovery
  useEffect(() => {
    const fetchOtherChannels = async () => {
      try {
        const res = await fetch('/api/channels?limit=10');
        if (!res.ok) return;
        const data = await res.json();
        const channels: any[] = data.channels || [];
        // Filter out the current channel
        const otherChannels = channels.filter((c: any) => c.slug !== (Array.isArray(params?.slug) ? params?.slug[0] : params?.slug));
        // Collect up to 10 products across those channels
        const collected: any[] = [];
        for (const ch of otherChannels) {
          if (ch.products?.length) {
            ch.products.forEach((p: any) => {
              if (collected.length < 10) collected.push({ ...p, channelName: ch.name, channelSlug: ch.slug });
            });
          }
          if (collected.length >= 10) break;
        }
        setOtherChannelProducts(collected);
      } catch (err) {
        console.error('Error fetching other channel products:', err);
      }
    };
    fetchOtherChannels();
  }, [params?.slug]);

  // Track product view in history
  useEffect(() => {
    const trackHistory = async () => {
      if (!session?.user?.id || !product?.id) return;

      try {
        await fetch(`/api/history/${product.id}`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Error tracking history:', error);
      }
    };

    if (product?.id && session?.user?.id) {
      trackHistory();
    }
  }, [product?.id, session?.user?.id]);


  // Load subscribers list for owner
  useEffect(() => {
    const loadSubscribers = async () => {
      if (!isOwner || !showSubscribersList || !channel?.id) return;

      try {
        const response = await fetch(`/api/channels/${channel.id}/subscribers`);
        if (response.ok) {
          const data = await response.json();
          setSubscribers(data.subscriptions || []);
        }
      } catch (error) {
        console.error('Error loading subscribers:', error);
      }
    };

    loadSubscribers();
  }, [isOwner, channel?.id, showSubscribersList]);

  const fetchReviewsAndComments = async (channelId: string, productId: string) => {
    try {
      // Fetch reviews
      const reviewsResponse = await fetch(`/api/channels/${channelId}/products/${productId}/reviews`);
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData.reviews || []);
        setAverageRating(reviewsData.averageRating || 0);
        setTotalReviews(reviewsData.totalReviews || 0);

        // Find user's review
        if (session?.user?.id) {
          const userReview = reviewsData.reviews?.find((r: any) => r.userId === session.user.id);
          if (userReview) {
            setUserRating(userReview.rating);
            setReviewComment(userReview.comment || '');
          }
        }
      }

      // Fetch comments
      const commentsResponse = await fetch(`/api/channels/${channelId}/products/${productId}/comments`);
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setComments(commentsData.comments || []);
      }
    } catch (error) {
      console.error('Error fetching reviews and comments:', error);
    }
  };

  // Live Polling Effect for Reviews and Comments
  useEffect(() => {
    if (!channel?.id || !product?.id) return;

    // Poll every 10 seconds to create a "live" feel
    const pollInterval = setInterval(() => {
      fetchReviewsAndComments(channel.id, product.id);
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [channel?.id, product?.id]);

  const checkUserLike = async (channelId: string, productId: string) => {
    try {
      const response = await fetch(`/api/channels/${channelId}/products/${productId}/like`);
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked || false);
      }
    } catch (error) {
      console.error('Error checking like:', error);
    }
  };

  const handleLikeToggle = async () => {
    if (!session?.user?.id) {
      router.push('/auth/signin');
      return;
    }

    if (!channel?.id || !product?.id) {
      console.error('Missing channel or product ID');
      return;
    }

    try {
      const response = await fetch(`/api/channels/${channel.id}/products/${product.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);

        // Fetch updated product to get correct like count
        const productResponse = await fetch(`/api/channels/public/${params?.slug}`);
        if (productResponse.ok) {
          const channelData = await productResponse.json();
          const updatedProduct = channelData.products?.find((p: any) => p.id === product.id);
          if (updatedProduct) {
            setProduct(updatedProduct);
          }
        }
      } else {
        const error = await response.json();
        console.error('Like error:', error);
        setModalMessage(error.error || 'Failed to like product');
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      setModalMessage(`Failed to like product: ${error?.message || 'Please try again'}`);
      setShowErrorModal(true);
    }
  };

  const handleRatingSubmit = async () => {
    if (!session?.user?.id) {
      router.push('/auth/signin');
      return;
    }

    if (!channel?.id || !product?.id) {
      setModalMessage('Product or channel information is missing');
      setShowErrorModal(true);
      return;
    }

    if (userRating === 0) {
      setModalMessage('Please select a rating');
      setShowErrorModal(true);
      return;
    }

    try {
      const response = await fetch(`/api/channels/${channel.id}/products/${product.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: userRating,
          comment: reviewComment.trim() || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchReviewsAndComments(channel.id, product.id);
        // Don't reset userRating - allow user to see their submitted rating
        setReviewComment('');
        setModalMessage('Review submitted successfully!');
        setShowSuccessModal(true);
      } else {
        const error = await response.json();
        console.error('Review submission error:', error);
        const errorMessage = error.details || error.error || 'Failed to submit review';
        setModalMessage(errorMessage);
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      setModalMessage(`Failed to submit review: ${error?.message || 'Please try again.'}`);
      setShowErrorModal(true);
    }
  };

  const handleCommentSubmit = async (parentId?: string) => {
    if (!session?.user?.id) {
      router.push('/auth/signin');
      return;
    }

    if (!channel?.id || !product?.id) {
      setModalMessage('Product or channel information is missing');
      setShowErrorModal(true);
      return;
    }

    const content = parentId ? replyContent : newComment;
    if (!content.trim()) {
      setModalMessage('Please enter a comment');
      setShowErrorModal(true);
      return;
    }

    try {
      const response = await fetch(`/api/channels/${channel.id}/products/${product.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          parentId: parentId || null,
        }),
      });

      if (response.ok) {
        await fetchReviewsAndComments(channel.id, product.id);
        if (parentId) {
          setReplyContent('');
          setReplyingTo(null);
        } else {
          setNewComment('');
        }
      } else {
        const error = await response.json();
        console.error('Comment submission error:', error);
        setModalMessage(error.error || 'Failed to submit comment');
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      setModalMessage('Failed to submit comment. Please try again.');
      setShowErrorModal(true);
    }
  };

  const formatPrice = (price: number, currency: string = 'INR') => {
    if (price === 0) return 'Free';
    if (currency === 'USD') return `$${price.toFixed(2)}`;
    if (currency === 'EUR') return `€${price.toFixed(2)}`;
    return `₹${price.toFixed(2)}`;
  };

  const handleFollow = async () => {
    if (!session?.user?.id) {
      router.push('/auth/signin');
      return;
    }

    if (!channel?.id) return;

    setIsFollowLoading(true);
    try {
      const response = await fetch(`/api/channels/${channel.id}/follow`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
        if (data.isFollowing) {
          toast.success('You are now following this channel!');
        } else {
          toast.success('Unfollowed channel.');
        }
      } else {
        toast.error('Failed to change follow status');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('An error occurred');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!session?.user?.id) {
      router.push('/auth/signin');
      return;
    }

    if (!channel?.id) return;

    setSubscribing(true);
    try {
      const response = await fetch(`/api/channels/${channel.id}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ duration: '1month' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create subscription order');
      }

      const data = await response.json();

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
          amount: Math.round(data.amount * 100),
          currency: data.currency,
          name: channel.name,
          description: 'Monthly Subscription',
          order_id: data.orderId,
          handler: async function (response: any) {
            const verifyResponse = await fetch(`/api/channels/${channel.id}/subscribe/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyResponse.ok) {
              setHasActiveSubscription(true);
              setShowSubscriptionModal(false);
              setModalMessage('Subscription activated successfully!');
              setShowSuccessModal(true);
            } else {
              const error = await verifyResponse.json();
              setModalMessage(error.error || 'Payment verification failed');
              setShowErrorModal(true);
            }
          },
          prefill: {
            email: session.user.email || '',
            name: session.user.name || '',
          },
          theme: {
            color: '#3b82f6',
          },
        };

        const razorpay = (window as any).Razorpay(options);
        razorpay.open();
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error('Error subscribing:', error);
      setModalMessage(error instanceof Error ? error.message : 'Failed to subscribe');
      setShowErrorModal(true);
    } finally {
      setSubscribing(false);
    }
  };

  const handleShare = async () => {
    if (!product || !channel) return;
    setIsShareModalOpen(true);
  };

  const submitReport = async () => {
    if (!session?.user?.id) {
      router.push('/auth/signin');
      return;
    }

    if (!channel?.id || !product?.id) {
      setModalMessage('Product or channel information is missing');
      setShowErrorModal(true);
      return;
    }

    setIsSubmittingReport(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, reason: reportReason })
      });
      if (res.ok) {
        setIsReporting(false);
        setModalMessage('Report submitted. Administrators will review it.');
        setShowSuccessModal(true);
      } else {
        setModalMessage('Failed to submit report');
        setShowErrorModal(true);
      }
    } catch {
      setModalMessage('Error submitting report');
      setShowErrorModal(true);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'VIDEO':
      case 'VIDEOS':
        return <VideoCameraIcon className="h-5 w-5" />;
      case 'DOCUMENT':
      case 'DOCUMENTS':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'CODE':
        return <CodeBracketIcon className="h-5 w-5" />;
      default:
        return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  // Helper function to normalize video URL
  const normalizeVideoUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;

    // If URL is already absolute, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If URL starts with /, it's a relative URL - make it absolute
    if (url.startsWith('/')) {
      return typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
    }

    // Otherwise, assume it's a relative URL and prepend the origin
    return typeof window !== 'undefined' ? `${window.location.origin}/${url}` : url;
  };

  // Effect to normalize video URL when product changes
  useEffect(() => {
    if (!product) {
      setNormalizedVideoUrl(null);
      return;
    }

    const productType = product.type?.toUpperCase() || '';
    if (productType !== 'VIDEO' && productType !== 'VIDEOS') {
      setNormalizedVideoUrl(null);
      return;
    }

    const rawVideoSource = product.videoUrl || product.fileUrl;
    if (!rawVideoSource) {
      setNormalizedVideoUrl(null);
      return;
    }

    const normalizedUrl = normalizeVideoUrl(rawVideoSource);
    setNormalizedVideoUrl(normalizedUrl);
  }, [product]);

  // Effect to handle video loading and retry
  useEffect(() => {
    if (!videoElement || !normalizedVideoUrl) return;

    // Set video source if it's different
    if (videoElement.src !== normalizedVideoUrl) {
      videoElement.src = normalizedVideoUrl;
      videoElement.load();
    }

    // Try to play video (may be blocked by browser autoplay policy)
    const tryPlay = async () => {
      try {
        await videoElement.play();
      } catch (error) {
        // Autoplay was prevented - this is normal, user can click play
        console.log('Autoplay prevented, user interaction required');
      }
    };

    // Try to play when video can play
    const handleCanPlay = () => {
      tryPlay();
    };

    videoElement.addEventListener('canplay', handleCanPlay);

    return () => {
      videoElement.removeEventListener('canplay', handleCanPlay);
    };
  }, [videoElement, normalizedVideoUrl]);

  const renderContent = () => {
    if (!product) return null;

    const productType = product.type?.toUpperCase() || '';
    const fileUrl = product.fileUrl;
    const canAccess = isOwner || !product.isSubscriberOnly || !channel?.subscriptionEnabled || hasActiveSubscription;

    if (productType === 'VIDEO' || productType === 'VIDEOS') {
      if (status === 'loading') {
        return (
          <div className="w-full relative bg-gray-900 animate-pulse" style={{ aspectRatio: '16/9' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
            </div>
          </div>
        );
      }

      const isGuest = !session?.user;

      return (
        <div className="w-full relative bg-black aspect-video flex items-center justify-center border-b border-[#1a1a1a]">
          {isGuest ? (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black/90 backdrop-blur-xl">
              <div className="text-center px-4 py-6 sm:py-8 w-full max-w-[340px] mx-auto scale-95 sm:scale-100">
                <div className="flex w-14 h-14 bg-[#111] rounded-2xl items-center justify-center mx-auto mb-4 border border-white/5 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                  <UserCircleIcon className="h-7 w-7 text-gray-500" />
                </div>
                <h3 className="text-white text-lg sm:text-2xl font-black mb-1 uppercase tracking-tighter">Join the Community</h3>
                <p className="text-gray-500 text-[10px] sm:text-xs mb-6 leading-relaxed max-w-[260px] mx-auto uppercase tracking-widest font-bold">Sign in to unlock premium content and support {channel.name}.</p>
                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={() => router.push('/auth/signin')}
                    className="w-full py-4 bg-white text-black rounded-xl font-black hover:bg-gray-200 transition-all active:scale-95 shadow-2xl text-xs uppercase tracking-[0.2em]"
                  >
                    Sign In to Watch
                  </button>
                  <button
                    onClick={() => router.push('/auth/signup')}
                    className="text-gray-400 text-[10px] font-black hover:text-white transition-colors uppercase tracking-[0.2em] py-2"
                  >
                    Create Free Account
                  </button>
                </div>
              </div>
            </div>
          ) : canAccess ? (
            normalizedVideoUrl ? (
              <StreamVideoPlayer
                src={normalizedVideoUrl}
                fileType={product.fileType || 'video/mp4'}
                createdAt={product.createdAt}
                onPlayChange={setIsPlaying}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-center">
                  <VideoCameraIcon className="h-16 w-16 text-gray-800 mx-auto mb-4" />
                  <p className="text-gray-600 font-black uppercase tracking-widest text-xs">Video not available</p>
                </div>
              </div>
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black/95 overflow-hidden backdrop-blur-2xl">
              <div className="text-center px-4 py-6 sm:py-8 w-full max-w-[340px] mx-auto scale-95 sm:scale-100">
                <div className="flex w-14 h-14 bg-red-600/5 rounded-2xl items-center justify-center mx-auto mb-4 border border-red-500/10 shadow-[0_0_50px_rgba(239,68,68,0.05)]">
                  <VideoCameraIcon className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="text-white text-lg sm:text-2xl font-black mb-1 uppercase tracking-tighter">Subscriber Only</h3>
                <p className="text-gray-500 text-[10px] sm:text-xs mb-6 leading-relaxed max-w-[260px] mx-auto uppercase tracking-widest font-bold">Premium content exclusive to channel members. Support to unlock.</p>
                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={() => setShowSubscriptionModal(true)}
                    className="w-full py-4 bg-[#e50914] text-white rounded-xl font-black hover:bg-red-700 transition-all active:scale-95 shadow-[0_10px_30px_rgba(229,9,20,0.3)] text-xs uppercase tracking-[0.2em]"
                  >
                    Subscribe Now
                  </button>
                  <button
                    onClick={() => router.push(`/channel/${params?.slug}`)}
                    className="text-gray-400 text-[10px] font-black hover:text-white transition-colors uppercase tracking-[0.2em] py-2"
                  >
                    Visit Channel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (productType === 'DOCUMENT' || productType === 'DOCUMENTS') {
      return (
        <div className="w-full h-[600px] bg-gray-100 overflow-hidden">
          <OptimizedMediaLoader type="pdf" aspectRatio="h-full">
            {canAccess ? (
              fileUrl ? (
                fileUrl.endsWith('.pdf') ? (
                  <div className="relative w-full h-full">
                    {/* Desktop View: Google Docs Viewer for Reliable Embedding */}
                    <div className="hidden md:block w-full h-full bg-gray-100">
                      {fileUrl.startsWith('http') ? (
                        <iframe
                          src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                          className="w-full h-full border-0"
                          title={product.title}
                          allow="fullscreen"
                          loading="lazy"
                        />
                      ) : (
                        <iframe
                          src={`${fileUrl}#toolbar=1`}
                          className="w-full h-full border-0"
                          title={product.title}
                          allow="fullscreen"
                          loading="lazy"
                        />
                      )}
                    </div>

                    {/* Mobile View: Explicit Button */}
                    <div className="md:hidden w-full h-full flex flex-col items-center justify-center bg-[#141414] p-6 text-center border border-[#333] rounded-lg">
                      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4">
                        <DocumentTextIcon className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{product.title}</h3>
                      <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">This document is optimized for mobile viewing.</p>
                      <a
                        href={fileUrl.startsWith('http') ? `/api/proxy-pdf?url=${encodeURIComponent(fileUrl)}` : fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
                      >
                        <DocumentTextIcon className="w-5 h-5" />
                        View PDF
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8">
                    <DocumentTextIcon className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-400 mb-4">Document Preview</p>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Open Document
                    </a>
                  </div>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                </div>
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <DocumentTextIcon className="h-16 w-16 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70 text-lg font-medium mb-4">Subscribe to view</p>
                  <button
                    onClick={() => setShowSubscriptionModal(true)}
                    className="px-6 py-3 bg-[#1a1a1a] text-white rounded-lg font-semibold hover:bg-[#333] transition"
                  >
                    Subscribe Now
                  </button>
                </div>
              </div>
            )}
          </OptimizedMediaLoader>
        </div>
      );
    }

    if (productType === 'CODE') {
      return (
        <div className="w-full h-[600px] bg-gray-900 overflow-hidden">
          <OptimizedMediaLoader type="code" aspectRatio="h-full">
            {canAccess ? (
              fileUrl ? (
                <iframe
                  src={fileUrl}
                  className="w-full h-full border-0"
                  title={product.title}
                  allow="fullscreen"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <CodeBracketIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                </div>
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <CodeBracketIcon className="h-16 w-16 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70 text-lg font-medium mb-4">Subscribe to view</p>
                  <button
                    onClick={() => setShowSubscriptionModal(true)}
                    className="px-6 py-3 bg-[#1a1a1a] text-white rounded-lg font-semibold hover:bg-[#333] transition"
                  >
                    Subscribe Now
                  </button>
                </div>
              </div>
            )}
          </OptimizedMediaLoader>
        </div>
      );
    }

    if (productType === 'IMAGE' || productType === 'IMAGES') {
      return (
        <div className="w-full bg-gray-900 overflow-hidden">
          {canAccess ? (
            fileUrl || product.previewImage ? (
              <img
                src={fileUrl || product.previewImage}
                alt={product.title}
                className="w-full h-auto max-h-[80vh] object-contain mx-auto"
              />
            ) : (
              <div className="w-full aspect-video flex items-center justify-center">
                <p className="text-gray-400">Image not available</p>
              </div>
            )
          ) : (
            <div className="w-full aspect-video flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <svg className="w-16 h-16 text-white/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <p className="text-white/70 text-lg font-medium mb-4">Subscribe to view</p>
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="px-6 py-3 bg-[#1a1a1a] text-white rounded-lg font-semibold hover:bg-[#333] transition"
                >
                  Subscribe Now
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="w-full h-[500px] bg-gray-900 flex items-center justify-center">
        {canAccess ? (
          <div className="text-center p-8">
            {getContentIcon(productType)}
            <h3 className="text-xl font-bold text-white mb-2 mt-4">{product.title}</h3>
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
              >
                Open File
              </a>
            )}
          </div>
        ) : (
          <div className="text-center p-8">
            {getContentIcon(productType)}
            <h3 className="text-xl font-bold text-white mb-2 mt-4">{product.title}</h3>
            <p className="text-white/70 text-lg font-medium mb-4">Subscribe to view</p>
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="px-6 py-3 bg-[#1a1a1a] text-white rounded-lg font-semibold hover:bg-[#333] transition"
            >
              Subscribe Now
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <CatLoader fullScreen={true} />;
  }

  if (!product || !channel) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Product not found</h1>
          <button
            onClick={() => router.push(`/channel/${params?.slug}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Channel
          </button>
        </div>
      </div>
    );
  }

  // Get theme colors (default if not available)
  const primaryColor = (channel as any)?.template?.defaultTheme?.primaryColor || '#3b82f6';
  const backgroundColor = (channel as any)?.template?.defaultTheme?.backgroundColor || '#ffffff';
  const textColor = (channel as any)?.template?.defaultTheme?.textColor || '#1f2937';
  const sellerName = channel.user?.name || channel.name || 'Creator';

  return (
    <MainLayout isDarkTheme={true} noPaddingTop={true}>
      <div className="min-h-screen bg-black w-full relative overflow-clip pt-0 lg:pt-16">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl opacity-20"></div>
        </div>

        {/* Main Content - Full Width */}
        <div className="w-full">
          <div className="flex flex-col lg:flex-row">
            {/* Main Content Area - Full Width */}
            <div className="flex-1 w-full relative bg-black">
              {/* Video/Content Player - Full Width */}
              <div className={`w-full sticky ${scrolled ? 'top-[56px]' : 'top-0'} z-40 lg:relative lg:top-0 bg-[#000] transition-all duration-300 overflow-hidden`}>
                {renderContent()}
              </div>

              {/* Content Details - Full Width with Padding */}
              <div className="w-full px-4 sm:px-6 lg:px-12 py-8 sm:py-12 relative z-10">
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {product.tags?.slice(0, 3).map((tag: string, i: number) => (
                      <span key={i} className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/5 px-2 py-1 rounded">#{tag}</span>
                    ))}
                  </div>
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-8 leading-[1.1] tracking-tighter uppercase italic">{product.title}</h1>

                  {/* Channel Info & Actions */}
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-12 pb-12 border-b border-[#1a1a1a]">
                    <div className="flex items-center gap-5">
                      {channel.profileImage || channel.user?.image ? (
                        <div
                          className="relative group cursor-pointer"
                          onClick={() => router.push(`/channel/${params?.slug}`)}
                        >
                          <div className="absolute inset-0 rounded-full bg-red-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
                          <img
                            src={channel.profileImage || channel.user?.image}
                            alt={channel.user?.name || channel.name}
                            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-[#222] object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#111] border border-[#222] flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                          onClick={() => router.push(`/channel/${params?.slug}`)}
                        >
                          <span className="text-white font-black text-2xl uppercase">{(channel.name || 'C')[0]}</span>
                        </div>
                      )}
                      <div>
                        <h3
                          className="font-black text-white text-xl sm:text-2xl cursor-pointer hover:text-red-500 transition-colors uppercase tracking-tight"
                          onClick={() => router.push(`/channel/${params?.slug}`)}
                        >
                          {channel.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5">
                           <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Verified Creator</span>
                           <div className="w-1 h-1 rounded-full bg-gray-800" />
                           <span className="text-[10px] font-black text-white uppercase tracking-widest">{formatNumber(channel.subscriberCount || 0)} Members</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {channel.subscriptionEnabled && !isOwner && (
                        <button
                          onClick={() => !hasActiveSubscription && setShowSubscriptionModal(true)}
                          className={`px-8 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${hasActiveSubscription ? 'bg-[#111] text-gray-500 border border-[#222] cursor-default' : 'bg-white text-black hover:bg-gray-200 shadow-[0_0_40px_rgba(255,255,255,0.1)]'}`}
                        >
                          {hasActiveSubscription ? 'Membership Active' : 'Join Membership'}
                        </button>
                      )}
                      
                      <div className="flex items-center bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden">
                        <button onClick={handleLikeToggle} className="flex items-center gap-2.5 px-6 py-4 hover:bg-[#111] transition-all border-r border-[#1a1a1a]">
                          {isLiked ? <HeartIconSolid className="h-5 w-5 text-red-600" /> : <HeartIcon className="h-5 w-5 text-gray-500" />}
                          <span className="text-sm font-black text-white">{formatNumber(product.likeCount || 0)}</span>
                        </button>
                        <button onClick={() => setIsBookmarked(!isBookmarked)} className="px-6 py-4 hover:bg-[#111] transition-all">
                          {isBookmarked ? <BookmarkIconSolid className="h-5 w-5 text-white" /> : <BookmarkIcon className="h-5 w-5 text-gray-500" />}
                        </button>
                      </div>

                      <button onClick={() => setIsSaveModalOpen(true)} className="p-4 rounded-xl bg-[#0a0a0a] border border-[#222] hover:bg-[#111] transition-all text-white">
                        <PlusCircleIcon className="h-5 w-5" />
                      </button>

                      <button onClick={handleShare} className="p-4 rounded-xl bg-[#0a0a0a] border border-[#222] hover:bg-[#111] transition-all text-white">
                        <ShareIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Description & Metadata */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
                    <div className="lg:col-span-2">
                       <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">The Story</h4>
                       <div className="relative">
                          <p className={`text-gray-400 text-lg leading-relaxed whitespace-pre-wrap ${!descriptionExpanded && 'line-clamp-[10]'} md:line-clamp-none`}>
                            {product.description || 'No description provided by creator.'}
                          </p>
                          {product.description?.length > 300 && (
                            <button 
                              onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                              className="md:hidden mt-4 text-[10px] font-black text-white uppercase tracking-widest border-b border-white/20 pb-0.5"
                            >
                              {descriptionExpanded ? 'Show Less' : 'Read Full Story'}
                            </button>
                          )}
                       </div>
                    </div>
                    <div>
                        <div className="bg-[#050505] border border-[#1a1a1a] rounded-3xl p-8 space-y-6">
                            <div className="flex items-center justify-between py-1">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Type</span>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{product.type}</span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-t border-[#111]">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Released</span>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{new Date(product.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-t border-[#111]">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Engagement</span>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{formatNumber(product.viewCount || 0)} Plays</span>
                            </div>
                            <div className="pt-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <StarIconSolid className="w-4 h-4 text-yellow-500" />
                                    <span className="text-xl font-black text-white">{averageRating.toFixed(1)}</span>
                                    <span className="text-xs text-gray-500 font-bold">({totalReviews} reviews)</span>
                                </div>
                                <button
                                    onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="w-full py-3.5 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600/20 transition-all"
                                >
                                    View authentic reviews
                                </button>
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* Reviews & Comments Integrated Section */}
                  <div id="reviews-section" className="space-y-16 py-16 border-t border-[#1a1a1a]">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-20">
                      
                      {/* Left Side: Reviews */}
                      <div className="space-y-10">
                        <div className="flex items-center justify-between">
                           <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Authentic Reviews</h2>
                           <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full uppercase tracking-widest">Verified Source</span>
                        </div>

                        {session?.user?.id ? (
                          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-3xl">
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 text-center">Your Rating</p>
                            <div className="flex justify-center gap-3 mb-8">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button 
                                      key={star} 
                                      onClick={() => setUserRating(star)} 
                                      className="transition-transform active:scale-90"
                                    >
                                        <StarIconSolid className={`w-8 h-8 ${star <= userRating ? 'text-yellow-500' : 'text-gray-800 hover:text-gray-600'}`} />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Share your experience with the community..."
                                className="w-full h-32 bg-black border border-[#222] rounded-2xl p-4 text-white placeholder-gray-700 outline-none focus:border-red-500/50 transition-all mb-4 text-sm resize-none"
                            />
                            <button
                                onClick={handleRatingSubmit}
                                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-gray-200 transition-all"
                            >
                                Publish Review
                            </button>
                          </div>
                        ) : (
                          <div className="bg-[#0a0a0a] border border-dashed border-[#222] p-10 rounded-3xl text-center">
                             <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Sign in to leave a review</p>
                          </div>
                        )}

                        <div className="space-y-6">
                            {reviews.slice(0, visibleReviewsCount).map((review: any) => (
                                <div key={review.id} className="p-6 bg-[#050505] border border-[#111] rounded-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#111] border border-[#222] flex items-center justify-center font-black text-gray-500 text-xs uppercase">
                                                {review.user?.image ? <img src={review.user.image} className="w-full h-full rounded-full object-cover" /> : review.user?.name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-white uppercase tracking-tight">{review.user?.name || 'Anonymous'}</p>
                                                <p className="text-[9px] font-bold text-gray-600 mt-0.5">{new Date(review.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <StarIconSolid key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-yellow-500' : 'text-gray-900'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 leading-relaxed">{review.comment}</p>
                                </div>
                            ))}
                            {reviews.length > visibleReviewsCount && (
                                <button onClick={() => setVisibleReviewsCount(v => v + 4)} className="w-full py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">Load more reviews ({reviews.length - visibleReviewsCount})</button>
                            )}
                        </div>
                      </div>

                      {/* Right Side: Comments */}
                      <div className="space-y-10">
                         <div className="flex items-center justify-between">
                           <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Community Dialogue</h2>
                           <span className="text-[10px] font-black text-gray-500 bg-[#0a0a0a] px-3 py-1 rounded-full uppercase tracking-widest border border-[#1a1a1a]">{comments.length} Thoughts</span>
                        </div>

                        <div className="relative group">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add to the discussion..."
                                className="w-full h-40 bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-6 text-white placeholder-gray-700 outline-none focus:border-red-500/30 focus:bg-black transition-all text-sm resize-none shadow-2xl"
                            />
                            <div className="absolute bottom-6 right-6">
                                <button
                                    onClick={() => handleCommentSubmit()}
                                    className="px-6 py-2.5 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
                                    disabled={!newComment.trim()}
                                >
                                    Send
                                </button>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {comments.slice(0, visibleCommentsCount).map((comment: any) => (
                                <div key={comment.id} className="relative pl-4 border-l border-[#1a1a1a]">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-[#0a0a0a] border border-[#1a1a1a] overflow-hidden flex items-center justify-center font-black text-[10px] text-gray-500">
                                            {comment.user?.image ? <img src={comment.user.image} className="w-full h-full object-cover" /> : comment.user?.name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-white uppercase tracking-tight">{comment.user?.name || 'Anonymous'}</p>
                                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-4 leading-relaxed max-w-lg">{comment.content}</p>
                                    <button
                                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                        className="text-[10px] font-black text-red-500/70 hover:text-red-500 uppercase tracking-[0.2em] transition-colors"
                                    >
                                        Reply
                                    </button>

                                    {replyingTo === comment.id && (
                                        <div className="mt-6 flex flex-col gap-3">
                                            <textarea
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                placeholder="Write your response..."
                                                className="w-full h-24 bg-[#0a0a0a] border border-[#222] rounded-xl p-4 text-sm text-white outline-none focus:border-white/20"
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => handleCommentSubmit(comment.id)} className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg">Reply</button>
                                                <button onClick={() => setReplyingTo(null)} className="px-4 py-2 text-gray-500 text-[10px] font-black uppercase tracking-widest">Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {comments.length > visibleCommentsCount && (
                                <button onClick={() => setVisibleCommentsCount(v => v + 5)} className="w-full py-10 text-[10px] font-black text-gray-700 uppercase tracking-[0.4em] hover:text-red-500 transition-colors">Discover more perspectives</button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Related Content */}
            <div className="w-full lg:w-96 lg:border-l border-[#1a1a1a] bg-black px-4 sm:px-6 lg:px-6 py-6 lg:py-10 relative z-10 no-scrollbar">
              
              {/* Product Shots Gallery - Premium Horizontal Scroll */}
              {(() => {
                const shots = relatedProducts.filter(p => p.isShots);
                if (shots.length === 0) return null;
                return (
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <div className="w-1 h-3 bg-red-600 rounded-full" />
                        Exclusive Shots
                      </h2>
                    </div>
                    <div className="flex lg:flex-wrap lg:grid lg:grid-cols-2 gap-3 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
                      {shots.slice(0, 4).map((shot: any) => (
                        <div 
                          key={shot.id}
                          onClick={() => router.push(`/channel/${channel.slug}/products/${shot.id}`)}
                          className="flex-shrink-0 w-40 lg:w-full group cursor-pointer"
                        >
                          <div className="relative aspect-[9/16] lg:aspect-video rounded-xl overflow-hidden bg-[#0a0a0a] border border-[#1a1a1a] transition-all group-hover:border-red-500/50 group-hover:shadow-[0_0_20px_rgba(229,9,20,0.1)]">
                            {shot.previewImage ? (
                              <img src={shot.previewImage} alt={shot.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-800">
                                <FilmIcon className="w-6 h-6" />
                              </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black to-transparent">
                              <p className="text-[9px] font-black text-white truncate uppercase tracking-tight">{shot.title}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1 h-3 bg-white/20 rounded-full" />
                  Continue Watching
                </h2>
              </div>

              {relatedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-[#222] rounded-2xl bg-[#050505]">
                  <FolderIcon className="w-6 h-6 text-gray-700 mb-2" />
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">End of Collection</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {relatedProducts.filter(p => !p.isShots).slice(0, 10).map((relatedProduct: any) => {
                    const canAccessRelated = isOwner || !relatedProduct.isSubscriberOnly || !channel?.subscriptionEnabled || hasActiveSubscription;
                    
                    return (
                      <div
                        key={relatedProduct.id}
                        onClick={() => router.push(`/channel/${channel.slug}/products/${relatedProduct.id}`)}
                        className={`group flex gap-3 rounded-xl transition-all duration-300 p-1.5 ${canAccessRelated ? 'cursor-pointer hover:bg-[#0a0a0a]' : 'cursor-not-allowed opacity-50'}`}
                      >
                        <div className="relative w-28 h-18 sm:w-32 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-[#0a0a0a] border border-[#1a1a1a]">
                          {relatedProduct.previewImage ? (
                            <img src={relatedProduct.previewImage} alt={relatedProduct.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-800">
                              {getContentIcon(relatedProduct.type)}
                            </div>
                          )}
                          {!canAccessRelated && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                              <div className="p-1.5 bg-black/40 rounded-full border border-white/10">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                          <h3 className="text-xs font-black text-white line-clamp-2 leading-tight group-hover:text-red-500 transition-colors uppercase tracking-tight">
                            {relatedProduct.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                             <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{formatNumber(relatedProduct.viewCount || 0)} views</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Discover More: Other Channels */}
              {otherChannelProducts.length > 0 && (
                <div className="space-y-6 pt-12 border-t border-[#1a1a1a]">
                   <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Deep Discoveries</h2>
                   <div className="grid grid-cols-1 gap-6">
                      {otherChannelProducts.slice(0, 5).map((p: any) => (
                         <div 
                           key={p.id}
                           onClick={() => router.push(`/channel/${p.channelSlug}/products/${p.id}`)}
                           className="group cursor-pointer"
                         >
                            <div className="aspect-[16/10] bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl overflow-hidden relative mb-4">
                               <img src={p.previewImage} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                               <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black to-transparent">
                                  <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.3em] mb-2 block">{p.channelName}</span>
                                  <h3 className="text-sm font-black text-white uppercase tracking-tighter italic">{p.title}</h3>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Modals - Consistent Premium Style */}
        <AnimatePresence>
          {showSubscriptionModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
              <div className="relative w-full max-w-lg bg-[#050505] border border-[#1a1a1a] rounded-[40px] p-12 text-center overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.02)]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>
                
                <button 
                  onClick={() => setShowSubscriptionModal(false)}
                  className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-8 h-8" />
                </button>

                <div className="mb-10">
                   <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.5em] mb-4 block">Membership Access</span>
                   <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-4">Support {channel.name}</h2>
                   <p className="text-sm text-gray-500 font-bold max-w-xs mx-auto">Get full access to all premium content and support the creator directly.</p>
                </div>

                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-8 mb-10">
                   <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-5xl font-black text-white tracking-tighter italic">
                        {formatPrice(Number(channel.subscriptionPrice) || 0, channel.subscriptionCurrency || 'INR')}
                      </span>
                      <span className="text-xs font-black text-gray-600 uppercase tracking-widest">/ monthly</span>
                   </div>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Unlock 30 days of pure content</p>
                </div>

                <div className="space-y-4">
                   <button 
                     onClick={handleSubscribe}
                     disabled={subscribing}
                     className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-gray-200 transition-all active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.05)]"
                   >
                     {subscribing ? 'Processing Transaction...' : 'Confirm Membership'}
                   </button>
                   <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest italic">Encrypted Secure Checkout</p>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Subscribers List Modal */}
        {showSubscribersList && channel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#e50914]/50 backdrop-blur-sm">
            <div
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
              style={{ backgroundColor }}
            >
              <div className="sticky top-0 flex items-center justify-between p-6 border-b z-10 backdrop-blur-md bg-[#1a1a1a]/80" style={{ borderColor: `${textColor}10` }}>
                <div>
                   <h2 className="text-2xl font-black mb-1" style={{ color: textColor }}>Subscribers</h2>
                   <p className="text-sm font-medium opacity-70" style={{ color: textColor }}>
                      {subscribers.length} total • {subscribers.filter((sub: any) => sub.status === 'ACTIVE' && new Date(sub.endDate) > new Date()).length} active
                   </p>
                </div>
                <button
                  onClick={() => setShowSubscribersList(false)}
                  className="p-2 rounded-xl transition-colors hover:bg-[#333]"
                  style={{ color: textColor }}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {subscribers.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-block p-6 rounded-full mb-4 bg-[#141414]" style={{ backgroundColor: `${primaryColor}10` }}>
                      <UserCircleIcon className="w-16 h-16" style={{ color: primaryColor }} />
                    </div>
                    <p className="text-xl font-bold mb-2" style={{ color: textColor }}>No subscribers yet</p>
                    <p className="text-sm opacity-60 max-w-sm mx-auto" style={{ color: textColor }}>
                      Share your channel on social media to start getting your first subscribers!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subscribers.map((subscriber: any) => (
                      <div
                        key={subscriber.id}
                        className="flex items-center gap-4 p-4 rounded-2xl border transition-colors hover:bg-[#141414]"
                        style={{ borderColor: `${textColor}10` }}
                      >
                         {/* Subscriber Row Content */}
                         {subscriber.user?.image ? (
                           <img src={subscriber.user.image} className="w-12 h-12 rounded-full object-cover ring-2 ring-white" />
                         ) : (
                           <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                             {(subscriber.user?.name || 'U')[0]?.toUpperCase()}
                           </div>
                         )}
                         <div className="flex-1 min-w-0">
                           <p className="font-bold text-sm truncate" style={{ color: textColor }}>{subscriber.user?.name || subscriber.user?.email || 'Anonymous'}</p>
                           <p className="text-xs opacity-60 truncate font-medium" style={{ color: textColor }}>{subscriber.user?.email}</p>
                         </div>
                         <div className="text-right">
                           <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${subscriber.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                             {subscriber.status}
                           </span>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modals */}
        <AnimatePresence>
          {showSuccessModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
               <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-10 text-center max-w-sm w-full">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                     <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Transaction Success</h3>
                  <p className="text-sm text-gray-500 mb-8">{modalMessage}</p>
                  <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl">Continue</button>
               </div>
            </div>
          )}
          
          {showErrorModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
               <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-10 text-center max-w-sm w-full">
                  <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                     <XCircleIcon className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Action Failed</h3>
                  <p className="text-sm text-gray-500 mb-8">{modalMessage}</p>
                  <button onClick={() => setShowErrorModal(false)} className="w-full py-4 bg-[#111] text-white border border-[#222] font-black uppercase tracking-widest text-[10px] rounded-xl">Close</button>
               </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <SaveToPlaylistModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        productId={product.id}
      />
      
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        title={product.title}
        description={product.description}
      />
    </MainLayout>
  );
}
