'use client';

import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import type { Cart, CartItem } from '@/lib/types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart | null;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
}: CartDrawerProps) {
  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Drawer */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white dark:bg-surface-900 shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700">
                      <Dialog.Title className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                        Shopping Cart
                        {items.length > 0 && (
                          <span className="ml-2 text-sm font-normal text-surface-500">
                            ({items.length} items)
                          </span>
                        )}
                      </Dialog.Title>
                      <button
                        type="button"
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:text-surface-300 dark:hover:bg-surface-800 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                      {isEmpty ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <svg
                            className="w-16 h-16 text-surface-300 dark:text-surface-600 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                          <p className="text-surface-900 dark:text-surface-100 font-medium mb-2">
                            Your cart is empty
                          </p>
                          <p className="text-surface-500 dark:text-surface-400 text-sm mb-6">
                            Add some products to get started
                          </p>
                          <Button variant="primary" onClick={onClose}>
                            Continue Shopping
                          </Button>
                        </div>
                      ) : (
                        <AnimatePresence mode="popLayout">
                          {items.map((item) => (
                            <CartItemRow
                              key={item.id}
                              item={item}
                              onUpdateQuantity={onUpdateQuantity}
                              onRemove={onRemoveItem}
                            />
                          ))}
                        </AnimatePresence>
                      )}
                    </div>

                    {/* Footer */}
                    {!isEmpty && (
                      <div className="border-t border-surface-200 dark:border-surface-700 px-6 py-4">
                        {/* Subtotal */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-surface-600 dark:text-surface-400">Subtotal</span>
                          <span className="text-surface-900 dark:text-surface-100 font-medium">
                            €{cart?.subtotal.toFixed(2)}
                          </span>
                        </div>

                        {/* Discount */}
                        {cart?.discount && cart.discount > 0 && (
                          <div className="flex items-center justify-between mb-2 text-green-600 dark:text-green-400">
                            <span>Discount</span>
                            <span>-€{cart.discount.toFixed(2)}</span>
                          </div>
                        )}

                        {/* Total */}
                        <div className="flex items-center justify-between mb-4 pt-2 border-t border-surface-200 dark:border-surface-700">
                          <span className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                            Total
                          </span>
                          <span className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                            €{cart?.total.toFixed(2)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                          <Link href="/checkout" onClick={onClose}>
                            <Button variant="primary" fullWidth size="lg">
                              Checkout
                            </Button>
                          </Link>
                          <Button variant="outline" fullWidth onClick={onClose}>
                            Continue Shopping
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex gap-4 py-4 border-b border-surface-100 dark:border-surface-800 last:border-0"
    >
      {/* Image */}
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-surface-100 dark:bg-surface-700 flex-shrink-0">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-surface-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
          {item.name}
        </h4>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
          €{item.price.toFixed(2)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center border border-surface-200 dark:border-surface-700 rounded-lg">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="p-1.5 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="w-8 text-center text-sm font-medium text-surface-900 dark:text-surface-100">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="p-1.5 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="p-1.5 text-surface-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="text-right">
        <span className="text-sm font-semibold text-surface-900 dark:text-surface-100">
          €{item.total.toFixed(2)}
        </span>
      </div>
    </motion.div>
  );
}

export default CartDrawer;
