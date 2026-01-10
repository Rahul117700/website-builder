import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPosts } from '@/data/blogs';
import { CalendarIcon, ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import MarkdownContent from '@/components/blog/MarkdownContent';
import Header from '@/components/Header';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | Sell Earn Direct Blog`,
    description: post.metaDescription,
    keywords: post.keywords.join(', '),
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription,
    },
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Blog</span>
          </Link>
          <div className="mb-4">
            <span className="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full">
              {post.category}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-6 text-purple-100">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              <span>{new Date(post.publishedAt).toLocaleDateString('en-US', {
                timeZone: 'UTC', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              <span>{post.readTime} min read</span>
            </div>
            <div>
              <span>By {post.author}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Content */}
        <article className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-12">
          <MarkdownContent content={post.content} />
        </article>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Selling Digital Products?</h2>
          <p className="text-lg mb-6 text-purple-100">
            Create your first sales funnel in minutes with Sell Earn Direct. No technical skills required.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started Free
          </Link>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="mb-3">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                      {relatedPost.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-purple-600 transition-colors line-clamp-2">
                    {relatedPost.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {relatedPost.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <ClockIcon className="h-3 w-3" />
                    <span>{relatedPost.readTime} min read</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

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

