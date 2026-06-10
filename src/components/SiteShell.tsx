'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Cart from '@/components/product/Cart';

interface SiteShellProps {
  children: React.ReactNode;
}

/**
 * SiteShell - client wrapper that coordinates shared layout state
 * Keeps the cart drawer closed by default and opens it from the navbar.
 */
export function SiteShell({ children }: SiteShellProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <Navbar onCartOpen={() => setIsCartOpen(true)} />
      <main className="pt-16">
        {children}
      </main>
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
