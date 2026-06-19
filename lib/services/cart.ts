import { v4 as uuid } from 'uuid';
import { getItem, putItem, updateItem, deleteItem, tables } from '../aws/dynamodb';
import { getProductById } from './products';
import { getInventoryItem } from './inventory';
import type { Cart, CartItem } from '../types';

const TABLE = tables.cart;
const CART_EXPIRY_DAYS = 7;

// Get Cart
export async function getCart(userId?: string, sessionId?: string): Promise<Cart | null> {
  if (userId) {
    return getItem<Cart>(TABLE, { id: `user:${userId}` });
  }
  if (sessionId) {
    return getItem<Cart>(TABLE, { id: `session:${sessionId}` });
  }
  return null;
}

// Create Empty Cart
export async function createCart(userId?: string, sessionId?: string): Promise<Cart> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const cart: Cart = {
    id: userId ? `user:${userId}` : `session:${sessionId || uuid()}`,
    userId,
    sessionId: userId ? undefined : sessionId || uuid(),
    items: [],
    subtotal: 0,
    discount: 0,
    total: 0,
    currency: 'EUR',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  await putItem(TABLE, cart);
  return cart;
}

// Get or Create Cart
export async function getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
  let cart = await getCart(userId, sessionId);

  if (!cart) {
    cart = await createCart(userId, sessionId);
  }

  return cart;
}

// Calculate Cart Totals
function calculateTotals(items: CartItem[], discount: number = 0): { subtotal: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const total = Math.max(0, subtotal - discount);
  return { subtotal, total };
}

// Add Item to Cart
export async function addToCart(
  userId: string | undefined,
  sessionId: string | undefined,
  productId: string,
  quantity: number = 1,
  variantId?: string
): Promise<Cart> {
  const cart = await getOrCreateCart(userId, sessionId);
  const product = await getProductById(productId);

  if (!product) {
    throw new Error('Product not found');
  }

  // Check inventory
  const inventory = await getInventoryItem(productId, variantId);
  if (!inventory || inventory.availableQuantity < quantity) {
    throw new Error('Insufficient stock');
  }

  // Check if item already exists
  const existingIndex = cart.items.findIndex(
    (item) => item.productId === productId && item.variantId === variantId
  );

  const price = product.price;
  const imageUrl = product.images.find((img) => img.isDefault)?.url || product.images[0]?.url;

  if (existingIndex >= 0) {
    // Update existing item
    const newQuantity = cart.items[existingIndex].quantity + quantity;

    if (newQuantity > inventory.availableQuantity) {
      throw new Error('Insufficient stock');
    }

    cart.items[existingIndex].quantity = newQuantity;
    cart.items[existingIndex].total = newQuantity * price;
  } else {
    // Add new item
    const cartItem: CartItem = {
      id: uuid(),
      productId,
      variantId,
      sku: product.sku,
      name: product.name,
      price,
      quantity,
      total: quantity * price,
      imageUrl,
    };
    cart.items.push(cartItem);
  }

  // Update totals
  const { subtotal, total } = calculateTotals(cart.items, cart.discount);
  cart.subtotal = subtotal;
  cart.total = total;
  cart.updatedAt = new Date().toISOString();

  await putItem(TABLE, cart);
  return cart;
}

// Update Cart Item Quantity
export async function updateCartItemQuantity(
  userId: string | undefined,
  sessionId: string | undefined,
  itemId: string,
  quantity: number
): Promise<Cart> {
  const cart = await getCart(userId, sessionId);

  if (!cart) {
    throw new Error('Cart not found');
  }

  const itemIndex = cart.items.findIndex((item) => item.id === itemId);

  if (itemIndex < 0) {
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    // Remove item
    cart.items.splice(itemIndex, 1);
  } else {
    // Check inventory
    const item = cart.items[itemIndex];
    const inventory = await getInventoryItem(item.productId, item.variantId);

    if (!inventory || inventory.availableQuantity < quantity) {
      throw new Error('Insufficient stock');
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].total = quantity * cart.items[itemIndex].price;
  }

  // Update totals
  const { subtotal, total } = calculateTotals(cart.items, cart.discount);
  cart.subtotal = subtotal;
  cart.total = total;
  cart.updatedAt = new Date().toISOString();

  await putItem(TABLE, cart);
  return cart;
}

