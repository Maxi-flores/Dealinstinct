'use client';

import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  Badge,
  Modal,
  ModalFooter,
} from '@/components/ui';
import type { DisplayCollection, Banner } from '@/lib/types';

// Mock display data
const collections: DisplayCollection[] = [
  {
    id: '1',
    name: 'Summer Essentials',
    slug: 'summer-essentials',
    description: 'Top picks for the summer season',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500',
    productIds: ['1', '2', '3', '4'],
    layout: 'grid',
    status: 'active',
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Tech Favorites',
    slug: 'tech-favorites',
    description: 'Best-selling electronics',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500',
    productIds: ['1', '2', '7', '8'],
    layout: 'carousel',
    status: 'active',
    displayOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'Fresh products just added',
    productIds: ['5', '6'],
    layout: 'featured',
    status: 'draft',
    displayOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const banners: Banner[] = [
  {
    id: '1',
    title: 'Summer Sale',
    subtitle: 'Up to 50% off',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    link: '/sale',
    buttonText: 'Shop Now',
    position: 'hero',
    status: 'active',
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Free Shipping',
    subtitle: 'On orders over €50',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
    position: 'hero',
    status: 'active',
    displayOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const layoutOptions = [
  { value: 'grid', label: 'Grid', icon: '▦' },
  { value: 'carousel', label: 'Carousel', icon: '↔' },
  { value: 'featured', label: 'Featured', icon: '★' },
  { value: 'masonry', label: 'Masonry', icon: '▤' },
  { value: 'banner', label: 'Banner', icon: '▬' },
];

export default function DisplayPage() {
  const [activeTab, setActiveTab] = useState<'collections' | 'banners'>('collections');
  const [collectionItems, setCollectionItems] = useState(collections);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    layout: 'grid',
  });

  const handleCreateCollection = () => {
    console.log('Creating collection:', newCollection);
    setIsCreateModalOpen(false);
    setNewCollection({ name: '', description: '', layout: 'grid' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Display Management
          </h1>
          <p className="text-surface-500 dark:text-surface-400">
            Manage collections, banners, and showcase layouts
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Collection
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-surface-200 dark:border-surface-700">
        <button
          onClick={() => setActiveTab('collections')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'collections'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200'
          }`}
        >
          Collections ({collections.length})
        </button>
        <button
          onClick={() => setActiveTab('banners')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'banners'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200'
          }`}
        >
          Banners ({banners.length})
        </button>
      </div>

      {/* Collections Tab */}
      {activeTab === 'collections' && (
        <div className="space-y-4">
          <Card>
            <CardContent>
              <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
                Drag and drop to reorder collections. The order here determines display order on your storefront.
              </p>
              <Reorder.Group
                axis="y"
                values={collectionItems}
                onReorder={setCollectionItems}
                className="space-y-3"
              >
                {collectionItems.map((collection) => (
                  <Reorder.Item
                    key={collection.id}
                    value={collection}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <motion.div
                      layout
                      className="flex items-center gap-4 p-4 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                    >
                      {/* Drag Handle */}
                      <div className="text-surface-400 dark:text-surface-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>

                      {/* Image */}
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-surface-100 dark:bg-surface-700 flex-shrink-0">
                        {collection.image ? (
                          <Image
                            src={collection.image}
                            alt={collection.name}
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

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-surface-900 dark:text-surface-100">
                            {collection.name}
                          </h3>
                          <Badge
                            variant={collection.status === 'active' ? 'success' : 'default'}
                            size="sm"
                          >
                            {collection.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-surface-500 dark:text-surface-400 mb-2 truncate">
                          {collection.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-surface-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            {collection.productIds.length} products
                          </span>
                          <span className="flex items-center gap-1">
                            <span>{layoutOptions.find(l => l.value === collection.layout)?.icon}</span>
                            {collection.layout}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Button>
                      </div>
                    </motion.div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Banners Tab */}
      {activeTab === 'banners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <Card key={banner.id} padding="none" className="overflow-hidden">
              <div className="relative aspect-[21/9]">
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={banner.status === 'active' ? 'success' : 'default'}>
                      {banner.status}
                    </Badge>
                    <Badge variant="secondary">{banner.position}</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-white">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-white/80 text-sm">{banner.subtitle}</p>
                  )}
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="text-sm text-surface-500">
                  {banner.link && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      {banner.link}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">Edit</Button>
                  <Button variant="ghost" size="sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {/* Add New Banner Card */}
          <Card
            padding="none"
            className="flex items-center justify-center aspect-[21/9] border-2 border-dashed border-surface-300 dark:border-surface-600 cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
          >
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-surface-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-surface-500 dark:text-surface-400">Add New Banner</p>
            </div>
          </Card>
        </div>
      )}

      {/* Create Collection Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Collection"
        description="Create a new product collection for your storefront"
      >
        <div className="space-y-4">
          <Input
            label="Collection Name"
            placeholder="e.g., Summer Essentials"
            value={newCollection.name}
            onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
              rows={3}
              placeholder="Describe this collection..."
              value={newCollection.description}
              onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
              Layout Style
            </label>
            <div className="grid grid-cols-5 gap-2">
              {layoutOptions.map((layout) => (
                <button
                  key={layout.value}
                  onClick={() => setNewCollection({ ...newCollection, layout: layout.value })}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    newCollection.layout === layout.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-surface-200 dark:border-surface-700 hover:border-surface-300'
                  }`}
                >
                  <span className="text-2xl">{layout.icon}</span>
                  <p className="text-xs mt-1 text-surface-600 dark:text-surface-400">{layout.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateCollection} disabled={!newCollection.name}>
            Create Collection
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
