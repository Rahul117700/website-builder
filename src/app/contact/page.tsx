'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  RocketLaunchIcon, 
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import gsap from 'gsap';
import Header from '@/components/Header';

export default function ContactPage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const contactRef = useRef(null);
  const formRef = useRef(null);
  const infoRef = useRef(null);

  // GSAP Animations
  useEffect(() => {
    gsap.registerPlugin();

    // Set initial visibility
    gsap.set('.contact-title, .contact-subtitle, .contact-form, .contact-info, .contact-method', { 
      opacity: 1, 
      y: 0 
    });

    // Contact section animations
    const contactTl = gsap.timeline();
    contactTl
      .set('.contact-title', { opacity: 0, y: 50 })
      .set('.contact-subtitle', { opacity: 0, y: 30 })
      .to('.contact-title', { 
        duration: 1, 
        y: 0, 
        opacity: 1, 
        ease: 'power3.out' 
      })
      .to('.contact-subtitle', { 
        duration: 0.8, 
        y: 0, 
        opacity: 1, 
        ease: 'power2.out' 
      }, '-=0.5');

    // Form animations
    gsap.fromTo('.contact-form', 
      { opacity: 0, y: 30 },
      {
        duration: 0.8,
        y: 0,
        opacity: 1,
        ease: 'power2.out',
        delay: 1
      }
    );

    // Contact info animations
    gsap.fromTo('.contact-info', 
      { opacity: 0, y: 30 },
      {
        duration: 0.8,
        y: 0,
        opacity: 1,
        ease: 'power2.out',
        delay: 1.2
      }
    );

    // Contact methods animations
    gsap.fromTo('.contact-method', 
      { opacity: 0, y: 30 },
      {
        duration: 0.8,
        y: 0,
        opacity: 1,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 1.5
      }
    );

  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 2000);
  };

  const contactMethods = [
    {
      icon: EnvelopeIcon,
      title: "Email Support",
      description: "Get help with your account, templates, or technical issues",
      contact: "support@websitebuilder.com",
      response: "Response within 24 hours"
    },
    {
      icon: PhoneIcon,
      title: "Phone Support",
      description: "Speak directly with our customer success team",
      contact: "+1 (555) 123-4567",
      response: "Available Mon-Fri, 9AM-6PM EST"
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Live Chat",
      description: "Instant help from our support specialists",
      contact: "Available on dashboard",
      response: "Response within minutes"
    },
    {
      icon: MapPinIcon,
      title: "Office Location",
      description: "Visit our headquarters for in-person meetings",
      contact: "123 Innovation Drive, Tech City, TC 12345",
      response: "By appointment only"
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section ref={contactRef} className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="contact-title text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Get in
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              {' '}Touch
            </span>
          </h1>
          <p className="contact-subtitle text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            We&apos;re here to help you succeed. Whether you have questions, need support, 
            or want to discuss your next project, our team is ready to assist.
          </p>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Form */}
            <div ref={formRef} className="contact-form">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                
                {submitSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">Message sent successfully! We&apos;ll get back to you soon.</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="feedback">Feedback & Suggestions</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? 'Sending Message...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Information */}
            <div ref={infoRef} className="contact-info">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Our team is committed to providing exceptional support and helping you achieve your goals. 
                    Reach out to us through any of the methods below.
                  </p>
                </div>

                {/* Contact Methods */}
                <div className="space-y-6">
                  {contactMethods.map((method, index) => (
                    <div key={index} className="contact-method bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <method.icon className="h-6 w-6 text-indigo-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.title}</h3>
                          <p className="text-gray-600 mb-3">{method.description}</p>
                          <div className="text-indigo-600 font-medium">{method.contact}</div>
                          <div className="text-sm text-gray-500 mt-1">{method.response}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Business Hours */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <ClockIcon className="h-6 w-6 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
                  </div>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span>9:00 AM - 6:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday:</span>
                      <span>10:00 AM - 4:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday:</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Quick answers to common questions about our platform and services.
            </p>
          </div>
          
          <div className="space-y-6">
            {[
              {
                question: "How quickly will I receive a response?",
                answer: "We typically respond to all inquiries within 24 hours during business days. For urgent technical issues, we offer live chat support with response times under 5 minutes."
              },
              {
                question: "Can I schedule a call with your team?",
                answer: "Absolutely! We offer consultation calls for enterprise clients and complex projects. You can request a call through our contact form or email us directly."
              },
              {
                question: "Do you offer support for custom development?",
                answer: "Yes, we provide custom development services for clients who need specialized solutions beyond our standard templates. Contact us to discuss your specific requirements."
              },
              {
                question: "What if I need help with my existing website?",
                answer: "Our support team can help with any website-related questions, from basic setup to advanced customization. We're here to ensure your success."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of entrepreneurs who&apos;ve already transformed their online presence with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 hover:shadow-xl"
            >
              Start Building Today
            </Link>
            <Link
              href="/#templates"
              className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-indigo-600 transition-all transform hover:scale-105"
            >
              Browse Templates
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