// Remove Item from Cart
export async function removeFromCart(
  userId: string | undefined,
  sessionId: string | undefined,
  itemId: string
): Promise<Cart> {
  return updateCartItemQuantity(userId, sessionId, itemId, 0);
}

// Clear Cart
export async function clearCart(userId?: string, sessionId?: string): Promise<void> {
  const cart = await getCart(userId, sessionId);
  if (cart) {
    await deleteItem(TABLE, { id: cart.id });
  }
}

// Apply Coupon Code
export async function applyCoupon(
  userId: string | undefined,
  sessionId: string | undefined,
  couponCode: string
): Promise<Cart> {
  const cart = await getCart(userId, sessionId);

  if (!cart) {
    throw new Error('Cart not found');
  }

  // TODO: Implement coupon validation
  // For now, apply a 10% discount for any valid code
  const discount = cart.subtotal * 0.1;

  cart.couponCode = couponCode;
  cart.discount = Math.round(discount * 100) / 100;
  cart.total = cart.subtotal - cart.discount;
  cart.updatedAt = new Date().toISOString();

  await putItem(TABLE, cart);
  return cart;
}

// Remove Coupon
export async function removeCoupon(
  userId: string | undefined,
  sessionId: string | undefined
): Promise<Cart> {
  const cart = await getCart(userId, sessionId);

  if (!cart) {
    throw new Error('Cart not found');
  }

  cart.couponCode = undefined;
  cart.discount = 0;
  cart.total = cart.subtotal;
  cart.updatedAt = new Date().toISOString();

  await putItem(TABLE, cart);
  return cart;
}

// Merge Guest Cart to User Cart
export async function mergeGuestCart(sessionId: string, userId: string): Promise<Cart> {
  const guestCart = await getCart(undefined, sessionId);
  let userCart = await getCart(userId);

  if (!guestCart) {
    return userCart || await createCart(userId);
  }

  if (!userCart) {
    // Transfer guest cart to user
    userCart = {
      ...guestCart,
      id: `user:${userId}`,
      userId,
      sessionId: undefined,
      updatedAt: new Date().toISOString(),
    };
  } else {
    // Merge items
    for (const guestItem of guestCart.items) {
      const existingIndex = userCart.items.findIndex(
        (item) => item.productId === guestItem.productId && item.variantId === guestItem.variantId
      );

      if (existingIndex >= 0) {
        userCart.items[existingIndex].quantity += guestItem.quantity;
        userCart.items[existingIndex].total =
          userCart.items[existingIndex].quantity * userCart.items[existingIndex].price;
      } else {
        userCart.items.push(guestItem);
      }
    }

    // Recalculate totals
    const { subtotal, total } = calculateTotals(userCart.items, userCart.discount);
    userCart.subtotal = subtotal;
    userCart.total = total;
    userCart.updatedAt = new Date().toISOString();
  }

  // Save user cart and delete guest cart
  await putItem(TABLE, userCart);
  await deleteItem(TABLE, { id: guestCart.id });

  return userCart;
}

// Get Cart Item Count
export async function getCartItemCount(userId?: string, sessionId?: string): Promise<number> {
  const cart = await getCart(userId, sessionId);
  if (!cart) return 0;
  return cart.items.reduce((count, item) => count + item.quantity, 0);
}

// Validate Cart Items (check stock availability)
export async function validateCart(
  userId?: string,
  sessionId?: string
): Promise<{ valid: boolean; invalidItems: string[] }> {
  const cart = await getCart(userId, sessionId);

  if (!cart || cart.items.length === 0) {
    return { valid: true, invalidItems: [] };
  }

  const invalidItems: string[] = [];

  for (const item of cart.items) {
    const inventory = await getInventoryItem(item.productId, item.variantId);

    if (!inventory || inventory.availableQuantity < item.quantity) {
      invalidItems.push(item.id);
    }
  }

  return {
    valid: invalidItems.length === 0,
    invalidItems,
  };
}
