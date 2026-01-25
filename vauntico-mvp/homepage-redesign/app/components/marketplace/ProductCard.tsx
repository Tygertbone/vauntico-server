'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Shield } from 'lucide-react';

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

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-3 h-3 text-slate-600" />
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 absolute top-0 left-0" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </div>
        )}

        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-3 h-3 text-slate-600" />
        ))}
      </div>
    );
  };

  const primaryImage = product.images?.[0] || '/api/placeholder/400/300';

  return (
    <Link href={`/marketplace/${product.id}`} className="block">
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group">
        {/* Product Image */}
        <div className="relative aspect-video bg-slate-700 overflow-hidden">
          <img
            src={primaryImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-purple-600/90 text-white text-xs font-medium rounded-md">
              {product.category}
            </span>
          </div>

          {/* Trust score badge */}
          <div className="absolute top-3 right-3">
            <div className={`flex items-center gap-1 px-2 py-1 bg-slate-900/90 text-white text-xs font-medium rounded-md ${getTrustScoreColor(product.creator.trust_score)}`}>
              <Shield className="w-3 h-3" />
              {product.creator.trust_score}
            </div>
          </div>

          {/* Moderation status */}
          {product.moderation_status === 'pending' && (
            <div className="absolute bottom-3 left-3">
              <span className="px-2 py-1 bg-yellow-600/90 text-white text-xs font-medium rounded-md">
                Pending Review
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
            {product.title}
          </h3>

          {/* Description */}
          <p className="text-slate-400 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Creator */}
          <div className="flex items-center gap-2 mb-3">
            {product.creator.profile_image_url && (
              <img
                src={product.creator.profile_image_url}
                alt={product.creator.name}
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="text-slate-400 text-sm">{product.creator.name}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {renderStars(product.stats.average_rating)}
              <span className="text-slate-400 text-sm">
                ({product.stats.review_count})
              </span>
            </div>
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg">
                {formatPrice(product.price)}
              </span>
              {product.trust_score_required > 60 && (
                <span className="text-slate-400 text-xs">
                  Requires {product.trust_score_required} trust
                </span>
              )}
            </div>

            <button className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors group-hover:bg-purple-700">
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {product.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
              {product.tags.length > 3 && (
                <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-md">
                  +{product.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
