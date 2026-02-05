'use client';

import { useEffect, useRef } from 'react';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

interface ChannelEditorTourProps {
    run: boolean;
    onFinish: () => void;
}

export default function ChannelEditorTour({ run, onFinish }: ChannelEditorTourProps) {
    const tourRef = useRef<InstanceType<typeof Shepherd.Tour> | null>(null);

    useEffect(() => {
        if (!run) return;

        // Cleanup any existing tour first
        if (tourRef.current) {
            tourRef.current.complete();
            tourRef.current = null;
        }

        // Small delay to ensure all elements are rendered
        const timer = setTimeout(() => {
            startTour();
        }, 500);

        function startTour() {
            if (tourRef.current) return;

            const tour = new Shepherd.Tour({
                useModalOverlay: true,
                defaultStepOptions: {
                    classes: 'shepherd-theme-custom shadow-2xl border-none rounded-2xl overflow-hidden',
                    scrollTo: { behavior: 'smooth', block: 'center' },
                    cancelIcon: { enabled: true },
                    modalOverlayOpeningPadding: 4,
                    modalOverlayOpeningRadius: 12,
                }
            });

            // Welcome Step
            tour.addStep({
                id: 'welcome',
                title: '🚀 Your Journey to Earning Starts Here!',
                text: `
          <div class="space-y-4">
            <p class="text-gray-700 leading-relaxed">
              Welcome to your <strong>Channel Studio</strong>! This is where you transform your content into a recurring revenue stream.
            </p>
            <div class="bg-violet-50 p-4 rounded-xl border border-violet-100 italic text-violet-700 text-sm">
              "Build once, earn forever. Join thousands of creators making ₹45Lakhs+ yearly."
            </div>
            <p class="text-sm text-gray-500">
              In the next 2 minutes, we'll show you how to launch your professional channel.
            </p>
          </div>
        `,
                buttons: [
                    {
                        text: 'Skip',
                        action: tour.cancel,
                        classes: 'px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700'
                    },
                    {
                        text: 'Let\'s Go! 🚀',
                        action: tour.next,
                        classes: 'px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold shadow-lg'
                    }
                ]
            });

            // Template Choice
            tour.addStep({
                id: 'template',
                attachTo: { element: '[data-tour="template-selector"]', on: 'bottom' },
                title: '🎨 Choose Your Vibe',
                text: `
          <div class="space-y-3">
            <p class="text-gray-700">
              Pick a professional template that matches your brand. Each one is conversion-optimized to turn visitors into paying subscribers.
            </p>
          </div>
        `,
                buttons: [
                    { text: 'Back', action: tour.back, classes: 'shepherd-button-secondary' },
                    { text: 'Got it', action: tour.next }
                ]
            });

            // Basic Tab
            tour.addStep({
                id: 'tab-basic',
                attachTo: { element: '[data-tour="tab-basic"]', on: 'bottom' },
                title: '🏷️ Branding & Identity',
                text: `
          <div class="space-y-2">
            <p class="text-gray-700">Start with the basics! Upload your profile picture, cover image, and set a catchy channel name.</p>
            <p class="text-sm text-indigo-600 font-medium italic">First impressions matter!</p>
          </div>
        `,
                buttons: [
                    { text: 'Back', action: tour.back, classes: 'shepherd-button-secondary' },
                    { text: 'Next', action: tour.next }
                ]
            });

            // Products Tab
            tour.addStep({
                id: 'tab-products',
                attachTo: { element: '[data-tour="tab-products"]', on: 'bottom' },
                title: '📦 Add Your Content',
                text: `
          <div class="space-y-3">
            <p class="text-gray-700">This is where the magic happens. Upload your videos, PDFs, software, or courses.</p>
            <div class="bg-amber-50 p-3 rounded-lg border border-amber-100 text-xs text-amber-800">
              💡 <strong>Pro Tip:</strong> Add at least 3 high-quality products to increase conversion by 40%!
            </div>
          </div>
        `,
                buttons: [
                    { text: 'Back', action: tour.back, classes: 'shepherd-button-secondary' },
                    { text: 'Show Me More', action: tour.next }
                ]
            });

            // Subscription Tab - THE MOTIVATION STEP
            tour.addStep({
                id: 'tab-subscription',
                attachTo: { element: '[data-tour="tab-subscription"]', on: 'bottom' },
                title: '💰 Turn on the Revenue Tap',
                text: `
          <div class="space-y-4">
            <p class="text-gray-700 leading-relaxed">
              Enable subscriptions to start earning recurring income. Set your price and watch your balance grow.
            </p>
            <div class="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <p class="text-emerald-800 font-bold text-sm mb-1">Instant Activation!</p>
              <p class="text-emerald-700 text-xs">Users pay directly via Razorpay. You get <strong>85%</strong> of every single sale.</p>
            </div>
          </div>
        `,
                buttons: [
                    { text: 'Back', action: tour.back, classes: 'shepherd-button-secondary' },
                    { text: 'Awesome!', action: tour.next }
                ]
            });

            // Analytics
            tour.addStep({
                id: 'tab-analytics',
                attachTo: { element: '[data-tour="tab-analytics"]', on: 'bottom' },
                title: '📈 Track Your Success',
                text: `
          <div class="space-y-3">
            <p class="text-gray-700">See your active users, conversion rates, and total revenue in real-time. Use data to grow your empire!</p>
          </div>
        `,
                buttons: [
                    { text: 'Back', action: tour.back, classes: 'shepherd-button-secondary' },
                    { text: 'Next', action: tour.next }
                ]
            });

            // Completion Panel
            tour.addStep({
                id: 'completion',
                attachTo: { element: '[data-tour="completion-panel"]', on: 'left' },
                title: '🎯 Reach 100%',
                text: `
          <div class="space-y-3">
            <p class="text-gray-700">Follow the checklist to ensure your channel is ready for prime time. A complete channel looks more trustworthy!</p>
          </div>
        `,
                buttons: [
                    { text: 'Back', action: tour.back, classes: 'shepherd-button-secondary' },
                    { text: 'Next', action: tour.next }
                ]
            });

            // Publish Action
            tour.addStep({
                id: 'publish',
                attachTo: { element: '[data-tour="publish-action"]', on: 'bottom' },
                title: '🎉 Go Live!',
                text: `
          <div class="space-y-4">
            <p class="text-gray-700 font-medium">Ready to start earning?</p>
            <p class="text-sm text-gray-600 leading-relaxed">
              Once you're happy with your setup, hit <strong>Publish</strong>. Your channel will be live and ready to accept customers!
            </p>
          </div>
        `,
                buttons: [
                    { text: 'Back', action: tour.back, classes: 'shepherd-button-secondary' },
                    {
                        text: 'Finish Tour ✓',
                        action: tour.complete,
                        classes: 'px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold shadow-lg'
                    }
                ]
            });

            tour.on('complete', onFinish);
            tour.on('cancel', onFinish);

            tour.start();
            tourRef.current = tour;
        }

        return () => {
            clearTimeout(timer);
            if (tourRef.current) {
                tourRef.current.complete();
            }
        };
    }, [run, onFinish]);

    return (
        <style jsx global>{`
            .shepherd-theme-custom {
                max - width: 400px;
            background: white;
      }
            .shepherd-header {
                background: white;
            padding: 1.5rem 1.5rem 0.5rem;
      }
            .shepherd-title {
                font - family: 'Inter', sans-serif;
            font-size: 1.125rem;
            font-weight: 800;
            color: #111827;
      }
            .shepherd-text {
                padding: 0.5rem 1.5rem 1.5rem;
            font-family: 'Inter', sans-serif;
            font-size: 0.875rem;
            color: #4b5563;
      }
            .shepherd-footer {
                padding: 0.5rem 1.5rem 1.5rem;
            display: flex;
            gap: 0.75rem;
            justify-content: flex-end;
      }
            .shepherd-button {
                padding: 0.625rem 1.25rem;
            font-size: 0.875rem;
            font-weight: 700;
            border-radius: 0.75rem;
            transition: all 0.2s;
            cursor: pointer;
      }
            .shepherd-button:not(.shepherd-button-secondary) {
                background: #111827;
            color: white;
      }
            .shepherd-button:not(.shepherd-button-secondary):hover {
                background: #000000;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
            .shepherd-button-secondary {
                background: #f3f4f6;
            color: #374151;
      }
            .shepherd-button-secondary:hover {
                background: #e5e7eb;
      }
            .shepherd-modal-overlay-container {
                opacity: 0.6;
      }
            .shepherd-cancel-icon {
                color: #9ca3af;
            transition: color 0.2s;
            padding: 0.5rem;
      }
            .shepherd-cancel-icon:hover {
                color: #4b5563;
      }
    `}</style>
    );
}
