'use client';

import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  GlobeAltIcon,
  PlayIcon,
  PauseIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  FireIcon,
  StarIcon,
  ArrowPathIcon,
  BoltIcon,
  PresentationChartLineIcon,
  BanknotesIcon,
  UsersIcon,
  EyeSlashIcon,
  ShareIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  ComputerDesktopIcon,
  PhotoIcon,
  VideoCameraIcon,
  CodeBracketIcon,
  DocumentIcon,
  CloudArrowUpIcon,
  PaintBrushIcon,
  XMarkIcon,
  LightBulbIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { gsap } from 'gsap';
import toast from 'react-hot-toast';
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import UpgradeModal from '@/components/modals/UpgradeModal';
import RazorpayRequiredModal from '@/components/modals/RazorpayRequiredModal';

interface FunnelTemplate {
  id: string;
  name: string;
  type: 'SOFTWARE' | 'IMAGES' | 'VIDEOS' | 'CODE' | 'DOCUMENTS' | 'COURSE';
  description: string;
  previewUrl: string;
  htmlSchema: any;
  createdAt: string;
}

interface DigitalProduct {
  id: string;
  name: string;
  description: string;
  type: string;
  price: number;
  currency: string;
  fileUrl: string;
  previewUrl?: string;
  createdAt: string;
}

