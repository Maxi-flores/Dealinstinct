import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';

/**
 * Firebase configuration object
 * Uses environment variables for security
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId
);

/**
 * Firebase app instance singleton
 * Prevents multiple initializations in development hot-reload
 */
let app: FirebaseApp | undefined;

/**
 * Initialize Firebase app
 * Check if already initialized to avoid duplicate app errors
 */
if (isFirebaseConfigured) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
}

/**
 * Firebase Authentication instance
 * Handles user sign-in/sign-up with multiple providers
 */
export const auth: Auth = app ? getAuth(app) : (undefined as unknown as Auth);

/**
 * Firestore database instance
 * NoSQL database for storing products, users, deals
 */
export const db: Firestore = app ? getFirestore(app) : (undefined as unknown as Firestore);

/**
 * Firebase Storage instance
 * For uploading product images and user uploads
 */
export const storage: FirebaseStorage = app ? getStorage(app) : (undefined as unknown as FirebaseStorage);

/**
 * Firebase Cloud Functions instance
 * For server-side operations like scraping triggers
 */
export const functions: Functions = app ? getFunctions(app) : (undefined as unknown as Functions);

/**
 * Export the app for admin SDK initialization if needed
 */
export default app;

/**
 * Firestore collection names
 * Centralized constants for database collections
 */
export const COLLECTIONS = {
  PRODUCTS: 'products',
  USERS: 'users',
  DEALS: 'deals',
  ORDERS: 'orders',
  CATEGORIES: 'categories',
  REVIEWS: 'reviews',
  CART: 'cart',
} as const;

/**
 * Product document interface
 * Represents a product in the deals platform
 */
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  tags: string[];
  scrapedFrom?: string;
  dealUrl?: string;
  discount?: number;
  instinctScore?: number;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  createdAt: Date;
  updatedAt: Date;
  featured?: boolean;
}

/**
 * User profile interface
 * Extended user information stored in Firestore
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'admin' | 'moderator';
  createdAt: Date;
  lastLogin?: Date;
  wishlist?: string[];
  cartItems?: CartItem[];
  orderHistory?: string[];
  preferences?: UserPreferences;
}

/**
 * Cart item interface
 * Items in user's shopping cart
 */
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  addedAt: Date;
}

/**
 * User preferences interface
 * User-specific settings and preferences
 */
export interface UserPreferences {
  notifications: boolean;
  newsletter: boolean;
  darkMode: boolean;
  favoriteCategories: string[];
}

/**
 * Deal document interface
 * Represents a scraped deal from external sites
 */
export interface Deal {
  id: string;
  source: 'amazon' | 'ebay' | 'walmart' | 'other';
  sourceUrl: string;
  productTitle: string;
  productPrice: number;
  originalPrice: number;
  discount: number;
  productImage: string;
  scrapedAt: Date;
  expiresAt?: Date;
  category: string;
  isActive: boolean;
}

/**
 * Order interface
 * Represents a completed purchase
 */
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  title: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Category interface
 * Product categories for filtering
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount: number;
  parentId?: string;
  isActive: boolean;
}

/**
 * Admin role check
 * Verifies if user has admin privileges
 */
export const isAdmin = (userRole?: string): boolean => {
  return userRole === 'admin' || userRole === 'moderator';
};

/**
 * Calculate instinct score
 * AI-like scoring algorithm for deal quality
 * Based on discount percentage, price, and popularity
 */
export const calculateInstinctScore = (
  discount: number,
  price: number,
  reviewCount: number = 0
): number => {
  // Base score from discount (0-40 points)
  const discountScore = Math.min(discount, 40);
  
  // Price score - cheaper is better (0-30 points)
  const priceScore = Math.max(0, 30 - (price / 10));
  
  // Popularity based on reviews (0-30 points)
  const popularityScore = Math.min(30, reviewCount / 10);
  
  return Math.round(discountScore + priceScore + popularityScore);
};

/**
 * Calculate discount percentage
 */
export const calculateDiscount = (original: number, current: number): number => {
  if (original <= 0) return 0;
  return Math.round(((original - current) / original) * 100);
};
