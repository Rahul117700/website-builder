'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { 
  PlusIcon, 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  EyeIcon,
  TagIcon,
  UserCircleIcon,
  CalendarIcon,
  FireIcon,
  UserGroupIcon,
  UserIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorEmail: string;
  category: string;
  tags: string[];
  videoLink?: string | null;
  websiteLink?: string | null;
  likes: number;
  views: number;
  isPinned: boolean;
  createdAt: string;
  isLiked?: boolean;
  _count?: {
    comments: number;
  };
}

interface NewPostData {
  title: string;
  content: string;
  category: string;
  tags: string;
  videoLink: string;
  websiteLink: string;
}

export default function CommunityPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostData, setNewPostData] = useState<NewPostData>({
    title: '',
    content: '',
    category: 'general',
    tags: '',
    videoLink: '',
    websiteLink: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingPost, setDeletingPost] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<{[postId: string]: any[]}>({});
  const [loadingComments, setLoadingComments] = useState<{[postId: string]: boolean}>({});

  const categories = [
    { value: 'all', label: 'All Posts' },
    { value: 'my-posts', label: 'My Posts' },
    { value: 'general', label: 'General Discussion' },
    { value: 'question', label: 'Questions' },
    { value: 'showcase', label: 'Showcase' },
    { value: 'tutorial', label: 'Tutorials' },
    { value: 'feedback', label: 'Feedback' }
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  // Track post views
  const trackPostView = async (postId: string) => {
    try {
      await fetch(`/api/community/posts/${postId}/view`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error tracking post view:', error);
    }
  };

  // Fetch comments for a specific post
  const fetchComments = async (postId: string) => {
    try {
      setLoadingComments(prev => ({ ...prev, [postId]: true }));
      const response = await fetch(`/api/community/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(prev => ({ ...prev, [postId]: data }));
      } else {
        console.error('Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/community/posts');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched posts data:', data); // Debug log
        setPosts(data.posts || data); // Handle both paginated and simple response
      } else {
        console.error('Failed to fetch posts:', response.status, response.statusText);
        toast.error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast.error('You must be logged in to create a post');
      return;
    }

    if (!newPostData.title.trim() || !newPostData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPostData,
          tags: newPostData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          videoLink: newPostData.videoLink.trim() || null,
          websiteLink: newPostData.websiteLink.trim() || null
        }),
      });

      if (response.ok) {
        toast.success('Post created successfully!');
        setShowNewPostModal(false);
        setNewPostData({ title: '', content: '', category: 'general', tags: '', videoLink: '', websiteLink: '' });
        fetchPosts(); // Refresh the posts
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!session?.user) {
      toast.error('You must be logged in to like posts');
      return;
    }

    try {
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        // Update the posts state to reflect the like/unlike
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes: result.liked ? post.likes + 1 : post.likes - 1,
                isLiked: result.liked
              }
            : post
        ));
        toast.success(result.liked ? 'Post liked!' : 'Post unliked!');
      } else {
        toast.error('Failed to like post');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!session?.user) {
      toast.error('You must be logged in to delete posts');
      return;
    }

    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingPost(postId);
      const response = await fetch(`/api/community/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the post from the state
        setPosts(prev => prev.filter(post => post.id !== postId));
        toast.success('Post deleted successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setDeletingPost(null);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!session?.user) {
      toast.error('You must be logged in to comment');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setSubmittingComment(postId);
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: commentText.trim() }),
      });

      if (response.ok) {
        setCommentText('');
        toast.success('Comment added successfully!');
        // Refresh the comments for this post
        fetchComments(postId);
        // Refresh the posts to get updated comment count
        fetchPosts();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(null);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || 
                           selectedCategory === 'my-posts' ? post.authorEmail === session?.user?.email : 
                           post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <SkeletonLoader type="text" lines={2} className="mb-4" />
            <SkeletonLoader type="button" className="w-32" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonLoader key={i} type="card" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Developer Community</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Share your thoughts, ask questions, and connect with other developers
            </p>
          </div>
          <button
            onClick={() => setShowNewPostModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            New Post
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
              selectedCategory === 'my-posts' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* My Posts Indicator */}
        {selectedCategory === 'my-posts' && (
          <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-purple-800 dark:text-purple-200 font-medium">Showing your posts</span>
              <button
                onClick={() => setSelectedCategory('all')}
                className="ml-auto text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 underline"
              >
                View all posts
              </button>
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <UserGroupIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No posts found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to start a discussion!'
                }
              </p>
              {!searchQuery && selectedCategory === 'all' && (
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/community/posts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: 'Welcome to the Community!',
                          content: 'This is a test post to get the community started. Feel free to share your thoughts, ask questions, or showcase your work!',
                          category: 'general',
                          tags: ['welcome', 'community'],
                          videoLink: '',
                          websiteLink: ''
                        })
                      });
                      if (response.ok) {
                        toast.success('Test post created!');
                        fetchPosts();
                      } else {
                        toast.error('Failed to create test post');
                      }
                    } catch (error) {
                      toast.error('Error creating test post');
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Create Test Post
                </button>
              )}
            </div>
          ) : (
            filteredPosts.map(post => (
              <div
                key={post.id}
                className={`bg-white rounded-lg shadow-sm border p-6 transition-all hover:shadow-md ${
                  post.isPinned ? 'border-purple-200 bg-purple-50' : 
                  selectedCategory === 'my-posts' ? 'border-purple-300 bg-purple-25' : 
                  'border-gray-200'
                }`}
              >
                {post.isPinned && (
                  <div className="flex items-center gap-1 text-purple-600 mb-2">
                    <FireIcon className="w-4 h-4" />
                    <span className="text-sm font-semibold">Pinned</span>
                  </div>
                )}
                
                {selectedCategory === 'my-posts' && (
                  <div className="flex items-center gap-1 text-purple-600 mb-2">
                    <UserIcon className="w-4 h-4" />
                    <span className="text-sm font-semibold">My Post</span>
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 
                      className="text-xl font-semibold text-black mb-2 hover:text-purple-600 cursor-pointer"
                      onClick={() => trackPostView(post.id)}
                    >
                      {post.title}
                    </h3>
                    <p className="text-black line-clamp-3">
                      {post.content.substring(0, 200)}...
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-black text-xs rounded-full"
                      >
                        <TagIcon className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Video Link for Tutorials */}
                {post.category === 'tutorial' && post.videoLink && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-black mb-2">📹 Tutorial Video</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <iframe
                        src={post.videoLink.replace('watch?v=', 'embed/')}
                        title="Tutorial Video"
                        className="w-full h-64 rounded-lg"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}

                {/* Website Link for Showcase */}
                {post.category === 'showcase' && post.websiteLink && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-black mb-2">🌐 Showcase Website</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-2">Website Preview</p>
                          <div className="bg-white border rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-gray-300 rounded"></div>
                              <span className="text-sm text-gray-500 truncate">{post.websiteLink}</span>
                            </div>
                            <div className="mt-2 h-32 bg-gray-100 rounded flex items-center justify-center">
                              <span className="text-gray-400 text-sm">Website Preview</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <a
                          href={post.websiteLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <GlobeAltIcon className="w-4 h-4" />
                          Visit Website
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Post meta */}
                <div className="flex items-center justify-between text-sm text-black">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <UserCircleIcon className="w-4 h-4" />
                      <span>{post.authorName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-black">
                      {post.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        post.isLiked 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-black hover:text-purple-600'
                      }`}
                    >
                      <HeartIcon className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
                    <div className="flex items-center gap-1 text-black">
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      <span>{post._count?.comments || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-black">
                      <EyeIcon className="w-4 h-4" />
                      <span>{post.views}</span>
                    </div>
                    {/* Delete button - only show for post author */}
                    {session?.user?.email === post.authorEmail && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletingPost === post.id}
                        className="flex items-center gap-1 hover:text-red-600 transition-colors text-black p-1 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete post"
                      >
                        {deletingPost === post.id ? (
                          <LoadingSpinner size="sm" color="primary" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Comment Section */}
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={() => {
                        const newExpandedPost = expandedPost === post.id ? null : post.id;
                        setExpandedPost(newExpandedPost);
                        if (newExpandedPost && !comments[post.id]) {
                          fetchComments(post.id);
                        }
                      }}
                      className="flex items-center gap-1 text-black hover:text-purple-600 transition-colors"
                    >
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      <span>{post._count?.comments || 0} comments</span>
                      <svg 
                        className={`w-4 h-4 transition-transform ${expandedPost === post.id ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {expandedPost === post.id && (
                    <div className="space-y-3">
                      {/* Display Comments */}
                      {loadingComments[post.id] ? (
                        <div className="flex justify-center py-4">
                          <LoadingSpinner size="md" color="primary" />
                        </div>
                      ) : comments[post.id] && comments[post.id].length > 0 ? (
                        <div className="space-y-3 mb-4">
                          {comments[post.id].map((comment: any) => (
                            <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-semibold text-purple-600">
                                    {comment.author?.name?.charAt(0) || 'U'}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-black text-sm">
                                      {comment.author?.name || 'Anonymous'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(comment.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-black text-sm">{comment.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No comments yet. Be the first to comment!
                        </div>
                      )}

                      {/* Add Comment Form */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(post.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={submittingComment === post.id || !commentText.trim()}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {submittingComment === post.id ? (
                            <>
                              <LoadingSpinner size="sm" color="white" />
                              Adding...
                            </>
                          ) : (
                            'Comment'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* New Post Modal */}
        {showNewPostModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-black">Create New Post</h2>
                  <button
                    onClick={() => setShowNewPostModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmitPost} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newPostData.title}
                      onChange={(e) => setNewPostData({ ...newPostData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                      placeholder="Enter your post title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Category
                    </label>
                    <select
                      value={newPostData.category}
                      onChange={(e) => setNewPostData({ ...newPostData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                    >
                      <option value="general">General Discussion</option>
                      <option value="question">Question</option>
                      <option value="showcase">Showcase</option>
                      <option value="tutorial">Tutorial</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newPostData.tags}
                      onChange={(e) => setNewPostData({ ...newPostData, tags: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                      placeholder="e.g., react, nextjs, web-development"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Content *
                    </label>
                    <textarea
                      value={newPostData.content}
                      onChange={(e) => setNewPostData({ ...newPostData, content: e.target.value })}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                      placeholder="Share your thoughts, questions, or experiences..."
                      required
                    />
                  </div>

                  {/* Video Link for Tutorials */}
                  {newPostData.category === 'tutorial' && (
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Video Link (YouTube, Vimeo, etc.)
                      </label>
                      <input
                        type="url"
                        value={newPostData.videoLink}
                        onChange={(e) => setNewPostData({ ...newPostData, videoLink: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Add a YouTube or Vimeo link to embed your tutorial video directly in the post.
                      </p>
                    </div>
                  )}

                  {/* Website Link for Showcase */}
                  {newPostData.category === 'showcase' && (
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Website Link
                      </label>
                      <input
                        type="url"
                        value={newPostData.websiteLink}
                        onChange={(e) => setNewPostData({ ...newPostData, websiteLink: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                        placeholder="https://your-website.com"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Add your website URL to showcase it directly in the post with a live preview.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowNewPostModal(false)}
                      className="px-4 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <LoadingSpinner size="sm" color="white" />
                          Creating...
                        </>
                      ) : (
                        'Create Post'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 