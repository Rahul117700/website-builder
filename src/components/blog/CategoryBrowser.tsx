'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, FunnelIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

interface Category {
  name: string;
  count: number;
}

interface CategoryBrowserProps {
  categories: Category[];
}

export default function CategoryBrowser({ categories }: CategoryBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Filter categories based on search
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show only top 12 categories initially
  const displayedCategories = showAllCategories 
    ? filteredCategories 
    : filteredCategories.slice(0, 12);

  return (
    <section className="mb-16">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-4">
          <Squares2X2Icon className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-600">{categories.length} Categories</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
        <p className="text-gray-600 text-lg mb-8">Find exactly what you're looking for</p>
        
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {displayedCategories.map((category) => (
          <Link
            key={category.name}
            href={`/blog/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
            className="group relative bg-white hover:bg-gray-50 rounded-xl border-2 border-gray-100 hover:border-gray-900 transition-all duration-200 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 mb-3 bg-gray-900 group-hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors">
                  <FunnelIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
                  {category.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="font-medium">{category.count}</span>
                  <span>{category.count === 1 ? 'post' : 'posts'}</span>
                </div>
              </div>
            </div>
            {/* Bottom indicator */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
          </Link>
        ))}
      </div>

      {/* Show More/Less Button */}
      {filteredCategories.length > 12 && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors"
          >
            <span>
              {showAllCategories 
                ? 'Show Less' 
                : `Show ${filteredCategories.length - 12} More Categories`}
            </span>
            <svg 
              className={`w-5 h-5 transition-transform ${showAllCategories ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* No results message */}
      {searchTerm && filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-600">Try searching with different keywords</p>
        </div>
      )}
    </section>
  );
}
