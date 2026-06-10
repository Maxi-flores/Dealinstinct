'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface DealCardProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  instinctScore?: number;
  source?: string;
  url?: string;
}

/**
 * DealCard - Card component for displaying deals
 * Shows image, title, prices, discount badge, and grab button
 */
export default function DealCard({ 
  id, 
  title, 
  price, 
  originalPrice, 
  discount, 
  image, 
  instinctScore,
  source,
  url 
}: DealCardProps) {
  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(p);
  };

  const finalUrl = url || `/products/${id}`;

  return (
    <Link 
      href={finalUrl}
      target={url ? '_blank' : '_self'}
      className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden
                 border border-gray-200 dark:border-gray-700 hover:shadow-xl
                 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image
          </div>
        )}
        
        {/* Discount Badge */}
        {discount && discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 
                        rounded-full text-sm font-bold">
            -{discount}%
          </div>
        )}

        {/* Source Badge */}
        {source && (
          <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 
                        px-2 py-1 rounded-full text-xs font-medium capitalize">
            {source}
          </div>
        )}

        {/* Instinct Score */}
        {instinctScore !== undefined && (
          <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full 
                        bg-gradient-to-br from-primary-500 to-accent-500 
                        flex items-center justify-center text-white font-bold text-sm
                        shadow-lg">
            {instinctScore}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-white 
                     line-clamp-2 group-hover:text-primary-600 transition-colors mb-2">
          {title}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-primary-600">
            {formatPrice(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Grab Button */}
        <button className="w-full flex items-center justify-center gap-2 py-2 
                          bg-gradient-to-r from-primary-500 to-accent-500 
                          text-white rounded-xl font-medium text-sm
                          group-hover:shadow-lg transition-all">
          <Sparkles className="w-4 h-4" />
          Grab Deal
        </button>
      </div>
    </Link>
  );
}

/**
 * Example usage:
 * 
 * import DealCard from '@/components/DealCard';
 * 
 * <DealCard 
 *   id="1"
 *   title="Apple AirPods Pro"
 *   price={189.99}
 *   originalPrice={249.00}
 *   discount={24}
 *   image="/product.jpg"
 *   instinctScore={85}
 *   source="amazon"
 * />
 */
