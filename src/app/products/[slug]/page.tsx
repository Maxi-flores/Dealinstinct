import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db, COLLECTIONS, isFirebaseConfigured } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ProductDetail from '@/components/product/ProductDetail';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const productsRef = doc(db, COLLECTIONS.PRODUCTS, slug);
    const productDoc = await getDoc(productsRef);
    
    if (productDoc.exists()) {
      const product = productDoc.data();
      return {
        title: `${product.title} | DealInstinct`,
        description: product.description || `Get this deal on ${product.title} at DealInstinct`,
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
  
  return {
    title: 'Product Not Found | DealInstinct',
  };
}

/**
 * Product Page - Dynamic product detail page
 * Fetches product by slug (product ID) from Firestore
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  
  try {
    // Fetch product from Firestore by ID
    const productsRef = doc(db, COLLECTIONS.PRODUCTS, slug);
    const productDoc = await getDoc(productsRef);
    
    if (!productDoc.exists()) {
      notFound();
    }
    
    const productData = productDoc.data();
    
    // Transform to Product type
    const product = {
      id: productDoc.id,
      title: productData.title,
      description: productData.description,
      price: productData.price,
      originalPrice: productData.originalPrice,
      images: productData.images || [],
      category: productData.category,
      tags: productData.tags || [],
      scrapedFrom: productData.scrapedFrom,
      dealUrl: productData.dealUrl,
      discount: productData.discount,
      instinctScore: productData.instinctScore,
      rating: productData.rating,
      reviewCount: productData.reviewCount,
      inStock: productData.inStock ?? true,
      createdAt: productData.createdAt?.toDate() || new Date(),
      updatedAt: productData.updatedAt?.toDate() || new Date(),
      featured: productData.featured,
    };
    
    // Fetch related products from same category
    // Note: In production, you'd use a separate query
    
    return (
      <ProductDetail 
        product={product}
        relatedProducts={[]}
      />
    );
  } catch (error) {
    console.error('Error loading product:', error);
    notFound();
  }
}

/**
 * Generate static params for SSG
 * Pre-render known product pages at build time
 */
export async function generateStaticParams() {
  if (!isFirebaseConfigured) {
    return [];
  }

  try {
    const { collection, getDocs, limit } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase');
    
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const snapshot = await getDocs(productsRef);
    
    return snapshot.docs.slice(0, 20).map((doc) => ({
      slug: doc.id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

/**
 * Example usage:
 * 
 * URL: /products/abc123
 * Fetches product with ID "abc123" from Firestore
 * Renders ProductDetail component with full product info
 */
