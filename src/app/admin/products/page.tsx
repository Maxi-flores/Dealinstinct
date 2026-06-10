'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/lib/useFirebaseAuth';
import { useProductsQuery } from '@/lib/useProductsQuery';
import { useCrmSync } from '@/lib/crm';
import ProductForm from '@/components/product/ProductForm';
import { Product } from '@/lib/firebase';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  Package,
  Search,
  Filter,
  X,
  ExternalLink
} from 'lucide-react';

interface AdminProductsPageProps {}

/**
 * AdminProductsPage - Product management for admins
 * Create, edit, delete products and sync to CRM
 */
export default function AdminProductsPage({}: AdminProductsPageProps) {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useFirebaseAuth();
  const { products, loading, fetchProducts, deleteProduct } = useProductsQuery();
  const { syncProduct, syncing, isConfigured } = useCrmSync();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || userProfile?.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [user, userProfile, authLoading, router]);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Handle create new
  const handleCreate = useCallback(() => {
    setEditingProduct(null);
    setShowForm(true);
  }, []);

  // Handle edit
  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  }, []);

  // Handle delete
  const handleDelete = useCallback(async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setDeletingId(productId);
    try {
      await deleteProduct(productId);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeletingId(null);
    }
  }, [deleteProduct]);

  // Handle form success
  const handleFormSuccess = useCallback(() => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts(true);
  }, [fetchProducts]);

  // Handle CRM sync
  const handleSyncToCrm = useCallback(async (product: Product) => {
    await syncProduct(product);
    alert('Product synced to CRM');
  }, [syncProduct]);

  // Categories for filter
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'toys', label: 'Toys' },
  ];

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // Not authorized
  if (!user || userProfile?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Manage Products
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create, edit, and manage your product catalog
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* CRM Status */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                CRM: {isConfigured ? 'Connected' : 'Not Configured'}
              </span>
            </div>

            {/* Add Product Button */}
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white 
                        rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 border 
                        border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 
                         rounded-xl dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                         rounded-xl dark:bg-gray-700 dark:text-white"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 
                        dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Products Found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || categoryFilter 
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first product'}
              </p>
              {!searchQuery && !categoryFilter && (
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 
                            text-white rounded-xl font-medium hover:bg-primary-700"
                >
                  <Plus className="w-5 h-5" />
                  Add Product
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 
                                  dark:text-white">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 
                                  dark:text-white">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 
                                  dark:text-white">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 
                                  dark:text-white">Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 
                                  dark:text-white">Score</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 
                                  dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-600 overflow-hidden">
                            {product.images?.[0] && (
                              <img 
                                src={product.images[0]} 
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                              {product.title}
                            </p>
                            {product.scrapedFrom && (
                              <p className="text-xs text-gray-500">
                                From: {product.scrapedFrom}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm capitalize">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-primary-600">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          product.inStock 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {product.instinctScore !== undefined && (
                          <span className="inline-flex items-center justify-center w-8 h-8 
                                        bg-gradient-to-br from-primary-500 to-accent-500 
                                        rounded-full text-white font-bold text-sm">
                            {product.instinctScore}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* View */}
                          <button
                            onClick={() => router.push(`/products/${product.id}`)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="View"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            title="Delete"
                          >
                            {deletingId === product.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-red-500" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 
                          dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <ProductForm
                product={editingProduct || undefined}
                onSuccess={handleFormSuccess}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Example usage:
 * 
 * Protected admin route at /admin/products
 * - Lists all products with search/filter
 * - Create new products with form
 * - Edit existing products
 * - Delete products
 * - Sync to CRM on save
 * - Requires admin role
 */
