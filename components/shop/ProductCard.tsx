'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Badge } from '@/components/ui';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'horizontal';
  showQuickAdd?: boolean;
  onQuickAdd?: (product: Product) => void;
}

export function ProductCard({
  product,
  variant = 'default',
  showQuickAdd = true,
  onQuickAdd,
}: ProductCardProps) {
  const defaultImage = product.images.find((img) => img.isDefault) || product.images[0];
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  if (variant === 'horizontal') {
    return (
      <Link href={`/products/${product.slug}`}>
        <motion.div
          whileHover={{ x: 4 }}
          className="flex gap-4 p-4 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
        >
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-surface-100 dark:bg-surface-700">
            {defaultImage ? (
              <Image
                src={defaultImage.url}
                alt={defaultImage.alt || product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-surface-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-surface-500 dark:text-surface-400 mb-1">{product.categoryName}</p>
            <h3 className="font-medium text-surface-900 dark:text-surface-100 truncate">{product.name}</h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                €{product.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-surface-400 line-through">
                  €{product.compareAtPrice!.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/products/${product.slug}`}>
        <motion.div
          whileHover={{ y: -4 }}
          className="group bg-white dark:bg-surface-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
        >
          <div className="relative aspect-square bg-surface-100 dark:bg-surface-700">
            {defaultImage ? (
              <Image
                src={defaultImage.url}
                alt={defaultImage.alt || product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-surface-400">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">{product.name}</h3>
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-1">
              €{product.price.toFixed(2)}
            </p>
          </div>
        </motion.div>
      </Link>
    );
  }

  // Default variant
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group bg-white dark:bg-surface-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-[4/5] bg-surface-100 dark:bg-surface-700">
          {defaultImage ? (
            <Image
              src={defaultImage.url}
              alt={defaultImage.alt || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-surface-400">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <Badge variant="danger">-{discountPercent}%</Badge>
            )}
            {product.featured && (
              <Badge variant="primary">Featured</Badge>
            )}
          </div>

          {/* Quick Add Button */}
          {showQuickAdd && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onQuickAdd?.(product);
              }}
              className={clsx(
                'absolute bottom-3 right-3 p-3 rounded-full',
                'bg-white dark:bg-surface-800 shadow-lg',
                'text-surface-600 hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400',
                'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0',
                'transition-all duration-300'
              )}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          )}
        </div>
      </Link>

      <div className="p-4">
        {product.brand && (
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-1">
            {product.brand}
          </p>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-surface-900 dark:text-surface-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            €{product.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-surface-400 line-through">
              €{product.compareAtPrice!.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ProductCard;
