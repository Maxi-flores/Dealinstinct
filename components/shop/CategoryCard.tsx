'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Category } from '@/lib/types';

interface CategoryCardProps {
  category: Category;
  variant?: 'default' | 'large' | 'minimal';
}

export function CategoryCard({ category, variant = 'default' }: CategoryCardProps) {
  if (variant === 'minimal') {
    return (
      <Link href={`/categories/${category.slug}`}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center gap-3 p-4"
        >
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-surface-100 dark:bg-surface-700">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-surface-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-surface-700 dark:text-surface-300 text-center">
            {category.name}
          </span>
        </motion.div>
      </Link>
    );
  }

  if (variant === 'large') {
    return (
      <Link href={`/categories/${category.slug}`}>
        <motion.div
          whileHover={{ y: -8 }}
          className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface-100 dark:bg-surface-700"
        >
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-500 to-accent-500">
              <span className="text-6xl font-bold text-white/20">{category.name[0]}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
            {category.description && (
              <p className="text-white/80 text-sm line-clamp-2 mb-2">{category.description}</p>
            )}
            <span className="text-white/60 text-sm">{category.productCount} products</span>
          </div>
        </motion.div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/categories/${category.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-700"
      >
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
            <span className="text-4xl font-bold text-white/30">{category.name[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-semibold text-white">{category.name}</h3>
          <span className="text-white/70 text-sm">{category.productCount} products</span>
        </div>
      </motion.div>
    </Link>
  );
}

export default CategoryCard;
