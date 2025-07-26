"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Discussion {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    image: string;
    role: string;
  };
  category: 'question' | 'showcase' | 'tutorial' | 'general';
  replies: number;
  likes: number;
  timestamp: string;
  tags: string[];
}

export default function CommunityPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostData, setNewPostData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: ''
  });

  // Mock data for discussions
  const [discussions, setDiscussions] = useState<Discussion[]>([
    {
      id: '1',
      title: 'How do you handle responsive design for complex layouts?',
      content: 'I\'m working on a project with a complex grid layout and I\'m struggling with making it responsive. What are your best practices for handling responsive design in complex layouts?',
      author: {
        name: 'Sarah Chen',
        image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
        role: 'Frontend Developer'
      },
      category: 'question',
      replies: 8,
      likes: 24,
      timestamp: '2 hours ago',
      tags: ['responsive-design', 'css', 'grid']
    },
    {
      id: '2',
      title: 'Just launched my portfolio site!',
      content: 'After months of work, I finally launched my portfolio website using the AI builder. The results are amazing and I couldn\'t be happier with how it turned out!',
      author: {
        name: 'Alex Rodriguez',
        image: 'https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg',
        role: 'Full Stack Developer'
      },
      category: 'showcase',
      replies: 15,
      likes: 67,
      timestamp: '5 hours ago',
      tags: ['portfolio', 'showcase', 'ai-builder']
    },
    {
      id: '3',
      title: 'Step-by-step guide for building e-commerce sites',
      content: 'I created a comprehensive tutorial for building e-commerce websites from scratch. This guide covers everything from setup to deployment.',
      author: {
        name: 'Mike Johnson',
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        role: 'Senior Developer'
      },
      category: 'tutorial',
      replies: 32,
      likes: 128,
      timestamp: '1 day ago',
      tags: ['tutorial', 'e-commerce', 'guide']
    },
    {
      id: '4',
      title: 'Best practices for SEO optimization',
      content: 'What are your go-to strategies for SEO optimization? I\'m looking to improve my site\'s search engine rankings.',
      author: {
        name: 'Emily Davis',
        image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
        role: 'Digital Marketing'
      },
      category: 'question',
      replies: 12,
      likes: 45,
      timestamp: '3 days ago',
      tags: ['seo', 'marketing', 'optimization']
    },
    {
      id: '5',
      title: 'My journey from beginner to professional developer',
      content: 'I wanted to share my story of how I went from knowing nothing about web development to building professional websites. Here\'s what I learned along the way.',
      author: {
        name: 'David Kim',
        image: 'https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg',
        role: 'Web Developer'
      },
      category: 'general',
      replies: 28,
      likes: 89,
      timestamp: '1 week ago',
      tags: ['career', 'learning', 'journey']
    }
  ]);

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesTab = activeTab === 'all' || discussion.category === activeTab;
    const matchesSearch = discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         discussion.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const handleNewPost = () => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }
    setShowNewPostModal(true);
  };

  const submitNewPost = () => {
    const newDiscussion: Discussion = {
      id: Date.now().toString(),
      title: newPostData.title,
      content: newPostData.content,
      author: {
        name: session?.user?.name || 'Anonymous',
        image: session?.user?.image || '/default-avatar.png',
        role: 'Developer'
      },
      category: newPostData.category as any,
      replies: 0,
      likes: 0,
      timestamp: 'Just now',
      tags: newPostData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    setDiscussions([newDiscussion, ...discussions]);
    setNewPostData({ title: '', content: '', category: 'general', tags: '' });
    setShowNewPostModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
                Website Builder
              </Link>
              <nav className="hidden md:flex space-x-8">
                <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium">
                  Home
                </Link>
                <Link href="/community" className="text-purple-600 dark:text-purple-400 px-3 py-2 text-sm font-medium">
                  Community
                </Link>
                <Link href="/auth/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {session?.user ? (
                <div className="flex items-center space-x-3">
                  <img src={session.user.image || "/default-avatar.png"} alt="User" className="h-8 w-8 rounded-full" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{session.user.name}</span>
                </div>
              ) : (
                <Link href="/auth/signin" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Developer Community
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Connect with fellow developers, share your knowledge, and grow together.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex space-x-2">
              {['all', 'question', 'showcase', 'tutorial', 'general'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* New Post Button */}
            <button
              onClick={handleNewPost}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              New Post
            </button>
          </div>
        </div>

        {/* Discussions List */}
        <div className="space-y-6">
          {filteredDiscussions.map((discussion) => (
            <div key={discussion.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <img src={discussion.author.image} alt={discussion.author.name} className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{discussion.author.name}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{discussion.timestamp}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      discussion.category === 'question' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                      discussion.category === 'showcase' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      discussion.category === 'tutorial' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {discussion.category.charAt(0).toUpperCase() + discussion.category.slice(1)}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {discussion.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {discussion.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{discussion.replies} replies</span>
                      <span>•</span>
                      <span>{discussion.likes} likes</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      {discussion.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDiscussions.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No discussions found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Post</h2>
              <button
                onClick={() => setShowNewPostModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newPostData.title}
                  onChange={(e) => setNewPostData({ ...newPostData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your post title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={newPostData.category}
                  onChange={(e) => setNewPostData({ ...newPostData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="question">Question</option>
                  <option value="showcase">Showcase</option>
                  <option value="tutorial">Tutorial</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={newPostData.content}
                  onChange={(e) => setNewPostData({ ...newPostData, content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Write your post content..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newPostData.tags}
                  onChange={(e) => setNewPostData({ ...newPostData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="web-development, css, javascript"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewPostModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submitNewPost}
                disabled={!newPostData.title || !newPostData.content}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                Create Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 