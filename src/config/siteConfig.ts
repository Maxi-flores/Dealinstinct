/**
 * Site Configuration
 * Branch point for multiple unique sites
 * Each variant can override colors, categories, and features
 */

export interface SiteConfig {
  name: string;
  description: string;
  logo: string;
  primaryColor: string;
  accentColor: string;
  categories: CategoryConfig[];
  features: FeatureConfig;
  social: SocialConfig;
}

export interface CategoryConfig {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  featured: boolean;
}

export interface FeatureConfig {
  scraping: boolean;
  crm: boolean;
  auth: boolean;
  cart: boolean;
  ratings: boolean;
}

export interface SocialConfig {
  twitter?: string;
  facebook?: string;
  instagram?: string;
  email?: string;
}

/**
 * Default DealInstinct configuration
 */
export const defaultConfig: SiteConfig = {
  name: 'DealInstinct',
  description: 'Find Deals Before Your Instinct Kicks In',
  logo: '/logo.svg',
  primaryColor: '#0ea5e9', // primary-500
  accentColor: '#a855f7', // accent-500
  categories: [
    { id: 'electronics', name: 'Electronics', slug: 'electronics', icon: '📱', color: '#3b82f6', featured: true },
    { id: 'fashion', name: 'Fashion', slug: 'fashion', icon: '👗', color: '#ec4899', featured: true },
    { id: 'home', name: 'Home & Garden', slug: 'home', icon: '🏠', color: '#22c55e', featured: true },
    { id: 'sports', name: 'Sports & Outdoors', slug: 'sports', icon: '⚽', color: '#f97316', featured: true },
    { id: 'beauty', name: 'Beauty & Health', slug: 'beauty', icon: '💄', color: '#a855f7', featured: true },
    { id: 'toys', name: 'Toys & Games', slug: 'toys', icon: '🧸', color: '#eab308', featured: false },
    { id: 'automotive', name: 'Automotive', slug: 'automotive', icon: '🚗', color: '#ef4444', featured: false },
    { id: 'books', name: 'Books & Media', slug: 'books', icon: '📚', color: '#6366f1', featured: false },
  ],
  features: {
    scraping: true,
    crm: true,
    auth: true,
    cart: true,
    ratings: true,
  },
  social: {
    twitter: 'https://twitter.com/dealinstinct',
    email: 'contact@dealinstinct.com',
  },
};

/**
 * Fashion variant configuration
 * Branch point: Override for fashion variant
 */
export const fashionVariant: SiteConfig = {
  ...defaultConfig,
  name: 'FashionFind',
  description: 'Discover the best fashion deals and trends',
  primaryColor: '#ec4899', // pink-500
  accentColor: '#f97316', // orange-500
  categories: [
    { id: 'womens', name: "Women's Fashion", slug: 'womens', icon: '👗', color: '#ec4899', featured: true },
    { id: 'mens', name: "Men's Fashion", slug: 'mens', icon: '👔', color: '#3b82f6', featured: true },
    { id: 'shoes', name: 'Shoes & Footwear', slug: 'shoes', icon: '👟', color: '#22c55e', featured: true },
    { id: 'accessories', name: 'Accessories', slug: 'accessories', icon: '👜', color: '#f97316', featured: true },
    { id: 'jewelry', name: 'Jewelry', slug: 'jewelry', icon: '💎', color: '#a855f7', featured: false },
  ],
};

/**
 * Tech variant configuration
 * Branch point: Override for tech/gadgets variant
 */
export const techVariant: SiteConfig = {
  ...defaultConfig,
  name: 'TechDeals',
  description: 'Best tech deals and gadgets',
  primaryColor: '#6366f1', // indigo-500
  accentColor: '#14b8a6', // teal-500
  categories: [
    { id: 'laptops', name: 'Laptops', slug: 'laptops', icon: '💻', color: '#6366f1', featured: true },
    { id: 'phones', name: 'Phones', slug: 'phones', icon: '📱', color: '#3b82f6', featured: true },
    { id: 'gaming', name: 'Gaming', slug: 'gaming', icon: '🎮', color: '#ef4444', featured: true },
    { id: 'audio', name: 'Audio', slug: 'audio', icon: '🎧', color: '#14b8a6', featured: true },
    { id: 'smart-home', name: 'Smart Home', slug: 'smart-home', icon: '🏠', color: '#22c55e', featured: false },
  ],
};

/**
 * Get site configuration based on variant
 */
export const getSiteConfig = (variant?: string): SiteConfig => {
  switch (variant) {
    case 'fashion':
      return fashionVariant;
    case 'tech':
      return techVariant;
    default:
      return defaultConfig;
  }
};

/**
 * Get current variant from environment or default
 */
export const getCurrentVariant = (): string => {
  return process.env.NEXT_PUBLIC_SITE_VARIANT || 'default';
};

/**
 * Current site config
 */
export const siteConfig = getSiteConfig(getCurrentVariant());

/**
 * Example usage:
 * 
 * import { siteConfig, getSiteConfig } from '@/config/siteConfig';
 * 
 * // Access config
 * <h1>{siteConfig.name}</h1>
 * 
 * // Branch by variant
 * const config = getSiteConfig('fashion');
 * <h1>{config.name}</h1>
 */

export default siteConfig;
