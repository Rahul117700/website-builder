'use client';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { 
  PlusIcon, 
  ChartBarIcon, 
  GlobeAltIcon, 
  CreditCardIcon,
  PhotoIcon,
  FireIcon,
  StarIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  CurrencyDollarIcon,
  UsersIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { gsap } from 'gsap';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeUsers: 0,
    pageViews: 0,
    conversionRate: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // GSAP refs
  const dashboardTitleRef = useRef<HTMLHeadingElement>(null);
  const dashboardSubtitleRef = useRef<HTMLParagraphElement>(null);
  const statCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const actionCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activityItemRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    // GSAP animations
    const tl = gsap.timeline();
    
    tl.fromTo(dashboardTitleRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    )
    .fromTo(dashboardSubtitleRef.current, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 
      "-=0.3"
    )
    .fromTo(statCardRefs.current, 
      { opacity: 0, y: 30, scale: 0.9 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out", stagger: 0.1 }, 
      "-=0.2"
    )
    .fromTo(actionCardRefs.current, 
      { opacity: 0, y: 20, scale: 0.95 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out", stagger: 0.1 }, 
      "-=0.3"
    )
    .fromTo(activityItemRefs.current, 
      { opacity: 0, x: -20 }, 
      { opacity: 1, x: 0, duration: 0.4, ease: "power2.out", stagger: 0.1 }, 
      "-=0.2"
    );
  }, [stats, recentActivity]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load stats from real APIs
      const [statsRes, activityRes, templatesRes, notificationsRes] = await Promise.all([
        fetch('/api/analytics/dashboard-stats'),
        fetch('/api/analytics/recent-activity'),
        fetch('/api/templates/my-templates'),
        fetch('/api/notifications')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats({
          totalRevenue: statsData.totalRevenue || 0,
          activeUsers: statsData.activeUsers || 0,
          pageViews: statsData.pageViews || 0,
          conversionRate: statsData.conversionRate || 0
        });
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setRecentActivity(activityData.slice(0, 5)); // Show last 5 activities
      }

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData.slice(0, 3)); // Show last 3 templates
      }

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        setNotifications(notificationsData.slice(0, 3)); // Show last 3 notifications
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Create Template',
      description: 'Build a new website template',
      icon: PlusIcon,
      href: '/auth/dashboard/create-template',
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      title: 'View Analytics',
      description: 'Check your performance metrics',
      icon: ChartBarIcon,
      href: '/auth/dashboard/analytics',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Manage Domains',
      description: 'Configure your domain settings',
      icon: GlobeAltIcon,
      href: '/auth/dashboard/domain',
      gradient: 'from-pink-500 to-rose-600'
    },
    {
      title: 'Billing & Plans',
      description: 'Manage your subscription',
      icon: CreditCardIcon,
      href: '/auth/dashboard/billing',
      gradient: 'from-indigo-600 to-blue-600'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center">
          <h1 
            ref={dashboardTitleRef}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Creator
            </span>
          </h1>
          <p 
            ref={dashboardSubtitleRef}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Here's what's happening with your website business today. Track your progress, manage your templates, and grow your revenue.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Total Revenue',
              value: `₹${stats.totalRevenue.toFixed(2)}`,
              change: '+12.5%',
              icon: CurrencyDollarIcon,
              gradient: 'from-indigo-500 to-purple-600'
            },
            {
              title: 'Active Users',
              value: stats.activeUsers.toLocaleString(),
              change: '+8.2%',
              icon: UsersIcon,
              gradient: 'from-purple-500 to-pink-600'
            },
            {
              title: 'Page Views',
              value: stats.pageViews.toLocaleString(),
              change: '+15.3%',
              icon: EyeIcon,
              gradient: 'from-pink-500 to-rose-600'
            },
            {
              title: 'Conversion Rate',
              value: `${stats.conversionRate.toFixed(1)}%`,
              change: '+2.1%',
              icon: ChartBarIcon,
              gradient: 'from-indigo-600 to-blue-600'
            }
          ].map((stat, index) => (
            <div
              key={stat.title}
              ref={(el) => { statCardRefs.current[index] = el; }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-green-600">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
                              <p className="text-sm text-gray-600">
                  {stat.title}
                </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <div
                key={action.title}
                ref={(el) => { actionCardRefs.current[index] = el; }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 cursor-pointer group"
              >
                <Link href={action.href} className="block">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${action.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {action.description}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity & Templates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                          <h2 className="text-xl font-bold text-gray-900 mb-4">
              Recent Activity
            </h2>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <ul className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <li
                    key={activity.id}
                    ref={(el) => { activityItemRefs.current[index] = el; }}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'template_created' ? 'bg-indigo-100 text-indigo-600' :
                      activity.type === 'template_sold' ? 'bg-purple-100 text-purple-600' :
                      activity.type === 'new_review' ? 'bg-pink-100 text-pink-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {activity.type === 'template_created' && <PlusIcon className="h-4 w-4" />}
                      {activity.type === 'template_sold' && <CurrencyDollarIcon className="h-4 w-4" />}
                      {activity.type === 'new_review' && <StarIcon className="h-4 w-4" />}
                      {!['template_created', 'template_sold', 'new_review'].includes(activity.type) && <DocumentTextIcon className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No recent activity
              </p>
            )}
          </div>

          {/* My Templates */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                My Templates
              </h2>
              <Link
                href="/auth/dashboard/create-template"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                View All
              </Link>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : templates.length > 0 ? (
              <div className="space-y-4">
                {templates.map((template, index) => (
                  <div
                    key={template.id}
                                         ref={(el) => { activityItemRefs.current[index + recentActivity.length] = el; }}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <PhotoIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {template.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {template.status} • ₹{template.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {template.views || 0} views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-3">
                  No templates yet
                </p>
                <Link
                  href="/auth/dashboard/create-template"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Template
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
