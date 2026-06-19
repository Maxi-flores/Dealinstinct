'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Input, Badge } from '@/components/ui';
import { ProductGrid } from '@/components/shop';
import type { Product, Category } from '@/lib/types';

// Mock data
const allProducts: Product[] = [
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
    tags: ['wireless', 'audio', 'premium'],
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
    tags: ['smartwatch', 'fitness'],
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
    tags: ['bag', 'fashion'],
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
    tags: ['kitchen', 'home'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    sku: 'PROD-005',
    name: 'Minimalist Desk Lamp',
    slug: 'minimalist-desk-lamp',
    description: 'Modern LED desk lamp with adjustable brightness',
    categoryId: 'cat-3',
    categoryName: 'Home & Living',
    brand: 'LightStudio',
    price: 79.00,
    currency: 'EUR',
    images: [{ id: 'img-5', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', position: 0, isDefault: true }],
    status: 'active',
    featured: false,
    tags: ['lighting', 'office'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    sku: 'PROD-006',
    name: 'Leather Wallet',
    slug: 'leather-wallet',
    description: 'Genuine leather wallet with RFID protection',
    categoryId: 'cat-2',
    categoryName: 'Fashion',
    brand: 'LeatherCraft',
    price: 59.00,
    currency: 'EUR',
    images: [{ id: 'img-6', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500', position: 0, isDefault: true }],
    status: 'active',
    featured: false,
    tags: ['accessory', 'leather'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '7',
    sku: 'PROD-007',
    name: 'Fitness Tracker Band',
    slug: 'fitness-tracker-band',
    description: 'Lightweight fitness tracker with heart rate monitor',
    categoryId: 'cat-1',
    categoryName: 'Electronics',
    brand: 'FitTech',
    price: 99.00,
    compareAtPrice: 129.00,
    currency: 'EUR',
    images: [{ id: 'img-7', url: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500', position: 0, isDefault: true }],
    status: 'active',
    featured: false,
    tags: ['fitness', 'wearable'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '8',
    sku: 'PROD-008',
    name: 'Portable Bluetooth Speaker',
    slug: 'portable-bluetooth-speaker',
    description: 'Waterproof speaker with 360-degree sound',
    categoryId: 'cat-1',
    categoryName: 'Electronics',
    brand: 'SoundWave',
    price: 149.00,
    currency: 'EUR',
    images: [{ id: 'img-8', url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', position: 0, isDefault: true }],
    status: 'active',
    featured: false,
    tags: ['audio', 'portable'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const categories: Category[] = [
  { id: 'all', name: 'All', slug: 'all', level: 0, path: [], productCount: allProducts.length, displayOrder: 0, status: 'active', createdAt: '', updatedAt: '' },
  { id: 'cat-1', name: 'Electronics', slug: 'electronics', level: 0, path: [], productCount: 4, displayOrder: 1, status: 'active', createdAt: '', updatedAt: '' },
  { id: 'cat-2', name: 'Fashion', slug: 'fashion', level: 0, path: [], productCount: 2, displayOrder: 2, status: 'active', createdAt: '', updatedAt: '' },
  { id: 'cat-3', name: 'Home & Living', slug: 'home-living', level: 0, path: [], productCount: 2, displayOrder: 3, status: 'active', createdAt: '', updatedAt: '' },
];

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter products
  let filteredProducts = allProducts.filter((product) => {
    // Category filter
    if (selectedCategory !== 'all' && product.categoryId !== selectedCategory) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !product.name.toLowerCase().includes(query) &&
        !product.description?.toLowerCase().includes(query) &&
        !product.brand?.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Price filter
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }

    return true;
  });

  // Sort products
  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
  });

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950">
      {/* Header */}
      <div className="bg-surface-50 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
        <div className="container-wide py-8">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-100">
            All Products
          </h1>
          <p className="mt-2 text-surface-600 dark:text-surface-400">
            {filteredProducts.length} products found
          </p>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Search
                </label>
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                  Categories
                </label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                          : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-xs text-surface-400">{category.productCount}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                  Price Range
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full"
                    placeholder="Min"
                  />
                  <span className="text-surface-400">-</span>
                  <Input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setPriceRange([0, 500]);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </Button>

              {/* Active Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedCategory !== 'all' && (
                  <Badge variant="primary" removable onRemove={() => setSelectedCategory('all')}>
                    {categories.find((c) => c.id === selectedCategory)?.name}
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="primary" removable onRemove={() => setSearchQuery('')}>
                    &quot;{searchQuery}&quot;
                  </Badge>
                )}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-surface-500 dark:text-surface-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products */}
            <ProductGrid
              products={filteredProducts}
              columns={3}
              onQuickAdd={(product) => console.log('Quick add:', product.id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
