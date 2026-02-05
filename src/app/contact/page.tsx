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
import Logo from '@/components/Logo';

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
      description: "Get help with your funnels, payments, or technical issues",
      contact: "i.am.rahul4550@gmail.com",
      response: "Response within 24-48 hours"
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section ref={contactRef} className="relative pt-20 pb-12 px-4 bg-gradient-to-br from-white via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="contact-title text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Get in
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              {' '}Touch
            </span>
          </h1>
          <p className="contact-subtitle text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Need help with your funnels? Our team is ready to assist with setup, payments, optimization, and more.
          </p>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-12 sm:py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div ref={infoRef} className="contact-info">
            <div className="text-center">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sm:p-12">
                <div className="mb-8">
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
                  <p className="text-lg text-gray-600">
                    Our team is committed to providing exceptional support and helping you achieve your goals.
                  </p>
                </div>

                {/* Email Contact - Large and Prominent */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 border-2 border-indigo-200 mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                    <EnvelopeIcon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Us</h3>
                  <p className="text-gray-600 mb-4">
                    Get help with your funnels, payments, or technical issues
                  </p>
                  <a 
                    href="mailto:i.am.rahul4550@gmail.com"
                    className="text-2xl sm:text-3xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors break-all"
                  >
                    i.am.rahul4550@gmail.com
                  </a>
                  <p className="text-sm text-gray-500 mt-4">
                    Response within 24-48 hours
                  </p>
                </div>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <ClockIcon className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Business Hours</h4>
                    <p className="text-sm text-gray-600">Monday - Friday</p>
                    <p className="text-sm font-medium text-gray-900">10:00 AM - 7:00 PM IST</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <ChatBubbleLeftRightIcon className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Support Topics</h4>
                    <p className="text-sm text-gray-600">Funnel setup, Payments,</p>
                    <p className="text-sm text-gray-600">Technical issues & More</p>
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
                answer: "We typically respond to all inquiries within 24 hours during business days. For urgent funnel or payment issues, we prioritize responses within a few hours."
              },
              {
                question: "Can you help me set up my first funnel?",
                answer: "Absolutely! We offer personalized onboarding calls to help you create your first funnel, set up Razorpay payments, and optimize for conversions. Contact us to schedule a session."
              },
              {
                question: "Do you help with Razorpay integration?",
                answer: "Yes! We provide step-by-step guidance for connecting your Razorpay account, configuring payment settings, and ensuring smooth transactions for your digital products."
              },
              {
                question: "What if I need help optimizing my funnel conversions?",
                answer: "Our team offers funnel optimization consultations to help you improve conversion rates, increase sales, and maximize your revenue. Reach out for a free audit!"
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
      <section className="py-12 sm:py-16 px-4 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Selling?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-indigo-100 mb-6 max-w-xl mx-auto">
            Create your first sales funnel and start selling your digital products today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-100 transition-all shadow-md hover:shadow-lg"
            >
              Create Your Funnel Free
            </Link>
            <Link
              href="/auth/signin"
              className="border-2 border-white text-white px-6 py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-white hover:text-indigo-600 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center sm:text-left">
              <Logo 
                variant="white" 
                size="lg"
                href=""
              />
              <p className="text-xs sm:text-sm text-gray-400 mt-2">
                Create sales funnels and sell digital products with ease.
              </p>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-sm sm:text-base font-semibold mb-3">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white transition-colors text-xs sm:text-sm">Contact Us</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors text-xs sm:text-sm">About</Link></li>
              </ul>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-sm sm:text-base font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/terms" className="hover:text-white transition-colors text-xs sm:text-sm">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors text-xs sm:text-sm">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
            <p className="text-xs sm:text-sm">&copy; 2025 sedStudios. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
