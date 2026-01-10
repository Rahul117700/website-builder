'use client';

import { Channel, ChannelTemplate, ChannelProductType } from '@prisma/client';
import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  VideoCameraIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  PlusIcon,
  CloudArrowUpIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  BarsArrowUpIcon,
  BarsArrowDownIcon,
  HomeIcon,
  ClockIcon,
  HeartIcon,
  BookmarkIcon,
  FolderIcon,
  ShoppingBagIcon,
  FireIcon,
  MusicalNoteIcon,
  FilmIcon,
  NewspaperIcon,
  TrophyIcon,
  LightBulbIcon,
  Bars3Icon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ArrowTopRightOnSquareIcon,
  CommandLineIcon,
  MoonIcon,
  SunIcon,
  AdjustmentsHorizontalIcon,
  LockClosedIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';
import { CreatePlaylistModal, AddToPlaylistModal } from './PlaylistModals';

interface TemplateRendererProps {
  channel: Channel & {
    template: ChannelTemplate;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
    products?: any[];
    _count?: {
      products: number;
      subscribers: number;
    };
  };
}

export default function TemplateRenderer({ channel }: TemplateRendererProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const template = channel.template;
  const theme = template.defaultTheme as any;
  const templateLayout = template.layout as any;
  const sections = template.sections as any;
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showSubscribersList, setShowSubscribersList] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMySubscriptions, setShowMySubscriptions] = useState(false);
  const [showPaidSubscriptions, setShowPaidSubscriptions] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [products, setProducts] = useState(channel.products || []);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [channelSubscriptions, setChannelSubscriptions] = useState<any[]>([]);
  const [paidSubscriptions, setPaidSubscriptions] = useState<any[]>([]);
  const [productRatings, setProductRatings] = useState<Record<string, { rating: number; count: number }>>({});
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [likedProducts, setLikedProducts] = useState<any[]>([]);
  const [savedProducts, setSavedProducts] = useState<any[]>([]);
  const [allChannels, setAllChannels] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [productToAdd, setProductToAdd] = useState<any | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check if current user is the channel owner
  const isOwner = session?.user?.id === channel.userId;

  // Get current channel URL for redirect after login/signup
  const channelUrl = `/channel/${channel.slug}`;

  // Check if user has active subscription
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // State for Minimal Classic Layout
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Default cover images from Pexels
  const defaultCoverImages = [
    'https://images.pexels.com/photos/9754/mountains-clouds-forest-fog.jpg',
    'https://images.pexels.com/photos/552785/pexels-photo-552785.jpeg',
    'https://images.pexels.com/photos/2444429/pexels-photo-2444429.jpeg'
  ];

  // Get cover image with fallback to random default
  // Use channel ID as seed to ensure same channel always gets same default image
  const getCoverImage = useMemo(() => {
    if (channel.coverImage) {
      return channel.coverImage;
    }
    // Use channel ID to deterministically select a default image
    const channelIdHash = channel.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageIndex = channelIdHash % defaultCoverImages.length;
    return defaultCoverImages[imageIndex];
  }, [channel.coverImage, channel.id]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>('home');
  const [showNavDropdown, setShowNavDropdown] = useState(false);

  // Refresh products when channel changes
  useEffect(() => {
    if (channel.products) {
      setProducts(channel.products);
    }
  }, [channel.products]);

  // Fetch products if not available
  useEffect(() => {
    const fetchProducts = async () => {
      if (!channel.products || channel.products.length === 0) {
        try {
          const response = await fetch(`/api/channels/${channel.id}/products`);
          if (response.ok) {
            const data = await response.json();
            setProducts(data);
          }
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      }
    };
    fetchProducts();
  }, [channel.id, channel.products]);

  // Fetch ratings for all products
  useEffect(() => {
    const fetchProductRatings = async () => {
      if (!products || products.length === 0) return;

      const ratingsMap: Record<string, { rating: number; count: number }> = {};

      // Fetch ratings for each product
      const ratingPromises = products.map(async (product: any) => {
        try {
          const response = await fetch(`/api/channels/${channel.id}/products/${product.id}/reviews`);
          if (response.ok) {
            const data = await response.json();
            ratingsMap[product.id] = {
              rating: data.averageRating || 0,
              count: data.totalReviews || 0,
            };
          } else {
            // If no reviews, set default
            ratingsMap[product.id] = {
              rating: 0,
              count: 0,
            };
          }
        } catch (error) {
          console.error(`Error fetching ratings for product ${product.id}:`, error);
          ratingsMap[product.id] = {
            rating: 0,
            count: 0,
          };
        }
      });

      await Promise.all(ratingPromises);
      setProductRatings(ratingsMap);
    };

    fetchProductRatings();
  }, [products, channel.id]);

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!session?.user?.id || isOwner) return;

      try {
        const response = await fetch(`/api/channels/${channel.id}/subscription/check`);
        if (response.ok) {
          const data = await response.json();
          setHasActiveSubscription(data.hasActiveSubscription || false);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    checkSubscription();
  }, [session?.user?.id, channel.id, isOwner]);

  // Load subscribers list for owner
  useEffect(() => {
    const loadSubscribers = async () => {
      if (!isOwner || !showSubscribersList) return;

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
  }, [isOwner, channel.id, showSubscribersList]);

  // Load user's channel subscriptions
  useEffect(() => {
    const loadChannelSubscriptions = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch('/api/user/channel-subscriptions');
        if (response.ok) {
          const data = await response.json();
          setChannelSubscriptions(data.all || []);
        }
      } catch (error) {
        console.error('Error loading channel subscriptions:', error);
      }
    };

    loadChannelSubscriptions();
  }, [session?.user?.id]);

  // Load paid subscriptions (platform subscriptions)
  useEffect(() => {
    const loadPaidSubscriptions = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch('/api/user/subscriptions');
        if (response.ok) {
          const data = await response.json();
          setPaidSubscriptions(data.subscriptionHistory || []);
        }
      } catch (error) {
        console.error('Error loading paid subscriptions:', error);
      }
    };

    loadPaidSubscriptions();
  }, [session?.user?.id]);

  // Load user history
  useEffect(() => {
    const loadHistory = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch('/api/user/history');
        if (response.ok) {
          const data = await response.json();
          setUserHistory(data.products || []);
        }
      } catch (error) {
        console.error('Error loading history:', error);
      }
    };

    loadHistory();
  }, [session?.user?.id]);

  // Load liked products
  useEffect(() => {
    const loadLiked = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch('/api/user/liked');
        if (response.ok) {
          const data = await response.json();
          setLikedProducts(data.products || []);
        }
      } catch (error) {
        console.error('Error loading liked products:', error);
      }
    };

    loadLiked();
  }, [session?.user?.id]);

  // Load saved products
  useEffect(() => {
    const loadSaved = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch('/api/user/saved');
        if (response.ok) {
          const data = await response.json();
          setSavedProducts(data.products || []);
        }
      } catch (error) {
        console.error('Error loading saved products:', error);
      }
    };

    loadSaved();
  }, [session?.user?.id]);

  // Check if a product is saved
  const isProductSaved = (productId: string) => {
    return savedProducts.some(p => p.id === productId);
  };

  // Show success modal
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
  };

  // Show error modal
  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  // Handle save/unsave product
  const handleToggleSave = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!session?.user?.id) {
      // Could show login modal here
      return;
    }

    const isSaved = isProductSaved(productId);

    try {
      if (isSaved) {
        // Unsave
        const response = await fetch(`/api/user/saved?productId=${productId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setSavedProducts(prev => prev.filter(p => p.id !== productId));
        }
      } else {
        // Save
        const response = await fetch('/api/user/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId })
        });

        if (response.ok) {
          const data = await response.json();
          // Reload saved products to get the full product data
          const savedResponse = await fetch('/api/user/saved');
          if (savedResponse.ok) {
            const savedData = await savedResponse.json();
            setSavedProducts(savedData.products || []);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  // Load all channels for explore
  useEffect(() => {
    const loadAllChannels = async () => {
      try {
        const response = await fetch('/api/channels');
        if (response.ok) {
          const data = await response.json();
          setAllChannels(data.channels || []);
        }
      } catch (error) {
        console.error('Error loading channels:', error);
      }
    };

    loadAllChannels();
  }, []);

  // Load user playlists
  useEffect(() => {
    const loadPlaylists = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch('/api/user/playlists');
        if (response.ok) {
          const data = await response.json();
          setPlaylists(data.playlists || []);
        }
      } catch (error) {
        console.error('Error loading playlists:', error);
      }
    };

    loadPlaylists();
  }, [session?.user?.id]);

  // Load selected playlist details
  useEffect(() => {
    const loadPlaylistDetails = async () => {
      if (!selectedPlaylist || !session?.user?.id) return;

      try {
        const response = await fetch(`/api/user/playlists/${selectedPlaylist.id}`);
        if (response.ok) {
          const data = await response.json();
          setSelectedPlaylist(data.playlist);
        }
      } catch (error) {
        console.error('Error loading playlist details:', error);
      }
    };

    if (selectedPlaylist?.id) {
      loadPlaylistDetails();
    }
  }, [selectedPlaylist?.id, session?.user?.id]);

  // Create new playlist
  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    try {
      const response = await fetch('/api/user/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlaylistName,
          description: newPlaylistDescription,
          isPublic: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPlaylists([data.playlist, ...playlists]);
        setNewPlaylistName('');
        setNewPlaylistDescription('');
        setShowCreatePlaylistModal(false);
        setSelectedPlaylist(data.playlist);
        setActiveSidebarItem('playlists');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to create playlist';
        console.error('Playlist creation error:', errorMessage);
        showError(errorMessage);
      }
    } catch (error: any) {
      console.error('Error creating playlist:', error);
      const errorMessage = error?.message || 'Failed to create playlist. Please try again.';
      showError(errorMessage);
    }
  };

  // Add product to playlist
  const handleAddToPlaylist = async (playlistId: string) => {
    if (!productToAdd) return;

    try {
      const response = await fetch(`/api/user/playlists/${playlistId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: productToAdd.id }),
      });

      if (response.ok) {
        setShowAddToPlaylistModal(false);
        setProductToAdd(null);
        // Refresh playlists
        const playlistsResponse = await fetch('/api/user/playlists');
        if (playlistsResponse.ok) {
          const data = await playlistsResponse.json();
          setPlaylists(data.playlists || []);
        }
        showSuccess('Product added to playlist!');
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to add product to playlist');
      }
    } catch (error) {
      console.error('Error adding product to playlist:', error);
      showError('Failed to add product to playlist');
    }
  };

  // Get custom theme colors from channel customizations
  const customizations = channel.customizations as any;
  const customTheme = customizations?.theme || {};
  const layout = customizations?.layout || {};

  // Get visible sections - default to all sections visible if not set
  const visibleSections = layout.visibleSections || ['hero', 'about', 'products', 'footer'];

  // Helper to check if a section should be visible
  const isSectionVisible = (sectionId: string) => {
    return visibleSections.includes(sectionId);
  };

  // Extract colors with proper fallbacks - prioritize custom theme over default theme
  const primaryColor = customTheme.primary || theme?.colors?.primary || '#6366f1';
  const secondaryColor = customTheme.secondary || theme?.colors?.secondary || '#8b5cf6';
  // For Minimal template, default to white background if not set
  const backgroundColor = customTheme.background || theme?.colors?.background || '#ffffff';
  // For Minimal template, default to dark text if background is light
  const defaultTextColor = backgroundColor === '#ffffff' || backgroundColor === '#fff' || !backgroundColor || backgroundColor.includes('white') ? '#0f172a' : '#ffffff';
  const textColor = customTheme.text || theme?.colors?.text || defaultTextColor;
  // Professional font stack - Inter, Roboto, system fonts
  const headingFont = customTheme.headingFont || theme?.fonts?.heading || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  const bodyFont = customTheme.bodyFont || theme?.fonts?.body || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  const spacing = customTheme.spacing || theme?.spacing || '1rem';
  const borderRadius = customTheme.borderRadius || theme?.borderRadius || '0.5rem';

  // Helper function to format price
  const formatPrice = (price: number, currency: string = 'INR') => {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
    };
    const symbol = currencySymbols[currency] || currency + ' ';
    return `${symbol}${price.toFixed(2)}`;
  };

  // Helper function to format view count
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Helper function to get product rating from fetched data
  const getProductRating = (product: any): { rating: number; count: number } => {
    // Get rating from fetched data, or return default if not available yet
    const ratingData = productRatings[product.id];
    if (ratingData) {
      return {
        rating: ratingData.rating,
        count: ratingData.count,
      };
    }

    // Return default if rating not loaded yet
    return {
      rating: 0,
      count: 0,
    };
  };

  // Helper to get subscription button text
  const getSubscribeButtonText = () => {
    if (!channel.subscriptionEnabled) return null;
    return 'Subscribe Now';
  };

  // Debug: Log customizations to help troubleshoot
  if (process.env.NODE_ENV === 'development') {
    console.log('Theme Customizations:', {
      customTheme,
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      visibleSections,
    });
    console.log('Channel Subscription Info:', {
      subscriptionEnabled: channel.subscriptionEnabled,
      subscriptionPrice: channel.subscriptionPrice,
      subscriptionPriceType: typeof channel.subscriptionPrice,
      subscriptionCurrency: channel.subscriptionCurrency,
    });
  }

  // Helper function to replace template variables
  const replaceVariables = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/\{\{channelName\}\}/g, channel.name)
      .replace(/\{\{channelDescription\}\}/g, channel.description || '')
      .replace(/\{\{welcomeMessage\}\}/g, channel.welcomeMessage || '')
      .replace(/\{\{year\}\}/g, new Date().getFullYear().toString());
  };

  // Render based on category or custom selection
  const renderTemplate = () => {
    const category = template.category || 'Creative';

    switch (category) {
      case 'Minimal':
        return renderMinimalTemplate();
      case 'Tech':
        return renderTechTemplate();
      case 'Education':
        return renderEducationTemplate();
      case 'Creative':
        return renderCreativeTemplate();
      case 'Business':
        return renderBusinessTemplate();
      default:
        return renderPremiumDefaultTemplate();
    }
  };

  // Creative Template - Uses white background with black text for visibility
  const renderCreativeTemplate = () => {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
          {/* Background */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${getCoverImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center px-4 sm:px-6 md:px-8 w-full">
            {channel.profileImage && (
              <img
                src={channel.profileImage}
                alt={channel.name}
                className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-white/20 shadow-2xl"
              />
            )}
            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-gray-900">
              {channel.name}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-700">
              {channel.description}
            </p>
            {channel.subscriptionEnabled && (
              !session?.user ? (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push(`/auth/signin?callbackUrl=${encodeURIComponent(channelUrl)}`)}
                    className="px-6 py-3 rounded-full font-semibold text-base transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-gray-900 bg-transparent text-gray-900 hover:bg-gray-900 hover:text-white"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push(`/auth/signup?callbackUrl=${encodeURIComponent(channelUrl)}`)}
                    className="px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl bg-gray-900 text-white hover:bg-black hover:shadow-2xl"
                  >
                    Subscribe Now
                  </button>
                </div>
              ) : !isOwner ? (
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  disabled={hasActiveSubscription}
                  className="px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl bg-gray-900 text-white hover:bg-black hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {hasActiveSubscription ? 'Subscribed' : 'Subscribe Now'}
                </button>
              ) : null
            )}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>

        {/* Welcome Section */}
        {channel.welcomeMessage && (
          <section className="py-20 px-4 bg-gray-50">
            <div className="w-full px-4 sm:px-6 md:px-8">
              <h2 className="text-4xl font-bold mb-6 text-center text-gray-900">
                Welcome
              </h2>
              <p className="text-lg leading-relaxed text-center text-gray-700">
                {channel.welcomeMessage}
              </p>
            </div>
          </section>
        )}

        {/* Products Grid */}
        {products && products.length > 0 && (
          <section className="py-20 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl font-bold mb-12 text-center text-gray-900">
                Products & Content
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any, index: number) => (
                  <div
                    key={index}
                    className="rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white border border-gray-200"
                  >
                    {product.previewImage && (
                      <img
                        src={product.previewImage}
                        alt={product.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-gray-900">
                        {product.title}
                      </h3>
                      {product.description && (
                        <p className="text-sm mb-4 text-gray-600">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        {channel.subscriptionEnabled && getSubscribeButtonText() ? (
                          <button
                            onClick={() => !isOwner && setShowSubscriptionModal(true)}
                            className="px-4 py-2 rounded-lg font-semibold text-sm bg-purple-600 text-white hover:bg-purple-700"
                          >
                            {getSubscribeButtonText()}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="py-12 px-4 border-t bg-gray-50 border-gray-200">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-600">
              © {new Date().getFullYear()} {channel.name}. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    );
  };

  // Add CSS animations and professional typography on mount
  useEffect(() => {
    const styleId = 'channel-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-gradient-shift {
          animation: gradient-shift 3s ease infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Professional Typography */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
        
        body, input, textarea, select, button {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
          font-feature-settings: "kern" 1;
          font-kerning: normal;
          letter-spacing: -0.011em;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        
        p, span, div, a, button {
          letter-spacing: -0.01em;
          line-height: 1.5;
        }
        
        .font-semibold {
          font-weight: 600;
          letter-spacing: -0.015em;
        }
        
        .font-bold {
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        
        .font-extrabold {
          font-weight: 800;
          letter-spacing: -0.025em;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Minimalist Classic - Modern Marketplace Design (defined first)
  const renderMinimalClassicLayout = () => {
    const allProducts = products || [];

    // Get unique categories from product tags
    const categories = ['All', ...new Set(allProducts.flatMap((p: any) => p.tags || []))].slice(0, 8);

    // Filter products based on activeSidebarItem first
    let baseProducts = allProducts;

    if (activeSidebarItem === 'history' && session?.user) {
      // Show user's viewing history
      baseProducts = userHistory;
    } else if (activeSidebarItem === 'liked' && session?.user) {
      // Show liked products
      baseProducts = likedProducts;
    } else if (activeSidebarItem === 'saved' && session?.user) {
      // Show saved products
      baseProducts = savedProducts;
    } else if (activeSidebarItem.startsWith('playlist-') && session?.user) {
      // Show products from selected playlist
      const playlistId = activeSidebarItem.replace('playlist-', '');
      const playlist = playlists.find((p: any) => p.id === playlistId);
      if (playlist && playlist.items) {
        baseProducts = playlist.items.map((item: any) => item.product).filter(Boolean);
      } else {
        baseProducts = [];
      }
    } else if (activeSidebarItem === 'playlists' && session?.user) {
      // Show all playlists view (will be handled separately)
      baseProducts = [];
    } else if (activeSidebarItem === 'subscriptions' && session?.user) {
      // Show products from subscribed channels
      const subscribedChannelIds = channelSubscriptions
        .filter((sub: any) => sub.status === 'ACTIVE' && new Date(sub.endDate) > new Date())
        .map((sub: any) => sub.channelId);
      baseProducts = allProducts.filter((p: any) =>
        subscribedChannelIds.includes(p.channelId)
      );
    } else if (['music', 'gaming', 'news', 'sports', 'learning'].includes(activeSidebarItem)) {
      // Filter by explore category - match tags or channel category
      const categoryMap: { [key: string]: string[] } = {
        music: ['music', 'audio', 'song', 'podcast'],
        gaming: ['gaming', 'game', 'esports', 'streaming'],
        news: ['news', 'current events', 'journalism', 'media'],
        sports: ['sports', 'fitness', 'athletic', 'competition'],
        learning: ['learning', 'education', 'course', 'tutorial', 'training'],
      };
      const categoryKeywords = categoryMap[activeSidebarItem] || [];
      baseProducts = allProducts.filter((p: any) =>
        categoryKeywords.some(keyword =>
          p.tags?.some((tag: string) => tag.toLowerCase().includes(keyword)) ||
          p.title?.toLowerCase().includes(keyword) ||
          p.description?.toLowerCase().includes(keyword) ||
          channel.name?.toLowerCase().includes(keyword)
        )
      );
    } else if (activeSidebarItem === 'explore') {
      // Show all products from all channels (not just current channel)
      // For now, show current channel products - can be expanded later
      baseProducts = allProducts;
    } else {
      // Default: show current channel products
      baseProducts = allProducts;
    }

    // Filter and sort products
    let filteredProducts = selectedCategory === 'All'
      ? baseProducts
      : baseProducts.filter((p: any) => p.tags?.includes(selectedCategory));

    // Apply search filter
    if (searchQuery) {
      filteredProducts = filteredProducts.filter((p: any) =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filteredProducts = filteredProducts.filter((p: any) =>
        p.type?.toUpperCase() === selectedType.toUpperCase()
      );
    }

    // Apply sorting
    filteredProducts = [...filteredProducts].sort((a: any, b: any) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'name-asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'name-desc':
          return (b.title || '').localeCompare(a.title || '');
        case 'price-asc':
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        case 'price-desc':
          return (Number(b.price) || 0) - (Number(a.price) || 0);
        default:
          return 0;
      }
    });

    const getContentIcon = (type: string) => {
      switch (type) {
        case 'VIDEO':
          return <VideoCameraIcon className="h-5 w-5" />;
        case 'DOCUMENT':
          return <DocumentTextIcon className="h-5 w-5" />;
        case 'CODE':
          return <CodeBracketIcon className="h-5 w-5" />;
        default:
          return <DocumentTextIcon className="h-5 w-5" />;
      }
    };


    // Calculate total purchases
    const totalPurchases = allProducts.reduce((sum: number, p: any) => sum + (p.purchaseCount || 0), 0);
    const averageRating = 4.5; // Mock rating - can be replaced with actual rating system
    const ratingCount = totalPurchases || 0;

    // Get seller info - only from user profile, not channel upload
    const sellerImage = channel.user?.image;
    const sellerName = channel.user?.name || 'Seller';

    // Mock recent buyers (would fetch from purchases in real implementation)
    const recentBuyers = [
      { name: 'Alex', image: null },
      { name: 'Sarah', image: null },
      { name: 'Mike', image: null },
      { name: 'Emma', image: null },
    ].slice(0, Math.min(4, totalPurchases));

    return (
      <div
        className="min-h-screen scroll-smooth"
        style={{
          fontFamily: bodyFont,
          backgroundColor: backgroundColor,
          color: textColor,
        }}
      >
        {/* Premium Soft-UI Header/Navigation */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-50 backdrop-blur-2xl border-b transition-all duration-500"
          style={{
            background: `${backgroundColor}D9`, // ~85% opacity
            borderColor: `${textColor}0D`,
            boxShadow: `0 4px 30px rgba(0, 0, 0, 0.03)`,
          }}
        >
          <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-18 md:h-20">
              {/* Logo/Brand with Navigation Dropdown */}
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                {/* Navigation Dropdown Button - Visible on all screens */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNavDropdown(!showNavDropdown);
                      setSidebarOpen(false);
                    }}
                    className="p-2 rounded-full hover:bg-opacity-10 transition-colors touch-manipulation"
                    style={{ color: textColor }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${textColor}10`}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    aria-label="Navigation menu"
                  >
                    <Bars3Icon className="w-6 h-6" />
                  </button>

                  {/* Navigation Dropdown Menu */}
                  <AnimatePresence>
                    {showNavDropdown && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]"
                          onClick={() => setShowNavDropdown(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                          className="absolute left-0 mt-3 w-72 max-h-[80vh] overflow-y-auto rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border z-50 scrollbar-hide"
                          style={{
                            backgroundColor: backgroundColor,
                            borderColor: `${textColor}10`,
                          }}
                        >
                          <div className="p-2">
                            {/* Main Navigation */}
                            <nav className="space-y-1 mb-2">
                              <button
                                onClick={() => {
                                  setActiveSidebarItem('home');
                                  const productsSection = document.getElementById('products');
                                  if (productsSection) {
                                    productsSection.scrollIntoView({ behavior: 'smooth' });
                                  }
                                  setShowNavDropdown(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeSidebarItem === 'home'
                                  ? 'shadow-inner'
                                  : 'hover:bg-gray-50/50'
                                  }`}
                                style={{
                                  color: activeSidebarItem === 'home' ? textColor : `${textColor}CC`,
                                  backgroundColor: activeSidebarItem === 'home' ? `${primaryColor}0D` : 'transparent',
                                }}
                              >
                                <HomeIcon className={`w-5 h-5 flex-shrink-0 ${activeSidebarItem === 'home' ? 'text-primary' : ''}`} style={{ color: activeSidebarItem === 'home' ? primaryColor : 'inherit' }} />
                                <span className="text-sm font-medium">Home</span>
                              </button>

                              <button
                                onClick={() => {
                                  setActiveSidebarItem('explore');
                                  setShowNavDropdown(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeSidebarItem === 'explore'
                                  ? 'shadow-inner'
                                  : 'hover:bg-gray-50/50'
                                  }`}
                                style={{
                                  color: activeSidebarItem === 'explore' ? textColor : `${textColor}CC`,
                                  backgroundColor: activeSidebarItem === 'explore' ? `${primaryColor}0D` : 'transparent',
                                }}
                              >
                                <FireIcon className="w-5 h-5 flex-shrink-0" style={{ color: activeSidebarItem === 'explore' ? primaryColor : 'inherit' }} />
                                <span className="text-sm font-medium">Explore</span>
                              </button>

                              {session?.user && (
                                <button
                                  onClick={() => {
                                    setActiveSidebarItem('subscriptions');
                                    setShowNavDropdown(false);
                                  }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeSidebarItem === 'subscriptions'
                                    ? 'bg-gray-100 font-semibold'
                                    : 'hover:bg-gray-50'
                                    }`}
                                  style={{
                                    color: activeSidebarItem === 'subscriptions' ? textColor : `${textColor}CC`,
                                  }}
                                >
                                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                  </svg>
                                  <span className="text-sm">Subscriptions</span>
                                </button>
                              )}
                            </nav>

                            {/* Divider */}
                            {session?.user && (
                              <>
                                <div className="my-2 border-t" style={{ borderColor: `${textColor}15` }} />

                                {/* Library Section */}
                                <div className="px-4 py-2">
                                  <h3
                                    className="text-xs font-semibold uppercase tracking-wider"
                                    style={{
                                      color: `${textColor}80`,
                                      fontFamily: bodyFont,
                                      letterSpacing: '0.1em',
                                      fontWeight: 600,
                                    }}
                                  >
                                    Library
                                  </h3>
                                </div>
                                <nav className="space-y-1 mb-2">
                                  <button
                                    onClick={() => {
                                      setActiveSidebarItem('history');
                                      setShowNavDropdown(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeSidebarItem === 'history'
                                      ? 'bg-gray-100 font-semibold'
                                      : 'hover:bg-gray-50'
                                      }`}
                                    style={{
                                      color: activeSidebarItem === 'history' ? textColor : `${textColor}CC`,
                                    }}
                                  >
                                    <ClockIcon className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm">History</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveSidebarItem('liked');
                                      setShowNavDropdown(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeSidebarItem === 'liked'
                                      ? 'bg-gray-100 font-semibold'
                                      : 'hover:bg-gray-50'
                                      }`}
                                    style={{
                                      color: activeSidebarItem === 'liked' ? textColor : `${textColor}CC`,
                                    }}
                                  >
                                    <HeartIcon className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm">Liked Products</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveSidebarItem('saved');
                                      setShowNavDropdown(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeSidebarItem === 'saved'
                                      ? 'bg-gray-100 font-semibold'
                                      : 'hover:bg-gray-50'
                                      }`}
                                    style={{
                                      color: activeSidebarItem === 'saved' ? textColor : `${textColor}CC`,
                                    }}
                                  >
                                    <BookmarkIcon className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm">Saved</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setShowCreatePlaylistModal(true);
                                      setShowNavDropdown(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50 border border-dashed border-gray-300"
                                    style={{
                                      color: `${textColor}CC`,
                                    }}
                                  >
                                    <PlusIcon className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm">Create Playlist</span>
                                  </button>

                                  {/* User's Playlists */}
                                  {playlists.length > 0 && (
                                    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                                      {playlists.map((playlist) => (
                                        <button
                                          key={playlist.id}
                                          onClick={() => {
                                            setSelectedPlaylist(playlist);
                                            setActiveSidebarItem(`playlist-${playlist.id}`);
                                            setShowNavDropdown(false);
                                          }}
                                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeSidebarItem === `playlist-${playlist.id}`
                                            ? 'bg-gray-100 font-semibold'
                                            : 'hover:bg-gray-50'
                                            }`}
                                          style={{
                                            color: activeSidebarItem === `playlist-${playlist.id}` ? textColor : `${textColor}CC`,
                                          }}
                                        >
                                          <FolderIcon className="w-5 h-5 flex-shrink-0" />
                                          <span className="text-sm truncate flex-1 text-left">{playlist.name}</span>
                                          <span className="text-xs opacity-70">({playlist.items?.length || 0})</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </nav>

                                <div className="my-2 border-t" style={{ borderColor: `${textColor}15` }} />
                              </>
                            )}

                            {/* Explore Categories */}
                            <div className="px-4 py-2">
                              <h3
                                className="text-xs font-semibold uppercase tracking-wider"
                                style={{
                                  color: `${textColor}80`,
                                  fontFamily: bodyFont,
                                  letterSpacing: '0.1em',
                                  fontWeight: 600,
                                }}
                              >
                                Explore
                              </h3>
                            </div>
                            <nav className="space-y-1 mb-2">
                              <button
                                onClick={() => {
                                  setActiveSidebarItem('music');
                                  setShowNavDropdown(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeSidebarItem === 'music'
                                  ? 'bg-gray-100 font-semibold'
                                  : 'hover:bg-gray-50'
                                  }`}
                                style={{
                                  color: activeSidebarItem === 'music' ? textColor : `${textColor}CC`,
                                }}
                              >
                                <MusicalNoteIcon className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">Music</span>
                              </button>

                              <button
                                onClick={() => {
                                  setActiveSidebarItem('gaming');
                                  setShowNavDropdown(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeSidebarItem === 'gaming'
                                  ? 'bg-gray-100 font-semibold'
                                  : 'hover:bg-gray-50'
                                  }`}
                                style={{
                                  color: activeSidebarItem === 'gaming' ? textColor : `${textColor}CC`,
                                }}
                              >
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm">Gaming</span>
                              </button>

                              <button
                                onClick={() => {
                                  setActiveSidebarItem('news');
                                  setShowNavDropdown(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeSidebarItem === 'news'
                                  ? 'bg-gray-100 font-semibold'
                                  : 'hover:bg-gray-50'
                                  }`}
                                style={{
                                  color: activeSidebarItem === 'news' ? textColor : `${textColor}CC`,
                                }}
                              >
                                <NewspaperIcon className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">News</span>
                              </button>

                              <button
                                onClick={() => {
                                  setActiveSidebarItem('sports');
                                  setShowNavDropdown(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeSidebarItem === 'sports'
                                  ? 'bg-gray-100 font-semibold'
                                  : 'hover:bg-gray-50'
                                  }`}
                                style={{
                                  color: activeSidebarItem === 'sports' ? textColor : `${textColor}CC`,
                                }}
                              >
                                <TrophyIcon className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">Sports</span>
                              </button>

                              <button
                                onClick={() => {
                                  setActiveSidebarItem('learning');
                                  setShowNavDropdown(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeSidebarItem === 'learning'
                                  ? 'bg-gray-100 font-semibold'
                                  : 'hover:bg-gray-50'
                                  }`}
                                style={{
                                  color: activeSidebarItem === 'learning' ? textColor : `${textColor}CC`,
                                }}
                              >
                                <LightBulbIcon className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">Learning</span>
                              </button>
                            </nav>

                            {/* Settings */}
                            {session?.user && (
                              <>
                                <div className="my-2 border-t" style={{ borderColor: `${textColor}15` }} />
                                <button
                                  onClick={() => {
                                    if (isOwner) {
                                      router.push('/auth/dashboard/settings');
                                    } else {
                                      router.push('/settings');
                                    }
                                    setShowNavDropdown(false);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50"
                                  style={{ color: `${textColor}CC` }}
                                >
                                  <Cog6ToothIcon className="w-5 h-5 flex-shrink-0" />
                                  <span className="text-sm">Settings</span>
                                </button>
                              </>
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
                {channel.user?.image ? (
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
                    <img
                      src={channel.user.image}
                      alt={sellerName}
                      className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-3 border-white shadow-lg object-cover transition-transform duration-300 group-hover:scale-105"
                      style={{ borderColor: `${primaryColor}30` }}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-3 shadow-lg"
                    style={{
                      backgroundColor: `${primaryColor}15`,
                      borderColor: `${primaryColor}30`,
                      color: primaryColor,
                    }}
                  >
                    <UserCircleIcon className="w-8 h-8" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h1
                    className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold tracking-tight bg-gradient-to-r bg-clip-text text-transparent truncate"
                    style={{
                      fontFamily: headingFont,
                      backgroundImage: `linear-gradient(135deg, ${textColor} 0%, ${primaryColor} 100%)`,
                    }}
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
                {/* Show login/subscription buttons for non-owners, always show login if not logged in */}
                {!isOwner && (
                  <div className="flex items-center gap-2 sm:gap-3">
                    {!session?.user ? (
                      <>
                        <button
                          onClick={() => router.push(`/auth/signin?callbackUrl=${encodeURIComponent(channelUrl)}`)}
                          className="flex px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 border-2 hover:scale-105 shadow-md hover:shadow-lg"
                          style={{
                            backgroundColor: 'transparent',
                            borderColor: `${primaryColor}40`,
                            color: primaryColor,
                          }}
                        >
                          Sign In
                        </button>
                        {channel.subscriptionEnabled ? (
                          <button
                            onClick={() => router.push(`/auth/signup?callbackUrl=${encodeURIComponent(channelUrl)}`)}
                            className="group relative px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white"
                          >
                            <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="hidden sm:inline">Subscribe Now</span>
                              <span className="sm:hidden">Subscribe</span>
                            </span>
                            <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          </button>
                        ) : (
                          <button
                            onClick={() => router.push(`/auth/signup?callbackUrl=${encodeURIComponent(channelUrl)}`)}
                            className="group relative px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white"
                          >
                            <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                              <span className="hidden sm:inline">Sign Up</span>
                              <span className="sm:hidden">Sign Up</span>
                            </span>
                            <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          </button>
                        )}
                      </>
                    ) : channel.subscriptionEnabled ? (
                      <button
                        onClick={() => setShowSubscriptionModal(true)}
                        disabled={hasActiveSubscription}
                        className={`group relative flex items-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden ${hasActiveSubscription
                          ? 'bg-gray-400 text-white'
                          : 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white'
                          }`}
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="relative z-10 hidden sm:inline">{hasActiveSubscription ? 'Subscribed' : (getSubscribeButtonText() || 'Subscribe')}</span>
                        <span className="relative z-10 sm:hidden">{hasActiveSubscription ? '✓' : '✓'}</span>
                        {!hasActiveSubscription && (
                          <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        )}
                      </button>
                    ) : null}
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
                    <AnimatePresence>
                      {showUserMenu && (
                        <>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]"
                            onClick={() => setShowUserMenu(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="absolute right-0 mt-3 w-80 max-h-[90vh] overflow-y-auto rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border z-50 scrollbar-hide"
                            style={{
                              backgroundColor: backgroundColor,
                              borderColor: `${textColor}10`,
                            }}
                          >
                            {/* User Info Header */}
                            <div className="p-4 border-b" style={{ borderColor: `${textColor}15` }}>
                              <div className="flex items-center gap-3 mb-2">
                                {session.user.image ? (
                                  <img
                                    src={session.user.image}
                                    alt={session.user.name || 'User'}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{
                                      backgroundColor: `${primaryColor}15`,
                                      color: primaryColor,
                                    }}
                                  >
                                    <UserCircleIcon className="w-6 h-6" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm truncate" style={{ color: textColor }}>
                                    {session.user.name || 'User'}
                                  </p>
                                  <p className="text-xs truncate" style={{ color: `${textColor}70` }}>
                                    {session.user.email}
                                  </p>
                                </div>
                              </div>
                              {isOwner && (
                                <button
                                  onClick={() => {
                                    router.push(`/channel/${channel.slug}`);
                                    setShowUserMenu(false);
                                  }}
                                  className="text-xs font-medium hover:underline"
                                  style={{ color: primaryColor }}
                                >
                                  View your channel →
                                </button>
                              )}
                            </div>

                            {/* Menu Items - YouTube Style */}
                            <div className="py-1">
                              {/* Channel/Account Section */}
                              {isOwner ? (
                                <>
                                  <button
                                    onClick={() => {
                                      router.push('/auth/dashboard');
                                      setShowUserMenu(false);
                                    }}
                                    className="w-full flex items-center gap-4 px-4 py-2.5 hover:bg-opacity-10 transition-colors"
                                    style={{ color: textColor }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${textColor}10`)}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                  >
                                    <FolderIcon className="w-5 h-5" />
                                    <span className="text-sm flex-1 text-left">My Channel</span>
                                    <ArrowTopRightOnSquareIcon className="w-4 h-4 opacity-50" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      router.push('/auth/dashboard');
                                      setShowUserMenu(false);
                                    }}
                                    className="w-full flex items-center gap-4 px-4 py-2.5 hover:bg-opacity-10 transition-colors"
                                    style={{ color: textColor }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${textColor}10`)}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                  >
                                    <UserCircleIcon className="w-5 h-5" />
                                    <span className="text-sm flex-1 text-left">Profile & Details</span>
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => {
                                    router.push('/');
                                    setShowUserMenu(false);
                                  }}
                                  className="w-full flex items-center gap-4 px-4 py-2.5 hover:bg-opacity-10 transition-colors"
                                  style={{ color: textColor }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${textColor}10`)}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                  <PlusIcon className="w-5 h-5" />
                                  <span className="text-sm flex-1 text-left">Create my channel</span>
                                  <ArrowTopRightOnSquareIcon className="w-4 h-4 opacity-50" />
                                </button>
                              )}

                              {/* Divider */}
                              <div className="h-px my-1" style={{ backgroundColor: `${textColor}15` }}></div>

                              {/* Settings Section */}
                              <button
                                onClick={() => {
                                  if (isOwner) {
                                    router.push('/auth/dashboard/settings');
                                  } else {
                                    router.push('/settings');
                                  }
                                  setShowUserMenu(false);
                                }}
                                className="w-full flex items-center gap-4 px-4 py-2.5 hover:bg-opacity-10 transition-colors"
                                style={{ color: textColor }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${textColor}10`)}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                              >
                                <Cog6ToothIcon className="w-5 h-5" />
                                <span className="text-sm flex-1 text-left">Settings</span>
                                <ArrowTopRightOnSquareIcon className="w-4 h-4 opacity-50" />
                              </button>

                              {/* Divider */}
                              <div className="h-px my-1" style={{ backgroundColor: `${textColor}15` }}></div>

                              {/* Subscriptions Section */}
                              <div className="px-4 py-2">
                                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: `${textColor}60` }}>
                                  Subscriptions
                                </p>
                                <button
                                  onClick={() => {
                                    setShowMySubscriptions(true);
                                    setShowUserMenu(false);
                                  }}
                                  className="w-full flex items-center gap-4 px-0 py-2 hover:bg-opacity-10 transition-colors rounded"
                                  style={{ color: textColor }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${textColor}10`)}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                  <CreditCardIcon className="w-5 h-5" />
                                  <span className="text-sm flex-1 text-left">My Subscriptions</span>
                                  {channelSubscriptions.length > 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                      style={{
                                        backgroundColor: `${textColor}20`,
                                        color: textColor,
                                      }}
                                    >
                                      {channelSubscriptions.filter(s => s.status === 'ACTIVE' && new Date(s.endDate) > new Date()).length}
                                    </span>
                                  )}
                                </button>
                              </div>

                              {/* Divider */}
                              <div className="h-px my-1" style={{ backgroundColor: `${textColor}15` }}></div>

                              {/* Help & Support Section */}
                              <div className="px-4 py-2">
                                <button
                                  onClick={() => {
                                    window.open('https://sellearndirect.com/docs', '_blank');
                                    setShowUserMenu(false);
                                  }}
                                  className="w-full flex items-center gap-4 px-0 py-2 hover:bg-opacity-10 transition-colors rounded"
                                  style={{ color: textColor }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${textColor}10`)}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                  <QuestionMarkCircleIcon className="w-5 h-5" />
                                  <span className="text-sm flex-1 text-left">Help</span>
                                  <ArrowTopRightOnSquareIcon className="w-4 h-4 opacity-50" />
                                </button>
                                <button
                                  onClick={() => {
                                    window.open('https://sellearndirect.com/contact', '_blank');
                                    setShowUserMenu(false);
                                  }}
                                  className="w-full flex items-center gap-4 px-0 py-2 hover:bg-opacity-10 transition-colors rounded"
                                  style={{ color: textColor }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${textColor}10`)}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                  <InformationCircleIcon className="w-5 h-5" />
                                  <span className="text-sm flex-1 text-left">Send feedback</span>
                                  <ArrowTopRightOnSquareIcon className="w-4 h-4 opacity-50" />
                                </button>
                              </div>

                              {/* Divider */}
                              <div className="h-px my-1" style={{ backgroundColor: `${textColor}15` }}></div>

                              {/* Sign Out */}
                              <button
                                onClick={() => {
                                  signOut({ callbackUrl: channelUrl });
                                  setShowUserMenu(false);
                                }}
                                className="w-full flex items-center gap-4 px-4 py-2.5 hover:bg-opacity-10 transition-colors"
                                style={{ color: '#ef4444' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ef444410')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                              >
                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                <span className="text-sm flex-1 text-left">Sign out</span>
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.header>

        {/* Mobile Menu Dropdown - Removed */}
        {false && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setShowMobileMenu(false)}
            />
            {/* Menu Panel */}
            <div
              className="fixed top-16 left-0 right-0 z-50 lg:hidden overflow-y-auto"
              style={{
                background: `linear-gradient(135deg, ${backgroundColor}FF 0%, ${backgroundColor}F0 100%)`,
                borderBottom: `1px solid ${textColor}15`,
                boxShadow: `0 10px 40px ${textColor}20`,
                maxHeight: 'calc(100vh - 4rem)',
              }}
            >
              <div className="px-4 py-6 space-y-1">

                {/* Action Buttons */}
                {isOwner && channel.subscriptionEnabled && (
                  <button
                    onClick={() => {
                      setShowSubscribersList(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-base transition-all duration-300"
                    style={{
                      backgroundColor: `${primaryColor}15`,
                      color: primaryColor,
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Subscribers
                  </button>
                )}

                {!isOwner && channel.subscriptionEnabled && getSubscribeButtonText() && (
                  <div className="space-y-2">
                    {!session?.user ? (
                      <>
                        <button
                          onClick={() => {
                            router.push(`/auth/signin?callbackUrl=${encodeURIComponent(channelUrl)}`);
                            setShowMobileMenu(false);
                          }}
                          className="w-full px-4 py-3 rounded-xl font-semibold text-base transition-all duration-300 border-2"
                          style={{
                            backgroundColor: 'transparent',
                            borderColor: `${primaryColor}40`,
                            color: primaryColor,
                          }}
                        >
                          Sign In
                        </button>
                        <button
                          onClick={() => {
                            router.push(`/auth/signup?callbackUrl=${encodeURIComponent(channelUrl)}`);
                            setShowMobileMenu(false);
                          }}
                          className="w-full px-4 py-3 rounded-xl font-bold text-base transition-all duration-300"
                          style={{
                            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                            color: '#ffffff',
                          }}
                        >
                          Subscribe Now
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setShowSubscriptionModal(true);
                          setShowMobileMenu(false);
                        }}
                        disabled={hasActiveSubscription}
                        className="w-full px-4 py-3 rounded-xl font-bold text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: hasActiveSubscription
                            ? `linear-gradient(135deg, ${primaryColor}40 0%, ${primaryColor}30 100%)`
                            : `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                          color: '#ffffff',
                        }}
                      >
                        {hasActiveSubscription ? 'Subscribed' : (getSubscribeButtonText() || 'Subscribe')}
                      </button>
                    )}
                  </div>
                )}

                {/* User Menu Items (if logged in) */}
                {session?.user && (
                  <>
                    <div className="my-4 border-t" style={{ borderColor: `${textColor}20` }} />
                    <div className="px-4 py-2">
                      <div className="flex items-center gap-3 mb-4">
                        {session?.user?.image ? (
                          <img
                            src={session?.user?.image || undefined}
                            alt={session?.user?.name || 'User'}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: `${primaryColor}15`,
                              color: primaryColor,
                            }}
                          >
                            <UserCircleIcon className="w-6 h-6" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate" style={{ color: textColor }}>
                            {session?.user?.name || 'User'}
                          </div>
                          <div className="text-xs opacity-75" style={{ color: textColor }}>
                            {session?.user?.email}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          router.push('/dashboard');
                          setShowMobileMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl font-medium transition-all duration-200"
                        style={{
                          color: textColor,
                          backgroundColor: `${primaryColor}10`,
                        }}
                      >
                        <Cog6ToothIcon className="w-5 h-5" />
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          signOut({ callbackUrl: channelUrl });
                          setShowMobileMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl font-medium transition-all duration-200 mt-2"
                        style={{
                          color: textColor,
                          backgroundColor: `${primaryColor}10`,
                        }}
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* Main Content with Sidebar */}
        <div className="flex relative">
          {/* YouTube-Style Sidebar - Hidden on mobile, shown on desktop */}
          <aside
            className={`hidden lg:block fixed lg:sticky top-20 left-0 h-[calc(100vh-5rem)] z-40 border-r transition-all duration-500 overflow-y-auto scrollbar-hide w-64`}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              backgroundColor: backgroundColor,
              borderColor: `${textColor}0D`,
              boxShadow: `4px 0 24px rgba(0, 0, 0, 0.02)`,
            }}
          >
            <div className="w-64 p-2">
              {/* Main Navigation */}
              <nav className="space-y-1">
                <button
                  onClick={() => {
                    setActiveSidebarItem('home');
                    const productsSection = document.getElementById('products');
                    if (productsSection) {
                      productsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${activeSidebarItem === 'home'
                    ? 'shadow-inner'
                    : 'hover:bg-gray-50/50'
                    }`}
                  style={{
                    color: activeSidebarItem === 'home' ? textColor : `${textColor}CC`,
                    backgroundColor: activeSidebarItem === 'home' ? `${primaryColor}0D` : 'transparent',
                  }}
                >
                  <HomeIcon className="w-6 h-6 flex-shrink-0" />
                  <span
                    className="text-sm"
                    style={{
                      fontFamily: bodyFont,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Home
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveSidebarItem('explore');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${activeSidebarItem === 'explore'
                    ? 'shadow-inner'
                    : 'hover:bg-gray-50/50'
                    }`}
                  style={{
                    color: activeSidebarItem === 'explore' ? textColor : `${textColor}CC`,
                    backgroundColor: activeSidebarItem === 'explore' ? `${primaryColor}0D` : 'transparent',
                  }}
                >
                  <FireIcon className="w-6 h-6 flex-shrink-0" />
                  <span className="text-sm">Explore</span>
                </button>

                {session?.user && (
                  <>
                    <button
                      onClick={() => {
                        setActiveSidebarItem('subscriptions');
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${activeSidebarItem === 'subscriptions'
                        ? 'shadow-inner'
                        : 'hover:bg-gray-50/50'
                        }`}
                      style={{
                        color: activeSidebarItem === 'subscriptions' ? textColor : `${textColor}CC`,
                        backgroundColor: activeSidebarItem === 'subscriptions' ? `${primaryColor}0D` : 'transparent',
                      }}
                    >
                      <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="text-sm">Subscriptions</span>
                    </button>
                  </>
                )}
              </nav>

              {/* Divider */}
              <div className="my-4 mx-4 border-t" style={{ borderColor: `${textColor}0D` }} />

              {/* Library Section */}
              {session?.user && (
                <>
                  <div className="px-4 py-3">
                    <h3
                      className="text-[10px] font-bold uppercase tracking-[0.15em]"
                      style={{
                        color: `${textColor}60`,
                        fontFamily: headingFont,
                      }}
                    >
                      Library
                    </h3>
                  </div>
                  <nav className="space-y-1">
                    <button
                      onClick={() => {
                        setActiveSidebarItem('history');
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${activeSidebarItem === 'history'
                        ? 'shadow-inner'
                        : 'hover:bg-gray-50/50'
                        }`}
                      style={{
                        color: activeSidebarItem === 'history' ? textColor : `${textColor}CC`,
                        backgroundColor: activeSidebarItem === 'history' ? `${primaryColor}0D` : 'transparent',
                      }}
                    >
                      <ClockIcon className="w-6 h-6 flex-shrink-0" />
                      <span className="text-sm font-medium">History</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveSidebarItem('liked');
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${activeSidebarItem === 'liked'
                        ? 'shadow-inner'
                        : 'hover:bg-gray-50/50'
                        }`}
                      style={{
                        color: activeSidebarItem === 'liked' ? textColor : `${textColor}CC`,
                        backgroundColor: activeSidebarItem === 'liked' ? `${primaryColor}0D` : 'transparent',
                      }}
                    >
                      <HeartIcon className="w-6 h-6 flex-shrink-0" />
                      <span className="text-sm font-medium">Liked Products</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveSidebarItem('saved');
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${activeSidebarItem === 'saved'
                        ? 'shadow-inner'
                        : 'hover:bg-gray-50/50'
                        }`}
                      style={{
                        color: activeSidebarItem === 'saved' ? textColor : `${textColor}CC`,
                        backgroundColor: activeSidebarItem === 'saved' ? `${primaryColor}0D` : 'transparent',
                      }}
                    >
                      <BookmarkIcon className="w-6 h-6 flex-shrink-0" />
                      <span className="text-sm font-medium">Saved</span>
                    </button>

                    {/* Create Playlist Button */}
                    <button
                      onClick={() => {
                        setShowCreatePlaylistModal(true);
                        setSidebarOpen(false);
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-gray-50/50 border border-dashed border-gray-300/50"
                      style={{
                        color: `${textColor}CC`,
                      }}
                    >
                      <PlusIcon className="w-6 h-6 flex-shrink-0" />
                      <span className="text-sm font-medium">Create Playlist</span>
                    </button>

                    {/* User's Playlists */}
                    {playlists.length > 0 && (
                      <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                        {playlists.map((playlist) => (
                          <button
                            key={playlist.id}
                            onClick={() => {
                              setSelectedPlaylist(playlist);
                              setActiveSidebarItem(`playlist-${playlist.id}`);
                              setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${activeSidebarItem === `playlist-${playlist.id}`
                              ? 'shadow-inner'
                              : 'hover:bg-gray-50/50'
                              }`}
                            style={{
                              color: activeSidebarItem === `playlist-${playlist.id}` ? textColor : `${textColor}CC`,
                              backgroundColor: activeSidebarItem === `playlist-${playlist.id}` ? `${primaryColor}0D` : 'transparent',
                            }}
                          >
                            <FolderIcon className="w-6 h-6 flex-shrink-0" />
                            <span className="text-sm font-medium truncate flex-1 text-left">{playlist.name}</span>
                            <span className="text-xs opacity-70">({playlist.items?.length || 0})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </nav>

                  {/* Divider */}
                  <div className="my-4 mx-4 border-t" style={{ borderColor: `${textColor}0D` }} />
                </>
              )}

              {/* Explore Categories */}
              <div className="px-4 py-2">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color: `${textColor}80`,
                    fontFamily: bodyFont,
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                  }}
                >
                  Explore
                </h3>
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => {
                    setActiveSidebarItem('music');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${activeSidebarItem === 'music'
                    ? 'bg-gray-100 font-semibold'
                    : 'hover:bg-gray-50'
                    }`}
                  style={{
                    color: activeSidebarItem === 'music' ? textColor : `${textColor}CC`,
                  }}
                >
                  <MusicalNoteIcon className="w-6 h-6 flex-shrink-0" />
                  <span className="text-sm">Music</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSidebarItem('gaming');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${activeSidebarItem === 'gaming'
                    ? 'bg-gray-100 font-semibold'
                    : 'hover:bg-gray-50'
                    }`}
                  style={{
                    color: activeSidebarItem === 'gaming' ? textColor : `${textColor}CC`,
                  }}
                >
                  <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">Gaming</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSidebarItem('news');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${activeSidebarItem === 'news'
                    ? 'bg-gray-100 font-semibold'
                    : 'hover:bg-gray-50'
                    }`}
                  style={{
                    color: activeSidebarItem === 'news' ? textColor : `${textColor}CC`,
                  }}
                >
                  <NewspaperIcon className="w-6 h-6 flex-shrink-0" />
                  <span className="text-sm">News</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSidebarItem('sports');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${activeSidebarItem === 'sports'
                    ? 'bg-gray-100 font-semibold'
                    : 'hover:bg-gray-50'
                    }`}
                  style={{
                    color: activeSidebarItem === 'sports' ? textColor : `${textColor}CC`,
                  }}
                >
                  <TrophyIcon className="w-6 h-6 flex-shrink-0" />
                  <span className="text-sm">Sports</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSidebarItem('learning');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${activeSidebarItem === 'learning'
                    ? 'bg-gray-100 font-semibold'
                    : 'hover:bg-gray-50'
                    }`}
                  style={{
                    color: activeSidebarItem === 'learning' ? textColor : `${textColor}CC`,
                  }}
                >
                  <LightBulbIcon className="w-6 h-6 flex-shrink-0" />
                  <span className="text-sm">Learning</span>
                </button>
              </nav>

              {/* Settings */}
              {session?.user && (
                <>
                  <div className="my-2 border-t" style={{ borderColor: `${textColor}15` }} />
                  <button
                    onClick={() => {
                      // If user is channel owner, go to dashboard settings
                      // Otherwise, go to viewer settings page
                      if (isOwner) {
                        router.push('/auth/dashboard/settings');
                      } else {
                        router.push('/settings');
                      }
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50"
                    style={{ color: `${textColor}CC` }}
                  >
                    <Cog6ToothIcon className="w-6 h-6 flex-shrink-0" />
                    <span className="text-sm">Settings</span>
                  </button>
                </>
              )}
            </div>
          </aside>


          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Premium Hero Section - SaaS Marketplace Design */}
            {isSectionVisible('hero') && (
              <section id="features" className="relative min-h-screen flex flex-col scroll-mt-20">
                {/* Header with Title */}
                <div className="relative z-20 pt-8 sm:pt-12 pb-6 sm:pb-8">
                  <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
                    <h1
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-center"
                      style={{
                        fontFamily: headingFont,
                        fontWeight: 700,
                        color: textColor,
                      }}
                    >
                      {channel.name}
                    </h1>

                    <p
                      className="text-sm sm:text-base md:text-lg lg:text-xl w-full px-4 mx-auto text-center leading-relaxed"
                      style={{
                        color: textColor,
                        opacity: 0.9,
                      }}
                    >
                      {channel.description || 'The world\'s first autonomous AI-powered technology for safe, efficient and highly accurate wind farm inspections.'}
                    </p>
                  </div>
                </div>

                {/* Hero Image Section with Overlays */}
                <div className="relative flex-1 min-h-[200px] sm:min-h-[250px] md:min-h-[300px] mb-4 sm:mb-6 md:mb-10">
                  {/* Background Image */}
                  <div className="absolute inset-0 rounded-none sm:rounded-2xl md:rounded-3xl overflow-hidden mx-0 sm:mx-4 md:mx-6 lg:mx-8">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${getCoverImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>

                  {/* Overlay Content */}
                  <div className="relative z-10 h-full p-4 sm:p-6 md:p-8 lg:p-12">
                    <div className="w-full h-full relative">

                      {/* Top Left - Seller Profile */}
                      {sellerImage && (
                        <div className="absolute top-6 sm:top-8 md:top-10 left-6 sm:left-8 md:left-10 z-20">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="relative">
                              <img
                                src={sellerImage}
                                alt={sellerName}
                                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-2xl object-cover"
                              />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-3 border-white shadow-lg"></div>
                            </div>
                            <div className="bg-white/95 backdrop-blur-lg rounded-2xl px-4 sm:px-5 py-3 sm:py-4 shadow-2xl border border-white/60">
                              <div className="text-base sm:text-lg font-bold text-gray-900">{sellerName}</div>
                              <div className="text-xs sm:text-sm text-gray-600 font-medium">Creator</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Top Right Card - Stats & Actions */}
                      <div className="absolute top-4 sm:top-6 md:top-8 lg:top-10 right-4 sm:right-6 md:right-8 lg:right-10 backdrop-blur-xl bg-white/90 border border-white/60 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl w-[calc(100%-2rem)] sm:w-auto sm:max-w-xs md:max-w-sm z-20">
                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200/50">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-5 h-5 sm:w-6 sm:h-6 ${star <= Math.floor(averageRating) ? 'text-yellow-400 fill-yellow-400' : star === Math.ceil(averageRating) && averageRating % 1 !== 0 ? 'text-yellow-400 fill-yellow-400/50' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-base sm:text-lg font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                          {ratingCount > 0 && (
                            <span className="text-xs sm:text-sm text-gray-500">({ratingCount} reviews)</span>
                          )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200/50">
                          {/* Views */}
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <div className="flex flex-col">
                              <span className="text-sm sm:text-base font-bold text-gray-900">
                                {(() => {
                                  // Calculate total views from all products' viewCount for accuracy
                                  const totalViews = allProducts?.reduce((sum: number, p: any) => {
                                    return sum + (Number(p.viewCount) || 0);
                                  }, 0) || 0;
                                  return totalViews;
                                })()}
                              </span>
                              <span className="text-xs text-gray-600">views</span>
                            </div>
                          </div>

                          {/* Products */}
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <div className="flex flex-col">
                              <span className="text-sm sm:text-base font-bold text-gray-900">{channel._count?.products || allProducts.length || 0}</span>
                              <span className="text-xs text-gray-600">products</span>
                            </div>
                          </div>

                          {/* Purchases */}
                          {totalPurchases > 0 && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                              <div className="flex flex-col">
                                <span className="text-sm sm:text-base font-bold text-gray-900">{totalPurchases}</span>
                                <span className="text-xs text-gray-600">sold</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* People Who Bought */}
                        {recentBuyers.length > 0 && (
                          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200/50">
                            <div className="flex -space-x-2">
                              {recentBuyers.map((buyer, idx) => (
                                <div
                                  key={idx}
                                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-3 border-white bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold shadow-lg"
                                >
                                  {buyer.image ? (
                                    <img src={buyer.image} alt={buyer.name} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    buyer.name.charAt(0).toUpperCase()
                                  )}
                                </div>
                              ))}
                            </div>
                            <span className="text-sm sm:text-base text-gray-700">
                              <span className="font-bold text-gray-900">{totalPurchases}+</span> bought
                            </span>
                          </div>
                        )}

                        {/* Category/Tags */}
                        {channel.category && (
                          <div className="mb-4 pb-4 border-b border-gray-200/50">
                            <div className="flex items-center gap-2 flex-wrap">
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              <span className="text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                                {channel.category}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                          {!isOwner && channel.subscriptionEnabled && getSubscribeButtonText() && (
                            !session?.user ? (
                              <>
                                <button
                                  onClick={() => router.push(`/auth/signin?callbackUrl=${encodeURIComponent(channelUrl)}`)}
                                  className="w-full px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border-2 border-gray-900 bg-transparent text-gray-900 hover:bg-gray-900 hover:text-white"
                                >
                                  Sign In
                                </button>
                                <button
                                  onClick={() => router.push(`/auth/signup?callbackUrl=${encodeURIComponent(channelUrl)}`)}
                                  className="w-full px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg hover:shadow-xl"
                                >
                                  Subscribe Now
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setShowSubscriptionModal(true)}
                                disabled={hasActiveSubscription}
                                className={`w-full px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${hasActiveSubscription
                                  ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg hover:shadow-xl'
                                  }`}
                              >
                                {hasActiveSubscription ? 'Subscribed' : getSubscribeButtonText()}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </section>
            )}


            {/* Subscriptions View */}
            {activeSidebarItem === 'subscriptions' && session?.user && (
              <section className="px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12">
                <div className="max-w-7xl mx-auto">
                  <h2
                    className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8"
                    style={{
                      fontFamily: headingFont,
                      color: textColor,
                    }}
                  >
                    My Subscriptions
                  </h2>
                  {channelSubscriptions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {channelSubscriptions
                        .filter((sub: any) => sub.status === 'ACTIVE' && new Date(sub.endDate) > new Date())
                        .map((subscription: any) => (
                          <div
                            key={subscription.id}
                            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-200"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                  {subscription.channel?.name || 'Channel'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Active until {new Date(subscription.endDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => router.push(`/channel/${subscription.channel?.slug}`)}
                              className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                            >
                              Visit Channel
                            </button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600 mb-4">You haven't subscribed to any channels yet.</p>
                      <button
                        onClick={() => setActiveSidebarItem('explore')}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Explore Channels
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* All Products Section */}
            {isSectionVisible('products') && (
              <section id="products" className="py-8 sm:py-12 bg-white scroll-mt-20">
                <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto">

                  {/* Mobile-Optimized Search & Controls Bar */}
                  <div className="relative bg-white border-b border-gray-200 shadow-sm py-3 sm:py-4 px-3 sm:px-4 md:px-6 lg:px-12">
                    <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
                      {/* Search Bar - Premium Soft-UI */}
                      <div className="relative w-full group">
                        <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
                          <MagnifyingGlassIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search for premium products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-12 sm:pl-14 pr-12 sm:pr-14 py-4 sm:py-5 bg-white/50 backdrop-blur-xl border rounded-2xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all duration-500 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]"
                          style={{
                            fontFamily: bodyFont,
                            letterSpacing: '-0.01em',
                          }}
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center active:bg-gray-100 rounded-r-full transition-colors touch-manipulation"
                            aria-label="Clear search"
                          >
                            <XMarkIcon className="h-5 w-5 text-gray-500 active:text-gray-700 transition-colors" />
                          </button>
                        )}
                      </div>

                      {/* Premium Horizontal Category Chips */}
                      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-3 sm:-mx-0 px-3 sm:px-0">
                        {categories.map((category) => {
                          const count = category === 'All'
                            ? allProducts.length
                            : allProducts.filter((p: any) => p.tags?.includes(category)).length;
                          const isActive = selectedCategory === category;

                          return (
                            <button
                              key={category}
                              onClick={() => setSelectedCategory(category)}
                              className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-500 flex-shrink-0 active:scale-95 shadow-sm border ${isActive
                                ? 'bg-gray-900 text-white border-transparent shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)]'
                                : 'bg-white text-gray-700 border-gray-100 hover:border-gray-200 hover:shadow-md'
                                }`}
                              style={{
                                fontFamily: bodyFont,
                                letterSpacing: '0.01em',
                                minHeight: '48px',
                              }}
                            >
                              <span className="flex items-center gap-2">
                                {category}
                                <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                  {count}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Controls Row - Mobile Optimized */}
                      <div className="flex flex-col gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-gray-200">
                        {/* Results Count - Hidden on very small screens */}
                        <div
                          className="text-xs sm:text-sm text-gray-600 hidden sm:block"
                          style={{
                            fontFamily: bodyFont,
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {activeSidebarItem === 'history' && (
                            <span>Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> viewed products</span>
                          )}
                          {activeSidebarItem === 'liked' && (
                            <span>Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> liked products</span>
                          )}
                          {activeSidebarItem === 'saved' && (
                            <span>Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> saved products</span>
                          )}
                          {!['history', 'liked', 'saved', 'subscriptions'].includes(activeSidebarItem) && (
                            <span>Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> of{' '}
                              <span className="font-semibold text-gray-900">{baseProducts.length}</span> products</span>
                          )}
                        </div>

                        {/* Premium Filter & View Controls */}
                        <div className="flex items-center justify-between gap-4 flex-wrap pt-4 border-t border-gray-100">
                          {/* Left: Filter Toggle & Sort */}
                          <div className="flex items-center gap-3 flex-1 flex-wrap">
                            <button
                              onClick={() => setShowFilters(!showFilters)}
                              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-500 flex items-center gap-2 active:scale-95 shadow-sm border ${showFilters || selectedType !== 'all'
                                ? 'bg-gray-900 text-white border-transparent shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)]'
                                : 'bg-white text-gray-700 border-gray-100 hover:border-gray-200 hover:shadow-md'
                                }`}
                              style={{ minHeight: '48px' }}
                            >
                              <AdjustmentsHorizontalIcon className="h-5 w-5" />
                              <span className="hidden xs:inline">Filters</span>
                              <span className="xs:hidden">Filter</span>
                              {(selectedType !== 'all' || sortBy !== 'newest') && (
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                              )}
                            </button>

                            <div className="relative min-w-[160px] flex-1 sm:flex-none">
                              <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none w-full pl-4 pr-10 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all duration-500 shadow-sm hover:shadow-md cursor-pointer"
                                style={{ minHeight: '48px' }}
                              >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                                <option value="price-asc">Price (Low to High)</option>
                                <option value="price-desc">Price (High to Low)</option>
                                <option value="rating">Top Rated</option>
                              </select>
                              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                                <ChevronDownIcon className="h-4 w-4" />
                              </div>
                            </div>
                          </div>

                          {/* Right: View Toggle */}
                          <div className="flex items-center bg-gray-50/50 p-1 rounded-xl border border-gray-100/50 shadow-inner">
                            <button
                              onClick={() => setViewMode('grid')}
                              className={`p-2.5 rounded-lg transition-all duration-500 ${viewMode === 'grid'
                                ? 'bg-white text-gray-900 shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                              title="Grid view"
                              aria-label="Grid view"
                            >
                              <Squares2X2Icon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => setViewMode('list')}
                              className={`p-2.5 rounded-lg transition-all duration-500 ${viewMode === 'list'
                                ? 'bg-white text-gray-900 shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                              title="List view"
                              aria-label="List view"
                            >
                              <ListBulletIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Premium Advanced Filters Panel */}
                      <AnimatePresence>
                        {showFilters && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                              <div className="flex items-center justify-between mb-6">
                                <h3
                                  className="text-xs font-bold text-gray-400 uppercase tracking-widest"
                                  style={{
                                    fontFamily: headingFont,
                                  }}
                                >
                                  Filter by Type
                                </h3>
                                <button
                                  onClick={() => {
                                    setShowFilters(false);
                                    setSelectedType('all');
                                  }}
                                  className="text-xs font-bold text-primary hover:underline transition-all"
                                >
                                  Clear All
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-3">
                                {['all', 'VIDEO', 'DOCUMENT', 'CODE'].map((type) => (
                                  <button
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all duration-500 ${selectedType === type
                                      ? 'bg-primary text-white shadow-[0_10px_20px_-5px_rgba(0,0,0,0.2)]'
                                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                      }`}
                                    style={{
                                      minHeight: '44px',
                                      backgroundColor: selectedType === type ? primaryColor : undefined,
                                    }}
                                  >
                                    {type === 'all' ? 'All Formats' : type}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Clear Filters Button */}
                      {(searchQuery || selectedType !== 'all' || selectedCategory !== 'All') && (
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setSelectedType('all');
                              setSelectedCategory('All');
                              setShowFilters(false);
                            }}
                            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center gap-1"
                          >
                            <XMarkIcon className="h-4 w-4" />
                            Clear filters
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Products Grid/List - Mobile Optimized */}
                  {filteredProducts.length > 0 ? (
                    <div className={viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 px-2 sm:px-0'
                      : 'space-y-3 sm:space-y-4 px-2 sm:px-0'
                    }>
                      {filteredProducts.map((product: any, index: number) => {
                        const canAccess = isOwner || !product.isSubscriberOnly || !channel.subscriptionEnabled || hasActiveSubscription;

                        if (viewMode === 'list') {
                          return (
                            <motion.div
                              key={product.id || index}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.5, delay: index * 0.05 }}
                              whileHover={{ y: -4 }}
                              onClick={() => {
                                if (canAccess) {
                                  window.location.href = `/channel/${channel.slug}/products/${product.id}`;
                                }
                              }}
                              className="group relative cursor-pointer"
                            >
                              <div className="relative bg-white/70 backdrop-blur-sm border border-gray-100 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500">
                                <div className="flex flex-col md:flex-row">
                                  {/* Thumbnail */}
                                  <div className="relative w-full md:w-80 lg:w-96 aspect-video md:aspect-auto bg-gray-50 overflow-hidden">
                                    {(product.type === 'VIDEO' || product.type === 'VIDEOS') && (product.videoUrl || product.fileUrl) ? (
                                      <>
                                        <video
                                          src={product.videoUrl || product.fileUrl}
                                          className="w-full h-full object-cover"
                                          muted
                                          loop
                                          playsInline
                                          autoPlay
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                                          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/95 backdrop-blur-md shadow-2xl">
                                            <div className="w-0 h-0 border-l-[12px] border-l-primary border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                                          </div>
                                        </div>
                                      </>
                                    ) : product.previewImage ? (
                                      <img
                                        src={product.previewImage}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <div style={{ color: `${primaryColor}40` }}>{getContentIcon(product.type)}</div>
                                      </div>
                                    )}

                                    {/* Type Badge */}
                                    <div className="absolute top-4 left-4">
                                      <div className="px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur-md shadow-lg border border-white/40">
                                        <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">
                                          {product.type}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 p-6 md:p-8 flex flex-col">
                                    <div className="flex-1">
                                      <div className="mb-4 flex flex-wrap items-center gap-3">
                                        {product.tags?.slice(0, 2).map((tag: string) => (
                                          <span key={tag} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-primary/5 text-primary border border-primary/10 uppercase tracking-wider">
                                            {tag}
                                          </span>
                                        ))}
                                        {!canAccess && (
                                          <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-900 text-white uppercase tracking-wider">
                                            <LockClosedIcon className="w-3 h-3" />
                                            Locked
                                          </span>
                                        )}
                                      </div>

                                      <h3
                                        className="text-2xl md:text-3xl font-black mb-3 text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300"
                                        style={{ fontFamily: headingFont }}
                                      >
                                        {product.title}
                                      </h3>

                                      {product.description && (
                                        <p className="text-gray-500 line-clamp-2 md:line-clamp-3 mb-6 text-sm md:text-base leading-relaxed" style={{ fontFamily: bodyFont }}>
                                          {product.description}
                                        </p>
                                      )}

                                      <div className="flex items-center gap-6 mb-8 text-xs font-bold uppercase tracking-widest text-gray-400">
                                        <div className="flex items-center gap-2">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                          </svg>
                                          {formatViewCount(Number(product.viewCount) || 0)}
                                        </div>
                                        {(() => {
                                          const { rating } = getProductRating(product);
                                          return rating > 0 && (
                                            <div className="flex items-center gap-2">
                                              <FireIcon className="w-4 h-4 text-orange-500" />
                                              {rating.toFixed(1)} Rating
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                                      <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Premium Access</span>
                                        <span className="text-2xl font-black text-gray-900" style={{ fontFamily: headingFont }}>
                                          {product.price > 0 ? `$${product.price}` : 'Free'}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-3">
                                        {session?.user && (
                                          <>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setProductToAdd(product);
                                                setShowAddToPlaylistModal(true);
                                              }}
                                              className="p-3.5 rounded-2xl bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100 hover:text-gray-600 transition-all duration-300"
                                            >
                                              <PlusIcon className="w-6 h-6" />
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleSave(product.id, e);
                                              }}
                                              className={`p-3.5 rounded-2xl transition-all duration-300 ${isProductSaved(product.id)
                                                ? 'bg-primary/10 text-primary border-primary/20 shadow-inner'
                                                : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100 hover:text-gray-600'
                                                } border`}
                                            >
                                              <BookmarkIcon className={`w-6 h-6 ${isProductSaved(product.id) ? 'fill-current' : ''}`} />
                                            </button>
                                          </>
                                        )}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (canAccess) {
                                              window.location.href = `/channel/${channel.slug}/products/${product.id}`;
                                            } else {
                                              setShowSubscriptionModal(true);
                                            }
                                          }}
                                          className="px-8 py-3.5 rounded-2xl bg-gray-900 text-white font-bold text-sm shadow-xl hover:shadow-primary/20 hover:bg-primary transition-all duration-300 active:scale-95 flex items-center gap-2"
                                        >
                                          {canAccess ? 'View Product' : 'Subscribe to Unlock'}
                                          <ArrowRightIcon className="w-5 h-5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        }

                        return (
                          <motion.div
                            key={product.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            whileHover={{ y: -10 }}
                            onClick={() => {
                              if (canAccess) {
                                window.location.href = `/channel/${channel.slug}/products/${product.id}`;
                              }
                            }}
                            className="group relative cursor-pointer h-full"
                          >
                            <div className="relative bg-white/70 backdrop-blur-sm border border-gray-100 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] transition-all duration-500 h-full flex flex-col">
                              <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                                {(product.type === 'VIDEO' || product.type === 'VIDEOS') && (product.videoUrl || product.fileUrl) ? (
                                  <>
                                    <video
                                      src={product.videoUrl || product.fileUrl}
                                      className="w-full h-full object-cover"
                                      muted
                                      loop
                                      playsInline
                                      autoPlay
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    {/* Play Button */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                                      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/95 backdrop-blur-md shadow-2xl">
                                        <div className="w-0 h-0 border-l-[12px] border-l-primary border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                                      </div>
                                    </div>
                                  </>
                                ) : product.previewImage ? (
                                  <img
                                    src={product.previewImage}
                                    alt={product.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                    <div style={{ color: `${primaryColor}40` }}>{getContentIcon(product.type)}</div>
                                  </div>
                                )}

                                {/* Premium Badges */}
                                <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                                  <div className="px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur-md shadow-lg border border-white/40">
                                    <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">
                                      {product.type}
                                    </span>
                                  </div>

                                  {!canAccess && (
                                    <div className="p-2 rounded-xl bg-gray-900/80 backdrop-blur-md shadow-lg text-white">
                                      <LockClosedIcon className="w-4 h-4" />
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Content Section */}
                              <div className="flex-1 flex flex-col p-5 sm:p-6">
                                <div className="mb-3 flex flex-wrap gap-2">
                                  {product.tags?.slice(0, 1).map((tag: string) => (
                                    <span key={tag} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-primary/5 text-primary border border-primary/10 uppercase tracking-wider">
                                      {tag}
                                    </span>
                                  ))}
                                </div>

                                <h3
                                  className="text-lg font-bold mb-2 text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300"
                                  style={{ fontFamily: headingFont }}
                                >
                                  {product.title}
                                </h3>

                                <div className="mt-auto pt-4 flex items-center justify-between">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Premium Access</p>
                                    <p className="text-xl font-black text-gray-900" style={{ fontFamily: headingFont }}>
                                      {product.price > 0 ? `$${product.price}` : 'Free'}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {session?.user && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleSave(product.id, e);
                                        }}
                                        className={`p-2.5 rounded-xl transition-all duration-300 ${isProductSaved(product.id)
                                          ? 'bg-primary/10 text-primary border-primary/20'
                                          : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                                          } border`}
                                      >
                                        <BookmarkIcon className={`w-5 h-5 ${isProductSaved(product.id) ? 'fill-current' : ''}`} />
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = `/channel/${channel.slug}/products/${product.id}`;
                                      }}
                                      className="p-2.5 rounded-xl bg-gray-900 text-white shadow-lg hover:shadow-primary/20 hover:bg-primary transition-all duration-300 active:scale-95"
                                    >
                                      <ArrowRightIcon className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="inline-block p-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="text-lg font-semibold text-gray-700 mb-2">No products found</p>
                      <p className="text-gray-500">Try selecting a different category</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Related Products Carousel */}
            {channel.products && channel.products.length > 0 && (
              <section className="py-24 relative overflow-hidden bg-gray-50/50">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
                  <div className="flex items-end justify-between mb-12">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2" style={{ fontFamily: headingFont }}>
                        You May Also Like
                      </h2>
                      <p className="text-gray-500 font-medium">Handpicked recommendations from {channel.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-3 rounded-full bg-white shadow-md hover:shadow-xl transition-all active:scale-95 text-gray-400 hover:text-gray-900 border border-gray-100">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <button className="p-3 rounded-full bg-white shadow-md hover:shadow-xl transition-all active:scale-95 text-gray-400 hover:text-gray-900 border border-gray-100">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory">
                    {channel.products.slice(0, 6).map((product, idx) => (
                      <motion.div
                        key={product.id}
                        whileHover={{ y: -10 }}
                        className="flex-shrink-0 w-[300px] sm:w-[350px] snap-start"
                      >
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group">
                          <div className="aspect-video relative overflow-hidden">
                            <img
                              src={product.previewImage || defaultCoverImages[idx % 3]}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            />
                            <div className="absolute top-4 left-4">
                              <div className="px-3 py-1.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/30">
                                {idx % 2 === 0 ? 'Hot Pick' : 'Editor Choice'}
                              </div>
                            </div>
                            {idx % 3 === 0 && (
                              <div className="absolute top-4 right-4 animate-bounce">
                                <div className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/30">
                                  20% OFF
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-6">
                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{product.title}</h3>
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-black text-gray-900">${product.price || '0'}</span>
                              <button className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center hover:bg-primary transition-colors">
                                <PlusIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Premium Footer */}
            <footer className="relative pt-24 pb-12 bg-white overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                  {/* Brand Column */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary p-0.5 shadow-lg shadow-primary/20">
                        <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center overflow-hidden">
                          {channel.profileImage ? (
                            <img src={channel.profileImage} alt={channel.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl font-black text-primary">{channel.name[0]}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-2xl font-black tracking-tighter text-gray-900">
                        {channel.name}
                      </span>
                    </div>
                    <p className="text-gray-500 leading-relaxed max-w-xs">
                      Elevating the digital commerce experience with premium products and curated content from top creators.
                    </p>
                    <div className="flex gap-4">
                      {['twitter', 'instagram', 'youtube'].map((platform) => (
                        <button key={platform} className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-white hover:shadow-xl transition-all active:scale-95">
                          <GlobeAltIcon className="w-5 h-5" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Links Column */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8">Navigation</h4>
                    <ul className="space-y-4">
                      {['Home', 'Products', 'Subscriptions', 'Library'].map((link) => (
                        <li key={link}>
                          <a href="#" className="text-gray-600 hover:text-primary font-medium transition-colors flex items-center group">
                            <span className="w-0 group-hover:w-4 h-0.5 bg-primary mr-0 group-hover:mr-2 transition-all" />
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Categories Column */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8">Categories</h4>
                    <ul className="grid grid-cols-2 gap-4">
                      {categories.slice(1, 7).map((cat) => (
                        <li key={cat}>
                          <button
                            onClick={() => setSelectedCategory(cat)}
                            className="text-gray-600 hover:text-primary font-medium transition-colors text-left text-sm"
                          >
                            {cat}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Newsletter/Support Column */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8">Subscribe</h4>
                    <p className="text-sm text-gray-500 mb-6">Stay updated with the latest releases and collector items.</p>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="your@email.com"
                        className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-inner"
                      />
                      <button className="absolute right-2 top-2 w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center hover:bg-primary transition-all">
                        <ArrowRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-sm text-gray-400 font-medium">
                    © {new Date().getFullYear()} <span className="text-gray-900 font-bold">{channel.name}</span>. All rights reserved.
                  </div>
                  <div className="flex gap-8">
                    {['Privacy', 'Terms', 'Security', 'Sitemap'].map((item) => (
                      <a key={item} href="#" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
                        {item}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </footer>

            {/* Content Viewer Modal */}
            {selectedContent && (
              <ContentViewerModal
                content={selectedContent}
                onClose={() => setSelectedContent(null)}
                channelName={channel.name}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                backgroundColor={backgroundColor}
                textColor={textColor}
                borderRadius={borderRadius}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Minimal Template - Classic layout only
  const renderMinimalTemplate = () => {
    // Always use classic layout for Minimalist template
    return renderMinimalClassicLayout();
  };

  // Minimalist Shop - E-commerce focused with product grid
  const renderMinimalShopLayout = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Shop Header */}
        <header className="sticky top-0 z-50 bg-white shadow-sm">
          <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center gap-2">
                {channel.profileImage && (
                  <img src={channel.profileImage} alt={channel.name} className="w-8 h-8 rounded" />
                )}
                <span className="font-bold text-lg text-gray-900">{channel.name}</span>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <a href="#shop" className="text-sm text-gray-600 hover:text-gray-900">Shop</a>
                <a href="#about" className="text-sm text-gray-600 hover:text-gray-900">About</a>
                <button className="p-2 text-gray-600 hover:text-gray-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Banner */}
        <section className="relative h-[300px] sm:h-[400px] bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-center text-white px-4">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">{channel.name}</h1>
            {channel.description && (
              <p className="text-lg sm:text-xl mb-6 opacity-90">{channel.description}</p>
            )}
            <button className="px-6 py-3 bg-white text-gray-900 font-semibold rounded hover:bg-gray-100">
              Shop Now
            </button>
          </div>
        </section>

        {/* Product Grid */}
        {channel.products && channel.products.length > 0 && (
          <section id="shop" className="py-12 sm:py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
                <select className="px-4 py-2 border border-gray-300 rounded text-sm">
                  <option>Sort by</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                </select>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {channel.products.map((product: any, index: number) => (
                  <div key={index} className="group bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {product.previewImage && (
                      <div className="aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={product.previewImage}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-3 sm:p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* About Section */}
        {channel.welcomeMessage && (
          <section id="about" className="py-16 px-4 bg-white">
            <div className="w-full px-4 sm:px-6 md:px-8 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">About Us</h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">{channel.welcomeMessage}</p>
            </div>
          </section>
        )}
      </div>
    );
  };

  // Minimalist Hero - Large image hero with overlays
  const renderMinimalHeroLayout = () => {
    return (
      <div className="min-h-screen bg-white">
        {/* Transparent Header */}
        <header className="absolute top-0 left-0 right-0 z-50">
          <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg truncate">{channel.name}</h1>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#products" className="text-sm text-white hover:opacity-80">Products</a>
              <a href="#about" className="text-sm text-white hover:opacity-80">About</a>
            </nav>
          </div>
        </header>

        {/* Full-Screen Hero */}
        <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
          <img
            src={getCoverImage}
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 text-center text-white px-4 sm:px-6 md:px-8 w-full">
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">{channel.name}</h2>
            {channel.description && (
              <p className="text-xl sm:text-2xl mb-8 opacity-90">{channel.description}</p>
            )}
            <button className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-colors">
              Explore
            </button>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>

        {/* Products Section */}
        {channel.products && channel.products.length > 0 && (
          <section id="products" className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center">Our Collection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {channel.products.map((product: any, index: number) => (
                  <div key={index} className="group">
                    {product.previewImage && (
                      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4">
                        <img
                          src={product.previewImage}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                          <button className="w-full py-3 bg-white text-gray-900 font-semibold rounded-lg">
                            Quick View
                          </button>
                        </div>
                      </div>
                    )}
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{product.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* About */}
        {channel.welcomeMessage && (
          <section id="about" className="py-20 px-4 bg-gray-50">
            <div className="w-full px-4 sm:px-6 md:px-8 text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h3>
              <p className="text-lg text-gray-600 leading-relaxed">{channel.welcomeMessage}</p>
            </div>
          </section>
        )}
      </div>
    );
  };

  // Minimalist Grid - Clean grid layout
  const renderMinimalGridLayout = () => {
    return (
      <div className="min-h-screen bg-white">
        {/* Minimal Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
          <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{channel.name}</h1>
              <button className="md:hidden p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Grid Hero */}
        <section className="py-12 sm:py-20 px-4">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">{channel.name}</h2>
              {channel.description && (
                <p className="text-lg text-gray-600 mb-8">{channel.description}</p>
              )}
              {channel.welcomeMessage && (
                <p className="text-base text-gray-500 mb-8">{channel.welcomeMessage}</p>
              )}
              <button className="px-6 py-3 bg-gray-900 text-white font-semibold rounded hover:bg-gray-800">
                Explore More
              </button>
            </div>
            <div className="rounded-3xl overflow-hidden">
              <img
                src={getCoverImage}
                alt="Hero"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Products Grid */}
        {channel.products && channel.products.length > 0 && (
          <section className="py-12 sm:py-20 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {channel.products.map((product: any, index: number) => (
                  <div key={index} className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
                    {product.previewImage && (
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={product.previewImage}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{product.title}</h3>
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        {!isOwner && channel.subscriptionEnabled && getSubscribeButtonText() && (
                          <button
                            onClick={() => setShowSubscriptionModal(true)}
                            disabled={hasActiveSubscription}
                            className="px-4 py-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white text-sm font-semibold rounded shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {hasActiveSubscription ? 'Subscribed' : getSubscribeButtonText()}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    );
  };

  // Minimalist Magazine - Editorial style
  const renderMinimalMagazineLayout = () => {
    return (
      <div className="min-h-screen bg-white">
        {/* Magazine Header */}
        <header className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 text-center mb-4">{channel.name}</h1>
            {channel.description && (
              <p className="text-center text-sm sm:text-base text-gray-600 w-full px-4 mx-auto">{channel.description}</p>
            )}
            <nav className="flex items-center justify-center gap-8 mt-6 text-sm">
              <a href="#" className="text-gray-900 font-medium">Home</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Products</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">About</a>
            </nav>
          </div>
        </header>

        {/* Featured Section */}
        <section className="py-12 sm:py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {channel.welcomeMessage && (
              <div className="w-full px-4 sm:px-6 md:px-8 text-center mb-12 sm:mb-16">
                <p className="text-xl text-gray-700 leading-relaxed italic">{channel.welcomeMessage}</p>
              </div>
            )}

            {/* Magazine Grid */}
            {channel.products && channel.products.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Feature Product */}
                {channel.products[0] && (
                  <div className="md:col-span-7">
                    {channel.products[0].previewImage && (
                      <img
                        src={channel.products[0].previewImage}
                        alt={channel.products[0].title}
                        className="w-full aspect-[16/10] object-cover rounded-lg mb-6"
                      />
                    )}
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{channel.products[0].title}</h2>
                    {channel.products[0].description && (
                      <p className="text-gray-600 mb-4">{channel.products[0].description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <button className="px-6 py-3 bg-gray-900 text-white font-semibold rounded hover:bg-gray-800">
                        View Details
                      </button>
                    </div>
                  </div>
                )}

                {/* Sidebar Products */}
                <div className="md:col-span-5 space-y-8">
                  {channel.products.slice(1, 4).map((product: any, index: number) => (
                    <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                      {product.previewImage && (
                        <img
                          src={product.previewImage}
                          alt={product.title}
                          className="w-full aspect-[16/9] object-cover rounded-lg mb-4"
                        />
                      )}
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{product.title}</h3>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  };

  // Small helper component for Stats
  const Stat = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="text-center">
      <div className={`text-4xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
  );

  // Tech Template - Modern gradient design
  const renderTechTemplate = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">

        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {channel.profileImage && (
                <img
                  src={channel.profileImage}
                  alt={channel.name}
                  className="w-12 h-12 rounded-xl border-2 border-indigo-600 shadow-lg"
                />
              )}
              <div>
                <h1 className="font-bold text-lg text-gray-900">{channel.name}</h1>
                <p className="text-xs text-gray-600">Tech & SaaS</p>
              </div>
            </div>

            {!isOwner && channel.subscriptionEnabled && getSubscribeButtonText() && (
              <button
                onClick={() => setShowSubscriptionModal(true)}
                disabled={hasActiveSubscription}
                className="px-6 py-2.5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white rounded-lg font-semibold hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {hasActiveSubscription ? 'Subscribed' : getSubscribeButtonText()}
              </button>
            )}
          </div>
        </header>

        {/* Hero */}
        <section className="py-20 px-4 text-center">
          <div className="max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
              </span>
              Now Available
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {channel.name}
            </h1>

            <p className="text-2xl text-gray-700 mb-12 max-w-3xl mx-auto">
              {channel.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <Stat label="Products" value={channel._count?.products || 0} color="text-indigo-600" />
              {isOwner && (
                <Stat label="Subscribers" value={channel._count?.subscribers || 0} color="text-purple-600" />
              )}
              <Stat label="Views" value={channel.totalViews || 0} color="text-pink-600" />
            </div>
          </div>
        </section>

        {/* Welcome */}
        {channel.welcomeMessage && (
          <section className="py-16 px-4 bg-white/50 backdrop-blur">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-xl border">
              <h2 className="text-3xl font-bold mb-4">Welcome</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {channel.welcomeMessage}
              </p>
            </div>
          </section>
        )}

        {/* Products */}
        {channel.products && channel.products.length > 0 && (
          <section className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl font-bold mb-12 text-center">Featured Products</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {channel.products.map((product: any, index: number) => {
                  const canAccess = isOwner || !product.isSubscriberOnly || !channel.subscriptionEnabled || hasActiveSubscription;

                  return (
                    <div
                      key={product.id || index}
                      onClick={() => {
                        if (canAccess) {
                          window.location.href = `/channel/${channel.slug}/products/${product.id}`;
                        }
                      }}
                      className="group bg-white rounded-2xl overflow-hidden border hover:shadow-2xl transition cursor-pointer"
                    >

                      {/* Preview */}
                      {(product.type === 'VIDEO' || product.type === 'VIDEOS') &&
                        (product.videoUrl || product.fileUrl) ? (
                        <div className="relative h-64 bg-black">
                          <video
                            src={product.videoUrl || product.fileUrl}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            autoPlay
                            playsInline
                          />
                        </div>
                      ) : product.previewImage ? (
                        <div className="relative h-64 overflow-hidden">
                          <img
                            src={product.previewImage}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition"
                          />
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center bg-gray-100 text-gray-400">
                          No Preview
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-2xl font-bold mb-3">{product.title}</h3>

                        {product.description && (
                          <p className="text-gray-600 mb-6 line-clamp-2">
                            {product.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          {canAccess ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedContent(product)
                              }}
                              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 hover:shadow-xl transition-all duration-200"
                            >
                              View
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowSubscriptionModal(true);
                              }}
                              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 hover:shadow-xl transition-all duration-200"
                            >
                              Subscribe to View
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="py-12 px-4 bg-gray-900 text-white text-center">
          © {new Date().getFullYear()} {channel.name}. All rights reserved.
        </footer>
      </div>
    );
  };

  // Education Template - Warm and inviting
  const renderEducationTemplate = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {channel.profileImage && (
                <img
                  src={channel.profileImage}
                  alt={channel.name}
                  className="w-16 h-16 rounded-full border-4 border-orange-500"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{channel.name}</h1>
                <p className="text-gray-600">Educational Content</p>
              </div>
            </div>
            {channel.subscriptionEnabled && (
              <button className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors">
                Start Learning
              </button>
            )}
          </div>
        </header>

        {/* Hero */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">{channel.name}</h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">{channel.description}</p>

            {channel.welcomeMessage && (
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                <p className="text-lg text-gray-700 leading-relaxed">{channel.welcomeMessage}</p>
              </div>
            )}
          </div>
        </section>

        {/* Courses/Products */}
        {channel.products && channel.products.length > 0 && (
          <section className="py-16 px-4 bg-white/50">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl font-bold mb-12 text-center text-gray-900">Available Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channel.products.map((product: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
                  >
                    {product.previewImage && (
                      <img
                        src={product.previewImage}
                        alt={product.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-gray-900">{product.title}</h3>
                      {product.description && (
                        <p className="text-gray-600 mb-4 text-sm">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold text-sm hover:bg-orange-700 transition-colors">
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="py-8 px-4 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-600">
              © {new Date().getFullYear()} {channel.name}. Empowering learners worldwide.
            </p>
          </div>
        </footer>
      </div>
    );
  };

  // Business Template (same as Premium)
  const renderBusinessTemplate = () => {
    return renderPremiumDefaultTemplate();
  };

  // Premium Default Template - Sleek & Modern
  const renderPremiumDefaultTemplate = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Hero Section with Parallax Effect */}
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

          {/* Cover Image */}
          <div className="absolute inset-0">
            <img
              src={getCoverImage}
              alt="Cover"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white"></div>
          </div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Profile Image */}
              <div className="relative group">
                {channel.profileImage ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <img
                      src={channel.profileImage}
                      alt={channel.name}
                      className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
              </div>

              {/* Channel Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3 tracking-tight">
                  {channel.name}
                </h1>
                {channel.description && (
                  <p className="text-lg text-gray-600 mb-4 max-w-2xl">
                    {channel.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="font-semibold">{channel._count?.products || 0}</span>
                    <span>Products</span>
                  </div>
                  {isOwner && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span className="font-semibold">{channel._count?.subscribers || 0}</span>
                      <span>Subscribers</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-semibold">{channel.totalViews || 0}</span>
                    <span>Views</span>
                  </div>
                </div>
                {!isOwner && channel.subscriptionEnabled && getSubscribeButtonText() && (
                  <button
                    onClick={() => setShowSubscriptionModal(true)}
                    disabled={hasActiveSubscription}
                    className="group inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white rounded-full font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <span>{hasActiveSubscription ? 'Subscribed' : getSubscribeButtonText()}</span>
                    {!hasActiveSubscription && (
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome Message */}
          {channel.welcomeMessage && (
            <div className="mb-16">
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-1 h-16 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome</h2>
                    <p className="text-gray-600 leading-relaxed">{channel.welcomeMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {channel.products && channel.products.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
                <button className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
                  View All →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channel.products.map((product: any, index: number) => (
                  <div
                    key={product.id || index}
                    onClick={() => window.location.href = `/channel/${channel.slug}/products/${product.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200 cursor-pointer"
                  >
                    <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {(product.type === 'VIDEO' || product.type === 'VIDEOS') && (product.videoUrl || product.fileUrl) ? (
                        <video
                          src={product.videoUrl || product.fileUrl}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                          autoPlay
                          onTimeUpdate={(e) => {
                            const video = e.currentTarget;
                            if (video.currentTime >= 30) {
                              video.pause();
                              video.currentTime = 0;
                            }
                          }}
                          onLoadedMetadata={(e) => {
                            const video = e.currentTarget;
                            if (video.duration > 30) {
                              video.currentTime = 0;
                              video.play();
                            }
                          }}
                        />
                      ) : product.previewImage ? (
                        <img
                          src={product.previewImage}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                          NEW
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                        {product.title}
                      </h3>
                      {product.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        {!isOwner && channel.subscriptionEnabled && getSubscribeButtonText() && (
                          <button
                            onClick={() => setShowSubscriptionModal(true)}
                            disabled={hasActiveSubscription}
                            className="px-6 py-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white rounded-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {hasActiveSubscription ? 'Subscribed' : getSubscribeButtonText()}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-block p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full mb-6">
                <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Yet</h3>
              <p className="text-gray-600">Start adding products to showcase your amazing content!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600 text-sm">
              <p>© {new Date().getFullYear()} {channel.name}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };


  const handleSubscribe = async (duration: string) => {
    if (!session?.user?.id) {
      showError('Please login to subscribe');
      return;
    }

    setSubscribing(true);
    try {
      // Create subscription order
      const response = await fetch(`/api/channels/${channel.id}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ duration }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create subscription order');
      }

      const data = await response.json();

      // Validate response data
      if (!data.orderId || !data.keyId) {
        throw new Error('Invalid response from server. Please check your payment gateway configuration.');
      }

      // Initialize Razorpay
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
          amount: Math.round(data.amount * 100),
          currency: data.currency,
          name: channel.name,
          description: `Subscription for ${duration}`,
          order_id: data.orderId,
          handler: async function (response: any) {
            // Verify payment
            const verifyResponse = await fetch(`/api/channels/${channel.id}/subscribe/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                duration,
              }),
            });

            if (verifyResponse.ok) {
              setHasActiveSubscription(true);
              setShowSubscriptionModal(false);
              showSuccess('Subscription activated successfully!');
            } else {
              const error = await verifyResponse.json();
              showError(error.error || 'Payment verification failed');
            }
          },
          prefill: {
            email: session.user.email || '',
            name: session.user.name || '',
          },
          theme: {
            color: primaryColor,
          },
        };

        const razorpay = (window as any).Razorpay(options);
        razorpay.open();
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error('Error subscribing:', error);
      showError(error instanceof Error ? error.message : 'Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <>
      {renderTemplate()}
      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onSubscribe={handleSubscribe}
          subscribing={subscribing}
          channel={channel}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          textColor={textColor}
          backgroundColor={backgroundColor}
        />
      )}
      {/* Subscribers List Modal */}
      {showSubscribersList && (
        <SubscribersListModal
          isOpen={showSubscribersList}
          onClose={() => setShowSubscribersList(false)}
          subscribers={subscribers}
          channel={channel}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          textColor={textColor}
          backgroundColor={backgroundColor}
        />
      )}
      {/* My Subscriptions Modal */}
      {showMySubscriptions && (
        <MySubscriptionsModal
          isOpen={showMySubscriptions}
          onClose={() => setShowMySubscriptions(false)}
          subscriptions={channelSubscriptions}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          textColor={textColor}
          backgroundColor={backgroundColor}
        />
      )}
      {/* Paid Subscriptions Modal */}
      {showPaidSubscriptions && (
        <PaidSubscriptionsModal
          isOpen={showPaidSubscriptions}
          onClose={() => setShowPaidSubscriptions(false)}
          subscriptions={paidSubscriptions}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          textColor={textColor}
          backgroundColor={backgroundColor}
        />
      )}

      {/* Create Playlist Modal */}
      {showCreatePlaylistModal && (
        <CreatePlaylistModal
          isOpen={showCreatePlaylistModal}
          onClose={() => {
            setShowCreatePlaylistModal(false);
            setNewPlaylistName('');
            setNewPlaylistDescription('');
          }}
          onCreate={handleCreatePlaylist}
          name={newPlaylistName}
          setName={setNewPlaylistName}
          description={newPlaylistDescription}
          setDescription={setNewPlaylistDescription}
          primaryColor={primaryColor}
          textColor={textColor}
        />
      )}

      {/* Add to Playlist Modal */}
      {showAddToPlaylistModal && (
        <AddToPlaylistModal
          isOpen={showAddToPlaylistModal}
          onClose={() => {
            setShowAddToPlaylistModal(false);
            setProductToAdd(null);
          }}
          playlists={playlists}
          onAddToPlaylist={handleAddToPlaylist}
          product={productToAdd}
          onCreateNew={() => {
            setShowAddToPlaylistModal(false);
            setShowCreatePlaylistModal(true);
          }}
          primaryColor={primaryColor}
          textColor={textColor}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          message={successMessage}
          primaryColor={primaryColor}
        />
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <ErrorModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          message={errorMessage}
          primaryColor={primaryColor}
        />
      )}
    </>
  );
}

// Success Modal Component
function SuccessModal({
  isOpen,
  onClose,
  message,
  primaryColor = '#6366f1',
}: {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  primaryColor?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all animate-in zoom-in-95 duration-300">
        {/* Success Icon */}
        <div className="flex flex-col items-center px-6 sm:px-8 py-8 sm:py-10">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
            <div
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <svg
                className="w-10 h-10 sm:w-12 sm:h-12"
                style={{ color: primaryColor }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Message */}
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 text-center">
            Success!
          </h3>
          <p className="text-sm sm:text-base text-gray-600 text-center mb-6 px-4">
            {message}
          </p>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-95 touch-manipulation"
            style={{
              backgroundColor: primaryColor,
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// Error Modal Component
function ErrorModal({
  isOpen,
  onClose,
  message,
  primaryColor = '#ef4444',
}: {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  primaryColor?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all animate-in zoom-in-95 duration-300">
        {/* Error Icon */}
        <div className="flex flex-col items-center px-6 sm:px-8 py-8 sm:py-10">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-50 flex items-center justify-center">
              <svg
                className="w-10 h-10 sm:w-12 sm:h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          {/* Message */}
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 text-center">
            Error
          </h3>
          <p className="text-sm sm:text-base text-gray-600 text-center mb-6 px-4">
            {message}
          </p>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-95 touch-manipulation bg-red-600 hover:bg-red-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// ProductUploadModal removed - functionality moved to ProductsTab in channel editor

// Content Viewer Modal Component
function ContentViewerModal({
  content,
  onClose,
  channelName,
  primaryColor = '#6366f1',
  secondaryColor = '#8b5cf6',
  backgroundColor = '#0f0f0f',
  textColor = '#ffffff',
  borderRadius = '0.5rem',
}: {
  content: any;
  onClose: () => void;
  channelName: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
}) {
  // Check if downloads are allowed (downloadLimit null means unlimited, > 0 means limited)
  // For now, we'll allow downloads if fileUrl exists and downloadLimit is not explicitly 0
  const allowDownload = content.fileUrl && (content.downloadLimit === null || content.downloadLimit > 0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDownload = () => {
    if (content.fileUrl && allowDownload) {
      // Create a temporary anchor to trigger download
      const link = document.createElement('a');
      link.href = content.fileUrl;
      link.download = content.title || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderContent = () => {
    const productType = content.type?.toUpperCase() || '';
    const videoSource = content.videoUrl || content.fileUrl;
    const fileUrl = content.fileUrl;

    // Handle VIDEO type - YouTube-like player
    if (productType === 'VIDEO' || productType === 'VIDEOS') {
      return (
        <div className="w-full bg-black rounded-lg overflow-hidden">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio */}
            {videoSource ? (
              <video
                src={videoSource}
                controls
                autoPlay
                className="absolute top-0 left-0 w-full h-full"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <VideoCameraIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Video not available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Handle DOCUMENT type - PDF viewer
    if (productType === 'DOCUMENT' || productType === 'DOCUMENTS') {
      return (
        <div className="w-full h-[600px] sm:h-[700px] bg-gray-100 rounded-lg overflow-hidden">
          {fileUrl ? (
            fileUrl.endsWith('.pdf') ? (
              <iframe
                src={`${fileUrl}#toolbar=1`}
                className="w-full h-full border-0"
                title={content.title}
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
              <div className="text-center">
                <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Document not available</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Handle CODE type - Code viewer
    if (productType === 'CODE') {
      return (
        <div className="w-full h-[600px] sm:h-[700px] bg-gray-900 rounded-lg overflow-hidden">
          {fileUrl ? (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0"
              title={content.title}
              allow="fullscreen"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <CodeBracketIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Code file not available</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Handle IMAGES type
    if (productType === 'IMAGE' || productType === 'IMAGES') {
      return (
        <div className="w-full bg-gray-900 rounded-lg overflow-hidden">
          {fileUrl || content.previewImage ? (
            <img
              src={fileUrl || content.previewImage}
              alt={content.title}
              className="w-full h-auto max-h-[80vh] object-contain mx-auto"
            />
          ) : (
            <div className="w-full aspect-video flex items-center justify-center">
              <p className="text-gray-400">Image not available</p>
            </div>
          )}
        </div>
      );
    }

    // Handle SOFTWARE type - Download button
    if (productType === 'SOFTWARE') {
      return (
        <div className="w-full h-[400px] bg-gray-900 rounded-lg flex items-center justify-center">
          <div className="text-center p-8">
            <CodeBracketIcon className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">{content.title}</h3>
            <p className="text-gray-400 mb-6">{content.description || 'Software package'}</p>
            {fileUrl && (
              <a
                href={fileUrl}
                download
                className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Download Software
              </a>
            )}
          </div>
        </div>
      );
    }

    // Handle COURSE type
    if (productType === 'COURSE') {
      return (
        <div className="w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden">
          {fileUrl ? (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0"
              title={content.title}
              allow="fullscreen"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center p-8">
                <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Course content not available</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Default - Generic file viewer
    return (
      <div className="w-full h-[500px] bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center p-8">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">{content.title}</h3>
          <p className="text-gray-400 mb-6">{content.description || 'Product content'}</p>
          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open File
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="rounded-lg max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: backgroundColor,
          borderRadius: borderRadius,
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 border-b p-3 sm:p-4 flex items-center justify-between z-10 backdrop-blur-sm"
          style={{
            backgroundColor: `${backgroundColor}E6`,
            borderColor: `${textColor}20`,
          }}
        >
          <div className="flex-1 min-w-0 pr-2">
            <h2
              className="text-lg sm:text-xl font-bold truncate"
              style={{ color: textColor }}
            >
              {content.title}
            </h2>
            <p
              className="text-xs sm:text-sm mt-1 truncate"
              style={{ color: `${textColor}80` }}
            >
              {channelName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors flex-shrink-0 hover:opacity-80"
            style={{ backgroundColor: `${textColor}20` }}
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: textColor }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            {renderContent()}
          </div>

          {/* Content Info */}
          <div className="space-y-4">
            {content.description && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Description</h3>
                <p className="text-sm sm:text-base text-gray-300 whitespace-pre-wrap">{content.description}</p>
              </div>
            )}

            {/* Actions */}
            <div
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-4 border-t"
              style={{ borderColor: `${textColor}20` }}
            >
              {content.fileUrl && allowDownload && (
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-all transform hover:scale-105 w-full sm:w-auto"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                    borderRadius: borderRadius,
                  }}
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span>Download</span>
                </button>
              )}
              {content.fileUrl && !allowDownload && (
                <p
                  className="text-xs sm:text-sm"
                  style={{ color: `${textColor}80` }}
                >
                  Downloads are disabled for this content
                </p>
              )}
              <div
                className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm"
                style={{ color: `${textColor}80` }}
              >
                <span>{content.viewCount || 0} views</span>
                <span>•</span>
                <span>{new Date(content.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subscription Modal Component
function SubscriptionModal({
  isOpen,
  onClose,
  onSubscribe,
  subscribing,
  channel,
  primaryColor,
  secondaryColor,
  textColor,
  backgroundColor,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (duration: string) => void;
  subscribing: boolean;
  channel: any;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
}) {
  // Only monthly subscription available
  const duration = '1month';
  // Handle Decimal type from Prisma - it's serialized as string in JSON
  const subscriptionPriceValue = channel.subscriptionPrice;
  let basePrice = 0;
  if (subscriptionPriceValue !== null && subscriptionPriceValue !== undefined) {
    if (typeof subscriptionPriceValue === 'string') {
      basePrice = parseFloat(subscriptionPriceValue) || 0;
    } else if (typeof subscriptionPriceValue === 'object' && 'toNumber' in subscriptionPriceValue) {
      basePrice = subscriptionPriceValue.toNumber();
    } else {
      basePrice = Number(subscriptionPriceValue) || 0;
    }
  }
  const price = basePrice;
  const currency = channel.subscriptionCurrency || 'INR';
  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl"
        style={{ backgroundColor }}
      >
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: `${textColor}20` }}>
          <h2 className="text-2xl font-bold" style={{ color: textColor }}>
            Subscribe to {channel.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: textColor }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${textColor}10`}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-lg font-medium mb-2" style={{ color: textColor }}>
              Monthly Subscription
            </p>
            <p className="text-sm" style={{ color: `${textColor}80` }}>
              Get access to all channel content for 1 month
            </p>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: `${primaryColor}10` }}>
            <div className="flex items-center justify-between">
              <span className="font-medium" style={{ color: textColor }}>
                Monthly Amount:
              </span>
              <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                {currencySymbol}{price.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg font-semibold transition-colors"
              style={{
                backgroundColor: `${textColor}10`,
                color: textColor,
              }}
              disabled={subscribing}
            >
              Cancel
            </button>
            <button
              onClick={() => onSubscribe(duration)}
              className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed bg-gray-900 hover:bg-gray-800"
              disabled={subscribing}
            >
              {subscribing ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subscribers List Modal Component
function SubscribersListModal({
  isOpen,
  onClose,
  subscribers,
  channel,
  primaryColor,
  secondaryColor,
  textColor,
  backgroundColor,
}: {
  isOpen: boolean;
  onClose: () => void;
  subscribers: any[];
  channel: any;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
}) {
  const activeSubscribers = subscribers.filter(
    (sub) => sub.status === 'ACTIVE' && new Date(sub.endDate) > new Date()
  );
  const expiredSubscribers = subscribers.filter(
    (sub) => sub.status === 'EXPIRED' || new Date(sub.endDate) <= new Date()
  );

  if (!isOpen) return null;

  return (
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
              {subscribers.length} total • {activeSubscribers.length} active
            </p>
          </div>
          <button
            onClick={onClose}
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
              {activeSubscribers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: textColor }}>
                    Active Subscribers ({activeSubscribers.length})
                  </h3>
                  <div className="space-y-2">
                    {activeSubscribers.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                        style={{ borderColor: `${textColor}20`, backgroundColor: `${textColor}05` }}
                      >
                        <div className="flex items-center gap-3">
                          {sub.user?.image ? (
                            <img
                              src={sub.user.image}
                              alt={sub.user.name || 'User'}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                              <span className="text-white font-semibold">
                                {(sub.user?.name || sub.user?.email || 'U')[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium" style={{ color: textColor }}>
                              {sub.user?.name || sub.user?.email || 'Anonymous'}
                            </div>
                            <div className="text-sm opacity-70" style={{ color: textColor }}>
                              Expires: {new Date(sub.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold" style={{ color: primaryColor }}>
                            {sub.currency === 'USD' ? '$' : sub.currency === 'EUR' ? '€' : '₹'}{Number(sub.amount).toFixed(2)}
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                            Active
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expiredSubscribers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: textColor }}>
                    Expired Subscriptions ({expiredSubscribers.length})
                  </h3>
                  <div className="space-y-2">
                    {expiredSubscribers.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-4 rounded-lg border opacity-60"
                        style={{ borderColor: `${textColor}20`, backgroundColor: `${textColor}05` }}
                      >
                        <div className="flex items-center gap-3">
                          {sub.user?.image ? (
                            <img
                              src={sub.user.image}
                              alt={sub.user.name || 'User'}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${textColor}40` }}>
                              <span className="text-white font-semibold">
                                {(sub.user?.name || sub.user?.email || 'U')[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium" style={{ color: textColor }}>
                              {sub.user?.name || sub.user?.email || 'Anonymous'}
                            </div>
                            <div className="text-sm opacity-70" style={{ color: textColor }}>
                              Expired: {new Date(sub.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold" style={{ color: textColor }}>
                            {sub.currency === 'USD' ? '$' : sub.currency === 'EUR' ? '€' : '₹'}{Number(sub.amount).toFixed(2)}
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${textColor}20`, color: textColor }}>
                            Expired
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// My Subscriptions Modal Component (Channel Subscriptions)
function MySubscriptionsModal({
  isOpen,
  onClose,
  subscriptions,
  primaryColor,
  secondaryColor,
  textColor,
  backgroundColor,
}: {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: any[];
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
}) {
  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.status === 'ACTIVE' && new Date(sub.endDate) > new Date()
  );
  const expiredSubscriptions = subscriptions.filter(
    (sub) => sub.status === 'EXPIRED' || new Date(sub.endDate) <= new Date()
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ backgroundColor }}
      >
        <div className="sticky top-0 flex items-center justify-between p-6 border-b" style={{ borderColor: `${textColor}20`, backgroundColor }}>
          <h2 className="text-2xl font-bold" style={{ color: textColor }}>
            My Channel Subscriptions
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: textColor }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${textColor}10`}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Active Subscriptions */}
          {activeSubscriptions.length > 0 ? (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4" style={{ color: textColor }}>
                Active Subscriptions ({activeSubscriptions.length})
              </h3>
              <div className="space-y-3">
                {activeSubscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: `${primaryColor}10`,
                      borderColor: `${textColor}20`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {sub.channel?.profileImage && (
                          <img
                            src={sub.channel.profileImage}
                            alt={sub.channel.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-semibold" style={{ color: textColor }}>
                            {sub.channel?.name || 'Unknown Channel'}
                          </div>
                          <div className="text-sm" style={{ color: `${textColor}80` }}>
                            Expires: {new Date(sub.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold" style={{ color: textColor }}>
                          {sub.currency === 'USD' ? '$' : sub.currency === 'EUR' ? '€' : '₹'}{Number(sub.amount).toFixed(2)}
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${primaryColor}30`, color: primaryColor }}>
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 mb-8">
              <CreditCardIcon className="w-16 h-16 mx-auto mb-4" style={{ color: `${textColor}50` }} />
              <p style={{ color: `${textColor}80` }}>No active channel subscriptions</p>
            </div>
          )}

          {/* Expired Subscriptions */}
          {expiredSubscriptions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: textColor }}>
                Expired Subscriptions ({expiredSubscriptions.length})
              </h3>
              <div className="space-y-3">
                {expiredSubscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-lg border opacity-60"
                    style={{
                      backgroundColor: `${textColor}05`,
                      borderColor: `${textColor}20`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {sub.channel?.profileImage && (
                          <img
                            src={sub.channel.profileImage}
                            alt={sub.channel.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-semibold" style={{ color: textColor }}>
                            {sub.channel?.name || 'Unknown Channel'}
                          </div>
                          <div className="text-sm" style={{ color: `${textColor}80` }}>
                            Expired: {new Date(sub.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold" style={{ color: textColor }}>
                          {sub.currency === 'USD' ? '$' : sub.currency === 'EUR' ? '€' : '₹'}{Number(sub.amount).toFixed(2)}
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${textColor}20`, color: textColor }}>
                          Expired
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 px-6 py-4 border-t flex justify-end" style={{ borderColor: `${textColor}20`, backgroundColor }}>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-semibold transition-colors"
            style={{
              backgroundColor: primaryColor,
              color: '#ffffff',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Paid Subscriptions Modal Component (Platform Subscriptions)
function PaidSubscriptionsModal({
  isOpen,
  onClose,
  subscriptions,
  primaryColor,
  secondaryColor,
  textColor,
  backgroundColor,
}: {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: any[];
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
}) {
  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.status === 'ACTIVE' && new Date(sub.endDate) > new Date()
  );
  const expiredSubscriptions = subscriptions.filter(
    (sub) => sub.status === 'EXPIRED' || new Date(sub.endDate) <= new Date()
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ backgroundColor }}
      >
        <div className="sticky top-0 flex items-center justify-between p-6 border-b" style={{ borderColor: `${textColor}20`, backgroundColor }}>
          <h2 className="text-2xl font-bold" style={{ color: textColor }}>
            Paid Subscriptions
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: textColor }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${textColor}10`}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Active Subscriptions */}
          {activeSubscriptions.length > 0 ? (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4" style={{ color: textColor }}>
                Active Plans ({activeSubscriptions.length})
              </h3>
              <div className="space-y-3">
                {activeSubscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: `${primaryColor}10`,
                      borderColor: `${textColor}20`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-lg" style={{ color: textColor }}>
                          {sub.plan?.name || 'Premium Plan'}
                        </div>
                        <div className="text-sm mt-1" style={{ color: `${textColor}80` }}>
                          Expires: {new Date(sub.endDate).toLocaleDateString()}
                        </div>
                        {sub.plan?.description && (
                          <div className="text-sm mt-2" style={{ color: `${textColor}70` }}>
                            {sub.plan.description}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: textColor }}>
                          {sub.currency === 'USD' ? '$' : sub.currency === 'EUR' ? '€' : '₹'}{Number(sub.amount).toFixed(2)}
                        </div>
                        <div className="text-xs mt-1" style={{ color: `${textColor}70` }}>
                          {sub.plan?.billingCycle || 'Monthly'}
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full mt-2 inline-block" style={{ backgroundColor: `${primaryColor}30`, color: primaryColor }}>
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 mb-8">
              <CreditCardIcon className="w-16 h-16 mx-auto mb-4" style={{ color: `${textColor}50` }} />
              <p style={{ color: `${textColor}80` }}>No active paid subscriptions</p>
            </div>
          )}

          {/* Expired Subscriptions */}
          {expiredSubscriptions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: textColor }}>
                Subscription History ({expiredSubscriptions.length})
              </h3>
              <div className="space-y-3">
                {expiredSubscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-lg border opacity-60"
                    style={{
                      backgroundColor: `${textColor}05`,
                      borderColor: `${textColor}20`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold" style={{ color: textColor }}>
                          {sub.plan?.name || 'Premium Plan'}
                        </div>
                        <div className="text-sm mt-1" style={{ color: `${textColor}80` }}>
                          Expired: {new Date(sub.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold" style={{ color: textColor }}>
                          {sub.currency === 'USD' ? '$' : sub.currency === 'EUR' ? '€' : '₹'}{Number(sub.amount).toFixed(2)}
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full mt-2 inline-block" style={{ backgroundColor: `${textColor}20`, color: textColor }}>
                          Expired
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 px-6 py-4 border-t flex justify-end" style={{ borderColor: `${textColor}20`, backgroundColor }}>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-semibold transition-colors"
            style={{
              backgroundColor: primaryColor,
              color: '#ffffff',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

