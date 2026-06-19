'use client';

import { useState } from 'react';
import { Header, Footer } from '@/components/layout';
import { CartDrawer } from '@/components/shop';
import type { Cart } from '@/lib/types';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);

  // Mock cart data for demo
  const mockCart: Cart = {
    id: 'cart-1',
    items: [],
    subtotal: 0,
    discount: 0,
    total: 0,
    currency: 'EUR',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    // TODO: Implement cart update
    console.log('Update quantity:', itemId, quantity);
  };

  const handleRemoveItem = (itemId: string) => {
    // TODO: Implement item removal
    console.log('Remove item:', itemId);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        cartItemCount={cart?.items.length || 0}
        onCartClick={() => setIsCartOpen(true)}
        onSearchClick={() => console.log('Search clicked')}
        isLoggedIn={false}
      />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart || mockCart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
}
