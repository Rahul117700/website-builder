'use client';

import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { gsap } from 'gsap';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

interface ShowcaseSlide {
  id: string;
  image: string;
  title: string;
  description: string;
  graphTitle: string;
  graphData: any[];
  graphType: 'line' | 'area';
  highlightColor: string;
  details: string[];
}

const slides: ShowcaseSlide[] = [
  {
    id: 'code-expertise',
    image: '/showcase/slide1.png',
    title: 'Share Your Code Expertise',
    description: 'Sell code templates, frameworks, libraries, and development resources. Help fellow developers build faster while earning from your creations.',
    graphTitle: 'Sales & Revenue Growth',
    graphType: 'line',
    highlightColor: '#ec4899', // Pink
    details: ['Monetize your GitHub repos', 'Automated delivery', 'License management'],
    graphData: [
      { week: 'Week 1', revenue: 12, sales: 4 },
      { week: 'Week 2', revenue: 45, sales: 15 },
      { week: 'Week 3', revenue: 78, sales: 28 },
      { week: 'Week 4', revenue: 125, sales: 42 }
    ]
  },
  {
    id: 'channel-editor',
    image: '/showcase/slide2.png',
    title: 'Edit Your Channel',
    description: 'Customize your channel with our intuitive visual editor. Manage products, adjust layouts, and update content in real-time without writing a single line of code.',
    graphTitle: 'Visitor Engagement',
    graphType: 'area',
    highlightColor: '#8b5cf6', // Violet
    details: ['Drag & drop interface', 'Real-time preview', 'Mobile responsive'],
    graphData: [
      { day: 'Mon', visits: 120, clicks: 45 },
      { day: 'Tue', visits: 180, clicks: 68 },
      { day: 'Wed', visits: 150, clicks: 55 },
      { day: 'Thu', visits: 220, clicks: 89 },
      { day: 'Fri', visits: 280, clicks: 112 },
      { day: 'Sat', visits: 310, clicks: 145 },
      { day: 'Sun', visits: 290, clicks: 130 }
    ]
  }
];

interface ScreenshotShowcaseProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScreenshotShowcase({ isOpen, onClose }: ScreenshotShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Modal entrance animation
  useEffect(() => {
    if (isOpen && containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [isOpen]);

  // Slide transition animation
  useEffect(() => {
    if (isOpen) {
      // Animate content
      gsap.fromTo([contentRef.current, imageRef.current],
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, [currentIndex, isOpen]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (!isOpen) return null;

  const currentSlide = slides[currentIndex];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-hidden">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Main Container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/20 hover:bg-black/10 text-gray-800 transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* LEFT SIDE: Image/Visual */}
        <div className="w-full lg:w-3/5 h-1/2 lg:h-full bg-gray-50 relative overflow-hidden group">
          <img
            ref={imageRef}
            src={currentSlide.image}
            alt={currentSlide.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo/logo.png'; // Fallback
            }}
          />
          {/* Gradient Overlay for text readability if needed */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent lg:hidden"></div>

          {/* Navigation Arrows (Overlaid on mobile, visible on desktop hover) */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={prevSlide}
              className="p-3 rounded-full bg-white/90 shadow-lg text-gray-800 hover:bg-white hover:scale-110 transition-all"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              className="p-3 rounded-full bg-white/90 shadow-lg text-gray-800 hover:bg-white hover:scale-110 transition-all"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Content & Graph */}
        <div className="w-full lg:w-2/5 h-1/2 lg:h-full bg-white p-6 lg:p-10 flex flex-col overflow-y-auto">
          <div ref={contentRef} className="flex-1 flex flex-col justify-center">

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                {currentSlide.title}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {currentSlide.description}
              </p>
            </div>

            {/* Key Benefits/Details */}
            <div className="flex flex-wrap gap-2 mb-8">
              {currentSlide.details.map((detail, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full"
                >
                  {detail}
                </span>
              ))}
            </div>

            {/* Graph Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentSlide.highlightColor }}></div>
                <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                  {currentSlide.graphTitle}
                </h4>
              </div>

              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {currentSlide.graphType === 'line' ? (
                    <LineChart data={currentSlide.graphData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis
                        dataKey="week"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                        dy={10}
                      />
                      <YAxis
                        hide={true}
                        domain={[0, 'dataMax + 20']}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke={currentSlide.highlightColor}
                        strokeWidth={4}
                        dot={{ r: 4, fill: currentSlide.highlightColor, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#a78bfa"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  ) : (
                    <AreaChart data={currentSlide.graphData}>
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={currentSlide.highlightColor} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={currentSlide.highlightColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                        dy={10}
                      />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="visits"
                        stroke={currentSlide.highlightColor}
                        fillOpacity={1}
                        fill="url(#colorVisits)"
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>

              {currentSlide.graphType === 'line' && (
                <div className="mt-2 text-center">
                  <span className="text-sm font-bold text-gray-900">4x increase</span>
                  <span className="text-xs text-gray-500 ml-1">in just one month</span>
                </div>
              )}
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-auto pt-4">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === idx
                      ? 'w-6 bg-gray-800'
                      : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                />
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

