import { NextRequest, NextResponse } from 'next/server';
import { defaultScraper, UnifiedScraper, ScrapedProduct } from '@/lib/scraper';
import { 
  db, 
  COLLECTIONS, 
  calculateInstinctScore, 
  calculateDiscount,
  Deal 
} from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

const SUPPORTED_SCRAPE_SOURCES = ['amazon', 'ebay', 'walmart'] as const;
type SupportedScrapeSource = (typeof SUPPORTED_SCRAPE_SOURCES)[number];

const isSupportedScrapeSource = (
  source: string | null
): source is SupportedScrapeSource => {
  return source !== null && SUPPORTED_SCRAPE_SOURCES.includes(source as SupportedScrapeSource);
};

/**
 * GET /api/scrape
 * Scrape deals from configured sources
 * 
 * Query parameters:
 * - source: 'all' | 'amazon' | 'ebay' | 'walmart'
 * - save: 'true' | 'false' (whether to save to Firestore)
 * - limit: number (max products to return)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get('source') as 'all' | 'amazon' | 'ebay' | 'walmart' | null;
    const saveToDb = searchParams.get('save') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    console.log(`[API /scrape] Starting scrape - source: ${source || 'all'}, save: ${saveToDb}`);

    // Create scraper instance
    const scraper: UnifiedScraper = new UnifiedScraper();
    
    // Scrape based on source
    let scrapeResult;
    if (isSupportedScrapeSource(source)) {
      scrapeResult = await scraper.scrapeSource(source);
    } else {
      scrapeResult = await scraper.scrapeAll();
    }

    if (!scrapeResult.success || !scrapeResult.data) {
      return NextResponse.json({
        success: false,
        error: scrapeResult.error || 'Scraping failed',
        source: scrapeResult.source,
      }, { status: 500 });
    }

    // Limit results
    const products = scrapeResult.data.slice(0, limit);

    // Optionally save to Firestore
    let savedCount = 0;
    const deals: Partial<Deal>[] = [];
    
    if (saveToDb) {
      try {
        // Clear old deals from same source before saving new ones
        if (source && source !== 'all') {
          const oldDealsQuery = query(
            collection(db, COLLECTIONS.DEALS),
            where('source', '==', source)
          );
          const oldDeals = await getDocs(oldDealsQuery);
          
          const batch = writeBatch(db);
          for (const dealDoc of oldDeals.docs) {
            batch.delete(doc(db, COLLECTIONS.DEALS, dealDoc.id));
          }
          await batch.commit();
          console.log(`[API /scrape] Cleared old deals for source: ${source}`);
        }

        // Save new deals
        for (const product of products) {
          const deal: Omit<Deal, 'id'> = {
            source: product.source as 'amazon' | 'ebay' | 'walmart' | 'other',
            sourceUrl: product.url,
            productTitle: product.title,
            productPrice: product.price,
            originalPrice: product.originalPrice || product.price,
            discount: product.discount || calculateDiscount(product.originalPrice || product.price, product.price),
            productImage: product.image,
            scrapedAt: serverTimestamp() as any,
            category: 'general',
            isActive: true,
          };

          const docRef = await addDoc(collection(db, COLLECTIONS.DEALS), deal);
          deals.push({ ...deal, id: docRef.id });
          savedCount++;
        }

        console.log(`[API /scrape] Saved ${savedCount} deals to Firestore`);
      } catch (dbError) {
        console.error('[API /scrape] Failed to save to Firestore:', dbError);
        // Continue with response even if save failed
      }
    }

    return NextResponse.json({
      success: true,
      source: scrapeResult.source,
      scrapedAt: scrapeResult.scrapedAt,
      count: products.length,
      savedCount,
      products: products.map(p => ({
        title: p.title,
        price: p.price,
        originalPrice: p.originalPrice,
        discount: p.discount,
        image: p.image,
        url: p.url,
        source: p.source,
        rating: p.rating,
        reviewCount: p.reviewCount,
      })),
    });
  } catch (error) {
    console.error('[API /scrape] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * POST /api/scrape
 * Scrape a custom URL
 * 
 * Body:
 * {
 *   url: string,
 *   save?: boolean,
 *   category?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, save = false, category = 'general' } = body;

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required',
      }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Invalid URL format',
      }, { status: 400 });
    }

    console.log(`[API /scrape] Custom URL scrape: ${url}`);

    // Use generic scraper for custom URLs
    const scraper = new UnifiedScraper();
    const result = await scraper.scrapeUrl(url);

    if (!result.success || !result.data) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Scraping failed',
      }, { status: 500 });
    }

    const products = result.data;

    // Optionally save to Firestore
    let savedCount = 0;
    if (save) {
      try {
        for (const product of products) {
          const deal: Omit<Deal, 'id'> = {
            source: 'other',
            sourceUrl: product.url,
            productTitle: product.title,
            productPrice: product.price,
            originalPrice: product.originalPrice || product.price,
            discount: product.discount || 0,
            productImage: product.image,
            scrapedAt: serverTimestamp() as any,
            category,
            isActive: true,
          };

          await addDoc(collection(db, COLLECTIONS.DEALS), deal);
          savedCount++;
        }
        console.log(`[API /scrape] Saved ${savedCount} deals from custom URL`);
      } catch (dbError) {
        console.error('[API /scrape] Failed to save deals:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      url,
      source: result.source,
      scrapedAt: result.scrapedAt,
      count: products.length,
      savedCount,
      products: products.map(p => ({
        title: p.title,
        price: p.price,
        originalPrice: p.originalPrice,
        discount: p.discount,
        image: p.image,
        url: p.url,
        source: p.source,
      })),
    });
  } catch (error) {
    console.error('[API /scrape] POST Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * DELETE /api/scrape
 * Clear scraped deals from database
 * 
 * Query parameters:
 * - source: 'all' | 'amazon' | 'ebay' | 'walmart'
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get('source') || 'all';

    console.log(`[API /scrape] Clearing deals for source: ${source}`);

    let q;
    if (source === 'all') {
      q = query(collection(db, COLLECTIONS.DEALS));
    } else {
      q = query(
        collection(db, COLLECTIONS.DEALS),
        where('source', '==', source)
      );
    }

    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    let deletedCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
      batch.delete(doc(db, COLLECTIONS.DEALS, docSnapshot.id));
      deletedCount++;
    }

    await batch.commit();

    console.log(`[API /scrape] Deleted ${deletedCount} deals`);

    return NextResponse.json({
      success: true,
      deletedCount,
      source,
    });
  } catch (error) {
    console.error('[API /scrape] DELETE Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * Example API calls:
 * 
 * GET /api/scrape?source=amazon&save=true&limit=50
 * GET /api/scrape?source=all&limit=100
 * POST /api/scrape { "url": "https://example.com/deals", "save": true }
 * DELETE /api/scrape?source=amazon
 */
