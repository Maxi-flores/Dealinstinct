import axios, { AxiosInstance, AxiosError } from 'axios';
import * as cheerio from 'cheerio';

/**
 * User agent strings for rotating to avoid blocking
 * Mimics real browser requests
 */
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

/**
 * Request delay configuration
 * Helps avoid rate limiting and anti-scraping measures
 */
const DELAY_MS = 2000; // 2 seconds between requests
const MAX_RETRIES = 3;
const TIMEOUT_MS = 30000; // 30 seconds timeout

/**
 * Scraped product interface
 * Represents a product scraped from external sites
 */
export interface ScrapedProduct {
  title: string;
  price: number;
  originalPrice?: number;
  currency: string;
  image: string;
  url: string;
  rating?: number;
  reviewCount?: number;
  discount?: number;
  inStock?: boolean;
  source: string;
  scrapedAt: Date;
}

/**
 * Scrape result with success/error info
 */
export interface ScrapeResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  source: string;
  scrapedAt: Date;
  count?: number;
}

/**
 * Configuration for axios instance
 */
interface AxiosConfig {
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Create configured axios instance with anti-scraping measures
 */
const createAxiosInstance = (config?: AxiosConfig): AxiosInstance => {
  return axios.create({
    timeout: config?.timeout || TIMEOUT_MS,
    headers: {
      'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
      ...config?.headers,
    },
    // Follow redirects
    maxRedirects: 5,
  });
};

/**
 * Rate limiter to prevent too many requests
 */
class RateLimiter {
  private lastRequest: number = 0;
  private delay: number;

