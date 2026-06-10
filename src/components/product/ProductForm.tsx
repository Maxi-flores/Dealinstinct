'use client';

import { useState, useCallback } from 'react';
import { Product } from '@/lib/firebase';
import { useProductsQuery } from '@/lib/useProductsQuery';
import Image from 'next/image';
import { 
  Loader2, 
  Upload, 
  X, 
  Save, 
  Trash2, 
  Plus,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Star
} from 'lucide-react';

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * ProductForm - Admin dashboard form for creating/editing products
 * Handles product creation, editing, image uploads, and category assignment
 */
export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { createProduct, updateProduct, uploadProductImage, loading, error } = useProductsQuery();
  
  const [formData, setFormData] = useState<Partial<Product>>({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.price || 0,
    originalPrice: product?.originalPrice || 0,
    images: product?.images || [],
    category: product?.category || 'general',
    tags: product?.tags || [],
    inStock: product?.inStock ?? true,
    featured: product?.featured ?? false,
    rating: product?.rating || 0,
    reviewCount: product?.reviewCount || 0,
  });

  const [newTag, setNewTag] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  /**
   * Handle form field changes
   */
  const handleChange = useCallback((
    field: keyof Product, 
    value: string | number | boolean | string[]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Handle number input changes with validation
   */
  const handleNumberChange = useCallback((field: 'price' | 'originalPrice', value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numValue }));
  }, []);

  /**
   * Add a new tag to the product
   */
  const addTag = useCallback(() => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag('');
    }
  }, [newTag, formData.tags]);

  /**
   * Remove a tag from the product
   */
  const removeTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove),
    }));
  }, []);

  /**
   * Handle image file selection and upload
   */
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const tempId = product?.id || 'temp-' + Date.now();
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large (max 5MB)`);
        }

        try {
          const url = await uploadProductImage(tempId, file);
          uploadedUrls.push(url);
        } catch (uploadError) {
          console.error(`Failed to upload ${file.name}:`, uploadError);
          // Use placeholder for failed uploads
          uploadedUrls.push(`/placeholder-product.jpg`);
        }
      }

      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls],
      }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  }, [product?.id, uploadProductImage]);

  /**
   * Remove an image from the product
   */
  const removeImage = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      // Validate required fields
      if (!formData.title?.trim()) {
        throw new Error('Product title is required');
      }
      if (!formData.price || formData.price <= 0) {
        throw new Error('Valid product price is required');
      }
      if (!formData.category) {
        throw new Error('Product category is required');
      }

      if (product?.id) {
        // Update existing product
        await updateProduct(product.id, formData);
        console.log('Product updated successfully');
      } else {
        // Create new product
        await createProduct(formData as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>);
        console.log('Product created successfully');
      }

      onSuccess?.();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  }, [formData, product, createProduct, updateProduct, onSuccess]);

  // Categories for dropdown
  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'beauty', label: 'Beauty & Health' },
    { value: 'toys', label: 'Toys & Games' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'books', label: 'Books & Media' },
    { value: 'food', label: 'Food & Grocery' },
    { value: 'general', label: 'General' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Display */}
      {(formError || error) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <X className="w-5 h-5 flex-shrink-0" />
          <span>{formError || error}</span>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Product Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     dark:bg-gray-800 dark:text-white"
          placeholder="Enter product title"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     dark:bg-gray-800 dark:text-white"
          placeholder="Enter product description"
        />
      </div>

      {/* Price Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Price *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              id="price"
              value={formData.price}
              onChange={(e) => handleNumberChange('price', e.target.value)}
              required
              min="0"
              step="0.01"
              className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         dark:bg-gray-800 dark:text-white"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Original Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              id="originalPrice"
              value={formData.originalPrice}
              onChange={(e) => handleNumberChange('originalPrice', e.target.value)}
              min="0"
              step="0.01"
              className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         dark:bg-gray-800 dark:text-white"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <Tag className="w-4 h-4 inline mr-1" />
          Category *
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     dark:bg-gray-800 dark:text-white"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tags
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       dark:bg-gray-800 dark:text-white"
            placeholder="Add a tag"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                       rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900 
                         text-primary-700 dark:text-primary-300 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <ImageIcon className="w-4 h-4 inline mr-1" />
          Product Images
        </label>
        
        {/* Image Upload Button */}
        <label className="flex items-center justify-center w-full h-32 border-2 border-dashed 
                        border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer 
                        hover:border-primary-500 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploadingImages}
          />
          <div className="text-center">
            {uploadingImages ? (
              <Loader2 className="w-8 h-8 mx-auto text-primary-500 animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload images</span>
              </>
            )}
          </div>
        </label>

        {/* Image Previews */}
        {formData.images && formData.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            {formData.images.map((url, index) => (
              <div key={index} className="relative group aspect-square">
                <Image
                  src={url}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full 
                             opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rating (Optional) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Star className="w-4 h-4 inline mr-1" />
            Rating (0-5)
          </label>
          <input
            type="number"
            id="rating"
            value={formData.rating}
            onChange={(e) => handleChange('rating', parseFloat(e.target.value) || 0)}
            min="0"
            max="5"
            step="0.1"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="reviewCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Review Count
          </label>
          <input
            type="number"
            id="reviewCount"
            value={formData.reviewCount}
            onChange={(e) => handleChange('reviewCount', parseInt(e.target.value) || 0)}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.inStock}
            onChange={(e) => handleChange('inStock', e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">In Stock</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => handleChange('featured', e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Featured Product</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={saving || loading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 
                     bg-primary-600 text-white rounded-lg font-medium
                     hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
        >
          {saving || loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {product ? 'Update Product' : 'Create Product'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 
                       dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 
                       dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

/**
 * Example usage:
 * 
 * // Create new product
 * <ProductForm onSuccess={() => router.push('/admin/products')} />
 * 
 * // Edit existing product
 * <ProductForm 
 *   product={existingProduct} 
 *   onSuccess={() => router.refresh()} 
 * />
 */
