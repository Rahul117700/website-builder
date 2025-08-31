'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  RocketLaunchIcon, 
  UsersIcon, 
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  FireIcon,
  StarIcon,
  ClockIcon,
  HeartIcon,
  EyeIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import gsap from 'gsap';
import Header from '@/components/Header';

export default function CommunityPage() {
  const { data: session } = useSession();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const communityRef = useRef(null);
  const postsRef = useRef(null);

  // GSAP Animations
  useEffect(() => {
    gsap.registerPlugin();

    // Set initial visibility
    gsap.set('.community-title, .community-subtitle, .community-post', { 
      opacity: 1, 
      y: 0 
    });

    // Community section animations
    const communityTl = gsap.timeline();
    communityTl
      .set('.community-title', { opacity: 0, y: 50 })
      .set('.community-subtitle', { opacity: 0, y: 30 })
      .to('.community-title', { 
        duration: 1, 
        y: 0, 
        opacity: 1, 
        ease: 'power3.out' 
      })
      .to('.community-subtitle', { 
        duration: 0.8, 
        y: 0, 
        opacity: 1, 
        ease: 'power2.out' 
      }, '-=0.5');

    // Posts animations
    gsap.fromTo('.community-post', 
      { opacity: 0, y: 30 },
      {
        duration: 0.8,
        y: 0,
        opacity: 1,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 1
      }
    );

  }, []);

  const filters = [
    { id: 'all', label: 'All', color: 'bg-indigo-600' },
    { id: 'question', label: 'Question', color: 'bg-blue-600' },
    { id: 'showcase', label: 'Showcase', color: 'bg-green-600' },
    { id: 'tutorial', label: 'Tutorial', color: 'bg-purple-600' },
    { id: 'general', label: 'General', color: 'bg-gray-600' }
  ];

  const communityPosts = [
    {
      id: 1,
      author: {
        name: "Sarah Chen",
        avatar: "/api/placeholder/40/40",
        role: "Frontend Developer"
      },
      timestamp: "2 hours ago",
      category: "question",
      categoryLabel: "Question",
      categoryColor: "bg-blue-600",
      title: "How do you handle responsive design for complex layouts?",
      content: "I'm working on a project with a complex grid layout and I'm struggling with making it responsive. What are your best practices for handling responsive design in complex layouts?",
      tags: ["responsive-design", "css", "grid"],
      stats: {
        replies: 8,
        likes: 24,
        views: 156
      }
    },
    {
      id: 2,
      author: {
        name: "Alex Rodriguez",
        avatar: "/api/placeholder/40/40",
        role: "Full-Stack Developer"
      },
      timestamp: "5 hours ago",
      category: "showcase",
      categoryLabel: "Showcase",
      categoryColor: "bg-green-600",
      title: "Just launched my portfolio site!",
      content: "After months of work, I finally launched my portfolio website using the AI builder. The results are amazing and I couldn't be happier with how it turned out!",
      tags: ["portfolio", "showcase", "ai-builder"],
      stats: {
        replies: 15,
        likes: 67,
        views: 342
      }
    },
    {
      id: 3,
      author: {
        name: "Emily Watson",
        avatar: "/api/placeholder/40/40",
        role: "UX Designer"
      },
      timestamp: "1 day ago",
      category: "tutorial",
      categoryLabel: "Tutorial",
      categoryColor: "bg-purple-600",
      title: "Complete guide to creating custom animations with GSAP",
      content: "I've been working with GSAP for years and wanted to share my knowledge. Here's a comprehensive guide to creating smooth, performant animations for your websites.",
      tags: ["gsap", "animations", "tutorial", "web-design"],
      stats: {
        replies: 23,
        likes: 89,
        views: 567
      }
    },
    {
      id: 4,
      author: {
        name: "Michael Chang",
        avatar: "/api/placeholder/40/40",
        role: "Backend Developer"
      },
      timestamp: "2 days ago",
      category: "question",
      categoryLabel: "Question",
      categoryColor: "bg-blue-600",
      title: "Best practices for API rate limiting?",
      content: "I'm building a public API and need to implement rate limiting. What are the best practices for implementing rate limiting that's both fair to users and protects the system?",
      tags: ["api", "rate-limiting", "backend", "security"],
      stats: {
        replies: 12,
        likes: 31,
        views: 234
      }
    },
    {
      id: 5,
      author: {
        name: "Lisa Thompson",
        avatar: "/api/placeholder/40/40",
        role: "Product Manager"
      },
      timestamp: "3 days ago",
      category: "general",
      categoryLabel: "General",
      categoryColor: "bg-gray-600",
      title: "What's your favorite development tool this year?",
      content: "I'm always looking for new tools to improve my workflow. What development tools, extensions, or utilities have you discovered this year that you can't live without?",
      tags: ["tools", "productivity", "development"],
      stats: {
        replies: 45,
        likes: 123,
        views: 789
      }
    },
    {
      id: 6,
      author: {
        name: "David Kim",
        avatar: "/api/placeholder/40/40",
        role: "DevOps Engineer"
      },
      timestamp: "4 days ago",
      category: "showcase",
      categoryLabel: "Showcase",
      categoryColor: "bg-green-600",
      title: "Built a CI/CD pipeline that deploys in under 2 minutes",
      content: "After optimizing our deployment process, we've reduced our CI/CD pipeline from 15 minutes to under 2 minutes. Here's how we did it and the tools we used.",
      tags: ["ci-cd", "devops", "automation", "deployment"],
      stats: {
        replies: 18,
        likes: 76,
        views: 445
      }
    }
  ];

  const filteredPosts = communityPosts.filter(post => {
    const matchesFilter = activeFilter === 'all' || post.category === activeFilter;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section ref={communityRef} className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="community-title text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Developer
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              {' '}Community
            </span>
          </h1>
          <p className="community-subtitle text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Connect with fellow developers, share your knowledge, and grow together. 
            Join thousands of creators building amazing websites and applications.
          </p>
        </div>
      </section>

      {/* Community Content */}
      <section ref={postsRef} className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Search and Filters */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full lg:w-96">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                      activeFilter === filter.id
                        ? `${filter.color} text-white shadow-lg`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* New Post Button */}
              <Link
                href="/community/new-post"
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>New Post</span>
              </Link>
            </div>
          </div>

          {/* Community Posts */}
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <div key={post.id} className="community-post bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-start space-x-4">
                  {/* Author Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                      <UsersIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    {/* Post Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">{post.author.name}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{post.author.role}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{post.timestamp}</span>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${post.categoryColor}`}>
                        {post.categoryLabel}
                      </span>
                    </div>

                    {/* Post Title */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-indigo-600 transition-colors cursor-pointer">
                      {post.title}
                    </h3>

                    {/* Post Content */}
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {post.content}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Post Stats */}
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        <span>{post.stats.replies} replies</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <HeartIcon className="h-4 w-4" />
                        <span>{post.stats.likes} likes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <EyeIcon className="h-4 w-4" />
                        <span>{post.stats.views} views</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or filters to find what you&apos;re looking for.
              </p>
              <Link
                href="/community/new-post"
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all transform hover:scale-105 hover:shadow-lg inline-flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Create the first post</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Join the Conversation
          </h2>
          <p className="text-lg sm:text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Share your knowledge, ask questions, and connect with developers from around the world. 
            Your next breakthrough idea might be just one discussion away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/community/new-post"
              className="bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 hover:shadow-xl inline-flex items-center space-x-2"
            >
              <PlusIcon className="h-6 w-6" />
              <span>Start a Discussion</span>
            </Link>
            <Link
              href="/auth/signup"
              className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-indigo-600 transition-all transform hover:scale-105"
            >
              Join Community
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start mb-4">
                <RocketLaunchIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400" />
                <span className="ml-2 text-lg sm:text-xl font-bold">Website Builder</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400">
                Empowering creators and entrepreneurs to build successful online businesses.
              </p>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/#features" className="hover:text-white transition-colors text-sm sm:text-base">Features</a></li>
                <li><a href="/#templates" className="hover:text-white transition-colors text-sm sm:text-base">Templates</a></li>
                <li><Link href="/auth/dashboard/marketplace" className="hover:text-white transition-colors text-sm sm:text-base">Marketplace</Link></li>
                <li><Link href="/auth/dashboard/create-template" className="hover:text-white transition-colors text-sm sm:text-base">Sell Your Template</Link></li>
              </ul>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors text-sm sm:text-base">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors text-sm sm:text-base">Contact</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors text-sm sm:text-base">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors text-sm sm:text-base">Privacy</Link></li>
              </ul>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/auth/signup" className="hover:text-white transition-colors text-sm sm:text-base">Sign Up</Link></li>
                <li><Link href="/auth/signin" className="hover:text-white transition-colors text-sm sm:text-base">Sign In</Link></li>
                <li><Link href="/auth/dashboard" className="hover:text-white transition-colors text-sm sm:text-base">Dashboard</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-sm sm:text-base">&copy; 2024 Website Builder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 