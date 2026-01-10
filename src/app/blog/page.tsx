import { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts } from '@/data/blogs';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import CategoryBrowser from '@/components/blog/CategoryBrowser';

export const metadata: Metadata = {
  title: 'Blog - Sell Earn Direct | Learn How to Sell Digital Products Online',
  description: 'Discover expert guides on selling digital products, creating sales funnels, building online businesses, and earning passive income. Learn from successful entrepreneurs.',
  keywords: 'blog, digital products, sales funnels, online business, passive income, course creation, marketing strategies',
  openGraph: {
    title: 'Blog - Sell Earn Direct',
    description: 'Expert guides on selling digital products and building online businesses',
    type: 'website',
  },
};

export default function BlogPage() {
  const featuredPosts = blogPosts.filter(post => post.featured).slice(0, 3);
  
  // Get categories with post counts
  const categoryMap = blogPosts.reduce((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categories = Object.entries(categoryMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count); // Sort by post count

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Blog & Resources
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl">
            Learn how to sell digital products, create sales funnels, and build a successful online business. Expert guides, strategies, and tips from successful entrepreneurs.
          </p>
          <div className="mt-6">
            <a
              href="/feed.xml"
              className="inline-flex items-center gap-2 text-purple-100 hover:text-white transition-colors text-sm"
              title="Subscribe to RSS Feed"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="6" cy="18" r="2" fill="currentColor"/>
                <path d="M4 4v4c7 0 13 6 13 13h4c0-9.4-7.6-17-17-17z" fill="currentColor"/>
                <path d="M4 11v4c3.3 0 6 2.7 6 6h4c0-5.5-4.5-10-10-10z" fill="currentColor"/>
              </svg>
              <span>Subscribe via RSS</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-black mb-8">Featured Articles</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                          {post.category}
                        </span>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                          Featured
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-black mb-3 hover:text-purple-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-black mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-black">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { timeZone: 'UTC' })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>{post.readTime} min read</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Categories - Interactive Component */}
        <CategoryBrowser categories={categories} />

        {/* All Posts */}
        <section>
          <h2 className="text-3xl font-bold text-black mb-8">All Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post, index) => {
              return (
                  <article
                    key={post.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                  >
                <Link href={`/blog/${post.slug}`}>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-gray-100 text-black text-xs font-semibold rounded-full">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-black mb-2 hover:text-purple-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-black text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-black">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { timeZone: 'UTC' })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>{post.readTime} min</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
          <p className="text-xl mb-6 text-purple-100">
            Create your first sales funnel in minutes and start earning today.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started Free
          </Link>
        </section>
      </div>
    </div>
  );
}

