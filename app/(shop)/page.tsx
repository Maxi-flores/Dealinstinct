'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { ProductCard, CategoryCard } from '@/components/shop';
import type { Product, Category } from '@/lib/types';

// Mock data for demo
const featuredProducts: Product[] = [
  {
    id: '1',
    sku: 'PROD-001',
    name: 'Premium Wireless Headphones',
    slug: 'premium-wireless-headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    categoryId: 'cat-1',
    categoryName: 'Electronics',
    brand: 'AudioTech',
    price: 299.99,
    compareAtPrice: 399.99,
    currency: 'EUR',
    images: [{ id: 'img-1', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', position: 0, isDefault: true }],
    status: 'active',
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    sku: 'PROD-002',
    name: 'Smart Watch Pro',
    slug: 'smart-watch-pro',
    description: 'Advanced smartwatch with health monitoring',
    categoryId: 'cat-1',
    categoryName: 'Electronics',
    brand: 'TechWear',
    price: 449.00,
    currency: 'EUR',
    images: [{ id: 'img-2', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', position: 0, isDefault: true }],
    status: 'active',
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    sku: 'PROD-003',
    name: 'Designer Backpack',
    slug: 'designer-backpack',
    description: 'Stylish and functional backpack for everyday use',
    categoryId: 'cat-2',
    categoryName: 'Fashion',
    brand: 'UrbanStyle',
    price: 129.00,
    compareAtPrice: 159.00,
    currency: 'EUR',
    images: [{ id: 'img-3', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', position: 0, isDefault: true }],
    status: 'active',
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    sku: 'PROD-004',
    name: 'Ceramic Coffee Set',
    slug: 'ceramic-coffee-set',
    description: 'Handcrafted ceramic coffee set for the perfect brew',
    categoryId: 'cat-3',
    categoryName: 'Home & Living',
    brand: 'Artisan Home',
    price: 89.00,
    currency: 'EUR',
    images: [{ id: 'img-4', url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500', position: 0, isDefault: true }],
    status: 'active',
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest gadgets and tech',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500',
    level: 0,
    path: [],
    productCount: 124,
    displayOrder: 1,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-2',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Trending styles and accessories',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500',
    level: 0,
    path: [],
    productCount: 256,
    displayOrder: 2,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-3',
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Beautiful home essentials',
    image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500',
    level: 0,
    path: [],
    productCount: 89,
    displayOrder: 3,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-4',
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Gear for active lifestyles',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500',
    level: 0,
    path: [],
    productCount: 67,
    displayOrder: 4,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-mesh opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-surface-950" />

        {/* Content */}
        <div className="relative container-wide py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1.5 text-sm font-medium text-white/90 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              New Collection Available
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Discover Premium
              <span className="block text-white/80">Products</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-lg">
              Explore our curated collection of high-quality products. From electronics to fashion, find everything you need.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-white/90">
                  Shop Now
                </Button>
              </Link>
              <Link href="/categories">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Browse Categories
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full hidden lg:block"
        >
          <div className="relative w-full h-full">
            <div className="absolute top-10 right-20 w-72 h-72 bg-white/10 rounded-3xl backdrop-blur-sm transform rotate-12" />
            <div className="absolute bottom-20 right-40 w-56 h-56 bg-white/10 rounded-3xl backdrop-blur-sm transform -rotate-6" />
          </div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white dark:bg-surface-950">
        <div className="container-wide">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-surface-900 dark:text-surface-100">
                Shop by Category
              </h2>
              <p className="mt-2 text-surface-600 dark:text-surface-400">
                Find what you&apos;re looking for
              </p>
            </div>
            <Link href="/categories">
              <Button variant="ghost">
                View All
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-surface-50 dark:bg-surface-900">
        <div className="container-wide">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-surface-900 dark:text-surface-100">
                Featured Products
              </h2>
              <p className="mt-2 text-surface-600 dark:text-surface-400">
                Handpicked items just for you
              </p>
            </div>
            <Link href="/products?featured=true">
              <Button variant="ghost">
                View All
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickAdd={(p) => console.log('Quick add:', p.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Banner Section */}
      <section className="py-16 bg-white dark:bg-surface-950">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Banner 1 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative rounded-2xl overflow-hidden aspect-[2/1] bg-gradient-to-br from-primary-500 to-primary-700"
            >
              <div className="absolute inset-0 p-8 flex flex-col justify-center">
                <span className="text-primary-200 text-sm font-medium mb-2">Limited Time</span>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Summer Sale</h3>
                <p className="text-primary-100 mb-4">Up to 50% off on selected items</p>
                <Link href="/sale">
                  <Button className="bg-white text-primary-600 hover:bg-white/90 w-fit">
                    Shop Sale
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Banner 2 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative rounded-2xl overflow-hidden aspect-[2/1] bg-gradient-to-br from-accent-500 to-accent-700"
            >
              <div className="absolute inset-0 p-8 flex flex-col justify-center">
                <span className="text-accent-200 text-sm font-medium mb-2">New Arrivals</span>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Fresh Collection</h3>
                <p className="text-accent-100 mb-4">Check out our latest products</p>
                <Link href="/products?sort=newest">
                  <Button className="bg-white text-accent-600 hover:bg-white/90 w-fit">
                    Explore New
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-surface-900 dark:bg-surface-950">
        <div className="container-tight text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Stay in the Loop
            </h2>
            <p className="text-surface-400 mb-8 max-w-md mx-auto">
              Subscribe to our newsletter for exclusive deals, new arrivals, and insider updates.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-surface-800 border border-surface-700 text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
              <Button size="lg" className="whitespace-nowrap">
                Subscribe
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </>
  );
}
