"use client";
/* eslint react/no-unescaped-entities: 0 */
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>

            <div className="prose prose-gray max-w-none">
              <p className="text-gray-300 mb-6">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  1. Information We Collect
                </h2>
                <h3 className="text-xl font-medium text-white mb-2">
                  Personal Information
                </h3>
                <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-4">
                  <li>Name and email address when you create an account</li>
                  <li>Payment information when you subscribe to our services</li>
                  <li>Profile information you choose to provide</li>
                </ul>
                
                <h3 className="text-xl font-medium text-white mb-2">
                  Usage Information
                </h3>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li>Website usage data and analytics</li>
                  <li>Form submissions and user interactions</li>
                  <li>Technical information about your device and browser</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  2. How We Use Your Information
                </h2>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li>To provide and maintain our website builder service</li>
                  <li>To process payments and manage subscriptions</li>
                  <li>To send you important updates and notifications</li>
                  <li>To improve our services and user experience</li>
                  <li>To provide customer support</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  3. Information Sharing
                </h2>
                <p className="text-gray-300 mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
                </p>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li>With your explicit consent</li>
                  <li>To trusted third-party service providers who assist us in operating our platform</li>
                  <li>To comply with legal requirements or protect our rights</li>
                  <li>In connection with a business transfer or merger</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  4. Data Security
                </h2>
                <p className="text-gray-300 mb-4">
                  We implement appropriate security measures to protect your personal information:
                </p>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication measures</li>
                  <li>Secure payment processing</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  5. Your Rights
                </h2>
                <p className="text-gray-300 mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your data</li>
                  <li>Object to processing of your data</li>
                  <li>Data portability</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  6. Cookies and Tracking
                </h2>
                <p className="text-gray-300 mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze website usage and performance</li>
                  <li>Provide personalized content and features</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  7. Third-Party Services
                </h2>
                <p className="text-gray-300 mb-4">
                  Our platform may integrate with third-party services. These services have their own privacy policies, and we encourage you to review them.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  8. Children's Privacy
                </h2>
                <p className="text-gray-300 mb-4">
                  Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  9. International Transfers
                </h2>
                <p className="text-gray-300 mb-4">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  10. Changes to This Policy
                </h2>
                <p className="text-gray-300 mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  11. Contact Us
                </h2>
                <p className="text-gray-300 mb-4">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p className="text-gray-300">
                  Email: privacy@websitebuilder.com<br />
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