'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useFirebaseAuth } from '@/lib/useFirebaseAuth';
import { CartSummary } from '@/components/product/Cart';
import { 
  Search, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  User, 
  LogOut,
  LayoutDashboard,
  Package,
  Settings,
  Heart,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  onCartOpen?: () => void;
}

/**
 * Navbar - Main navigation component
 * Sticky header with logo, search, cart, user menu
 */
export default function Navbar({ onCartOpen }: NavbarProps) {
  const { user, userProfile, logout } = useFirebaseAuth();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle scroll state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Handle search submit
   */
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/deals?search=${encodeURIComponent(searchQuery)}`;
    }
  }, [searchQuery]);

  /**
   * Handle logout
   */
  const handleLogout = useCallback(async () => {
    await logout();
    setIsUserMenuOpen(false);
  }, [logout]);

  /**
   * Toggle theme
   */
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
                    ${isScrolled 
                      ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md' 
                      : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 
                          rounded-xl flex items-center justify-center text-white font-bold text-xl">
              DI
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
              DealInstinct
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/deals" 
              className="text-gray-600 dark:text-gray-300 hover:text-primary-600 
                       dark:hover:text-primary-400 font-medium transition-colors"
            >
              Deals
            </Link>
            <Link 
              href="/deals?category=electronics" 
              className="text-gray-600 dark:text-gray-300 hover:text-primary-600 
                       dark:hover:text-primary-400 font-medium transition-colors"
            >
              Electronics
            </Link>
            <Link 
              href="/deals?category=fashion" 
              className="text-gray-600 dark:text-gray-300 hover:text-primary-600 
                       dark:hover:text-primary-400 font-medium transition-colors"
            >
              Fashion
            </Link>
            <Link 
              href="/deals?category=home" 
              className="text-gray-600 dark:text-gray-300 hover:text-primary-600 
                       dark:hover:text-primary-400 font-medium transition-colors"
            >
              Home
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search deals..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 
                         border-0 rounded-xl text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-primary-500 placeholder-gray-500"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg 
                       text-gray-600 dark:text-gray-300 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onCartOpen}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg 
                       text-gray-600 dark:text-gray-300 transition-colors"
              aria-label="Open cart"
            >
              <CartSummary />
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 
                           dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  )}
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 
                                rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 
                                py-2 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 
                               dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    
                    <Link
                      href="/wishlist"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 
                               dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Heart className="w-4 h-4" />
                      Wishlist
                    </Link>

                    {userProfile?.role === 'admin' && (
                      <>
                        <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 
                                   dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                        <Link
                          href="/admin/products"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 
                                   dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Package className="w-4 h-4" />
                          Manage Products
                        </Link>
                      </>
                    )}

                    <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-red-600 
                               hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium
                         hover:bg-primary-700 transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search deals..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 
                           border-0 rounded-xl text-gray-900 dark:text-white"
                />
              </div>
            </form>

            {/* Mobile Links */}
            <div className="space-y-2">
              <Link
                href="/deals"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 
                         hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                All Deals
              </Link>
              <Link
                href="/deals?category=electronics"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 
                         hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Electronics
              </Link>
              <Link
                href="/deals?category=fashion"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 
                         hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Fashion
              </Link>
              <Link
                href="/deals?category=home"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 
                         hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Home & Garden
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

/**
 * Example usage:
 * 
 * import Navbar from '@/components/Navbar';
 * 
 * // In layout
 * <Navbar onCartOpen={() => setIsCartOpen(true)} />
 */
