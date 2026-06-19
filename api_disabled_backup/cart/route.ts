import { NextRequest, NextResponse } from 'next/server';
import {
  getOrCreateCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} from '@/lib/services/cart';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || undefined;
    const sessionId = searchParams.get('sessionId') || undefined;

    if (!userId && !sessionId) {
      return NextResponse.json(
        { success: false, error: 'userId or sessionId required' },
        { status: 400 }
      );
    }

    const cart = await getOrCreateCart(userId, sessionId);

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, sessionId, ...data } = body;

    if (!userId && !sessionId) {
      return NextResponse.json(
        { success: false, error: 'userId or sessionId required' },
        { status: 400 }
      );
    }

    let cart;

    switch (action) {
      case 'add':
        if (!data.productId) {
          return NextResponse.json(
            { success: false, error: 'productId required' },
            { status: 400 }
          );
        }
        cart = await addToCart(userId, sessionId, data.productId, data.quantity || 1, data.variantId);
        break;

      case 'updateQuantity':
        if (!data.itemId || data.quantity === undefined) {
          return NextResponse.json(
            { success: false, error: 'itemId and quantity required' },
            { status: 400 }
          );
        }
        cart = await updateCartItemQuantity(userId, sessionId, data.itemId, data.quantity);
        break;

      case 'remove':
        if (!data.itemId) {
          return NextResponse.json(
            { success: false, error: 'itemId required' },
            { status: 400 }
          );
        }
        cart = await removeFromCart(userId, sessionId, data.itemId);
        break;

      case 'clear':
        await clearCart(userId, sessionId);
        cart = await getOrCreateCart(userId, sessionId);
        break;

      case 'applyCoupon':
        if (!data.couponCode) {
          return NextResponse.json(
            { success: false, error: 'couponCode required' },
            { status: 400 }
          );
        }
        cart = await applyCoupon(userId, sessionId, data.couponCode);
        break;

      case 'removeCoupon':
        cart = await removeCoupon(userId, sessionId);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error('Error processing cart action:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to process cart action' },
      { status: 500 }
    );
  }
}
