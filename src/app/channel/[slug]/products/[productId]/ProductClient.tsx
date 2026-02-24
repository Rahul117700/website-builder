'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
  FlagIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  StarIcon as StarIconSolid,
  FlagIcon as FlagIconSolid
} from '@heroicons/react/24/solid';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import MainLayout from '@/components/layout/MainLayout';
import SaveToPlaylistModal from '@/components/modals/SaveToPlaylistModal';
import ShareModal from '@/components/modals/ShareModal';
import OptimizedMediaLoader from '@/components/ui/OptimizedMediaLoader';

// Utility for formatting numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export default function ProductClient() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [product, setProduct] = useState<any>(null);
  const [channel, setChannel] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
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
      return (
        <div className="w-full relative">
          <OptimizedMediaLoader type="video">
            {canAccess ? (
              normalizedVideoUrl ? (
                <div className="absolute inset-0">
                  <video
                    ref={(el) => {
                      if (el) setVideoElement(el);
                    }}
                    src={normalizedVideoUrl || ''}
                    controls
                    autoPlay
                    playsInline
                    muted={false}
                    preload="metadata"
                    className="w-full h-full"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onError={(e) => {
                      console.error('Video playback error:', e);
                      console.error('Video source:', normalizedVideoUrl);
                    }}
                    style={{ objectFit: 'cover', backgroundColor: 'transparent' }}
                  >
                    <source src={normalizedVideoUrl} type={product.fileType || 'video/mp4'} />
                    Your browser does not support the video tag.
                  </video>

                  {/* Quality Selector */}
                  <div className="absolute bottom-16 right-4 z-10">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowQualityMenu(!showQualityMenu);
                        }}
                        className="px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white text-sm font-medium rounded flex items-center gap-2 transition-colors backdrop-blur-sm"
                      >
                        <span>{selectedQuality === 'auto' ? 'Auto' : selectedQuality}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <VideoCameraIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Video not available</p>
                  </div>
                </div>
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <VideoCameraIcon className="h-16 w-16 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70 text-lg font-medium mb-4">Subscribe to watch</p>
                  <button
                    onClick={() => setShowSubscriptionModal(true)}
                    className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition"
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
                    <div className="md:hidden w-full h-full flex flex-col items-center justify-center bg-gray-50 p-6 text-center border border-gray-100 rounded-lg">
                      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4">
                        <DocumentTextIcon className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{product.title}</h3>
                      <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">This document is optimized for mobile viewing.</p>
                      <a
                        href={fileUrl.startsWith('http') ? `/api/proxy-pdf?url=${encodeURIComponent(fileUrl)}` : fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
                      >
                        <DocumentTextIcon className="w-5 h-5" />
                        View PDF
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8">
                    <DocumentTextIcon className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">Document Preview</p>
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
                    className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition"
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
                    className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition"
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
                  className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition"
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
              className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Subscribe Now
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product || !channel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h1>
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
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 w-full relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-200/10 to-pink-200/10 rounded-full blur-3xl"></div>
        </div>

        {/* Main Content - Full Width */}
        <div className="w-full">
          <div className="flex flex-col lg:flex-row">
            {/* Main Content Area - Full Width */}
            <div className="flex-1 w-full">
              {/* Video/Content Player - Full Width */}
              <div className="w-full">
                {renderContent()}
              </div>

              {/* Content Details - Full Width with Padding */}
              <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">{product.title}</h1>

                {/* Channel Info & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {channel.user?.image ? (
                      <div
                        className="relative group cursor-pointer"
                        onClick={() => router.push(`/channel/${params?.slug}`)}
                      >
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 blur-md transition-opacity"></div>
                        <img
                          src={channel.user.image}
                          alt={channel.user.name || 'Creator'}
                          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full ring-2 ring-white shadow-lg"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center ring-2 ring-white shadow-lg cursor-pointer"
                        onClick={() => router.push(`/channel/${params?.slug}`)}
                      >
                        <span className="text-indigo-600 font-bold text-lg">
                          {(channel.user?.name || channel.name || 'C')[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3
                        className="font-bold text-gray-900 text-base sm:text-lg cursor-pointer hover:text-indigo-600 transition-colors"
                        onClick={() => router.push(`/channel/${params?.slug}`)}
                      >
                        {channel.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {channel._count?.subscribers || channel.subscribers?.length || 0} subscribers
                      </p>
                    </div>
                    {channel.subscriptionEnabled && !isOwner && (
                      <button
                        onClick={() => {
                          if (!session?.user?.id) {
                            router.push('/auth/signin');
                            return;
                          }
                          if (!hasActiveSubscription) {
                            setShowSubscriptionModal(true);
                          }
                        }}
                        disabled={hasActiveSubscription}
                        className="hidden sm:block px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-red-200/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      >
                        {hasActiveSubscription ? 'Subscribed' : 'Subscribe'}
                      </button>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleLikeToggle}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all hover:shadow-md"
                    >
                      {isLiked ? (
                        <HeartIconSolid className="h-5 w-5 text-red-600" />
                      ) : (
                        <HeartIcon className="h-5 w-5 text-gray-600" />
                      )}
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        {product.likeCount || 0}
                      </span>
                    </button>
                    <button
                      onClick={() => setIsBookmarked(!isBookmarked)}
                      className="p-2.5 rounded-xl bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all hover:shadow-md"
                    >
                      {isBookmarked ? (
                        <BookmarkIconSolid className="h-5 w-5 text-blue-600" />
                      ) : (
                        <BookmarkIcon className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsSaveModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all hover:shadow-md"
                    >
                      <PlusCircleIcon className="h-5 w-5 text-gray-600" />
                      <span className="hidden sm:inline text-sm font-medium text-gray-700">Save</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all hover:shadow-md"
                    >
                      <ShareIcon className="h-5 w-5 text-gray-600" />
                      <span className="hidden sm:inline text-sm font-medium text-gray-700">Share</span>
                    </button>
                    {product.fileUrl && (product.type?.toUpperCase() !== 'VIDEO' && product.type?.toUpperCase() !== 'VIDEOS') && (
                      <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all hover:shadow-md">
                        <ArrowDownTrayIcon className="h-5 w-5 text-gray-600" />
                        <span className="hidden sm:inline text-sm font-medium text-gray-700">Download</span>
                      </button>
                    )}
                    <div className="relative">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsReporting(!isReporting); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all hover:shadow-md ${isReporting ? 'bg-amber-50 text-amber-600 border-amber-300' : 'bg-white border-gray-200 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 text-gray-700'}`}
                      >
                        {isReporting ? <FlagIconSolid className="h-5 w-5 text-amber-500" /> : <FlagIcon className="h-5 w-5" />}
                        <span className="hidden sm:inline text-sm font-medium">Report</span>
                      </button>

                      {isReporting && (
                        <div className="absolute right-0 top-14 w-60 bg-white shadow-[0_10px_40px_-5px_rgba(0,0,0,0.2)] rounded-2xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                          <p className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                            <FlagIcon className="w-4 h-4 text-amber-500" /> Report Content
                          </p>
                          <select
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="w-full text-sm p-2.5 rounded-xl border border-gray-200 mb-4 outline-none bg-gray-50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                          >
                            <option>Inappropriate content</option>
                            <option>Pornography or Nudity</option>
                            <option>Copyright violation</option>
                            <option>Spam or misleading</option>
                            <option>Other</option>
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setIsReporting(false)}
                              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold py-2.5 rounded-xl transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={submitReport}
                              disabled={isSubmittingReport}
                              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold py-2.5 rounded-xl disabled:opacity-50 transition-colors shadow-md shadow-amber-500/20"
                            >
                              {isSubmittingReport ? '...' : 'Submit'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {product.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {!isOwner && channel.subscriptionEnabled && (
                      <button
                        onClick={() => {
                          if (!session?.user?.id) {
                            router.push('/auth/signin');
                            return;
                          }
                          setShowSubscriptionModal(true);
                        }}
                        disabled={hasActiveSubscription}
                        className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {hasActiveSubscription ? 'Subscribed' : 'Subscribe Now'}
                      </button>
                    )}
                  </div>
                  {product.description && (
                    <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{product.description}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 mb-6">
                  <span>{product.viewCount || 0} views</span>
                  <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                  <span>{product.type}</span>
                </div>

                {/* Ratings Section */}
                <div className="mb-12">
                  <button
                    onClick={() => setReviewsExpanded(!reviewsExpanded)}
                    className="w-full flex md:hidden items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm mb-4"
                  >
                    <div className="flex items-center gap-3">
                      <StarIconSolid className="w-5 h-5 text-yellow-400" />
                      <span className="font-bold text-gray-900">Ratings & Reviews ({totalReviews})</span>
                    </div>
                    {reviewsExpanded ? (
                      <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    )}
                  </button>

                  <div className={`${reviewsExpanded ? 'block' : 'hidden'} md:block`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-1">
                            {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                          </div>
                          <div className="flex items-center justify-center mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIconSolid
                                key={star}
                                className={`h-4 w-4 ${star <= Math.round(averageRating)
                                  ? 'text-yellow-400'
                                  : 'text-gray-200'
                                  }`}
                              />
                            ))}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">{totalReviews} reviews</div>
                        </div>
                        <div className="h-16 w-px bg-gray-100 hidden sm:block" />
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 mb-1">Ratings & Reviews</h2>
                          <p className="text-sm text-gray-500">Real feedback from actual users of this content.</p>
                        </div>
                      </div>
                    </div>

                    {/* User Rating Form */}
                    {session?.user?.id && (
                      <div className="bg-indigo-50/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-indigo-100/50 transition-all hover:shadow-md">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <StarIcon className="w-5 h-5 text-indigo-600" />
                          Rate this product
                        </h3>
                        <div className="flex items-center gap-3 mb-5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setUserRating(star)}
                              className="group relative focus:outline-none transition-transform hover:scale-110 active:scale-95"
                              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                            >
                              {star <= userRating ? (
                                <StarIconSolid className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-400 drop-shadow-sm" />
                              ) : (
                                <StarIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300 group-hover:text-yellow-200 transition-colors" />
                              )}
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Tell us what you think about this content..."
                          className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base text-gray-900 mb-4 shadow-sm transition-all focus:shadow-md resize-none"
                          rows={3}
                        />
                        <button
                          onClick={handleRatingSubmit}
                          disabled={userRating === 0}
                          className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:shadow-none translate-y-0 active:translate-y-0.5"
                        >
                          Submit Review
                        </button>
                      </div>
                    )}

                    {/* Reviews List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reviews.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                          <p className="text-sm text-gray-500 font-medium">No reviews yet. Be the first to share your thoughts!</p>
                        </div>
                      ) : (
                        reviews.map((review: any) => (
                          <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4 mb-3">
                              {review.user?.image ? (
                                <img
                                  src={review.user.image}
                                  alt={review.user.name || 'User'}
                                  className="w-10 h-10 rounded-full ring-2 ring-gray-50"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-2 border-white shadow-sm">
                                  <span className="text-indigo-600 font-bold text-xs">
                                    {(review.user?.name || 'U')[0].toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                  <span className="font-bold text-sm text-gray-900 truncate">
                                    {review.user?.name || 'Anonymous'}
                                  </span>
                                  <div className="flex items-center bg-yellow-50 px-1.5 py-0.5 rounded-md">
                                    <StarIconSolid className="h-3 w-3 text-yellow-500 mr-1" />
                                    <span className="text-[10px] font-bold text-yellow-700">{review.rating}</span>
                                  </div>
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                  {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-gray-600 leading-relaxed italic line-clamp-3">"{review.comment}"</p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="mb-6">
                  <button
                    onClick={() => setCommentsExpanded(!commentsExpanded)}
                    className="w-full flex md:hidden items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm mb-4"
                  >
                    <div className="flex items-center gap-3">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-700" />
                      <span className="font-bold text-gray-900">Comments ({comments.length})</span>
                    </div>
                    {commentsExpanded ? (
                      <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    )}
                  </button>

                  <div className={`${commentsExpanded ? 'block' : 'hidden'} md:block`}>
                    {/* Comments Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                          <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-700" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 leading-none mb-1">
                            Comments
                          </h2>
                          <p className="text-xs text-gray-500 font-medium">{comments.length} discussions happening</p>
                        </div>
                      </div>
                    </div>

                    {/* Comment Form */}
                    <div className="mb-10">
                      {session?.user?.id ? (
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md focus-within:shadow-md focus-within:border-indigo-100">
                          <div className="flex gap-4 mb-4">
                            {session.user.image ? (
                              <img
                                src={session.user.image}
                                alt={session.user.name || 'You'}
                                className="w-10 h-10 rounded-full ring-2 ring-gray-50 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                                <span className="text-gray-600 font-bold text-xs">
                                  {(session.user.name || 'Y')[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="flex-1">
                              <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Join the conversation..."
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none focus:bg-white focus:border-indigo-100 text-sm sm:text-base text-gray-900 transition-all resize-none"
                                rows={2}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleCommentSubmit()}
                              disabled={!newComment.trim()}
                              className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-sm disabled:opacity-30 disabled:shadow-none active:scale-95"
                            >
                              Post Comment
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50/50 rounded-2xl p-8 border border-dashed border-gray-200 text-center">
                          <p className="text-sm text-gray-500 font-medium mb-4">Sign in to share your thoughts with the community</p>
                          <button
                            onClick={() => router.push('/auth/signin')}
                            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                          >
                            Sign In to Comment
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Comments List */}
                    <div className="space-y-8">
                      {comments.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-12 italic font-medium">No comments yet. Start the conversation!</p>
                      ) : (
                        comments.map((comment: any) => (
                          <div key={comment.id} className="group relative">
                            <div className="flex gap-4">
                              <div className="flex flex-col items-center gap-2">
                                {comment.user?.image ? (
                                  <img
                                    src={comment.user.image}
                                    alt={comment.user.name || 'User'}
                                    className="w-10 h-10 rounded-full ring-2 ring-gray-50 shadow-sm"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-white shadow-sm font-bold text-gray-500 text-xs">
                                    {(comment.user?.name || 'U')[0].toUpperCase()}
                                  </div>
                                )}
                                <div className="w-px flex-1 bg-gray-100 group-last:hidden" />
                              </div>
                              <div className="flex-1 pb-2">
                                {/* Main Comment Box */}
                                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-all hover:shadow-md group-hover:border-indigo-100/50">
                                  <div className="flex items-center justify-between gap-2 mb-3">
                                    <span className="font-bold text-sm text-gray-900">
                                      {comment.user?.name || 'Anonymous'}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                      {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{comment.content}</p>
                                  {session?.user?.id && (
                                    <button
                                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                    >
                                      <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                      {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                                    </button>
                                  )}
                                </div>

                                {/* Reply Form */}
                                {replyingTo === comment.id && session?.user?.id && (
                                  <div className="mt-4 bg-indigo-50/30 rounded-2xl p-4 border border-indigo-100/50 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex gap-3 mb-4">
                                      {session.user.image ? (
                                        <img
                                          src={session.user.image}
                                          alt={session.user.name || 'You'}
                                          className="w-8 h-8 rounded-full ring-2 ring-white"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm font-bold text-indigo-600 text-[10px]">
                                          {(session.user.name || 'Y')[0].toUpperCase()}
                                        </div>
                                      )}
                                      <textarea
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder="Write your response..."
                                        className="flex-1 px-4 py-2.5 bg-white border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 shadow-sm transition-all focus:shadow-md resize-none"
                                        rows={2}
                                      />
                                    </div>
                                    <div className="flex justify-end gap-3">
                                      <button
                                        onClick={() => {
                                          setReplyingTo(null);
                                          setReplyContent('');
                                        }}
                                        className="px-4 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleCommentSubmit(comment.id)}
                                        disabled={!replyContent.trim()}
                                        className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm active:scale-95 disabled:opacity-30"
                                      >
                                        Post Reply
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Replies List */}
                                {comment.replies && comment.replies.length > 0 && (
                                  <div className="mt-4 space-y-4 ml-2 border-l-2 border-gray-100/50 pl-4">
                                    {comment.replies.map((reply: any) => (
                                      <div key={reply.id} className="relative">
                                        <div className="flex gap-3">
                                          {reply.user?.image ? (
                                            <img
                                              src={reply.user.image}
                                              alt={reply.user.name || 'User'}
                                              className="w-8 h-8 rounded-full ring-2 ring-gray-50 shadow-sm"
                                            />
                                          ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border border-white shadow-sm font-bold text-gray-400 text-[10px]">
                                              {(reply.user?.name || 'U')[0].toUpperCase()}
                                            </div>
                                          )}
                                          <div className="flex-1 bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50 transition-all hover:border-indigo-100/30">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                              <span className="font-bold text-xs text-gray-900">
                                                {reply.user?.name || 'Anonymous'}
                                              </span>
                                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {new Date(reply.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                              </span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{reply.content}</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Related Products */}
            <div className="w-full lg:w-96 lg:border-l border-gray-200 bg-white/60 backdrop-blur-md lg:bg-white/80 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">More from {channel.name}</h2>
                <div className="h-1 w-12 bg-indigo-500 rounded-full hidden lg:block"></div>
              </div>

              {relatedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-100 rounded-3xl">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <FolderIcon className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm font-bold text-gray-400">No other products available</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-5">
                  {relatedProducts.map((relatedProduct: any) => {
                    // Check if user can access this related product
                    const canAccessRelated = isOwner || !relatedProduct.isSubscriberOnly || !channel?.subscriptionEnabled || hasActiveSubscription;

                    const handleRelatedProductClick = () => {
                      if (canAccessRelated) {
                        router.push(`/channel/${params?.slug}/products/${relatedProduct.id}`);
                      } else {
                        // Show subscription modal if they don't have access
                        setShowSubscriptionModal(true);
                      }
                    };

                    return (
                      <div
                        key={relatedProduct.id}
                        onClick={handleRelatedProductClick}
                        className={`group flex flex-col lg:flex-row gap-2 rounded-none transition-all duration-500 bg-transparent border-none ${canAccessRelated
                          ? 'cursor-pointer hover:bg-gray-50/50 hover:-translate-y-1 active:scale-95'
                          : 'cursor-not-allowed opacity-75'
                          }`}
                      >
                        {/* Thumbnail Container */}
                        <div className="relative w-full lg:w-32 h-28 lg:h-20 flex-shrink-0 rounded-none overflow-hidden bg-gray-50 shadow-inner">
                          {relatedProduct.previewImage ? (
                            <img
                              src={relatedProduct.previewImage}
                              alt={relatedProduct.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              {getContentIcon(relatedProduct.type)}
                            </div>
                          )}

                          {/* Overlays */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                          {/* Play Icon for Videos */}
                          {(relatedProduct.type === 'VIDEO' || relatedProduct.type === 'VIDEOS') && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 scale-90 group-hover:scale-100 transition-transform duration-300">
                                <PlayIcon className="h-5 w-5 text-white shadow-sm" />
                              </div>
                            </div>
                          )}

                          {/* Locked State */}
                          {!canAccessRelated && (
                            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                              <div className="p-2 bg-white/20 rounded-full border border-white/40">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </div>
                            </div>
                          )}

                          {/* Free Badge */}
                          {relatedProduct.isFree && (
                            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-green-500 text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-sm">
                              Free
                            </div>
                          )}
                        </div>

                        {/* Content Container */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <h3 className="text-xs lg:text-sm font-black text-gray-900 line-clamp-2 leading-tight lg:leading-snug group-hover:text-indigo-600 transition-colors duration-300">
                              {relatedProduct.title}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] font-bold text-gray-400 truncate max-w-[80px]">
                                {channel.name}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                              <span className="text-[10px] font-bold text-gray-500">
                                {formatNumber(relatedProduct.viewCount || 0)} views
                              </span>
                            </div>
                          </div>

                          {/* Sub Only Badge */}
                          {!canAccessRelated && relatedProduct.isSubscriberOnly && channel?.subscriptionEnabled && (
                            <div className="mt-2 flex">
                              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                                Sub Exclusive
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Mobile CTA for Non-Subscribers */}
        {!hasActiveSubscription && channel?.subscriptionEnabled && !isOwner && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-4 pb-safe md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.1)] animation-slide-up">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Unlock Full Access</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-gray-900">
                    {(() => {
                      const priceValue = channel.subscriptionPrice;
                      let price = 0;
                      if (priceValue !== null && priceValue !== undefined) {
                        if (typeof priceValue === 'string') {
                          price = parseFloat(priceValue) || 0;
                        } else if (typeof priceValue === 'object' && 'toNumber' in priceValue) {
                          price = priceValue.toNumber();
                        } else {
                          price = Number(priceValue) || 0;
                        }
                      }
                      return formatPrice(price, channel.subscriptionCurrency || 'INR');
                    })()}
                  </span>
                  <span className="text-xs font-medium text-gray-500">/month</span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!session?.user?.id) {
                    router.push('/auth/signin');
                    return;
                  }
                  setShowSubscriptionModal(true);
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        )}

        {/* Subscription Modal */}
        {showSubscriptionModal && channel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-3xl shadow-2xl bg-white overflow-hidden">
              {/* Header Pattern */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-blue-600 to-indigo-600 opacity-10"></div>

              <div className="relative p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Unlock Access</h2>
                    <p className="text-sm text-gray-500 font-medium">Support {channel.name} & get exclusive content</p>
                  </div>
                  <button
                    onClick={() => setShowSubscriptionModal(false)}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors -mr-2 -mt-2"
                  >
                    <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-900" />
                  </button>
                </div>

                <div className="mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 mb-4 relative overflow-hidden group hover:border-blue-200 transition-colors">
                    <div className="absolute top-0 right-0 px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-bl-xl">
                      Best Value
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900 flex items-center gap-2">
                        <StarIconSolid className="w-5 h-5 text-yellow-400" />
                        Monthly Access
                      </span>
                      <span className="text-3xl font-black text-blue-600 tracking-tight">
                        {(() => {
                          const priceValue = channel.subscriptionPrice;
                          let price = 0;
                          if (priceValue !== null && priceValue !== undefined) {
                            if (typeof priceValue === 'string') {
                              price = parseFloat(priceValue) || 0;
                            } else if (typeof priceValue === 'object' && 'toNumber' in priceValue) {
                              price = priceValue.toNumber();
                            } else {
                              price = Number(priceValue) || 0;
                            }
                          }
                          return formatPrice(price, channel.subscriptionCurrency || 'INR');
                        })()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">
                      Get instant access to all premium videos, documents, and resources in this channel for 30 days.
                    </p>
                  </div>

                  {/* Trust Signals */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-xs font-bold text-gray-600">Cancel anytime</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">🔒</div>
                      <span className="text-xs font-bold text-gray-600">Secure payment</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSubscriptionModal(false)}
                    className="flex-1 px-4 py-3.5 border-2 border-gray-100 text-gray-700 rounded-xl text-base font-bold hover:bg-gray-50 hover:border-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    className="flex-[2] px-4 py-3.5 bg-gray-900 text-white rounded-xl text-base font-bold hover:bg-black transition-all shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {subscribing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Subscribe Now</span>
                    )}
                  </button>
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-4 font-medium">
                  By subscribing, you agree to our Terms of Service.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Subscribers List Modal */}
        {showSubscribersList && channel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
              style={{ backgroundColor }}
            >
              <div className="sticky top-0 flex items-center justify-between p-6 border-b z-10 backdrop-blur-md bg-white/80" style={{ borderColor: `${textColor}10` }}>
                <div>
                  <h2 className="text-2xl font-black mb-1" style={{ color: textColor }}>
                    Subscribers
                  </h2>
                  <p className="text-sm font-medium opacity-70" style={{ color: textColor }}>
                    {subscribers.length} total • {subscribers.filter((sub: any) => sub.status === 'ACTIVE' && new Date(sub.endDate) > new Date()).length} active
                  </p>
                </div>
                <button
                  onClick={() => setShowSubscribersList(false)}
                  className="p-2 rounded-xl transition-colors hover:bg-gray-100"
                  style={{ color: textColor }}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {subscribers.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-block p-6 rounded-full mb-4 bg-gray-50" style={{ backgroundColor: `${primaryColor}10` }}>
                      <UserCircleIcon className="w-16 h-16" style={{ color: primaryColor }} />
                    </div>
                    <p className="text-xl font-bold mb-2" style={{ color: textColor }}>
                      No subscribers yet
                    </p>
                    <p className="text-sm opacity-60 max-w-sm mx-auto" style={{ color: textColor }}>
                      Share your channel on social media to start getting your first subscribers!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subscribers.map((subscriber: any) => (
                      <div
                        key={subscriber.id}
                        className="flex items-center gap-4 p-4 rounded-2xl border transition-colors hover:bg-gray-50"
                        style={{
                          borderColor: `${textColor}10`,
                        }}
                      >
                        {subscriber.user?.image ? (
                          <img
                            src={subscriber.user.image}
                            alt={subscriber.user.name || 'Subscriber'}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                            {(subscriber.user?.name || 'U')[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate" style={{ color: textColor }}>
                            {subscriber.user?.name || subscriber.user?.email || 'Anonymous'}
                          </p>
                          <p className="text-xs opacity-60 truncate font-medium" style={{ color: textColor }}>
                            {subscriber.user?.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${subscriber.status === 'ACTIVE' && new Date(subscriber.endDate) > new Date()
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-700'
                              }`}
                          >
                            {subscriber.status === 'ACTIVE' && new Date(subscriber.endDate) > new Date() ? 'Active' : 'Expired'}
                          </span>
                          <p className="text-[10px] mt-1.5 opacity-60 font-medium uppercase tracking-wider" style={{ color: textColor }}>
                            Ends {new Date(subscriber.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-sm rounded-3xl shadow-2xl bg-white p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-500 font-medium mb-8 leading-relaxed">{modalMessage}</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-6 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-transform active:scale-95"
              >
                Okay, got it
              </button>
            </div>
          </div>
        )}

        {/* Error Modal */}
        {showErrorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-sm rounded-3xl shadow-2xl bg-white p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <XCircleIcon className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Oops!</h3>
              <p className="text-gray-500 font-medium mb-8 leading-relaxed">{modalMessage}</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full px-6 py-3.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-transform active:scale-95"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save to Playlist Modal */}
      {channel && product && (
        <SaveToPlaylistModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          productId={product.id}
        />
      )}
      {channel && product && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          url={typeof window !== 'undefined' ? window.location.href : ''}
          title={product.title}
          description={product.description}
        />
      )}
    </MainLayout>
  );
}
