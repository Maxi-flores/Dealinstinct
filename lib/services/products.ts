import { v4 as uuid } from 'uuid';
import { getItem, putItem, updateItem, deleteItem, scanItems, queryItems, tables } from '../aws/dynamodb';
import type { Product, PaginatedResponse, SearchFilters } from '../types';

const TABLE = tables.products;

// Create Product
export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const now = new Date().toISOString();
  const product: Product = {
    ...data,
    id: uuid(),
    createdAt: now,
    updatedAt: now,
  };

  await putItem(TABLE, product);
  return product;
}

// Get Product by ID
export async function getProductById(id: string): Promise<Product | null> {
  return getItem<Product>(TABLE, { id });
}

// Get Product by Slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await queryItems<Product>(
    TABLE,
    'slug = :slug',
    { ':slug': slug },
    'slug-index',
    1
  );
  return products[0] || null;
}

// Get Product by SKU
export async function getProductBySku(sku: string): Promise<Product | null> {
  const products = await queryItems<Product>(
    TABLE,
    'sku = :sku',
    { ':sku': sku },
    'sku-index',
    1
  );
  return products[0] || null;
}

// Update Product
export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  await updateItem(TABLE, { id }, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

// Delete Product
export async function deleteProduct(id: string): Promise<void> {
  await deleteItem(TABLE, { id });
}

// List Products with Filters
export async function listProducts(filters: SearchFilters = {}): Promise<PaginatedResponse<Product>> {
  const {
    query,
    categoryId,
    minPrice,
    maxPrice,
    brand,
    tags,
    status = 'active',
    inStock,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    pageSize = 20,
  } = filters;

  // Build filter expression
  const filterParts: string[] = [];
  const expressionValues: Record<string, any> = {};

  if (status) {
    filterParts.push('#status = :status');
    expressionValues[':status'] = status;
  }

  if (categoryId) {
    filterParts.push('categoryId = :categoryId');
    expressionValues[':categoryId'] = categoryId;
  }

  if (minPrice !== undefined) {
    filterParts.push('price >= :minPrice');
    expressionValues[':minPrice'] = minPrice;
  }

  if (maxPrice !== undefined) {
    filterParts.push('price <= :maxPrice');
    expressionValues[':maxPrice'] = maxPrice;
  }

  if (brand) {
    filterParts.push('brand = :brand');
    expressionValues[':brand'] = brand;
  }

  const filterExpression = filterParts.length > 0 ? filterParts.join(' AND ') : undefined;

  // Fetch all matching products (for demo - in production use pagination tokens)
  let products = await scanItems<Product>(TABLE, filterExpression, expressionValues);

  // Filter by search query
  if (query) {
    const lowerQuery = query.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery) ||
        p.sku.toLowerCase().includes(lowerQuery)
    );
  }

  // Filter by tags
  if (tags && tags.length > 0) {
    products = products.filter((p) =>
      tags.some((tag) => p.tags?.includes(tag))
    );
  }

  // Sort
  products.sort((a, b) => {
    const aVal = a[sortBy as keyof Product] as any;
    const bVal = b[sortBy as keyof Product] as any;
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  // Paginate
  const total = products.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const items = products.slice(start, start + pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
    hasMore: page < totalPages,
  };
}

// Get Featured Products
export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
  const products = await scanItems<Product>(
    TABLE,
    '#status = :status AND featured = :featured',
    { ':status': 'active', ':featured': true }
  );

  return products
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    .slice(0, limit);
}

// Get Products by Category
export async function getProductsByCategory(
  categoryId: string,
  limit: number = 20
): Promise<Product[]> {
  return queryItems<Product>(
    TABLE,
    'categoryId = :categoryId AND #status = :status',
    { ':categoryId': categoryId, ':status': 'active' },
    'category-index',
    limit
  );
}

// Get Related Products
export async function getRelatedProducts(product: Product, limit: number = 4): Promise<Product[]> {
  // Get products from same category
  const categoryProducts = await getProductsByCategory(product.categoryId, limit + 5);

  // Filter out current product and limit
  return categoryProducts
    .filter((p) => p.id !== product.id)
    .slice(0, limit);
}

// Search Products
export async function searchProducts(query: string, limit: number = 20): Promise<Product[]> {
  const products = await scanItems<Product>(TABLE, '#status = :status', { ':status': 'active' });

  const lowerQuery = query.toLowerCase();
  return products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery) ||
        p.sku.toLowerCase().includes(lowerQuery) ||
        p.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    )
    .slice(0, limit);
}

// Bulk Update Products
export async function bulkUpdateProducts(
  ids: string[],
  updates: Partial<Product>
): Promise<void> {
  const updatePromises = ids.map((id) => updateProduct(id, updates));
  await Promise.all(updatePromises);
}

// Get Product Stats
export async function getProductStats(): Promise<{
  total: number;
  active: number;
  draft: number;
  archived: number;
}> {
  const products = await scanItems<Product>(TABLE);

  return {
    total: products.length,
    active: products.filter((p) => p.status === 'active').length,
    draft: products.filter((p) => p.status === 'draft').length,
    archived: products.filter((p) => p.status === 'archived').length,
  };
}
