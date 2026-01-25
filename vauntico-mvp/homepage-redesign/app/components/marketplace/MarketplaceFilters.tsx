'use client';

import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';

interface MarketplaceFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  minPrice: number;
  setMinPrice: (price: number) => void;
  maxPrice: number;
  setMaxPrice: (price: number) => void;
  minTrustScore: number;
  setMinTrustScore: (score: number) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
}

const categories = [
  'All Categories',
  'Digital Products',
  'Courses & Tutorials',
  'Templates & Assets',
  'Consulting & Coaching',
  'Services',
  'Art & Design',
  'Writing & Content',
  'Marketing & Growth',
  'Tech & Tools',
  'Other',
];

const sortOptions = [
  { value: 'created_at', label: 'Newest' },
  { value: 'price', label: 'Price' },
  { value: 'title', label: 'Name' },
];

const availableTags = [
  'Marketing',
  'SEO',
  'Social Media',
  'E-commerce',
  'SaaS',
  'Content Creation',
  'Email Marketing',
  'Analytics',
  'Growth Hacking',
  'UI/UX Design',
  'React',
  'WordPress',
  'Shopify',
  'AI Tools',
  'Automation',
  'Business Strategy',
  'Freelancing',
  'Passive Income',
];

export default function MarketplaceFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minTrustScore,
  setMinTrustScore,
  selectedTags,
  setSelectedTags,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}: MarketplaceFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Debounce search term updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchTerm, setSearchTerm]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearAllFilters = () => {
    setLocalSearchTerm('');
    setSelectedCategory('All Categories');
    setMinPrice(0);
    setMaxPrice(1000);
    setMinTrustScore(60);
    setSelectedTags([]);
    setSortBy('created_at');
    setSortOrder('desc');
  };

  const hasActiveFilters =
    localSearchTerm ||
    selectedCategory !== 'All Categories' ||
    minPrice > 0 ||
    maxPrice < 1000 ||
    minTrustScore > 60 ||
    selectedTags.length > 0;

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-slate-400" />
          <span className="text-white font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
              Active
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Sorting */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
        <div className="flex gap-2">
          {sortOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                sortBy === option.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {option.label}
              {sortBy === option.value && sortOrder === 'desc' && ' ↓'}
              {sortBy === option.value && sortOrder === 'asc' && ' ↑'}
            </button>
          ))}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-2 py-1 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            disabled={!sortBy}
          >
            {sortOrder === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {isExpanded && (
        <>
          {/* Price Range */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Price Range: ${minPrice} - ${maxPrice}
              {maxPrice >= 1000 && '+'}
            </label>
            <div className="px-2">
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="10"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider absolute top-0"
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>$0</span>
                <span>$1000+</span>
              </div>
            </div>
          </div>

          {/* Trust Score Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Minimum Trust Score: {minTrustScore}
            </label>
            <input
              type="range"
              min="60"
              max="100"
              step="5"
              value={minTrustScore}
              onChange={(e) => setMinTrustScore(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>60 (Basic)</span>
              <span>100 (Elite)</span>
            </div>
          </div>

          {/* Tags Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {tag}
                  {selectedTags.includes(tag) && (
                    <X className="inline w-3 h-3 ml-1" />
                  )}
                </button>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  Selected: {selectedTags.join(', ')}
                </span>
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-xs text-purple-400 hover:text-purple-300"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          Clear All Filters
        </button>
      )}
    </div>
  );
}