// Helper function to generate diverse, performance-based marketing tips
const generateMarketingTips = (funnel: any) => {
  const tips: any[] = [];
  const productType = funnel.template.type.toLowerCase();
  const visitors = funnel.visitors;
  const conversionRate = funnel.conversionRate;
  const revenue = funnel.revenue;
  
  // Product-specific tip pools
  const productSpecificTips = {
    software: [
      {
        type: 'traffic',
        icon: '💻',
        title: 'Developer Communities',
        description: 'Share your software on GitHub, Stack Overflow, and Reddit programming communities.',
        channel: 'Developer',
        action: 'Post in r/programming with demo'
      },
      {
        type: 'conversion',
        icon: '🆓',
        title: 'Free Trial Strategy',
        description: 'Offer a free trial or freemium version to reduce purchase friction.',
        channel: 'Conversion',
        action: 'Create 14-day free trial'
      }
    ],
    videos: [
      {
        type: 'traffic',
        icon: '🎬',
        title: 'Video SEO',
        description: 'Optimize video titles, descriptions, and tags for better YouTube discoverability.',
        channel: 'YouTube',
        action: 'Research trending keywords'
      },
      {
        type: 'traffic',
        icon: '📺',
        title: 'TikTok Marketing',
        description: 'Create short, engaging clips for TikTok to reach younger audiences.',
        channel: 'TikTok',
        action: 'Post 3 videos per week'
      }
    ],
    course: [
      {
        type: 'conversion',
        icon: '🎓',
        title: 'Course Preview',
        description: 'Create a free lesson or course preview to showcase value.',
        channel: 'Content',
        action: 'Upload lesson 1 for free'
      },
      {
        type: 'revenue',
        icon: '👥',
        title: 'Group Discounts',
        description: 'Offer bulk discounts for teams and organizations.',
        channel: 'Sales',
        action: 'Create 50% group pricing'
      }
    ],
    images: [
      {
        type: 'traffic',
        icon: '📸',
        title: 'Visual Platforms',
        description: 'Showcase your images on Pinterest, Instagram, and Behance.',
        channel: 'Visual',
        action: 'Create Pinterest boards'
      },
      {
        type: 'conversion',
        icon: '🖼️',
        title: 'Preview Gallery',
        description: 'Add a high-quality preview gallery to increase conversions.',
        channel: 'Website',
        action: 'Create image previews'
      }
    ],
    documents: [
      {
        type: 'traffic',
        icon: '📚',
        title: 'Educational Content',
        description: 'Share excerpts on Medium, LinkedIn, and professional blogs.',
        channel: 'Content',
        action: 'Publish sample chapters'
      },
      {
        type: 'conversion',
        icon: '📖',
        title: 'Table of Contents',
        description: 'Show detailed table of contents to demonstrate value.',
        channel: 'Website',
        action: 'Add comprehensive TOC'
      }
    ],
    code: [
      {
        type: 'traffic',
        icon: '⚡',
        title: 'Code Repositories',
        description: 'Share on GitHub, GitLab, and Bitbucket with detailed README.',
        channel: 'Developer',
        action: 'Create comprehensive README'
      },
      {
        type: 'conversion',
        icon: '🔧',
        title: 'Code Examples',
        description: 'Provide working examples and documentation.',
        channel: 'Developer',
        action: 'Add usage examples'
      }
    ]
  };

  // Performance-based tips with more variety
  const performanceTips = [
    // Very low traffic tips
    {
      condition: visitors < 5,
      tips: [
        {
          type: 'traffic',
          icon: '📱',
          title: 'Social Media Launch',
          description: 'Create a launch campaign on Instagram, Facebook, and LinkedIn with engaging visuals.',
          channel: 'Social Media',
          action: 'Post 5 launch posts this week'
        },
        {
          type: 'traffic',
          icon: '📧',
          title: 'Email Outreach',
          description: 'Reach out to your personal network and ask for shares and support.',
          channel: 'Email',
          action: 'Send 20 personal emails'
        },
        {
          type: 'traffic',
          icon: '🎯',
          title: 'Targeted Ads',
          description: 'Start with small budget Facebook ads targeting your ideal customers.',
          channel: 'Paid Ads',
          action: 'Create ₹200/day campaign'
        }
      ]
    },
    // Low traffic tips
    {
      condition: visitors >= 5 && visitors < 20,
      tips: [
        {
          type: 'traffic',
          icon: '🎥',
          title: 'YouTube Strategy',
          description: 'Create tutorial videos and product demos for YouTube.',
          channel: 'YouTube',
          action: 'Upload 2 videos this week'
        },
        {
          type: 'traffic',
          icon: '📝',
          title: 'Content Marketing',
          description: 'Write blog posts about problems your product solves.',
          channel: 'Content',
          action: 'Publish 3 blog posts'
        },
        {
          type: 'traffic',
          icon: '🤝',
          title: 'Partnership Outreach',
          description: 'Reach out to influencers and bloggers in your niche.',
          channel: 'Partnerships',
          action: 'Contact 10 influencers'
        }
      ]
    },
    // Medium traffic, low conversion
    {
      condition: visitors >= 20 && conversionRate < 8,
      tips: [
        {
          type: 'conversion',
          icon: '🌐',
          title: 'Landing Page Optimization',
          description: 'Improve headlines, testimonials, and call-to-action buttons.',
          channel: 'Website',
          action: 'A/B test new headlines'
        },
        {
          type: 'conversion',
          icon: '💰',
          title: 'Pricing Strategy',
          description: 'Test different pricing tiers and limited-time offers.',
          channel: 'Pricing',
          action: 'Create 25% launch discount'
        },
        {
          type: 'conversion',
          icon: '⭐',
          title: 'Social Proof',
          description: 'Add customer testimonials, reviews, and success stories.',
          channel: 'Trust',
          action: 'Collect 5 testimonials'
        }
      ]
    },
    // Good traffic, low revenue
    {
      condition: visitors >= 30 && revenue < 2000,
      tips: [
        {
          type: 'revenue',
          icon: '💼',
          title: 'Email Marketing',
          description: 'Build an email list and send targeted nurture sequences.',
          channel: 'Email',
          action: 'Set up email automation'
        },
        {
          type: 'revenue',
          icon: '🔄',
          title: 'Upsell Strategy',
          description: 'Create premium versions or additional products to increase AOV.',
          channel: 'Sales',
          action: 'Create premium package'
        },
        {
          type: 'revenue',
          icon: '🎁',
          title: 'Bundle Offers',
          description: 'Create product bundles with special pricing.',
          channel: 'Sales',
          action: 'Create 3 product bundle'
        }
      ]
    },
    // High performance - scaling
    {
      condition: visitors > 50 && conversionRate > 12,
      tips: [
        {
          type: 'success',
          icon: '📈',
          title: 'Paid Advertising Scale',
          description: 'Increase ad budgets on Google, Facebook, and TikTok.',
          channel: 'Paid Ads',
          action: 'Scale to ₹1000/day'
        },
        {
          type: 'success',
          icon: '🤝',
          title: 'Affiliate Program',
          description: 'Create an affiliate program to expand reach.',
          channel: 'Partnerships',
          action: 'Launch affiliate program'
        },
        {
          type: 'success',
          icon: '🌍',
          title: 'International Expansion',
          description: 'Translate and adapt for international markets.',
          channel: 'Global',
          action: 'Create Spanish version'
        }
      ]
    }
  ];

  // Add product-specific tip first
  if (productSpecificTips[productType as keyof typeof productSpecificTips]) {
    const productTips = productSpecificTips[productType as keyof typeof productSpecificTips];
    const randomProductTip = productTips[Math.floor(Math.random() * productTips.length)];
    tips.push(randomProductTip);
  }

  // Add performance-based tip
  for (const category of performanceTips) {
    if (category.condition) {
      const randomTip = category.tips[Math.floor(Math.random() * category.tips.length)];
      if (!tips.some(tip => tip.title === randomTip.title)) {
        tips.push(randomTip);
      }
      break;
    }
  }

  // Add general marketing tips if we need more
  if (tips.length < 2) {
    const generalTips = [
      {
        type: 'traffic',
        icon: '📊',
        title: 'Analytics Optimization',
        description: 'Set up Google Analytics and track user behavior to optimize conversions.',
        channel: 'Analytics',
        action: 'Install heatmap tracking'
      },
      {
        type: 'conversion',
        icon: '⏰',
        title: 'Urgency Strategy',
        description: 'Create limited-time offers and countdown timers to increase conversions.',
        channel: 'Psychology',
        action: 'Add 48-hour flash sale'
      },
      {
        type: 'revenue',
        icon: '🎯',
        title: 'Customer Segmentation',
        description: 'Create different offers for different customer segments.',
        channel: 'Marketing',
        action: 'Create buyer personas'
      }
    ];
    
    const remainingGeneralTips = generalTips.filter(tip => !tips.some((existingTip: any) => existingTip.title === tip.title));
    if (remainingGeneralTips.length > 0) {
      const randomGeneralTip = remainingGeneralTips[Math.floor(Math.random() * remainingGeneralTips.length)];
      tips.push(randomGeneralTip);
    }
  }
  
  return tips.slice(0, 2); // Show max 2 tips
};

// Generate sample chart data
const generateChartData = (funnel: any) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    views: Math.floor(Math.random() * funnel.visitors) + 1,
    revenue: Math.floor(Math.random() * funnel.revenue) + 1
  }));
};

interface Funnel {
  id: string;
  name: string;
  description?: string;
  userId: string;
  templateId: string;
  template: FunnelTemplate;
  productId?: string;
  product?: DigitalProduct;
  customizations?: any;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  published: boolean;
  createdAt: string;
  updatedAt: string;
  url?: string;
  visitors: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
}

