import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cart, CartItem, Product } from '@/lib/types';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  isOpen: boolean;

  // Actions
  setCart: (cart: Cart | null) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  addItem: (product: Product, quantity?: number, variantId?: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;

  applyCoupon: (code: string) => void;
  removeCoupon: () => void;

  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
}

const createEmptyCart = (): Cart => ({
  id: `cart-${Date.now()}`,
  items: [],
  subtotal: 0,
  discount: 0,
  total: 0,
  currency: 'EUR',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
});

const recalculateTotals = (items: CartItem[], discount: number = 0): { subtotal: number; total: number } => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const total = Math.max(0, subtotal - discount);
  return { subtotal, total };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,
      isOpen: false,

      setCart: (cart) => set({ cart }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (product, quantity = 1, variantId) => {
        set((state) => {
          const cart = state.cart || createEmptyCart();
          const items = [...cart.items];

          // Find existing item
          const existingIndex = items.findIndex(
            (item) => item.productId === product.id && item.variantId === variantId
          );

          const defaultImage = product.images.find((img) => img.isDefault) || product.images[0];

          if (existingIndex >= 0) {
            // Update existing item
            items[existingIndex] = {
              ...items[existingIndex],
              quantity: items[existingIndex].quantity + quantity,
              total: (items[existingIndex].quantity + quantity) * items[existingIndex].price,
            };
          } else {
            // Add new item
            const newItem: CartItem = {
              id: `item-${Date.now()}`,
              productId: product.id,
              variantId,
              sku: product.sku,
              name: product.name,
              price: product.price,
              quantity,
              total: quantity * product.price,
              imageUrl: defaultImage?.url,
            };
            items.push(newItem);
          }

          const { subtotal, total } = recalculateTotals(items, cart.discount);

          return {
            cart: {
              ...cart,
              items,
              subtotal,
              total,
              updatedAt: new Date().toISOString(),
            },
            isOpen: true,
          };
        });
      },

      updateItemQuantity: (itemId, quantity) => {
        set((state) => {
          if (!state.cart) return state;

          const items = state.cart.items
            .map((item) =>
              item.id === itemId
                ? { ...item, quantity, total: quantity * item.price }
                : item
            )
            .filter((item) => item.quantity > 0);

          const { subtotal, total } = recalculateTotals(items, state.cart.discount);

          return {
            cart: {
              ...state.cart,
              items,
              subtotal,
              total,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      removeItem: (itemId) => {
        set((state) => {
          if (!state.cart) return state;

          const items = state.cart.items.filter((item) => item.id !== itemId);
          const { subtotal, total } = recalculateTotals(items, state.cart.discount);

          return {
            cart: {
              ...state.cart,
              items,
              subtotal,
              total,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      clearCart: () => {
        set({ cart: createEmptyCart() });
      },

      applyCoupon: (code) => {
        set((state) => {
          if (!state.cart) return state;

          // Mock coupon logic - 10% discount
          const discount = state.cart.subtotal * 0.1;
          const total = state.cart.subtotal - discount;

          return {
            cart: {
              ...state.cart,
              couponCode: code,
              discount: Math.round(discount * 100) / 100,
              total: Math.round(total * 100) / 100,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      removeCoupon: () => {
        set((state) => {
          if (!state.cart) return state;

          return {
            cart: {
              ...state.cart,
              couponCode: undefined,
              discount: 0,
              total: state.cart.subtotal,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      getItemCount: () => {
        const cart = get().cart;
        if (!cart) return 0;
        return cart.items.reduce((count, item) => count + item.quantity, 0);
      },

      getSubtotal: () => {
        const cart = get().cart;
        return cart?.subtotal || 0;
      },

      getTotal: () => {
        const cart = get().cart;
        return cart?.total || 0;
      },
    }),
    {
      name: 'dealinstinct-cart',
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);