  constructor(delayMs: number = DELAY_MS) {
    this.delay = delayMs;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    
    if (timeSinceLastRequest < this.delay) {
      await new Promise(resolve => 
        setTimeout(resolve, this.delay - timeSinceLastRequest)
      );
    }
    
    this.lastRequest = Date.now();
  }
}

/**
 * Global rate limiter instance
 */
const rateLimiter = new RateLimiter();

/**
 * Retry helper with exponential backoff
 */
const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> => {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      await rateLimiter.wait();
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt + 1} failed:`, lastError.message);
      
      // Exponential backoff
      if (attempt < retries - 1) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }
  
  throw lastError;
};

/**
 * Parse price string to number
 * Handles various currency formats
 */
export const parsePrice = (priceStr: string): number => {
  if (!priceStr) return 0;
  
  // Remove currency symbols and whitespace
  const cleaned = priceStr
    .replace(/[^0-9.,]/g, '')
    .replace(',', '.'); // Handle European decimal format
  
  // Handle range prices (e.g., "$10 - $20")
  const rangeMatch = cleaned.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
  if (rangeMatch) {
    return parseFloat(rangeMatch[1]);
  }
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Parse discount percentage from string
 */
export const parseDiscount = (discountStr: string): number => {
  if (!discountStr) return 0;
  
  const match = discountStr.match(/(\d+)%/);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  return 0;
};

/**
 * Amazon scraper class
 * Handles scraping deals from Amazon
 */
export class AmazonScraper {
  private axios: AxiosInstance;
  private source: string = 'amazon';

  constructor() {
    this.axios = createAxiosInstance();
  }

  /**
   * Scrape deals from Amazon today's deals page
   */
  async scrapeDealsPage(): Promise<ScrapeResult<ScrapedProduct[]>> {
    const startTime = Date.now();
    
    try {
      const result = await withRetry(async () => {
        const response = await this.axios.get(
          'https://www.amazon.com/deals',
          {
            headers: {
              // Amazon-specific headers
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120"',
              'sec-ch-ua-mobile': '?0',
              'sec-ch-ua-platform': '"Windows"',
            },
          }
        );
        
        const $ = cheerio.load(response.data);
        const products: ScrapedProduct[] = [];

        // Amazon uses various selectors for deals
        // Try multiple selectors for compatibility
        const dealItems = $(
          '[data-component-type="s-search-result"], ' +
          '.s-result-item, ' +
          '.dealGridItem'
        );

        dealItems.each((_, el) => {
          try {
            const $el = $(el);
            
            // Extract product data with multiple selector fallbacks
            const title = $el
              .find('h2 a span, .a-text-normal, h2 a')
              .first()
              .text()
              .trim();

            if (!title) return;

            const priceStr = $el
              .find('.a-price-whole, .a-offscreen, [data-a-color="price"] span')
              .first()
              .text()
              .trim();

            const originalPriceStr = $el
              .find('.a-text-price span.a-offscreen, .a-compare-at-price')
              .first()
              .text()
              .trim();

            const imageUrl = $el
              .find('img.s-image, .a-dynamic-image')
              .first()
              .attr('src') || 
              $el.find('img.s-image').first().attr('data-old-src') || '';

            const productUrl = $el
              .find('h2 a')
              .first()
              .attr('href') || '';

            const ratingStr = $el
              .find('.a-icon-alt, [aria-label*="stars"]')
              .first()
              .text()
              .trim();

            const reviewCountStr = $el
              .find('.a-link-normal span, [aria-label*="review"]')
              .first()
              .text()
              .trim();

            const discountStr = $el
              .find('.savingsPercentage, .a-badge-text')
              .first()
              .text()
              .trim();

            // Parse extracted data
            const price = parsePrice(priceStr);
            const originalPrice = originalPriceStr ? parsePrice(originalPriceStr) : undefined;
            const discount = discountStr ? parseDiscount(discountStr) : 
              (originalPrice && price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

            const ratingMatch = ratingStr?.match(/(\d+\.?\d*)/);
            const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;

            const reviewMatch = reviewCountStr?.match(/(\d+,?\d*)/);
            const reviewCount = reviewMatch ? parseInt(reviewMatch[1].replace(',', ''), 10) : undefined;

            // Skip if no valid price
            if (price <= 0) return;

            products.push({
              title,
              price,
              originalPrice,
              currency: 'USD',
              image: imageUrl,
              url: productUrl.startsWith('http') ? productUrl : `https://www.amazon.com${productUrl}`,
              rating,
              reviewCount,
              discount,
              inStock: true,
              source: this.source,
              scrapedAt: new Date(),
            });
          } catch (parseError) {
            // Skip individual product parse errors
            console.warn('Failed to parse product:', parseError);
          }
        });

        return products;
      });

      console.log(`[AmazonScraper] Scraped ${result.length} products in ${Date.now() - startTime}ms`);

      return {
        success: true,
        data: result,
        source: this.source,
        scrapedAt: new Date(),
        count: result.length,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('[AmazonScraper] Scraping failed:', axiosError.message);
      
      return {
        success: false,
        error: axiosError.message,
        source: this.source,
        scrapedAt: new Date(),
      };
    }
  }

  /**
   * Scrape specific Amazon product page
   */
  async scrapeProduct(url: string): Promise<ScrapeResult<ScrapedProduct>> {
    try {
      const result = await withRetry(async () => {
        const response = await this.axios.get(url);
        const $ = cheerio.load(response.data);

        const title = $('#productTitle, #title').text().trim();
        
        const priceWhole = $('#priceblock_ourprice, #priceblock_dealprice, .a-price .a-offscreen')
          .first()
          .text()
          .trim();
        
        const originalPriceStr = $('#priceblock_ourprice_lbl, .a-text-price .a-offscreen')
          .first()
          .text()
          .trim();

        const image = $('#landingImage, #imgBlkFront').attr('src') || 
          $('#landingImage').attr('data-old-src') || '';

        const ratingStr = $('#averageCustomerReviews .a-icon-alt').text().trim();
        const reviewCountStr = $('#averageCustomerReviews #acrCustomerReviewCount').text().trim();

        const price = parsePrice(priceWhole);
        const originalPrice = originalPriceStr ? parsePrice(originalPriceStr) : undefined;
        
        const ratingMatch = ratingStr?.match(/(\d+\.?\d*)/);
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;

        const reviewMatch = reviewCountStr?.match(/(\d+,?\d*)/);
        const reviewCount = reviewMatch ? parseInt(reviewMatch[1].replace(',', ''), 10) : undefined;

        const discount = originalPrice && price ? 
          Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

        return {
          title,
          price,
          originalPrice,
          currency: 'USD',
          image,
          url,
          rating,
          reviewCount,
          discount,
          inStock: true,
          source: this.source,
          scrapedAt: new Date(),
        };
      });

      return {
        success: true,
        data: result,
        source: this.source,
        scrapedAt: new Date(),
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.message,
        source: this.source,
        scrapedAt: new Date(),
      };
    }
  }
}