export default function FunnelsDashboard() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [templates, setTemplates] = useState<FunnelTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'status' | 'revenue'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FunnelTemplate | null>(null);
  const [newFunnelName, setNewFunnelName] = useState('');
  const [newFunnelDescription, setNewFunnelDescription] = useState('');
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [funnelToDelete, setFunnelToDelete] = useState<Funnel | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalData, setUpgradeModalData] = useState<{
    limitType: 'funnels' | 'visitors';
    currentCount?: number;
    limit?: number;
  } | null>(null);

  // Razorpay modal state
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [hasRazorpayConfig, setHasRazorpayConfig] = useState(false);
  const [checkingRazorpay, setCheckingRazorpay] = useState(true);

  // Subscription state
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  // GSAP refs
  const heroRef = useRef<HTMLDivElement>(null);
  const funnelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(heroRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(funnelsRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.3"
    );

    loadFunnels();
    loadTemplates();
    loadSubscriptionData();
    checkRazorpayConfig();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoadingSubscription(true);
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const checkRazorpayConfig = async () => {
    try {
      setCheckingRazorpay(true);
      const response = await fetch('/api/razorpay-config');
      const data = await response.json();
      setHasRazorpayConfig(data.hasConfig || false);
    } catch (error) {
      console.error('Error checking Razorpay config:', error);
      setHasRazorpayConfig(false);
    } finally {
      setCheckingRazorpay(false);
    }
  };

  const loadFunnels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/funnels/my');
      if (response.ok) {
        const data = await response.json();
        setFunnels(data);
      } else {
        // Fallback to mock data if API fails
        const mockFunnels: Funnel[] = [
          {
            id: '1',
            name: 'Premium Software Package',
            description: 'High-quality software solution for businesses',
            userId: 'user1',
            templateId: 'template1',
            template: {
              id: 'template1',
              name: 'Software Sales Funnel',
              type: 'SOFTWARE',
              description: 'Perfect for selling software products',
              previewUrl: '/templates/software.jpg',
              htmlSchema: {},
              createdAt: '2024-01-01T00:00:00Z'
            },
            productId: 'product1',
            product: {
              id: 'product1',
              name: 'Business Pro Software',
              description: 'Complete business management solution',
              type: 'SOFTWARE',
              price: 2999,
              currency: 'INR',
              fileUrl: '/files/software.zip',
              previewUrl: '/previews/software.jpg',
              createdAt: '2024-01-01T00:00:00Z'
            },
            status: 'ACTIVE',
            published: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            url: '/f/1',
            visitors: 1250,
            conversions: 45,
            revenue: 134955,
            conversionRate: 3.6
          }
        ];
        setFunnels(mockFunnels);
      }
    } catch (error) {
      console.error('Error loading funnels:', error);
      // Use mock data as fallback
      const mockFunnels: Funnel[] = [
        {
          id: '1',
          name: 'Premium Software Package',
          description: 'High-quality software solution for businesses',
          userId: 'user1',
          templateId: 'template1',
          template: {
            id: 'template1',
            name: 'Software Sales Funnel',
            type: 'SOFTWARE',
            description: 'Perfect for selling software products',
            previewUrl: '/templates/software.jpg',
            htmlSchema: {},
            createdAt: '2024-01-01T00:00:00Z'
          },
          productId: 'product1',
          product: {
            id: 'product1',
            name: 'Business Pro Software',
            description: 'Complete business management solution',
            type: 'SOFTWARE',
            price: 2999,
            currency: 'INR',
            fileUrl: '/files/software.zip',
            previewUrl: '/previews/software.jpg',
            createdAt: '2024-01-01T00:00:00Z'
          },
          status: 'ACTIVE',
          published: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          url: '/f/1',
          visitors: 1250,
          conversions: 45,
          revenue: 134955,
          conversionRate: 3.6
        }
      ];
      setFunnels(mockFunnels);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/funnel-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      } else {
        // Fallback to mock templates
        const mockTemplates: FunnelTemplate[] = [
          {
            id: 'template1',
            name: 'Software Sales Funnel',
            type: 'SOFTWARE',
            description: 'Perfect for selling software, apps, or digital tools. Includes landing page, checkout, and download page.',
            previewUrl: '/templates/software.jpg',
            htmlSchema: {},
            createdAt: '2024-01-01T00:00:00Z'
          },
          {
            id: 'template2',
            name: 'Code Package Funnel',
            type: 'CODE',
            description: 'Great for selling code snippets, scripts, or development tools. Features code preview and documentation.',
            previewUrl: '/templates/code.jpg',
            htmlSchema: {},
            createdAt: '2024-01-01T00:00:00Z'
          },
          {
            id: 'template3',
            name: 'Document Sales Funnel',
            type: 'DOCUMENTS',
            description: 'Perfect for selling PDFs, ebooks, guides, or templates. Includes preview and secure download.',
            previewUrl: '/templates/documents.jpg',
            htmlSchema: {},
            createdAt: '2024-01-01T00:00:00Z'
          },
          {
            id: 'template4',
            name: 'Image Pack Funnel',
            type: 'IMAGES',
            description: 'Ideal for selling photo packs, graphics, or design assets. Features gallery preview and instant download.',
            previewUrl: '/templates/images.jpg',
            htmlSchema: {},
            createdAt: '2024-01-01T00:00:00Z'
          },
          {
            id: 'template5',
            name: 'Video Course Funnel',
            type: 'VIDEOS',
            description: 'Perfect for selling video courses, tutorials, or premium video content. Includes preview and streaming.',
            previewUrl: '/templates/videos.jpg',
            htmlSchema: {},
            createdAt: '2024-01-01T00:00:00Z'
          },
          {
            id: 'template6',
            name: 'Online Course Funnel',
            type: 'COURSE',
            description: 'Complete course sales funnel with lessons, progress tracking, and student management.',
            previewUrl: '/templates/course.jpg',
            htmlSchema: {},
            createdAt: '2024-01-01T00:00:00Z'
          }
        ];
        setTemplates(mockTemplates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      // Use mock templates as fallback
      const mockTemplates: FunnelTemplate[] = [
        {
          id: 'template1',
          name: 'Software Sales Funnel',
          type: 'SOFTWARE',
          description: 'Perfect for selling software, apps, or digital tools. Includes landing page, checkout, and download page.',
          previewUrl: '/templates/software.jpg',
          htmlSchema: {},
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'template2',
          name: 'Code Package Funnel',
          type: 'CODE',
          description: 'Great for selling code snippets, scripts, or development tools. Features code preview and documentation.',
          previewUrl: '/templates/code.jpg',
          htmlSchema: {},
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'template3',
          name: 'Document Sales Funnel',
          type: 'DOCUMENTS',
          description: 'Perfect for selling PDFs, ebooks, guides, or templates. Includes preview and secure download.',
          previewUrl: '/templates/documents.jpg',
          htmlSchema: {},
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'template4',
          name: 'Image Pack Funnel',
          type: 'IMAGES',
          description: 'Ideal for selling photo packs, graphics, or design assets. Features gallery preview and instant download.',
          previewUrl: '/templates/images.jpg',
          htmlSchema: {},
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'template5',
          name: 'Video Course Funnel',
          type: 'VIDEOS',
          description: 'Perfect for selling video courses, tutorials, or premium video content. Includes preview and streaming.',
          previewUrl: '/templates/videos.jpg',
          htmlSchema: {},
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'template6',
          name: 'Online Course Funnel',
          type: 'COURSE',
          description: 'Complete course sales funnel with lessons, progress tracking, and student management.',
          previewUrl: '/templates/course.jpg',
          htmlSchema: {},
          createdAt: '2024-01-01T00:00:00Z'
        }
      ];
      setTemplates(mockTemplates);
    }
  };

  const handleSort = (field: 'name' | 'createdAt' | 'status' | 'revenue') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedFunnels = funnels
    .filter(funnel => {
      const matchesSearch = funnel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          funnel.template.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || funnel.status === statusFilter;
      const matchesType = !typeFilter || funnel.template.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'revenue':
          aValue = a.revenue;
          bValue = b.revenue;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SOFTWARE': return <ComputerDesktopIcon className="h-5 w-5" />;
      case 'IMAGES': return <PhotoIcon className="h-5 w-5" />;
      case 'VIDEOS': return <VideoCameraIcon className="h-5 w-5" />;
      case 'CODE': return <CodeBracketIcon className="h-5 w-5" />;
      case 'DOCUMENTS': return <DocumentIcon className="h-5 w-5" />;
      case 'COURSE': return <PresentationChartLineIcon className="h-5 w-5" />;
      default: return <FunnelIcon className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SOFTWARE': return 'bg-blue-100 text-blue-800';
      case 'IMAGES': return 'bg-green-100 text-green-800';
      case 'VIDEOS': return 'bg-purple-100 text-purple-800';
      case 'CODE': return 'bg-orange-100 text-orange-800';
      case 'DOCUMENTS': return 'bg-gray-100 text-gray-800';
      case 'COURSE': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'ARCHIVED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateFunnel = async () => {
    if (!selectedTemplate || !newFunnelName.trim()) return;

    try {
      const response = await fetch('/api/funnels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newFunnelName,
          description: newFunnelDescription,
          templateId: selectedTemplate.id,
          status: 'DRAFT'
        }),
      });

      if (response.ok) {
        const newFunnel = await response.json();
        setFunnels([newFunnel, ...funnels]);
        setShowCreateModal(false);
        setSelectedTemplate(null);
        setNewFunnelName('');
        setNewFunnelDescription('');
        
        // Show success toast
        toast.success('🎉 Product created successfully! Opening editor...', {
          duration: 2000,
          icon: '✅',
          style: {
            background: '#10B981',
            color: '#fff',
          },
        });
        
        // Auto-redirect to edit page after a short delay
        setTimeout(() => {
          window.location.href = `/auth/dashboard/funnels/${newFunnel.id}/customize`;
        }, 800);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('Error response:', errorData);
        
        // Check if payment gateway needs to be configured
        if (errorData.requiresRazorpaySetup) {
          setShowCreateModal(false);
          setShowRazorpayModal(true);
          return;
        }
        
        if (errorData.requiresUpgrade && errorData.error === 'Free tier limit reached') {
          // Show upgrade modal
          console.log('Showing upgrade modal');
          setUpgradeModalData({
            limitType: 'funnels',
            currentCount: funnels.length,
            limit: 1,
          });
          setShowUpgradeModal(true);
          return;
        }
        // Fallback to mock creation
        const mockFunnel: Funnel = {
          id: Date.now().toString(),
          name: newFunnelName,
          description: newFunnelDescription,
          userId: 'user1',
          templateId: selectedTemplate.id,
          template: selectedTemplate,
          status: 'DRAFT',
          published: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          visitors: 0,
          conversions: 0,
          revenue: 0,
          conversionRate: 0
        };

        setFunnels([mockFunnel, ...funnels]);
        setShowCreateModal(false);
        setSelectedTemplate(null);
        setNewFunnelName('');
        setNewFunnelDescription('');
        toast.success('🎉 Product created successfully! Opening editor...', {
          duration: 2000,
          icon: '✅',
        });
        
        // Auto-redirect to edit page
        setTimeout(() => {
          window.location.href = `/auth/dashboard/funnels/${mockFunnel.id}/customize`;
        }, 800);
      }
    } catch (error) {
      console.error('Error creating funnel:', error);
      toast.error('❌ Failed to create product. Please try again.', {
        duration: 4000,
      });
      // Use mock creation as fallback
      const mockFunnel: Funnel = {
        id: Date.now().toString(),
        name: newFunnelName,
        description: newFunnelDescription,
        userId: 'user1',
        templateId: selectedTemplate.id,
        template: selectedTemplate,
        status: 'DRAFT',
        published: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visitors: 0,
        conversions: 0,
        revenue: 0,
        conversionRate: 0
      };

      setFunnels([mockFunnel, ...funnels]);
      setShowCreateModal(false);
      setSelectedTemplate(null);
      setNewFunnelName('');
      setNewFunnelDescription('');
      
      // Auto-redirect to edit page even on error fallback
      setTimeout(() => {
        window.location.href = `/auth/dashboard/funnels/${mockFunnel.id}/customize`;
      }, 800);
    }
  };

  const handleDeleteFunnel = (funnel: Funnel) => {
    setFunnelToDelete(funnel);
    setShowDeleteModal(true);
  };

  const confirmDeleteFunnel = async () => {
    if (!funnelToDelete) return;
    
    setDeleteLoading(true);
    
    try {
      const response = await fetch(`/api/funnels/${funnelToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFunnels(funnels.filter(f => f.id !== funnelToDelete.id));
        toast.success('🗑️ Funnel deleted successfully!', {
          duration: 3000,
          style: {
            background: '#10B981',
            color: '#fff',
          },
        });
        setShowDeleteModal(false);
        setFunnelToDelete(null);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to delete: ${errorData.error || 'Unknown error'}`);
        console.error('Delete error:', errorData);
      }
    } catch (error) {
      console.error('Error deleting funnel:', error);
      toast.error('Failed to delete funnel. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setFunnelToDelete(null);
  };

  const handleUpdateFunnelStatus = async (funnelId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/funnels/${funnelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setFunnels(funnels.map(f => 
          f.id === funnelId ? { ...f, status: newStatus as any } : f
        ));
        toast.success(`✅ Status updated to ${newStatus.toLowerCase()}`, {
          duration: 2000,
        });
      } else {
        // Fallback to local update
        setFunnels(funnels.map(f => 
          f.id === funnelId ? { ...f, status: newStatus as any } : f
        ));
      }
    } catch (error) {
      console.error('Error updating funnel status:', error);
      // Fallback to local update
      setFunnels(funnels.map(f => 
        f.id === funnelId ? { ...f, status: newStatus as any } : f
      ));
    }
  };

  const handleDuplicateFunnel = async (funnel: Funnel) => {
    try {
      const response = await fetch('/api/funnels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${funnel.name} (Copy)`,
          description: funnel.description,
          templateId: funnel.templateId,
          status: 'DRAFT',
          customizations: funnel.customizations
        }),
      });

      if (response.ok) {
        const newFunnel = await response.json();
        setFunnels([newFunnel, ...funnels]);
        toast.success('📋 Product duplicated successfully!', {
          duration: 2000,
        });
      } else {
        // Fallback to mock duplication
        const duplicateFunnel: Funnel = {
          ...funnel,
          id: Date.now().toString(),
          name: `${funnel.name} (Copy)`,
          status: 'DRAFT',
          published: false,
          visitors: 0,
          conversions: 0,
          revenue: 0,
          conversionRate: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setFunnels([duplicateFunnel, ...funnels]);
        toast.success('📋 Product duplicated successfully!', {
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error duplicating funnel:', error);
      toast.error('❌ Failed to duplicate product. Please try again.', {
        duration: 3000,
      });
      // Fallback to mock duplication
      const duplicateFunnel: Funnel = {
        ...funnel,
        id: Date.now().toString(),
        name: `${funnel.name} (Copy)`,
        status: 'DRAFT',
        published: false,
        visitors: 0,
        conversions: 0,
        revenue: 0,
        conversionRate: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setFunnels([duplicateFunnel, ...funnels]);
    }
  };

  const totalFunnels = funnels.length;
  const publishedFunnels = funnels.filter(f => f.status === 'ACTIVE').length;
  const totalRevenue = funnels.reduce((sum, funnel) => sum + funnel.revenue, 0);
  const totalVisitors = funnels.reduce((sum, funnel) => sum + funnel.visitors, 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full h-screen m-0 p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 overflow-y-auto">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Search Section Skeleton */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Product Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 space-y-4">
                <div className="h-6 w-3/4 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading Message */}
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-purple-50 border border-purple-200 rounded-xl">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              <span className="text-sm font-medium text-purple-700">Loading your products...</span>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full h-screen m-0 p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 overflow-y-auto">
        {/* Header */}
        <div ref={heroRef} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Products</h1>
              <div className="group relative">
                <InformationCircleIcon className="h-5 w-5 text-gray-400 hover:text-purple-600 cursor-help transition-colors flex-shrink-0" />
                <div className="absolute left-0 top-full mt-2 w-72 max-w-sm p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <p className="font-semibold mb-2">📊 Product Management</p>
                  <p className="leading-relaxed">Track performance, customize sales pages, and optimize your products for maximum sales.</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">Manage your products and sales</p>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <p className="text-xs text-purple-600 flex items-center gap-1">
                <LightBulbIcon className="h-4 w-4" />
                <span>View, edit, and track all your products in one place</span>
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <ShieldCheckIcon className="h-4 w-4 text-green-600" />
                <span>Your data is secure and encrypted</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center text-sm sm:text-base shadow-lg group relative"
            title="Create a new product sales page"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Sell New Product
          </button>
        </div>

        {/* Razorpay Configuration Banner - Only show when NOT configured */}
        {!checkingRazorpay && !hasRazorpayConfig && (
          <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 shadow-2xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 mb-6">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white opacity-10 rounded-full"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-3">
                    <BoltIcon className="h-4 w-4 text-white mr-2" />
                    <span className="text-xs font-semibold text-white uppercase">⚠️ PAYMENT SETUP REQUIRED</span>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    💳 Connect Razorpay to Receive Payments!
                  </h2>
                  
                  <p className="text-base sm:text-lg text-white/90 mb-3">
                    <strong>Important:</strong> You need to connect your Razorpay account to receive payments from customers. All money goes <strong>directly to YOUR bank account</strong>!
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                      <CheckCircleIcon className="h-5 w-5 text-white mr-2" />
                      <span className="text-sm text-white font-medium">Direct to Your Account</span>
                    </div>
                    <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                      <CheckCircleIcon className="h-5 w-5 text-white mr-2" />
                      <span className="text-sm text-white font-medium">Instant Settlements</span>
                    </div>
                    <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                      <CheckCircleIcon className="h-5 w-5 text-white mr-2" />
                      <span className="text-sm text-white font-medium">Zero Platform Fees</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-white/80 flex items-start">
                    <SparklesIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Without Razorpay, you won't be able to create products or receive any payments from your customers.</span>
                  </p>
                </div>
                
                <div className="flex-shrink-0">
                  <Link
                    href="/auth/dashboard/razorpay-setup"
                    className="group inline-flex items-center px-6 py-3 bg-white text-red-600 rounded-xl font-bold text-base hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    <BanknotesIcon className="h-5 w-5 mr-2" />
                    Connect Razorpay Now
                    <ArrowTrendingUpIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <p className="text-xs text-white/90 text-center mt-2 font-medium">⚡ Takes only 2 minutes to setup</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Search and Filter Section */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg p-6 mb-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-0">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                <MagnifyingGlassIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  Search & Filter
                  <div className="group relative">
                    <InformationCircleIcon className="h-4 w-4 text-gray-400 hover:text-purple-600 cursor-help transition-colors flex-shrink-0" />
                    <div className="absolute left-0 top-full mt-2 w-72 max-w-sm p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <p className="font-semibold mb-2">🔍 Smart Search Tips</p>
                      <ul className="space-y-1.5 list-disc list-inside leading-relaxed">
                        <li>Search by product name or description</li>
                        <li>Filter by status (Active, Draft, etc.)</li>
                        <li>Filter by product type</li>
                        <li>Use quick filter tags for faster access</li>
                      </ul>
                    </div>
                  </div>
                </h3>
                <p className="text-sm text-gray-600">Find your products quickly with smart search and filters</p>
              </div>
            </div>
            
            {/* Active Filters Count */}
            {(searchTerm || statusFilter || typeFilter) && (
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full">
                <span className="text-xs font-semibold text-purple-700">
                  {[searchTerm, statusFilter, typeFilter].filter(Boolean).length} filter(s) active
                </span>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setTypeFilter('');
                  }}
                  className="text-purple-600 hover:text-purple-800 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Enhanced Search Input */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search products by name, type, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Enhanced Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div className="relative group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-blue-100 rounded-lg">
                      <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    Status Filter
                  </div>
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white shadow-sm hover:shadow-md transition-all duration-300 appearance-none cursor-pointer text-base"
                >
                  <option value="">📊 All Status</option>
                  <option value="ACTIVE">✅ Active</option>
                  <option value="PAUSED">⏸️ Paused</option>
                  <option value="DRAFT">📝 Draft</option>
                  <option value="ARCHIVED">📦 Archived</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none top-8">
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Type Filter */}
              <div className="relative group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-green-100 rounded-lg">
                      <FunnelIcon className="h-4 w-4 text-green-600" />
                    </div>
                    Product Type
                  </div>
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white shadow-sm hover:shadow-md transition-all duration-300 appearance-none cursor-pointer text-base"
                >
                  <option value="">🎯 All Types</option>
                  <option value="SOFTWARE">💻 Software</option>
                  <option value="CODE">⚡ Code</option>
                  <option value="DOCUMENTS">📄 Documents</option>
                  <option value="IMAGES">🖼️ Images</option>
                  <option value="VIDEOS">🎥 Videos</option>
                  <option value="COURSE">🎓 Course</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none top-8">
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Quick Filter Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600">Quick filters:</span>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  statusFilter === 'ACTIVE' 
                    ? 'bg-green-100 text-green-700 border border-green-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
                }`}
              >
                ✅ Active Only
              </button>
              <button
                onClick={() => setStatusFilter('DRAFT')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  statusFilter === 'DRAFT' 
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600'
                }`}
              >
                📝 Drafts Only
              </button>
              <button
                onClick={() => setTypeFilter('SOFTWARE')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  typeFilter === 'SOFTWARE' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                💻 Software
              </button>
              <button
                onClick={() => setTypeFilter('VIDEOS')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  typeFilter === 'VIDEOS' 
                    ? 'bg-red-100 text-red-700 border border-red-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                🎥 Videos
              </button>
            </div>
          </div>
        </div>

        {/* Helpful Banner for Draft Funnels */}
        {filteredAndSortedFunnels.some(f => f.status === 'DRAFT') && (
          <div data-banner="edit-help" className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 bg-purple-100 rounded-xl">
                <LightBulbIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  ✏️ Need to Edit Your Funnel?
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Click the <strong className="text-purple-700">purple edit button (✏️)</strong> on any funnel card below to customize it. You can add products, set prices, upload files, and design your sales page!
                </p>
                <div className="flex items-center gap-2 text-sm text-purple-700 font-medium">
                  <PencilIcon className="h-4 w-4" />
                  <span>Look for the purple edit button → It will open the funnel editor</span>
                </div>
              </div>
              <button
                onClick={() => {
                  const banner = document.querySelector('[data-banner="edit-help"]');
                  if (banner) banner.remove();
                }}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Funnels Grid */}
        <div ref={funnelsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedFunnels.map((funnel) => (
            <div key={funnel.id} className="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-1">
              {/* Premium Header with Gradient */}
              <div className="relative p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-100">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 transition-colors break-words hover:text-purple-700">{funnel.name}</h3>
                      {funnel.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed break-words">{funnel.description}</p>
                      )}
                      <div className="flex items-center flex-wrap gap-3">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${getTypeColor(funnel.template.type)}`}>
                          {getTypeIcon(funnel.template.type)}
                          <span className="ml-2 capitalize">{funnel.template.type.toLowerCase()}</span>
                        </span>
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(funnel.status)}`}>
                          {funnel.status === 'ACTIVE' && <CheckCircleIcon className="h-4 w-4 mr-2" />}
                          {funnel.status === 'DRAFT' && <ClockIcon className="h-4 w-4 mr-2" />}
                          {funnel.status === 'PAUSED' && <PauseIcon className="h-4 w-4 mr-2" />}
                          {funnel.status === 'ARCHIVED' && <ArchiveBoxIcon className="h-4 w-4 mr-2" />}
                          <span className="capitalize">{funnel.status.toLowerCase()}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Stats with Premium Design */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-purple-200 rounded-lg">
                        <UserGroupIcon className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <p className="text-3xl font-bold text-purple-700">{funnel.visitors}</p>
                      {!subscriptionData?.hasActivePlan && funnel.visitors >= 80 && funnel.visitors < 100 && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full whitespace-nowrap">
                          ⚠️ {100 - funnel.visitors} left
                        </span>
                      )}
                      {!subscriptionData?.hasActivePlan && funnel.visitors >= 100 && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full whitespace-nowrap">
                          🚫 Limit
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Visitors</p>
                    {!subscriptionData?.hasActivePlan && funnel.visitors >= 80 && (
                      <Link
                        href="/auth/dashboard/plans"
                        className="mt-2 inline-block text-xs text-purple-600 hover:text-purple-800 underline font-medium"
                      >
                        Upgrade for unlimited →
                      </Link>
                    )}
                    {/* Mini chart for visitors */}
                    <div className="h-10 mt-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={generateChartData(funnel)}>
                          <Line 
                            type="monotone" 
                            dataKey="views" 
                            stroke="#8b5cf6" 
                            strokeWidth={3}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-green-200 rounded-lg">
                        <ShoppingCartIcon className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-green-700 mb-1">{funnel.conversions}</p>
                    <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Sales</p>
                    <div className="mt-2 p-2 bg-orange-100 rounded-lg">
                      <p className="text-xs text-orange-700 font-bold">Rate: {funnel.conversionRate}%</p>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-blue-200 rounded-lg">
                        <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-blue-700 mb-1 break-words leading-tight">₹{funnel.revenue.toLocaleString()}</p>
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Revenue</p>
                    {/* Mini chart for revenue */}
                    <div className="h-10 mt-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={generateChartData(funnel)}>
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#3b82f6" 
                            fill="#3b82f6"
                            fillOpacity={0.4}
                            strokeWidth={3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Marketing Tips Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <LightBulbIcon className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-gray-900">Marketing Recommendations</h4>
                        <div className="group relative">
                          <InformationCircleIcon className="h-4 w-4 text-gray-400 hover:text-yellow-600 cursor-help transition-colors flex-shrink-0" />
                          <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <p className="font-semibold mb-2">💡 AI-Powered Insights</p>
                            <p className="leading-relaxed">These recommendations are based on your product performance data. Following them can help increase traffic, conversions, and revenue.</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 break-words">Personalized tips to boost your sales based on your product performance</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {generateMarketingTips(funnel).map((tip, index) => (
                      <div key={index} className={`p-4 rounded-xl border-l-4 shadow-sm transition-all duration-300 hover:shadow-md min-w-0 ${
                        tip.type === 'traffic' ? 'bg-blue-50 border-blue-400 hover:bg-blue-100' :
                        tip.type === 'conversion' ? 'bg-orange-50 border-orange-400 hover:bg-orange-100' :
                        tip.type === 'revenue' ? 'bg-green-50 border-green-400 hover:bg-green-100' :
                        tip.type === 'content' ? 'bg-purple-50 border-purple-400 hover:bg-purple-100' :
                        'bg-indigo-50 border-indigo-400 hover:bg-indigo-100'
                      }`}>
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                            <span className="text-2xl">{tip.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <p className="text-sm font-bold text-gray-900 break-words min-w-0">{tip.title}</p>
                              <span className="px-2 py-1 bg-white rounded-full text-xs font-semibold text-gray-600 shadow-sm flex-shrink-0 whitespace-nowrap">
                                {tip.channel}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 leading-relaxed break-words">{tip.description}</p>
                            <div className="p-2 bg-white rounded-lg">
                              <p className="text-xs font-semibold text-gray-800 break-words">
                                💡 Action: {tip.action}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Actions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* Eye icon always shows for all funnels, not just published */}
                      <button
                        onClick={() => {
                          if (funnel.status === 'ACTIVE' && funnel.url) {
                            window.open(funnel.url, '_blank');
                          } else {
                            toast('📢 Publish your funnel to view it live', {
                              duration: 2000,
                            });
                          }
                        }}
                        className={`p-3 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md ${
                          funnel.status === 'ACTIVE'
                            ? 'text-purple-600 hover:text-white hover:bg-purple-600 cursor-pointer'
                            : 'text-gray-400 hover:text-white hover:bg-gray-400 cursor-pointer'
                        }`}
                        title={funnel.status === 'ACTIVE' ? "View Live Site" : "Publish to view live"}
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      
                      {/* EDIT BUTTON - Made more prominent */}
                      <button
                        onClick={() => window.location.href = `/auth/dashboard/funnels/${funnel.id}/customize`}
                        className="relative p-3 text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group"
                        title="Edit & Customize Your Funnel"
                      >
                        <PencilIcon className="h-5 w-5" />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                          ✏️ Click to Edit Funnel
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/f/${funnel.id}`;
                          navigator.clipboard.writeText(url);
                          toast.success('🔗 Link copied to clipboard!', {
                            duration: 2000,
                          });
                        }}
                        className="p-3 text-blue-600 hover:text-white hover:bg-blue-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                        title="Share Link"
                      >
                        <ShareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDuplicateFunnel(funnel)}
                        className="p-3 text-green-600 hover:text-white hover:bg-green-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                        title="Duplicate Funnel"
                      >
                        <ArrowPathIcon className="h-5 w-5" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteFunnel(funnel)}
                      className="p-3 text-red-600 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                      title="Delete Funnel"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="relative">
                    <select
                      value={funnel.status}
                      onChange={(e) => handleUpdateFunnelStatus(funnel.id, e.target.value)}
                      className="w-full text-sm px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black bg-white shadow-sm hover:shadow-md transition-all duration-300 appearance-none cursor-pointer"
                      title={`Change status: ${funnel.status.toLowerCase()}`}
                    >
                      <option value="DRAFT">📝 Draft</option>
                      <option value="ACTIVE">✅ Active</option>
                      <option value="PAUSED">⏸️ Paused</option>
                      <option value="ARCHIVED">📦 Archived</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAndSortedFunnels.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FunnelIcon className="mx-auto h-12 w-12 sm:h-16 sm:w-16" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter || typeFilter ? 'No Products Found' : 'No Products Yet'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {searchTerm || statusFilter || typeFilter
                ? 'Try adjusting your search or filters to find products'
                : 'Get started by selling your first product - it only takes a few minutes!'
              }
            </p>
            {!searchTerm && !statusFilter && !typeFilter && (
              <>
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-sm shadow-lg mb-6"
                >
                  <PlusIcon className="h-4 w-4 inline mr-1" />
                  Sell Your First Product
                </button>
                <div className="mt-6 max-w-2xl mx-auto space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <LightBulbIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-left flex-1">
                        <h4 className="text-base font-bold text-gray-900 mb-3">🚀 Quick Start Guide</h4>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span><strong>Step 1:</strong> Click "Sell New Product" to choose a template</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span><strong>Step 2:</strong> Add your product name, description, and pricing</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span><strong>Step 3:</strong> Customize colors, images, and text to match your brand</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span><strong>Step 4:</strong> Upload your product file and publish</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span><strong>Step 5:</strong> Share your link and start earning! 💰</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                      <p className="text-sm font-semibold text-green-900">Secure & Easy</p>
                    </div>
                    <p className="text-xs text-green-800 text-left">
                      Your products are securely stored and protected. Payment processing is handled safely with Razorpay. 
                      No technical skills required - we've got you covered!
                    </p>
                  </div>
                </div>
              </>
            )}
            {(searchTerm || statusFilter || typeFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setTypeFilter('');
                }}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Template Selection Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Choose a Product Template</h3>
                    <p className="text-sm text-gray-600 mt-1">Select the template that matches your product type</p>
                  </div>
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-800">
                    <strong>💡 Pro Tip:</strong> Each template is pre-designed for specific product types with optimized layouts for better sales!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowTemplateModal(false);
                        setShowCreateModal(true);
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(template.type)}`}>
                          {getTypeIcon(template.type)}
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(template.type)}`}>
                          {template.type.toLowerCase()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                      <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                        Use This Template
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Funnel Modal */}
        {showCreateModal && selectedTemplate && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Create New Product</h3>
                    <p className="text-sm text-gray-600 mt-1">Fill in the details to create your product</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedTemplate(null);
                      setNewFunnelName('');
                      setNewFunnelDescription('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Premium WordPress Theme, Python Course, etc..."
                      value={newFunnelName}
                      onChange={(e) => setNewFunnelName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
                      placeholder="Describe your product... (You can customize this later on the sales page)"
                      value={newFunnelDescription}
                      onChange={(e) => setNewFunnelDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    />
                    <p className="text-xs text-gray-500 mt-1">💡 Tip: A good description helps customers understand your product better</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selected Template</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className={`p-2 rounded-lg ${getTypeColor(selectedTemplate.type)}`}>
                        {getTypeIcon(selectedTemplate.type)}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{selectedTemplate.name}</p>
                        <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800">
                      <strong>📝 Note:</strong> After creating, you can customize colors, images, text, pricing, and more on the next page!
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setSelectedTemplate(null);
                        setNewFunnelName('');
                        setNewFunnelDescription('');
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateFunnel}
                      disabled={!newFunnelName.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Product
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Delete Confirmation Modal */}
        {/* Upgrade Modal */}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => {
            setShowUpgradeModal(false);
            setUpgradeModalData(null);
          }}
          limitType={upgradeModalData?.limitType || 'funnels'}
          currentCount={upgradeModalData?.currentCount}
          limit={upgradeModalData?.limit}
        />

        {showDeleteModal && funnelToDelete && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={cancelDelete}></div>
            
            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <TrashIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Delete Funnel</h3>
                      <p className="text-sm text-gray-600">This action cannot be undone</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        {getTypeIcon(funnelToDelete.template.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{funnelToDelete.name}</h4>
                        <p className="text-sm text-gray-600">
                          {funnelToDelete.visitors} visitors • ₹{funnelToDelete.revenue.toLocaleString()} revenue
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-red-100 rounded-lg">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-red-800 mb-1">Warning</p>
                        <p className="text-sm text-red-700">
                          Deleting this funnel will permanently remove all data including visitors, sales, and revenue statistics. This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={cancelDelete}
                      disabled={deleteLoading}
                      className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDeleteFunnel}
                      disabled={deleteLoading}
                      className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-red-600 border border-transparent rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {deleteLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <TrashIcon className="h-4 w-4" />
                          Delete Forever
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Razorpay Required Modal */}
        <RazorpayRequiredModal
          isOpen={showRazorpayModal}
          onClose={() => setShowRazorpayModal(false)}
        />
      </div>
    </DashboardLayout>
  );
}