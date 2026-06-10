'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, calculateDiscount } from '@/lib/firebase';
import { useFirebaseAuth } from '@/lib/useFirebaseAuth';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw,
  ChevronRight,
  Plus,
  Minus,
  Loader2,
  Check
} from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  relatedProducts?: Product[];
}

/**
 * ProductDetail - Dynamic product page component
 * Shows product details, images, add-to-cart, and related products
 */
export default function ProductDetail({ product, relatedProducts = [] }: ProductDetailProps) {
  const { user } = useFirebaseAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  /**
   * Handle quantity change
   */
  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(prev + delta, product.inStock ? 10 : 0)));
  }, [product.inStock]);

  /**
   * Handle add to cart
   */
  const handleAddToCart = useCallback(async () => {
    setIsAddingToCart(true);
    
    try {
      // Simulate API call - in real app, would call cart API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Save to localStorage for persistence
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingIndex = cart.findIndex((item: any) => item.productId === product.id);
      
      if (existingIndex >= 0) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push({
          productId: product.id,
          title: product.title,
          price: product.price,
          image: product.images[0],
          quantity,
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  }, [product, quantity]);

  /**
   * Handle wishlist toggle
   */
  const handleWishlistToggle = useCallback(() => {
    if (!user) {
      // Redirect to login or show modal
      return;
    }
    setIsWishlisted(prev => !prev);
  }, [user]);

  /**
   * Handle share
   */
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out this deal: ${product.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }, [product.title]);

  // Calculate discount
  const discount = product.originalPrice 
    ? calculateDiscount(product.originalPrice, product.price)
    : product.discount || 0;

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/products" className="hover:text-primary-600">Products</Link>
        <ChevronRight className="w-4 h-4" />
        <Link 
          href={`/products?category=${product.category}`} 
          className="hover:text-primary-600 capitalize"
        >
          {product.category}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white truncate max-w-[200px]">
          {product.title}
        </span>
      </nav>

      {/* Product Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            {product.images[selectedImageIndex] ? (
              <Image
                src={product.images[selectedImageIndex]}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No Image
              </div>
            )}
            
            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 
                            rounded-full font-bold text-sm">
                -{discount}% OFF
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden 
                             border-2 transition-colors flex-shrink-0
                             ${selectedImageIndex === index 
                               ? 'border-primary-500' 
                               : 'border-transparent hover:border-gray-300'}`}
                >
                  <Image
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title and Brand */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {product.title}
            </h1>
            {product.scrapedFrom && (
              <p className="text-sm text-gray-500">
                Scraped from: {product.scrapedFrom}
              </p>
            )}
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= product.rating! 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.rating} ({product.reviewCount || 0} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="text-lg text-green-600 font-medium">
                  Save {formatPrice(product.originalPrice - product.price)}
                </span>
              </>
            )}
          </div>

          {/* Instinct Score */}
          {product.instinctScore !== undefined && (
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary-50 
                          to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 
                          rounded-xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 
                            to-accent-500 flex items-center justify-center text-white font-bold">
                {product.instinctScore}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Instinct Score</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our AI-powered deal quality rating
                </p>
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {product.inStock ? (
              <>
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-green-600 font-medium">In Stock</span>
              </>
            ) : (
              <span className="text-red-500 font-medium">Out of Stock</span>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Quantity:
            </span>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 10}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || isAddingToCart}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 
                        rounded-xl font-bold text-lg transition-all
                        ${product.inStock 
                          ? 'bg-primary-600 text-white hover:bg-primary-700' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >
              {isAddingToCart ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : addedToCart ? (
                <>
                  <Check className="w-5 h-5" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </>
              )}
            </button>

            <button
              onClick={handleWishlistToggle}
              className={`p-4 border-2 rounded-xl transition-colors
                        ${isWishlisted 
                          ? 'border-red-500 bg-red-50 text-red-500' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-red-500'}`}
            >
              <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-4 border-2 border-gray-300 dark:border-gray-600 
                        rounded-xl hover:border-primary-500 transition-colors"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <Truck className="w-6 h-6 mx-auto mb-2 text-primary-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Free Shipping</p>
            </div>
            <div className="text-center">
              <Shield className="w-6 h-6 mx-auto mb-2 text-primary-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Secure Payment</p>
            </div>
            <div className="text-center">
              <RotateCcw className="w-6 h-6 mx-auto mb-2 text-primary-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Easy Returns</p>
            </div>
          </div>

          {/* Description */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Description
            </h3>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {product.description || 'No description available.'}
            </p>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/products?tag=${tag}`}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 
                           dark:text-gray-400 rounded-full text-sm hover:bg-gray-200 
                           dark:hover:bg-gray-700 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Related Products
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((related) => (
              <Link
                key={related.id}
                href={`/products/${related.id}`}
                className="group"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden 
                              bg-gray-100 dark:bg-gray-800 mb-3">
                  {related.images[0] && (
                    <Image
                      src={related.images[0]}
                      alt={related.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                  {related.discount && related.discount > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white 
                                   px-2 py-1 rounded-full text-xs font-bold">
                      -{related.discount}%
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white 
                             group-hover:text-primary-600 transition-colors line-clamp-2">
                  {related.title}
                </h3>
                <p className="text-primary-600 font-bold mt-1">
                  {formatPrice(related.price)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Example usage:
 * 
 * // In a page component
 * const { product, loading } = useProductBySlug(slug);
 * const { products: related } = useProductsByCategory(product?.category || '');
 * 
 * if (loading) return <Loading />;
 * return <ProductDetail product={product} relatedProducts={related} />;
 */
