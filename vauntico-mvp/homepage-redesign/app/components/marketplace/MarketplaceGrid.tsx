'use client';

import React, { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { Skeleton } from '../ui/Skeleton';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  trust_score_required: number;
  category: string;
  tags: string[];
  images: string[];
  is_active: boolean;
  moderation_status: string;
  created_at: string;
  creator: {
    id: string;
    name: string;
    bio?: string;
    profile_image_url?: string;
    total_sales: number;
    trust_score: number;
  };
  stats: {
    average_rating: number;
    review_count: number;
  };
}

interface MarketplaceGridProps {
  searchTerm?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minTrustScore?: number;
  sortBy?: string;
  sortOrder?: string;
}

export default function MarketplaceGrid({
  searchTerm,
  category,
  minPrice,
  maxPrice,
  minTrustScore = 60,
  sortBy = 'created_at',
  sortOrder = 'desc',
}: MarketplaceGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  });

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        min_trust_score: minTrustScore.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      if (searchTerm) params.set('search', searchTerm);
      if (category) params.set('category', category);
      if (minPrice) params.set('min_price', minPrice.toString());
      if (maxPrice) params.set('max_price', maxPrice.toString());

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
      }

      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, category, minPrice, maxPrice, minTrustScore, sortBy, sortOrder]);

  const handleLoadMore = () => {
    if (pagination.page < pagination.total_pages) {
      fetchProducts(pagination.page + 1);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-lg mb-4">Failed to load products</div>
        <div className="text-slate-400 mb-6">{error}</div>
        <button
          onClick={() => fetchProducts()}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🛒</div>
        <div className="text-xl text-slate-300 mb-2">No products found</div>
        <div className="text-slate-400">Try adjusting your filters or check back later for new listings</div>
      </div>
    );
  }

  return (
    <div>
      {/* Results header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-slate-300">
          Showing {products.length} of {pagination.total} products
        </div>
        <div className="text-sm text-slate-400">
          Page {pagination.page} of {pagination.total_pages}
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Load more button */}
      {pagination.page < pagination.total_pages && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : `Load More (Page ${pagination.page + 1})`}
          </button>
        </div>
      )}

      {/* End message */}
      {pagination.page >= pagination.total_pages && pagination.total > 0 && (
        <div className="text-center text-slate-400 text-sm">
          You've reached the end of the marketplace
        </div>
      )}
    </div>
  );
}