/**
 * eBay scraper class
 * Handles scraping deals from eBay
 */
export class EbayScraper {
  private axios: AxiosInstance;
  private source: string = 'ebay';

  constructor() {
    this.axios = createAxiosInstance();
  }

  /**
   * Scrape deals from eBay deals page
   */
  async scrapeDealsPage(): Promise<ScrapeResult<ScrapedProduct[]>> {
    const startTime = Date.now();
    
    try {
      const result = await withRetry(async () => {
        const response = await this.axios.get(
          'https://www.ebay.com/deals',
          {
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
          }
        );
        
        const $ = cheerio.load(response.data);
        const products: ScrapedProduct[] = [];

        // eBay deals selector
        const dealItems = $('.s-item, .deal-item');

        dealItems.each((_, el) => {
          try {
            const $el = $(el);
            
            const title = $el
              .find('.s-item__title, .deal-title')
              .first()
              .text()
              .trim();

            if (!title) return;

            const priceStr = $el
              .find('.s-item__price, .deal-price')
              .first()
              .text()
              .trim();

            const originalPriceStr = $el
              .find('.s-item__original-price, .original-price')
              .first()
              .text()
              .trim();

            const imageUrl = $el
              .find('.s-item__image-link img, .deal-image img')
              .attr('src') || '';

            const productUrl = $el
              .find('.s-item__link, .deal-link')
              .attr('href') || '';

            const ratingStr = $el
              .find('.x-star-rating, .rating')
              .text()
              .trim();

            const price = parsePrice(priceStr);
            const originalPrice = originalPriceStr ? parsePrice(originalPriceStr) : undefined;
            
            const discount = originalPrice && price ? 
              Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

            const ratingMatch = ratingStr?.match(/(\d+\.?\d*)/);
            const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;

            if (price <= 0) return;

            products.push({
              title,
              price,
              originalPrice,
              currency: 'USD',
              image: imageUrl,
              url: productUrl,
              rating,
              discount,
              inStock: true,
              source: this.source,
              scrapedAt: new Date(),
            });
          } catch (parseError) {
            console.warn('Failed to parse eBay product:', parseError);
          }
        });

        return products;
      });

      console.log(`[EbayScraper] Scraped ${result.length} products in ${Date.now() - startTime}ms`);

      return {
        success: true,
        data: result,
        source: this.source,
        scrapedAt: new Date(),
        count: result.length,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('[EbayScraper] Scraping failed:', axiosError.message);
      
      return {
        success: false,
        error: axiosError.message,
        source: this.source,
        scrapedAt: new Date(),
      };
    }
  }
}

/**
 * Walmart scraper class
 */
export class WalmartScraper {
  private axios: AxiosInstance;
  private source: string = 'walmart';

  constructor() {
    this.axios = createAxiosInstance();
  }

