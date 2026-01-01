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
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';

export default function ProductPage() {
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
  const [commentsExpanded, setCommentsExpanded] = useState(false); // Collapsed by default on mobile
  
  // Success/Error Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

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

  const renderContent = () => {
    if (!product) return null;

    const productType = product.type?.toUpperCase() || '';
    const videoSource = product.videoUrl || product.fileUrl;
    const fileUrl = product.fileUrl;
    const canAccess = isOwner || !product.isSubscriberOnly || !channel?.subscriptionEnabled || hasActiveSubscription;

    if (productType === 'VIDEO' || productType === 'VIDEOS') {
      return (
        <div className="w-full bg-black px-2 sm:px-4 py-2 sm:py-4">
          <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
            {canAccess ? (
              videoSource ? (
                <div className="absolute inset-0">
                  <video
                    ref={(el) => {
                      if (el) setVideoElement(el);
                    }}
                    src={videoSource}
                    controls
                    autoPlay
                    className="w-full h-full rounded-lg"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onError={(e) => {
                      console.error('Video playback error:', e);
                      console.error('Video source:', videoSource);
                    }}
                    onLoadStart={() => {
                      console.log('Video loading started:', videoSource);
                    }}
                    onLoadedData={() => {
                      console.log('Video loaded successfully:', videoSource);
                    }}
                    style={{ objectFit: 'contain' }}
                  >
                    <source src={videoSource} type={product.fileType || 'video/mp4'} />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Quality Selector - YouTube-style */}
                  <div className="absolute bottom-16 right-4 z-10">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowQualityMenu(!showQualityMenu);
                        }}
                        onBlur={() => {
                          // Delay closing to allow menu clicks
                          setTimeout(() => setShowQualityMenu(false), 200);
                        }}
                        className="px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white text-sm font-medium rounded flex items-center gap-2 transition-colors backdrop-blur-sm"
                        title="Quality"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>{selectedQuality === 'auto' ? 'Auto' : selectedQuality}</span>
                        <svg 
                          className={`w-4 h-4 transition-transform ${showQualityMenu ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {showQualityMenu && (
                        <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg overflow-hidden shadow-xl min-w-[140px] backdrop-blur-sm border border-white/10">
                          {[
                            { label: 'Auto', value: 'auto', description: 'Recommended' },
                            { label: '1080p', value: '1080p', description: 'HD' },
                            { label: '720p', value: '720p', description: 'HD' },
                            { label: '480p', value: '480p', description: 'SD' },
                            { label: '360p', value: '360p', description: 'SD' },
                            { label: '240p', value: '240p', description: 'Low' },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedQuality(option.value);
                                setShowQualityMenu(false);
                                
                                // For now, all qualities use the same source
                                // In future, this can be enhanced to switch between different quality URLs
                                if (videoElement) {
                                  // Pause and reload video when quality changes
                                  const wasPlaying = !videoElement.paused;
                                  const currentTime = videoElement.currentTime;
                                  
                                  // In future implementation:
                                  // videoElement.src = getQualityUrl(option.value);
                                  // For now, just reload the same source
                                  videoElement.load();
                                  
                                  if (wasPlaying) {
                                    videoElement.play().then(() => {
                                      videoElement.currentTime = currentTime;
                                    });
                                  } else {
                                    videoElement.currentTime = currentTime;
                                  }
                                }
                              }}
                              className={`w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center justify-between ${
                                selectedQuality === option.value ? 'bg-white/20' : ''
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{option.label}</span>
                                {option.description && (
                                  <span className="text-xs text-white/70">{option.description}</span>
                                )}
                              </div>
                              {selectedQuality === option.value && (
                                <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <VideoCameraIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Video not available</p>
                    <p className="text-gray-500 text-sm mt-2">No video URL found</p>
                    {product.fileUrl && (
                      <p className="text-gray-500 text-xs mt-1">File URL: {product.fileUrl}</p>
                    )}
                    {product.videoUrl && (
                      <p className="text-gray-500 text-xs mt-1">Video URL: {product.videoUrl}</p>
                    )}
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
          </div>
        </div>
      );
    }

    if (productType === 'DOCUMENT' || productType === 'DOCUMENTS') {
      return (
        <div className="w-full h-[600px] bg-gray-100 overflow-hidden">
          {canAccess ? (
            fileUrl ? (
              fileUrl.endsWith('.pdf') ? (
                <iframe
                  src={`${fileUrl}#toolbar=1`}
                  className="w-full h-full border-0"
                  title={product.title}
                  allow="fullscreen"
                />
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
        </div>
      );
    }

    if (productType === 'CODE') {
      return (
        <div className="w-full h-[600px] bg-gray-900 overflow-hidden">
          {canAccess ? (
            fileUrl ? (
              <iframe
                src={fileUrl}
                className="w-full h-full border-0"
                title={product.title}
                allow="fullscreen"
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
    <div className="min-h-screen bg-white w-full">
      {/* Premium Header/Navigation - Same as TemplateRenderer */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${backgroundColor}EE 0%, ${backgroundColor}DD 100%)`,
          borderColor: `${textColor}15`,
          boxShadow: `0 4px 20px ${textColor}08`,
        }}
      >
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 md:h-20">
            {/* Logo/Brand */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
              {channel.user?.image ? (
                <div className="relative group">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
                  <img
                    src={channel.user.image}
                    alt={sellerName}
                    className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-3 border-white shadow-lg object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                    style={{ borderColor: `${primaryColor}30` }}
                    onClick={() => router.push(`/channel/${params?.slug}`)}
                  />
                </div>
              ) : (
                <div 
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-3 shadow-lg cursor-pointer"
                  style={{ 
                    backgroundColor: `${primaryColor}15`,
                    borderColor: `${primaryColor}30`,
                    color: primaryColor,
                  }}
                  onClick={() => router.push(`/channel/${params?.slug}`)}
                >
                  <UserCircleIcon className="w-8 h-8" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 
                  className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold tracking-tight bg-gradient-to-r bg-clip-text text-transparent truncate cursor-pointer"
                  style={{ 
                    backgroundImage: `linear-gradient(135deg, ${textColor} 0%, ${primaryColor} 100%)`,
                  }}
                  onClick={() => router.push(`/channel/${params?.slug}`)}
                >
                  {channel.name}
                </h1>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {isOwner && channel.subscriptionEnabled && (
            <button
                  onClick={() => setShowSubscribersList(true)}
                  className="hidden md:flex items-center gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    color: primaryColor,
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Subscribers
            </button>
              )}
              {!isOwner && channel.subscriptionEnabled && (
                <div className="flex items-center gap-2 sm:gap-3">
                  {!session?.user ? (
                    <button 
                      onClick={() => router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/channel/${params?.slug}/products/${params?.productId}`)}`)}
                      className="hidden sm:flex px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 border-2 hover:scale-105 shadow-md hover:shadow-lg"
                      style={{
                        backgroundColor: 'transparent',
                        borderColor: `${primaryColor}40`,
                        color: primaryColor,
                      }}
                    >
                      Sign In
                    </button>
                  ) : (
                <button 
                  onClick={() => setShowSubscriptionModal(true)}
                  disabled={hasActiveSubscription}
                      className={`group relative flex items-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden ${
                        hasActiveSubscription 
                          ? 'bg-gray-400 text-white'
                          : 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white'
                      }`}
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="relative z-10 hidden sm:inline">{hasActiveSubscription ? 'Subscribed' : 'Subscribe'}</span>
                      <span className="relative z-10 sm:hidden">{hasActiveSubscription ? '✓' : '✓'}</span>
                      {!hasActiveSubscription && (
                        <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      )}
                </button>
              )}
            </div>
              )}
              
              {/* User Menu - Show when logged in */}
              {session?.user && (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="group flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: showUserMenu ? `${primaryColor}15` : 'transparent',
                      color: textColor,
                    }}
                  >
                    {session.user.image ? (
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
                        <img
                          src={session.user.image}
                          alt={session.user.name || 'User'}
                          className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
          </div>
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: `${primaryColor}15`,
                          color: primaryColor,
                        }}
                      >
                        <UserCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
                    )}
                    <span className="hidden lg:block text-xs sm:text-sm font-semibold truncate max-w-[100px]">{session.user.name || 'User'}</span>
                    <ChevronDownIcon className={`w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* User Menu Dropdown */}
                  {showUserMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div 
                        className="absolute right-0 mt-3 w-72 rounded-2xl shadow-2xl border-2 backdrop-blur-xl z-50 overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${backgroundColor}FF 0%, ${backgroundColor}F0 100%)`,
                          borderColor: `${primaryColor}30`,
                          boxShadow: `0 20px 60px ${textColor}20`,
                        }}
                      >
                        <div className="p-4 border-b" style={{ borderColor: `${textColor}10` }}>
                          <div className="flex items-center gap-3">
                            {session.user.image ? (
                              <img
                                src={session.user.image}
                                alt={session.user.name || 'User'}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                                style={{ 
                                  backgroundColor: `${primaryColor}15`,
                                  color: primaryColor,
                                }}
                              >
                                <UserCircleIcon className="w-8 h-8" />
                              </div>
                            )}
          <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate" style={{ color: textColor }}>
                                {session.user.name || 'User'}
                              </p>
                              <p className="text-xs truncate opacity-70" style={{ color: textColor }}>
                                {session.user.email}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              router.push('/auth/dashboard');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105"
                            style={{
                              backgroundColor: 'transparent',
                              color: textColor,
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${primaryColor}10`}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Dashboard
                          </button>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              router.push('/auth/dashboard/channels');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105"
                            style={{
                              backgroundColor: 'transparent',
                              color: textColor,
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${primaryColor}10`}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            My Channels
                          </button>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              router.push('/');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105"
                            style={{
                              backgroundColor: 'transparent',
                              color: textColor,
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${primaryColor}10`}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="flex-1 text-left">Want to Create your own channel ? click here</span>
                            <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                          <button
                            onClick={async () => {
                              setShowUserMenu(false);
                              const { signOut } = await import('next-auth/react');
                              signOut({ callbackUrl: '/' });
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 text-red-600"
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width */}
      <div className="w-full">
        <div className="flex flex-col lg:flex-row">
          {/* Main Content Area - Full Width */}
          <div className="flex-1 w-full">
            {/* Video/Content Player - Full Width */}
            <div className="w-full bg-black">
              {renderContent()}
            </div>

            {/* Content Details - Full Width with Padding */}
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
              
              {/* Channel Info & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3 sm:gap-4">
                  {channel.user?.image ? (
                    <img
                      src={channel.user.image}
                      alt={channel.user.name || 'Creator'}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 font-semibold text-sm sm:text-base">
                        {(channel.user?.name || channel.name || 'C')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{channel.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
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
                      className="hidden sm:block px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {hasActiveSubscription ? 'Subscribed' : 'Subscribe'}
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleLikeToggle}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    {isLiked ? (
                      <HeartIconSolid className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                    ) : (
                      <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                    )}
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      {product.likeCount || 0}
                    </span>
                  </button>
                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    {isBookmarked ? (
                      <BookmarkIconSolid className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    ) : (
                      <BookmarkIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                    )}
                  </button>
                  <button className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                    <ShareIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                    <span className="hidden sm:inline text-sm font-medium text-gray-700">Share</span>
                  </button>
                  {product.fileUrl && (product.type?.toUpperCase() !== 'VIDEO' && product.type?.toUpperCase() !== 'VIDEOS') && (
                    <button className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                      <ArrowDownTrayIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                      <span className="hidden sm:inline text-sm font-medium text-gray-700">Download</span>
                    </button>
                  )}
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
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Ratings & Reviews</h2>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIconSolid
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.round(averageRating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm sm:text-base font-semibold text-gray-900">
                        {averageRating > 0 ? averageRating.toFixed(1) : 'No ratings yet'}
                      </span>
                      <span className="text-sm text-gray-600">({totalReviews} reviews)</span>
                    </div>
            </div>
          </div>

                {/* User Rating Form */}
                {session?.user?.id && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Rate this product</h3>
                    <div className="flex items-center gap-2 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => {
                            setUserRating(star);
                          }}
                          className="focus:outline-none hover:scale-110 transition-transform cursor-pointer"
                          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                          {star <= userRating ? (
                            <StarIconSolid className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
                          ) : (
                            <StarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300" />
                          )}
                        </button>
                      ))}
                      {userRating > 0 && (
                        <span className="text-sm text-gray-600 ml-2">
                          {userRating} star{userRating > 1 ? 's' : ''} selected
                        </span>
                      )}
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Write your review (optional)..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-900 mb-3"
                      rows={3}
                    />
                    <button
                      onClick={handleRatingSubmit}
                      disabled={userRating === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Review
                    </button>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>
                  ) : (
                    reviews.map((review: any) => (
                      <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-2">
                          {review.user?.image ? (
                            <img
                              src={review.user.image}
                              alt={review.user.name || 'User'}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-600 font-semibold text-xs sm:text-sm">
                                {(review.user?.name || 'U')[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm sm:text-base text-gray-900">
                                {review.user?.name || 'Anonymous'}
                              </span>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <StarIconSolid
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm sm:text-base text-gray-700 mt-2">{review.comment}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <div className="mb-6">
                {/* Comments Header - Clickable on mobile to expand/collapse */}
                <button
                  onClick={() => setCommentsExpanded(!commentsExpanded)}
                  className="w-full flex items-center justify-between gap-2 mb-4 md:mb-4 md:pointer-events-none"
                >
                  <div className="flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Comments ({comments.length})
                    </h2>
                  </div>
                  {/* Expand/Collapse Icon - Only visible on mobile */}
                  <div className="md:hidden">
                    {commentsExpanded ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                </button>

                {/* Comment Form - Hidden on mobile when collapsed */}
                <div className={`md:block ${commentsExpanded ? 'block' : 'hidden'}`}>
                {session?.user?.id ? (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex gap-3 mb-3">
                      {session.user.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || 'You'}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-semibold text-xs sm:text-sm">
                            {(session.user.name || 'Y')[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-900"
                          rows={3}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleCommentSubmit()}
                      disabled={!newComment.trim()}
                      className="ml-11 sm:ml-14 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Post Comment
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">Sign in to leave a comment</p>
                    <button
                      onClick={() => router.push('/auth/signin')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                )}
                </div>

                {/* Comments List - Hidden on mobile when collapsed */}
                <div className={`space-y-4 ${commentsExpanded ? 'block' : 'hidden'} md:block`}>
                  {comments.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                  ) : (
                    comments.map((comment: any) => (
                      <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex gap-3 mb-2">
                          {comment.user?.image ? (
                            <img
                              src={comment.user.image}
                              alt={comment.user.name || 'User'}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-600 font-semibold text-xs sm:text-sm">
                                {(comment.user?.name || 'U')[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm sm:text-base text-gray-900">
                                {comment.user?.name || 'Anonymous'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm sm:text-base text-gray-700 mb-2">{comment.content}</p>
                            {session?.user?.id && (
                              <button
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                              >
                                {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Reply Form */}
                        {replyingTo === comment.id && session?.user?.id && (
                          <div className="ml-11 sm:ml-14 mt-3 bg-gray-50 rounded-lg p-3">
                            <div className="flex gap-3 mb-2">
                              {session.user.image ? (
                                <img
                                  src={session.user.image}
                                  alt={session.user.name || 'You'}
                                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                                />
                              ) : (
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-gray-600 font-semibold text-xs">
                                    {(session.user.name || 'Y')[0].toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                                rows={2}
                              />
                            </div>
                            <div className="flex gap-2 ml-9 sm:ml-11">
                              <button
                                onClick={() => handleCommentSubmit(comment.id)}
                                disabled={!replyContent.trim()}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Post Reply
                              </button>
                              <button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyContent('');
                                }}
                                className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-11 sm:ml-14 mt-3 space-y-3">
                            {comment.replies.map((reply: any) => (
                              <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex gap-2 mb-1">
                                  {reply.user?.image ? (
                                    <img
                                      src={reply.user.image}
                                      alt={reply.user.name || 'User'}
                                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                      <span className="text-gray-600 font-semibold text-xs">
                                        {(reply.user?.name || 'U')[0].toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-xs sm:text-sm text-gray-900">
                                        {reply.user?.name || 'Anonymous'}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(reply.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-700">{reply.content}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Related Products */}
          <div className="w-full lg:w-96 lg:border-l border-gray-200 bg-gray-50 lg:bg-white px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">More from {channel.name}</h2>
            {relatedProducts.length === 0 ? (
              <p className="text-sm text-gray-500">No other products available</p>
            ) : (
            <div className="space-y-3">
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
                      className={`flex gap-3 rounded-lg p-2 transition-colors ${
                        canAccessRelated 
                          ? 'cursor-pointer hover:bg-gray-100' 
                          : 'cursor-not-allowed opacity-75 hover:bg-gray-50'
                      }`}
                    >
                      {relatedProduct.previewImage ? (
                        <div className="relative w-32 sm:w-40 h-20 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                          <img
                            src={relatedProduct.previewImage}
                            alt={relatedProduct.title}
                            className="w-full h-full object-cover"
                          />
                          {(relatedProduct.type === 'VIDEO' || relatedProduct.type === 'VIDEOS') && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <PlayIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                            </div>
                          )}
                          {!canAccessRelated && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative w-32 sm:w-40 h-20 sm:h-24 flex-shrink-0 rounded-lg bg-gray-200 flex items-center justify-center">
                          {getContentIcon(relatedProduct.type)}
                          {!canAccessRelated && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                          {relatedProduct.title}
                        </h3>
                        <p className="text-xs text-gray-600 mb-1">{channel.name}</p>
                        <p className="text-xs text-gray-600">
                          {relatedProduct.viewCount || 0} views {!canAccessRelated && relatedProduct.isSubscriberOnly && channel?.subscriptionEnabled && (
                            <span className="text-orange-600 font-semibold">• Subscribe to access</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && channel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl shadow-2xl bg-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Subscribe to {channel.name}</h2>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm sm:text-base text-gray-900">Monthly Subscription</span>
                    <span className="text-xl sm:text-2xl font-bold text-blue-600">
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
                  <p className="text-xs sm:text-sm text-gray-600">
                    Get access to all content in this channel for 30 days
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subscribing ? 'Processing...' : 'Subscribe Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscribers List Modal */}
      {showSubscribersList && channel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{ backgroundColor }}
          >
            <div className="sticky top-0 flex items-center justify-between p-6 border-b" style={{ borderColor: `${textColor}20`, backgroundColor }}>
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ color: textColor }}>
                  Subscribers
                </h2>
                <p className="text-sm opacity-70" style={{ color: textColor }}>
                  {subscribers.length} total • {subscribers.filter((sub: any) => sub.status === 'ACTIVE' && new Date(sub.endDate) > new Date()).length} active
                </p>
              </div>
              <button
                onClick={() => setShowSubscribersList(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: textColor }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${textColor}10`}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {subscribers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-block p-6 rounded-full mb-4" style={{ backgroundColor: `${primaryColor}10` }}>
                    <svg className="w-12 h-12" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium mb-2" style={{ color: textColor }}>
                    No subscribers yet
                  </p>
                  <p className="text-sm opacity-70" style={{ color: textColor }}>
                    Share your channel to get subscribers!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscribers.map((subscriber: any) => (
                    <div
                      key={subscriber.id}
                      className="flex items-center gap-4 p-4 rounded-xl border"
                      style={{
                        borderColor: `${textColor}10`,
                        backgroundColor: `${primaryColor}05`,
                      }}
                    >
                      {subscriber.user?.image ? (
                        <img
                          src={subscriber.user.image}
                          alt={subscriber.user.name || 'Subscriber'}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                          <UserCircleIcon className="w-8 h-8" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: textColor }}>
                          {subscriber.user?.name || subscriber.user?.email || 'Anonymous'}
                        </p>
                        <p className="text-xs opacity-70 truncate" style={{ color: textColor }}>
                          {subscriber.user?.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            subscriber.status === 'ACTIVE' && new Date(subscriber.endDate) > new Date()
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {subscriber.status === 'ACTIVE' && new Date(subscriber.endDate) > new Date() ? 'Active' : 'Expired'}
                        </span>
                        <p className="text-xs mt-1 opacity-70" style={{ color: textColor }}>
                          {new Date(subscriber.endDate).toLocaleDateString()}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl shadow-2xl bg-white animate-fade-in">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircleIcon className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Success!</h3>
              <p className="text-gray-600 text-center mb-6">{modalMessage}</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl shadow-2xl bg-white animate-fade-in">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircleIcon className="w-10 h-10 text-red-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Error</h3>
              <p className="text-gray-600 text-center mb-6">{modalMessage}</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
