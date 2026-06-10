import { NextRequest, NextResponse } from 'next/server';
import { 
  db, 
  COLLECTIONS, 
  Deal,
  isFirebaseConfigured
} from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  getDocs,
  DocumentData 
} from 'firebase/firestore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/deals
 * Fetch scraped deals from Firestore
 * 
 * Query parameters:
 * - source: 'amazon' | 'ebay' | 'walmart' | 'all'
 * - category: string
 * - minDiscount: number
 * - maxPrice: number
 * - limit: number (default 50)
 * - sortBy: 'scrapedAt' | 'discount' | 'price' (default 'scrapedAt')
 * - order: 'asc' | 'desc' (default 'desc')
 */
export async function GET(request: NextRequest) {
  try {
    if (!isFirebaseConfigured || !db) {
      return NextResponse.json({
        success: true,
        count: 0,
        deals: [],
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get('source');
    const category = searchParams.get('category');
    const minDiscount = parseInt(searchParams.get('minDiscount') || '0', 10);
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const sortBy = searchParams.get('sortBy') || 'scrapedAt';
    const order = searchParams.get('order') || 'desc';

    console.log(`[API /deals] Fetching deals - source: ${source}, category: ${category}, minDiscount: ${minDiscount}`);

    // Build query
    const dealsRef = collection(db, COLLECTIONS.DEALS);
    const constraints: any[] = [];

    // Filter by source
    if (source && source !== 'all') {
      constraints.push(where('source', '==', source));
    }

    // Filter by category
    if (category) {
      constraints.push(where('category', '==', category));
    }

    // Filter by active status
    constraints.push(where('isActive', '==', true));

    // Sort
    const sortField = sortBy === 'discount' ? 'discount' : 
                      sortBy === 'price' ? 'productPrice' : 'scrapedAt';
    constraints.push(orderBy(sortField, order as 'asc' | 'desc'));

    // Limit
    constraints.push(firestoreLimit(Math.min(limit, 100)));

    const q = query(dealsRef, ...constraints);
    const snapshot = await getDocs(q);

    let deals = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        scrapedAt: data.scrapedAt?.toDate()?.toISOString() || new Date().toISOString(),
        expiresAt: data.expiresAt?.toDate()?.toISOString() || null,
      } as Deal;
    });

    // Apply client-side filters (Firestore limitations)
    if (minDiscount > 0) {
      deals = deals.filter(d => d.discount >= minDiscount);
    }

    deals = deals.filter(d => d.productPrice <= maxPrice);

    console.log(`[API /deals] Found ${deals.length} deals`);

    return NextResponse.json({
      success: true,
      count: deals.length,
      deals,
    });
  } catch (error) {
    console.error('[API /deals] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * Example API calls:
 * 
 * GET /api/deals?source=amazon&limit=20
 * GET /api/deals?minDiscount=20&sortBy=discount&order=desc
 * GET /api/deals?category=electronics&maxPrice=100
 */