  /**
   * Scrape deals from Walmart deals page
   */
  async scrapeDealsPage(): Promise<ScrapeResult<ScrapedProduct[]>> {
    const startTime = Date.now();
    
    try {
      const result = await withRetry(async () => {
        const response = await this.axios.get(
          'https://www.walmart.com/deals',
          {
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
          }
        );
        
        const $ = cheerio.load(response.data);
        const products: ScrapedProduct[] = [];

        // Walmart uses JSON-LD for product data
        const scriptTags = $('script[type="application/ld+json"]');
        
        scriptTags.each((_, el) => {
          try {
            const jsonStr = $(el).html();
            if (!jsonStr) return;
            
            const jsonData = JSON.parse(jsonStr);
            
            // Handle array of products
            const items = Array.isArray(jsonData) ? jsonData : [jsonData];
            
            for (const item of items) {
              if (item['@type'] === 'Product' && item.offers) {
                const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
                
                products.push({
                  title: item.name || '',
                  price: parsePrice(offer.price || '0'),
                  originalPrice: offer.priceSpecification?.maxPrice ? 
                    parsePrice(String(offer.priceSpecification.maxPrice)) : undefined,
                  currency: offer.priceCurrency || 'USD',
                  image: item.image?.[0] || '',
                  url: item.url || '',
                  rating: item.aggregateRating?.ratingValue,
                  reviewCount: item.aggregateRating?.reviewCount,
                  inStock: offer.availability?.includes('InStock'),
                  source: this.source,
                  scrapedAt: new Date(),
                });
              }
            }
          } catch (parseError) {
            // Skip invalid JSON
          }
        });

        // Also try CSS selectors as fallback
        const gridItems = $('[data-testid="product-card"], .product-card');
        
        gridItems.each((_, el) => {
          try {
            const $el = $(el);
            
            const title = $el
              .find('[data-testid="product-title"], .product-title')
              .first()
              .text()
              .trim();

            if (!title) return;

            const priceStr = $el
              .find('[data-testid="price"], .price')
              .first()
              .text()
              .trim();

            const price = parsePrice(priceStr);
            if (price <= 0) return;

            const imageUrl = $el
              .find('img')
              .attr('src') || '';

            const productUrl = $el
              .find('a')
              .attr('href') || '';

            products.push({
              title,
              price,
              currency: 'USD',
              image: imageUrl,
              url: productUrl,
              inStock: true,
              source: this.source,
              scrapedAt: new Date(),
            });
          } catch (parseError) {
            console.warn('Failed to parse Walmart product:', parseError);
          }
        });

        return products;
      });

      console.log(`[WalmartScraper] Scraped ${result.length} products in ${Date.now() - startTime}ms`);

      return {
        success: true,
        data: result,
        source: this.source,
        scrapedAt: new Date(),
        count: result.length,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('[WalmartScraper] Scraping failed:', axiosError.message);
      
      return {
        success: false,
        error: axiosError.message,
        source: this.source,
        scrapedAt: new Date(),
      };
    }
  }
}

/**
 * Generic scraper that can handle any e-commerce site
 */
export class GenericScraper {
  private axios: AxiosInstance;

  constructor() {
    this.axios = createAxiosInstance();
  }

  /**
   * Attempt to scrape products from any URL
   * Uses heuristics to detect common e-commerce patterns
   */
  async scrape(url: string): Promise<ScrapeResult<ScrapedProduct[]>> {
    const startTime = Date.now();
    const hostname = new URL(url).hostname;
    
    try {
      const result = await withRetry(async () => {
        const response = await this.axios.get(url);
        const $ = cheerio.load(response.data);
        const products: ScrapedProduct[] = [];

        // Common product selectors across e-commerce sites
        const selectors = [
          '[data-product-id]',
          '.product-item',
          '.product-card',
          '.item-product',
          '.product-grid-item',
          'article.product',
          '[itemtype="http://schema.org/Product"]',
        ];

        const productElements = $(selectors.join(', '));

        productElements.each((_, el) => {
          try {
            const $el = $(el);
            
            // Try multiple strategies to extract product info
            const title = 
              $el.find('h2, h3, .product-title, .product-name, [itemprop="name"]')
                .first().text().trim() ||
              $el.attr('data-product-name') ||
              $el.find('a').first().attr('title') ||
              '';

            if (!title || title.length < 3) return;

            const priceStr = 
              $el.find('.price, [itemprop="price"], .product-price, .sale-price')
                .first().text().trim() ||
              $el.attr('data-product-price') ||
              '';

            const imageUrl = 
              $el.find('img').first().attr('src') ||
              $el.find('img').first().attr('data-src') ||
              $el.find('[itemprop="image"]').attr('content') ||
              '';

            const productUrl = 
              $el.find('a').first().attr('href') || '';

            const price = parsePrice(priceStr);
            if (price <= 0) return;

            products.push({
              title,
              price,
              currency: 'USD',
              image: imageUrl,
              url: productUrl.startsWith('http') ? productUrl : `https://${hostname}${productUrl}`,
              inStock: true,
              source: hostname,
              scrapedAt: new Date(),
            });
          } catch (parseError) {
            console.warn('Failed to parse product:', parseError);
          }
        });

        return products;
      });

      console.log(`[GenericScraper] Scraped ${result.length} products from ${hostname} in ${Date.now() - startTime}ms`);

      return {
        success: true,
        data: result,
        source: hostname,
        scrapedAt: new Date(),
        count: result.length,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('[GenericScraper] Scraping failed:', axiosError.message);
      
      return {
        success: false,
        error: axiosError.message,
        source: hostname,
        scrapedAt: new Date(),
      };
    }
  }
}

/**
 * Unified scraper that combines all site-specific scrapers
 */
export class UnifiedScraper {
  private amazonScraper: AmazonScraper;
  private ebayScraper: EbayScraper;
  private walmartScraper: WalmartScraper;
  private genericScraper: GenericScraper;

