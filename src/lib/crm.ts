import axios, { AxiosInstance, AxiosError } from 'axios';
import { Product, UserProfile, Order } from '@/lib/firebase';

/**
 * CRM API Configuration
 * Connects to Powerframe-CRM backend
 */
const CRM_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_CRM_API_URL || 'http://localhost:5000/api',
  apiKey: process.env.CRM_API_KEY || '',
  timeout: 30000,
};

/**
 * Create axios instance for CRM API
 */
const createCrmClient = (): AxiosInstance => {
  return axios.create({
    baseURL: CRM_CONFIG.baseUrl,
    timeout: CRM_CONFIG.timeout,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': CRM_CONFIG.apiKey,
    },
  });
};

/**
 * Product data format for CRM
 */
export interface CrmProduct {
  externalId?: string;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  category?: string;
  inventory?: number;
  images?: string[];
  status: 'active' | 'inactive' | 'draft';
  metadata?: Record<string, any>;
}

/**
 * Customer data format for CRM
 */
export interface CrmCustomer {
  externalId?: string;
  email: string;
  name: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Sales data format for CRM
 */
export interface CrmSale {
  externalId?: string;
  customerId: string;
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  paymentMethod?: string;
  metadata?: Record<string, any>;
}

/**
 * CRM Response wrapper
 */
export interface CrmResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Product Sync Result
 */
export interface ProductSyncResult {
  synced: number;
  failed: number;
  errors: string[];
}

/**
 * Customer Monitor Data
 */
export interface CustomerMonitorData {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  churnRate: number;
  recentActivity: Array<{
    id: string;
    type: string;
    customer: string;
    timestamp: string;
    details?: string;
  }>;
}

/**
 * Sales Analytics
 */
export interface SalesAnalytics {
  totalSales: number;
  revenue: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: Array<{
    productId: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  salesByDay: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

/**
 * CRM Service class
 * Handles all CRM operations and integrations
 */
export class CrmService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.client = createCrmClient();
    this.apiKey = CRM_CONFIG.apiKey;
  }

  /**
   * Check if CRM is configured
   */
  isConfigured(): boolean {
    return !!(CRM_CONFIG.baseUrl && CRM_CONFIG.apiKey);
  }

