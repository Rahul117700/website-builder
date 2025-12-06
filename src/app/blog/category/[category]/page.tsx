import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPosts } from '@/data/blogs';
import { CalendarIcon, ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Header from '@/components/Header';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export async function generateStaticParams() {
  const categories = Array.from(new Set(blogPosts.map(post => post.category)));
  return categories.map((category) => ({
    category: category.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categoryName = params.category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${categoryName} Articles - Sell Earn Direct Blog`,
    description: `Browse all ${categoryName.toLowerCase()} articles. Learn about ${categoryName.toLowerCase()} strategies, tips, and best practices.`,
    keywords: `${categoryName.toLowerCase()}, blog, articles, guides`,
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const categoryName = params.category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Use a stable, deterministic filter
  const categoryPosts = blogPosts
    .filter(
      (post) => post.category.toLowerCase().replace(/\s+/g, '-') === params.category.toLowerCase()
    )
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  if (categoryPosts.length === 0) {
    notFound();
  }

  const allCategories = Array.from(new Set(blogPosts.map(post => post.category)));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Blog</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {categoryName} Articles
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl">
            Browse all articles in the {categoryName.toLowerCase()} category
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories Navigation */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            {allCategories.map((category) => {
              const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
              const isActive = categorySlug === params.category;
              return (
                <Link
                  key={category}
                  href={`/blog/category/${categorySlug}`}
                  className={`px-4 py-2 bg-white border rounded-lg transition-colors text-black ${
                    isActive
                      ? 'border-purple-500 bg-purple-50 text-purple-700 font-semibold'
                      : 'border-gray-200 hover:border-purple-500 hover:text-purple-600'
                  }`}
                >
                  {category}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Category Posts */}
        <section>
          <h2 className="text-3xl font-bold text-black mb-8">
            {categoryPosts.length} {categoryPosts.length === 1 ? 'Article' : 'Articles'} in {categoryName}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                        {post.category}
                      </span>
                      {post.featured && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                          Featured
                        </span>
                      )}
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
            ))}
          </div>
        </section>

        {/* Back to Blog */}
        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>View All Articles</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