  constructor() {
    this.amazonScraper = new AmazonScraper();
    this.ebayScraper = new EbayScraper();
    this.walmartScraper = new WalmartScraper();
    this.genericScraper = new GenericScraper();
  }

  /**
   * Scrape all configured deal sources
   */
  async scrapeAll(): Promise<ScrapeResult<ScrapedProduct[]>> {
    const allProducts: ScrapedProduct[] = [];
    const errors: string[] = [];

    // Scrape from each source in parallel
    const results = await Promise.allSettled([
      this.amazonScraper.scrapeDealsPage(),
      this.ebayScraper.scrapeDealsPage(),
      this.walmartScraper.scrapeDealsPage(),
    ]);

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success && result.value.data) {
        allProducts.push(...result.value.data);
      } else if (result.status === 'rejected') {
        errors.push(result.reason?.message || 'Unknown error');
      } else if (result.status === 'fulfilled' && !result.value.success) {
        errors.push(result.value.error || 'Unknown error');
      }
    }

    return {
      success: allProducts.length > 0,
      data: allProducts,
      error: errors.length > 0 ? errors.join('; ') : undefined,
      source: 'all',
      scrapedAt: new Date(),
      count: allProducts.length,
    };
  }

  /**
   * Scrape specific source
   */
  async scrapeSource(source: 'amazon' | 'ebay' | 'walmart'): Promise<ScrapeResult<ScrapedProduct[]>> {
    switch (source) {
      case 'amazon':
        return this.amazonScraper.scrapeDealsPage();
      case 'ebay':
        return this.ebayScraper.scrapeDealsPage();
      case 'walmart':
        return this.walmartScraper.scrapeDealsPage();
      default:
        return {
          success: false,
          error: `Unknown source: ${source}`,
          source,
          scrapedAt: new Date(),
        };
    }
  }

  /**
   * Scrape custom URL
   */
  async scrapeUrl(url: string): Promise<ScrapeResult<ScrapedProduct[]>> {
    return this.genericScraper.scrape(url);
  }

  /**
   * Get supported sources
   */
  getSupportedSources(): string[] {
    return ['amazon', 'ebay', 'walmart'];
  }
}

/**
 * Factory function to create scraper by source
 */
export const createScraper = (
  source?: 'amazon' | 'ebay' | 'walmart' | 'generic' | 'all'
): UnifiedScraper | AmazonScraper | EbayScraper | WalmartScraper | GenericScraper => {
  if (!source || source === 'all') {
    return new UnifiedScraper();
  }
  
  switch (source) {
    case 'amazon':
      return new AmazonScraper();
    case 'ebay':
      return new EbayScraper();
    case 'walmart':
      return new WalmartScraper();
    case 'generic':
    default:
      return new GenericScraper();
  }
};

/**
 * Default scraper instance
 */
export const defaultScraper = new UnifiedScraper();

/**
 * Example usage:
 * 
 * // Scrape all sources
 * const allResults = await defaultScraper.scrapeAll();
 * 
 * // Scrape specific source
 * const amazonResults = await defaultScraper.scrapeSource('amazon');
 * 
 * // Custom URL
 * const customResults = await defaultScraper.scrapeUrl('https://example.com/deals');
 * 
 * // Individual scrapers
 * const amazon = new AmazonScraper();
 * const products = await amazon.scrapeDealsPage();
 */
