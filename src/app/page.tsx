'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight, 
  Zap, 
  TrendingUp, 
  Shield, 
  Clock,
  Sparkles,
  ExternalLink,
  Star,
  Loader2
} from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  url: string;
  source: string;
  scrapedAt: string;
}

interface Category {
  name: string;
  slug: string;
  icon: string;
  color: string;
}

/**
 * HomePage - Main landing page with hero, deals, and features
 */
export default function HomePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);

  const categories: Category[] = [
    { name: 'Electronics', slug: 'electronics', icon: '📱', color: 'bg-blue-500' },
    { name: 'Fashion', slug: 'fashion', icon: '👗', color: 'bg-pink-500' },
    { name: 'Home & Garden', slug: 'home', icon: '🏠', color: 'bg-green-500' },
    { name: 'Sports', slug: 'sports', icon: '⚽', color: 'bg-orange-500' },
    { name: 'Beauty', slug: 'beauty', icon: '💄', color: 'bg-purple-500' },
    { name: 'Toys', slug: 'toys', icon: '🧸', color: 'bg-yellow-500' },
  ];

  // Fetch deals on mount
  useEffect(() => {
    fetchDeals();
  }, []);

  // Fetch deals from API
  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/deals?limit=20&sortBy=discount&order=desc');
      const data = await response.json();
      if (data.success) {
        setDeals(data.deals || []);
      }
    } catch (error) {
      console.error('Failed to fetch deals:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger manual scrape
  const handleScrape = useCallback(async () => {
    setScraping(true);
    try {
      const response = await fetch('/api/scrape?source=all&save=true&limit=50');
      const data = await response.json();
      if (data.success) {
        await fetchDeals();
      }
    } catch (error) {
      console.error('Failed to scrape:', error);
    } finally {
      setScraping(false);
    }
  }, [fetchDeals]);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Feature cards
  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI-Powered Scoring',
      description: 'Our Instinct Score algorithm finds the best deals for you',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Real-Time Deals',
      description: 'Scraped directly from Amazon, eBay, and Walmart',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Verified Savings',
      description: 'Track price history and verify authentic discounts',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Flash Deals',
      description: 'Limited-time offers that won\'t last long',
    },
  ];

  // Sample trending products (fallback when no deals)
  const sampleProducts = [
    {
      id: '1',
      title: 'Apple AirPods Pro (2nd Gen)',
      price: 189.99,
      originalPrice: 249.00,
      discount: 24,
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400',
      url: '',
      source: 'amazon',
    },
    {
      id: '2',
      title: 'Sony WH-1000XM5 Headphones',
      price: 298.00,
      originalPrice: 399.00,
      discount: 25,
      image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
      url: '',
      source: 'amazon',
    },
    {
      id: '3',
      title: 'Samsung 65" OLED Smart TV',
      price: 1299.99,
      originalPrice: 1799.99,
      discount: 28,
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400',
      url: '',
      source: 'walmart',
    },
    {
      id: '4',
      title: 'Nintendo Switch OLED',
      price: 299.99,
      originalPrice: 349.99,
      discount: 14,
      image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400',
      url: '',
      source: 'ebay',
    },
    {
      id: '5',
      title: 'Dyson V15 Vacuum',
      price: 599.99,
      originalPrice: 749.99,
      discount: 20,
      image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400',
      url: '',
      source: 'amazon',
    },
    {
      id: '6',
      title: 'Apple Watch Series 9',
      price: 329.00,
      originalPrice: 399.00,
      discount: 18,
      image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400',
      url: '',
      source: 'amazon',
    },
    {
      id: '7',
      title: 'PlayStation 5 Console',
      price: 449.99,
      originalPrice: 499.99,
      discount: 10,
      image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
      url: '',
      source: 'walmart',
    },
    {
      id: '8',
      title: 'Bose QuietComfort Earbuds',
      price: 199.00,
      originalPrice: 279.00,
      discount: 29,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
      url: '',
      source: 'amazon',
    },
  ];

  const displayDeals = deals.length > 0 ? deals : sampleProducts;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 
                         text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-repeat" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 
                          animate-fade-in">
              Find Deals Before Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r 
                            from-yellow-300 to-orange-400">
                Instinct Kicks In
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Discover the best deals from Amazon, eBay, Walmart and more. 
              Our AI-powered scoring helps you find the biggest savings instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/deals"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 
                          bg-white text-primary-700 rounded-xl font-bold text-lg
                          hover:bg-gray-100 transition-colors shadow-lg"
              >
                <Zap className="w-5 h-5" />
                Browse All Deals
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={handleScrape}
                disabled={scraping}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 
                          bg-primary-800/50 text-white rounded-xl font-bold text-lg
                          hover:bg-primary-800/70 transition-colors border border-primary-500"
              >
                {scraping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <TrendingUp className="w-5 h-5" />
                )}
                {scraping ? 'Scraping...' : 'Refresh Deals'}
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-primary-200">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Verified Deals</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Updated Daily</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>50K+ Happy Shoppers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
                  className="fill-gray-50 dark:fill-gray-900" />
          </svg>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/deals?category=${category.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 text-center
                         border border-gray-200 dark:border-gray-700 hover:shadow-lg
                         hover:border-primary-300 dark:hover:border-primary-600
                         transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white 
                             group-hover:text-primary-600 transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Deals Grid Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Trending Deals
            </h2>
            <Link
              href="/deals"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 
                       font-medium transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-xl aspect-square mb-4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {displayDeals.slice(0, 8).map((deal) => (
                <Link
                  key={deal.id}
                  href={deal.url || `/products/${deal.id}`}
                  target={deal.url ? '_blank' : '_self'}
                  className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden
                           border border-gray-200 dark:border-gray-700 hover:shadow-xl
                           transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={deal.image || '/placeholder-product.jpg'}
                      alt={deal.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 
                                  rounded-full text-sm font-bold">
                      -{deal.discount}%
                    </div>
                    <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 
                                  px-2 py-1 rounded-full text-xs font-medium capitalize">
                      {deal.source}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white 
                                 line-clamp-2 group-hover:text-primary-600 transition-colors mb-2">
                      {deal.title}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-primary-600">
                        {formatPrice(deal.price)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(deal.originalPrice)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Why Choose DealInstinct?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center
                         border border-gray-200 dark:border-gray-700 hover:shadow-lg
                         transition-all duration-300"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-primary-100 dark:bg-primary-900 
                              rounded-2xl flex items-center justify-center text-primary-600">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Start Saving?
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Join thousands of smart shoppers who never miss a deal.
          </p>
          <Link
            href="/deals"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 
                      bg-white text-primary-700 rounded-xl font-bold text-lg
                      hover:bg-gray-100 transition-colors shadow-lg"
          >
            Explore All Deals
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 
                              rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  DI
                </div>
                <span className="text-xl font-bold text-white">DealInstinct</span>
              </div>
              <p className="text-sm">
                Find the best deals before your instinct kicks in. 
                AI-powered deal discovery for smart shoppers.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/deals" className="hover:text-white">All Deals</Link></li>
                <li><Link href="/deals?category=electronics" className="hover:text-white">Electronics</Link></li>
                <li><Link href="/deals?category=fashion" className="hover:text-white">Fashion</Link></li>
                <li><Link href="/deals?category=home" className="hover:text-white">Home</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/profile" className="hover:text-white">Profile</Link></li>
                <li><Link href="/wishlist" className="hover:text-white">Wishlist</Link></li>
                <li><Link href="/auth/login" className="hover:text-white">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            © {new Date().getFullYear()} DealInstinct. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Example usage:
 * 
 * This is the main landing page featuring:
 * - Hero section with CTA
 * - Category grid
 * - Trending deals grid
 * - Features section
 * - Footer
 * 
 * Deals are fetched from /api/deals or use sample data as fallback
 */
