'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { 
  db, 
  storage, 
  COLLECTIONS, 
  Product, 
  calculateInstinctScore,
  calculateDiscount 
} from './firebase';

/**
 * Query options for fetching products
 */
export interface ProductQueryOptions {
  category?: string;
  featured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'createdAt' | 'instinctScore' | 'discount';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  startAfter?: DocumentData;
}

/**
 * Hook for fetching and managing products
 * Provides CRUD operations and queries
 */
export const useProductsQuery = (initialOptions?: ProductQueryOptions) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [options, setOptions] = useState<ProductQueryOptions>(initialOptions || {});

  /**
   * Build query constraints from options
   */
  const buildQueryConstraints = useCallback((): QueryConstraint[] => {
    const constraints: QueryConstraint[] = [];

    if (options.category) {
      constraints.push(where('category', '==', options.category));
    }

    if (options.featured) {
      constraints.push(where('featured', '==', true));
    }

    if (options.minPrice !== undefined) {
      constraints.push(where('price', '>=', options.minPrice));
    }

    if (options.search) {
      // Note: Firestore doesn't support full-text search
      // This would require a search service like Algolia
      // For now, we'll filter client-side after fetching
    }

    // Sort options
    const sortField = options.sortBy || 'createdAt';
    const sortDirection = options.sortOrder === 'asc' ? 'asc' : 'desc';
    constraints.push(orderBy(sortField, sortDirection));

    // Limit
    const limitCount = options.limit || 20;
    constraints.push(limit(limitCount));

    return constraints;
  }, [options]);

  /**
   * Fetch products from Firestore
   */
  const fetchProducts = useCallback(async (reset: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const productsRef = collection(db, COLLECTIONS.PRODUCTS);
      const constraints = buildQueryConstraints();
      
      let q = query(productsRef, ...constraints);
      
      // Handle startAfter for pagination
      if (options.startAfter && !reset) {
        q = query(productsRef, ...constraints);
      }

      const querySnapshot = await getDocs(q);
      
      const fetchedProducts: Product[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Product;
      });

      // Client-side filtering for search (Firestore limitation)
      let filteredProducts = fetchedProducts;
      if (options.search) {
        const searchLower = options.search.toLowerCase();
        filteredProducts = fetchedProducts.filter(
          (p) =>
            p.title.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower) ||
            p.tags.some((t) => t.toLowerCase().includes(searchLower))
        );
      }

      // Client-side filtering for price range
      if (options.minPrice !== undefined) {
        filteredProducts = filteredProducts.filter((p) => p.price >= options.minPrice!);
      }
      if (options.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter((p) => p.price <= options.maxPrice!);
      }

      if (reset) {
        setProducts(filteredProducts);
      } else {
        setProducts((prev) => [...prev, ...filteredProducts]);
      }

      setHasMore(querySnapshot.docs.length === (options.limit || 20));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [options, buildQueryConstraints]);

  /**
   * Fetch single product by ID
   */
  const fetchProduct = useCallback(async (productId: string): Promise<Product | null> => {
    try {
      const productDoc = await getDoc(doc(db, COLLECTIONS.PRODUCTS, productId));
      if (productDoc.exists()) {
        const data = productDoc.data();
        return {
          id: productDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Product;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, []);

  /**
   * Create new product
   */
  const createProduct = useCallback(async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const productsRef = collection(db, COLLECTIONS.PRODUCTS);
      
      // Calculate instinct score if not provided
      const discount = productData.originalPrice 
        ? calculateDiscount(productData.originalPrice, productData.price)
        : 0;
      const instinctScore = productData.instinctScore || 
        calculateInstinctScore(discount, productData.price, productData.reviewCount || 0);

      const newProduct = {
        ...productData,
        instinctScore,
        discount,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(productsRef, newProduct);
      return { id: docRef.id, ...newProduct };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update product
   */
  const updateProduct = useCallback(async (productId: string, productData: Partial<Product>) => {
    setLoading(true);
    setError(null);
    try {
      const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
      
      // Recalculate instinct score if price changed
      const updates = {
        ...productData,
        updatedAt: serverTimestamp(),
      };

      if (productData.price || productData.originalPrice) {
        const docSnap = await getDoc(productRef);
        if (docSnap.exists()) {
          const existing = docSnap.data();
          const price = productData.price || existing.price;
          const originalPrice = productData.originalPrice || existing.originalPrice;
          const discount = calculateDiscount(originalPrice, price);
          const instinctScore = calculateInstinctScore(discount, price, productData.reviewCount || existing.reviewCount || 0);
          Object.assign(updates, { discount, instinctScore });
        }
      }

      await updateDoc(productRef, updates);
      return { id: productId, ...updates };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete product
   */
  const deleteProduct = useCallback(async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Delete associated images from storage
      const product = await fetchProduct(productId);
      if (product?.images) {
        for (const imageUrl of product.images) {
          try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          } catch (e) {
            console.warn('Failed to delete image:', imageUrl);
          }
        }
      }

      await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, productId));
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProduct]);

  /**
   * Upload product image
   */
  const uploadProductImage = useCallback(async (
    productId: string, 
    file: File
  ): Promise<string> => {
    try {
      const storageRef = ref(storage, `products/${productId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Update query options and refetch
   */
  const setQueryOptions = useCallback((newOptions: ProductQueryOptions) => {
    setOptions(newOptions);
    fetchProducts(true);
  }, [fetchProducts]);

  /**
   * Load more products (pagination)
   */
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const lastProduct = products[products.length - 1];
      if (lastProduct) {
        setOptions((prev) => ({ ...prev, startAfter: lastProduct }));
      }
    }
  }, [loading, hasMore, products]);

  // Initial fetch
  useEffect(() => {
    fetchProducts(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    products,
    loading,
    error,
    hasMore,
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    setQueryOptions,
    loadMore,
  };
};

/**
 * Hook for featured products only
 */
export const useFeaturedProducts = (limit: number = 10) => {
  return useProductsQuery({ featured: true, limit });
};

/**
 * Hook for products by category
 */
export const useProductsByCategory = (category: string, limit: number = 20) => {
  return useProductsQuery({ category, limit });
};

/**
 * Hook for searching products
 */
export const useProductSearch = (searchQuery: string) => {
  return useProductsQuery({ search: searchQuery, limit: 50 });
};

/**
 * Hook for product by slug
 * Uses URL-friendly slug for SSR/SSG
 */
export const useProductBySlug = (slug: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBySlug = async () => {
      setLoading(true);
      try {
        const productsRef = collection(db, COLLECTIONS.PRODUCTS);
        const q = query(productsRef, where('slug', '==', slug), limit(1));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          setProduct({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Product);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBySlug();
    }
  }, [slug]);

  return { product, loading, error };
};

/**
 * Example usage:
 * 
 * const { 
 *   products, 
 *   loading, 
 *   error,
 *   fetchProducts,
 *   createProduct,
 *   updateProduct,
 *   deleteProduct 
 * } = useProductsQuery({ category: 'electronics', featured: true });
 * 
 * // Featured products
 * const { products: featuredProducts } = useFeaturedProducts(10);
 * 
 * // Products by category
 * const { products: electronics } = useProductsByCategory('electronics');
 * 
 * // Search
 * const { products: searchResults } = useProductSearch('laptop');
 */
