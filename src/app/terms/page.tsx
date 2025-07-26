"use client";
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Footer from '@/components/Footer';

export default function TermsPage() {
  const { data: session } = useSession();
  
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Navbar (matching home page) */}
      <header className="bg-black shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/" className="text-2xl font-bold text-white">Website Builder</Link>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/#features" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">Features</Link>
              <Link href="/#templates" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">Templates</Link>
              <Link href="/#pricing" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">Pricing</Link>
              <Link href="/about" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">About Us</Link>
            </nav>
            
            {/* User/CTA Section */}
            <div className="flex items-center space-x-4">
              <Link href="/auth/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Go to Dashboard</Link>
              {session?.user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <img src={session.user.image || "/default-avatar.png"} alt="User" className="h-8 w-8 rounded-full" />
                    <span className="text-gray-300 text-sm">{session.user.name || session.user.email}</span>
                  </div>
                  <button 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300 text-sm">Rahul117700</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-gray-900 rounded-lg shadow-lg p-8 border border-gray-700">
            <div className="mb-8">
              <Link 
                href="/"
                className="text-purple-400 hover:text-purple-300"
              >
                ← Back to Home
              </Link>
            </div>

            <h1 className="text-3xl font-bold text-white mb-8">
              Terms of Service
            </h1>

            <div className="prose prose-gray max-w-none">
              <p className="text-gray-300 mb-6">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-300 mb-4">
                  By accessing and using this website builder platform, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  2. Use License
                </h2>
                <p className="text-gray-300 mb-4">
                  Permission is granted to temporarily use this platform for personal or commercial website creation purposes. This is the grant of a license, not a transfer of title.
                </p>
                <p className="text-gray-300 mb-4">
                  This license shall automatically terminate if you violate any of these restrictions and may be terminated by us at any time.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  3. User Responsibilities
                </h2>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li>You are responsible for the content you create and publish</li>
                  <li>You must not use the platform for illegal or harmful purposes</li>
                  <li>You must not violate any third-party rights</li>
                  <li>You are responsible for maintaining the security of your account</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  4. Subscription and Payment
                </h2>
                <p className="text-gray-300 mb-4">
                  Some features require a paid subscription. Payments are processed securely through our payment partners.
                </p>
                <p className="text-gray-300 mb-4">
                  Subscriptions automatically renew unless cancelled. You may cancel your subscription at any time.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  5. Privacy and Data
                </h2>
                <p className="text-gray-300 mb-4">
                  We collect and process your data in accordance with our Privacy Policy. By using our service, you consent to such processing.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  6. Limitation of Liability
                </h2>
                <p className="text-gray-300 mb-4">
                  We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  7. Changes to Terms
                </h2>
                <p className="text-gray-300 mb-4">
                  We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  8. Contact Information
                </h2>
                <p className="text-gray-300 mb-4">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <p className="text-gray-300">
                  Email: support@websitebuilder.com<br />
                  Address: 123 Website Street, Builder City, BC 12345
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 