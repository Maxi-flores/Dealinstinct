// Product Types
export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  categoryName?: string;
  brand?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  currency: string;
  images: ProductImage[];
  variants?: ProductVariant[];
  attributes?: ProductAttribute[];
  tags?: string[];
  status: 'active' | 'draft' | 'archived';
  featured: boolean;
  displayOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  position: number;
  isDefault: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  attributes: Record<string, string>;
  imageId?: string;
}

export interface ProductAttribute {
  name: string;
  value: string;
  visible: boolean;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  level: number;
  path: string[];
  productCount: number;
  displayOrder: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Inventory Types
export interface InventoryItem {
  productId: string;
  variantId?: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  location?: string;
  warehouseId?: string;
  lastRestockedAt?: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  variantId?: string;
  sku: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer' | 'return';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  reference?: string;
  userId: string;
  createdAt: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  currentQuantity: number;
  threshold: number;
  alertType: 'low_stock' | 'out_of_stock';
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod?: string;
  paymentMethod?: string;
  stripePaymentIntentId?: string;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export type FulfillmentStatus = 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'returned';

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  sku: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  imageUrl?: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

// Cart Types
export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  imageUrl?: string;
  attributes?: Record<string, string>;
}

// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  addresses?: Address[];
  defaultAddressId?: string;
  preferences?: UserPreferences;
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'manager' | 'staff' | 'customer';

export interface UserPreferences {
  currency?: string;
  language?: string;
  notifications?: {
    email?: boolean;
    sms?: boolean;
    marketing?: boolean;
  };
}

// Display/Showroom Types
export interface DisplayCollection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productIds: string[];
  rules?: DisplayRule[];
  layout: DisplayLayout;
  status: 'active' | 'draft' | 'scheduled';
  startDate?: string;
  endDate?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DisplayRule {
  type: 'category' | 'tag' | 'price' | 'brand' | 'attribute';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: string | number | string[];
}

export type DisplayLayout = 'grid' | 'masonry' | 'carousel' | 'featured' | 'banner';

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link?: string;
  buttonText?: string;
  position: 'hero' | 'sidebar' | 'footer' | 'popup';
  status: 'active' | 'inactive' | 'scheduled';
  startDate?: string;
  endDate?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Analytics Types
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  topProducts: TopProduct[];
  recentOrders: Order[];
  inventoryAlerts: StockAlert[];
}

export interface TopProduct {
  productId: string;
  name: string;
  imageUrl?: string;
  totalSold: number;
  revenue: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  tags?: string[];
  status?: string;
  inStock?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