  /**
   * Sync product to CRM
   * POST /api/products/sync
   */
  async syncProduct(product: Product): Promise<CrmResponse<{ id: string }>> {
    if (!this.isConfigured()) {
      console.warn('[CrmService] CRM not configured, skipping sync');
      return { success: false, error: 'CRM not configured' };
    }

    try {
      const crmProduct: CrmProduct = {
        externalId: product.id,
        name: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        inventory: product.inStock ? 100 : 0,
        images: product.images,
        status: product.inStock ? 'active' : 'inactive',
        metadata: {
          instinctScore: product.instinctScore,
          discount: product.discount,
          tags: product.tags,
          scrapedFrom: product.scrapedFrom,
        },
      };

      const response = await this.client.post('/products/sync', crmProduct);
      
      console.log(`[CrmService] Product synced: ${product.id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('[CrmService] Product sync failed:', axiosError.message);
      return {
        success: false,
        error: axiosError.message,
      };
    }
  }

  /**
   * Sync multiple products to CRM
   * Batch sync for efficiency
   */
  async syncProducts(products: Product[]): Promise<ProductSyncResult> {
    const result: ProductSyncResult = {
      synced: 0,
      failed: 0,
      errors: [],
    };

    for (const product of products) {
      const response = await this.syncProduct(product);
      if (response.success) {
        result.synced++;
      } else {
        result.failed++;
        result.errors.push(`${product.title}: ${response.error}`);
      }
    }

    console.log(`[CrmService] Batch sync complete: ${result.synced} synced, ${result.failed} failed`);
    return result;
  }

  /**
   * Get all products from CRM
   * GET /api/products
   */
  async getProducts(): Promise<CrmResponse<CrmProduct[]>> {
    if (!this.isConfigured()) {
      return { success: false, error: 'CRM not configured' };
    }

    try {
      const response = await this.client.get('/products');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.message,
      };
    }
  }

  /**
   * Create or update product in CRM
   * POST /api/products/create
   */
  async createProduct(product: CrmProduct): Promise<CrmResponse<{ id: string }>> {
    if (!this.isConfigured()) {
      return { success: false, error: 'CRM not configured' };
    }

    try {
      const response = await this.client.post('/products/create', product);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.message,
      };
    }
  }

  /**
   * Manage product in CRM
   * POST /api/products/manage
   */
  async manageProduct(
    productId: string, 
    action: 'update' | 'delete' | 'activate' | 'deactivate',
    data?: Partial<CrmProduct>
  ): Promise<CrmResponse<{ id: string }>> {
    if (!this.isConfigured()) {
      return { success: false, error: 'CRM not configured' };
    }

    try {
      const response = await this.client.post('/products/manage', {
        productId,
        action,
        data,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.message,
      };
    }
  }

  /**
   * Get customers from CRM
   * GET /api/customers
   */
  async getCustomers(): Promise<CrmResponse<CrmCustomer[]>> {
    if (!this.isConfigured()) {
      return { success: false, error: 'CRM not configured' };
    }

    try {
      const response = await this.client.get('/customers');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.message,
      };
    }
  }

  /**
   * Monitor customers
   * GET /api/customers/monitor
   */
  async monitorCustomers(): Promise<CrmResponse<CustomerMonitorData>> {
    if (!this.isConfigured()) {
      return { success: false, error: 'CRM not configured' };
    }

    try {
      const response = await this.client.get('/customers/monitor');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.message,
      };
    }
  }

  /**
   * Sync customer to CRM
   * POST /api/customers/sync
   */
  async syncCustomer(userProfile: UserProfile): Promise<CrmResponse<{ id: string }>> {
    if (!this.isConfigured()) {
      return { success: false, error: 'CRM not configured' };
    }

    try {
      const crmCustomer: CrmCustomer = {
        externalId: userProfile.id,
        email: userProfile.email,
        name: userProfile.displayName,
        metadata: {
          role: userProfile.role,
          wishlist: userProfile.wishlist,
          orderHistory: userProfile.orderHistory,
          preferences: userProfile.preferences,
        },
      };

      const response = await this.client.post('/customers/sync', crmCustomer);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.message,
      };
    }
  }

  /**
   * Track sale to CRM
   * POST /api/sales/track
   */
  async trackSale(order: Order, userProfile: UserProfile): Promise<CrmResponse<{ id: string }>> {
    if (!this.isConfigured()) {
      return { success: false, error: 'CRM not configured' };
    }

    try {
      const crmStatus: CrmSale['status'] =
        order.status === 'cancelled'
          ? 'cancelled'
          : order.status === 'shipped' || order.status === 'delivered'
            ? 'completed'
            : 'pending';

      const crmSale: CrmSale = {
        externalId: order.id,
        customerId: userProfile.id,
        products: order.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        total: order.total,
        status: crmStatus,
        paymentMethod: order.paymentMethod,
        metadata: {
          shippingAddress: order.shippingAddress,
        },
      };

      const response = await this.client.post('/sales/track', crmSale);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.message,
      };
    }
  }

  /**
   * Get sales analytics
   * GET /api/sales/analytics
   */
  async getSalesAnalytics(period?: 'day' | 'week' | 'month' | 'year'): Promise<CrmResponse<SalesAnalytics>> {
    if (!this.isConfigured()) {
      return { success: false, error: 'CRM not configured' };
    }

    try {
      const response = await this.client.get('/sales/analytics', {
        params: { period },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.message,
      };
    }
  }

  /**
   * Get CRM dashboard data
   * Fetches all analytics in one call
   */
  async getDashboardData(): Promise<{
    customers: CustomerMonitorData | null;
    sales: SalesAnalytics | null;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    const [customersResult, salesResult] = await Promise.all([
      this.monitorCustomers(),
      this.getSalesAnalytics('month'),
    ]);

    return {
      customers: customersResult.success ? customersResult.data || null : null,
      sales: salesResult.success ? salesResult.data || null : null,
      errors,
    };
  }
}

/**
 * Default CRM service instance
 */
export const crmService = new CrmService();

/**
 * React hook for CRM sync
 */
export const useCrmSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncProduct = useCallback(async (product: Product) => {
    setSyncing(true);
    setError(null);
    
    try {
      const result = await crmService.syncProduct(product);
      if (!result.success) {
        setError(result.error || 'Sync failed');
      }
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Sync failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setSyncing(false);
    }
  }, []);

  const syncProducts = useCallback(async (products: Product[]) => {
    setSyncing(true);
    setError(null);
    
    try {
      const result = await crmService.syncProducts(products);
      if (result.failed > 0) {
        setError(`${result.failed} products failed to sync`);
      }
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Batch sync failed';
      setError(errorMsg);
      return { synced: 0, failed: products.length, errors: [errorMsg] };
    } finally {
      setSyncing(false);
    }
  }, []);

  return {
    syncProduct,
    syncProducts,
    syncing,
    error,
    isConfigured: crmService.isConfigured(),
  };
};

/**
 * Example usage:
 * 
 * // Import and use CRM service
 * import { crmService, useCrmSync } from '@/lib/crm';
 * 
 * // In a component
 * const { syncProducts, syncing, error } = useCrmSync();
 * 
 * // Sync product after creation
 * const handleProductCreate = async (product) => {
 *   await createProduct(product);
 *   await syncProduct(product);
 * };
 * 
 * // Get dashboard data
 * const dashboard = await crmService.getDashboardData();
 */

import { useState, useCallback } from 'react';
