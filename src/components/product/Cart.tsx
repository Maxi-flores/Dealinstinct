'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight,
  X,
  ShoppingBag,
  CreditCard,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface CartItem {
  productId: string;
  title: string;
  price: number;
  image?: string;
  quantity: number;
  maxQuantity?: number;
}

interface CartProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Cart - Shopping cart component with modal and sidebar support
 * Handles cart display, quantity updates, and checkout initiation
 */
export default function Cart({ isOpen = false, onClose }: CartProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(isOpen);

  // Load cart from localStorage
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, loading]);

  // Toggle cart visibility
  const toggleCart = useCallback(() => {
    setIsCartOpen(prev => !prev);
    onClose?.();
  }, [onClose]);

  /**
   * Update item quantity
   */
  const updateQuantity = useCallback(async (productId: string, delta: number) => {
    setUpdating(productId);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setItems(prev => {
        return prev.map(item => {
          if (item.productId === productId) {
            const newQuantity = Math.max(1, Math.min(item.quantity + delta, item.maxQuantity || 10));
            return { ...item, quantity: newQuantity };
          }
          return item;
        }).filter(item => item.quantity > 0);
      });
    } finally {
      setUpdating(null);
    }
  }, []);

  /**
   * Remove item from cart
   */
  const removeItem = useCallback(async (productId: string) => {
    setUpdating(productId);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      setItems(prev => prev.filter(item => item.productId !== productId));
    } finally {
      setUpdating(null);
    }
  }, []);

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem('cart');
  }, []);

  /**
   * Calculate totals
   */
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const total = subtotal + shipping;

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Empty cart state
  if (!loading && items.length === 0) {
    return (
      <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white dark:bg-gray-900 
                      shadow-2xl transform transition-transform z-50 
                      ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b 
                        border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Your Cart
            </h2>
            <button
              onClick={toggleCart}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Empty State */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-500 mb-6">
              Looks like you haven't added any items yet.
            </p>
            <Link
              href="/deals"
              onClick={toggleCart}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white 
                        rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white dark:bg-gray-900 
                    shadow-2xl transform transition-transform z-50 
                    ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b 
                      border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Your Cart
            </h2>
            <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900 
                          text-primary-600 dark:text-primary-400 text-sm rounded-full">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            onClick={toggleCart}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className={`flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl
                           transition-opacity ${updating === item.productId ? 'opacity-50' : ''}`}
              >
                {/* Product Image */}
                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden 
                              bg-gray-200 dark:bg-gray-700">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.productId}`}
                    onClick={toggleCart}
                    className="font-medium text-gray-900 dark:text-white 
                             hover:text-primary-600 line-clamp-2"
                  >
                    {item.title}
                  </Link>
                  
                  <p className="text-primary-600 font-bold mt-1">
                    {formatPrice(item.price)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-300 
                                  dark:border-gray-600 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        disabled={updating === item.productId || item.quantity <= 1}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        disabled={
                          updating === item.productId ||
                          Boolean(item.maxQuantity && item.quantity >= item.maxQuantity)
                        }
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      disabled={updating === item.productId}
                      className="p-2 text-gray-400 hover:text-red-500 
                               transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Free Shipping Notice */}
        {subtotal < 50 && (
          <div className="px-6 py-3 bg-yellow-50 dark:bg-yellow-900/20 
                        border-t border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-yellow-800 dark:text-yellow-200">
                Add {formatPrice(50 - subtotal)} more for free shipping!
              </span>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 
                      bg-gray-50 dark:bg-gray-800">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Shipping</span>
              <span className="text-gray-900 dark:text-white">
                {shipping === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  formatPrice(shipping)
                )}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 
                          border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-900 dark:text-white">Total</span>
              <span className="text-primary-600">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <Link
            href="/checkout"
            onClick={toggleCart}
            className="flex items-center justify-center gap-2 w-full py-4 
                      bg-primary-600 text-white rounded-xl font-bold
                      hover:bg-primary-700 transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            Checkout
            <ArrowRight className="w-5 h-5" />
          </Link>

          {/* Continue Shopping */}
          <Link
            href="/deals"
            onClick={toggleCart}
            className="flex items-center justify-center gap-2 w-full mt-3 py-3 
                      text-gray-600 dark:text-gray-400 hover:text-primary-600 
                      transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Cart Summary - Mini cart for navbar
 */
export function CartSummary() {
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setItemCount(count);
      } catch {
        setItemCount(0);
      }
    };

    updateCount();
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', updateCount);
    return () => window.removeEventListener('cartUpdated', updateCount);
  }, []);

  return (
    <div className="relative">
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white 
                       text-xs font-bold rounded-full flex items-center justify-center">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </div>
  );
}

/**
 * Example usage:
 * 
 * // Full cart modal
 * <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
 * 
 * // Mini cart in navbar
 * import { CartSummary } from '@/components/product/Cart';
 * <CartSummary />
 */
