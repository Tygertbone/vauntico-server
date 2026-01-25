'use client';

import React, { useState } from 'react';
import MarketplaceGrid from '../components/marketplace/MarketplaceGrid';
import MarketplaceFilters from '../components/marketplace/MarketplaceFilters';

export default function MarketplacePage() {
  // Filter state management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minTrustScore, setMinTrustScore] = useState(60);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Creator Marketplace
          </h1>
          <p className="text-xl text-slate-300">
            Discover and purchase valuable digital products from trusted creators
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="text-2xl font-bold text-white">50+</div>
            <div className="text-slate-400">Active Products</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="text-2xl font-bold text-green-400">$2,500+</div>
            <div className="text-slate-400">Total Sales Volume</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="text-2xl font-bold text-purple-400">25</div>
            <div className="text-slate-400">Active Creators</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <MarketplaceFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                minTrustScore={minTrustScore}
                setMinTrustScore={setMinTrustScore}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <MarketplaceGrid
              searchTerm={searchTerm}
              category={selectedCategory === 'All Categories' ? '' : selectedCategory}
              minPrice={minPrice}
              maxPrice={maxPrice < 1000 ? maxPrice : undefined}
              minTrustScore={minTrustScore}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
