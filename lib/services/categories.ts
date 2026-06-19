import { v4 as uuid } from 'uuid';
import { getItem, putItem, updateItem, deleteItem, scanItems, tables } from '../aws/dynamodb';
import type { Category } from '../types';

const TABLE = tables.categories;

// Create Category
export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  displayOrder?: number;
}): Promise<Category> {
  const now = new Date().toISOString();

  // Determine level and path
  let level = 0;
  let path: string[] = [];

  if (data.parentId) {
    const parent = await getCategoryById(data.parentId);
    if (parent) {
      level = parent.level + 1;
      path = [...parent.path, parent.id];
    }
  }

  const category: Category = {
    id: uuid(),
    name: data.name,
    slug: data.slug,
    description: data.description,
    image: data.image,
    parentId: data.parentId,
    level,
    path,
    productCount: 0,
    displayOrder: data.displayOrder || 0,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  await putItem(TABLE, category);
  return category;
}

// Get Category by ID
export async function getCategoryById(id: string): Promise<Category | null> {
  return getItem<Category>(TABLE, { id });
}

// Get Category by Slug
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await scanItems<Category>(TABLE, 'slug = :slug', { ':slug': slug }, 1);
  return categories[0] || null;
}

// Update Category
export async function updateCategory(id: string, updates: Partial<Category>): Promise<void> {
  await updateItem(TABLE, { id }, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

// Delete Category
export async function deleteCategory(id: string): Promise<void> {
  // Check for child categories
  const children = await getChildCategories(id);
  if (children.length > 0) {
    throw new Error('Cannot delete category with subcategories');
  }

  await deleteItem(TABLE, { id });
}

// Get All Categories
export async function getAllCategories(): Promise<Category[]> {
  const categories = await scanItems<Category>(TABLE);
  return categories.sort((a, b) => a.displayOrder - b.displayOrder);
}

// Get Active Categories
export async function getActiveCategories(): Promise<Category[]> {
  const categories = await scanItems<Category>(TABLE, '#status = :status', { ':status': 'active' });
  return categories.sort((a, b) => a.displayOrder - b.displayOrder);
}

// Get Root Categories (top-level)
export async function getRootCategories(): Promise<Category[]> {
  const categories = await scanItems<Category>(
    TABLE,
    'attribute_not_exists(parentId) OR parentId = :empty',
    { ':empty': '' }
  );
  return categories
    .filter((c) => c.status === 'active')
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

// Get Child Categories
export async function getChildCategories(parentId: string): Promise<Category[]> {
  const categories = await scanItems<Category>(TABLE, 'parentId = :parentId', { ':parentId': parentId });
  return categories
    .filter((c) => c.status === 'active')
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

// Get Category Tree
export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  const categories = await getActiveCategories();
  return buildTree(categories);
}

interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

function buildTree(categories: Category[], parentId?: string): CategoryTreeNode[] {
  return categories
    .filter((c) => c.parentId === parentId || (!c.parentId && !parentId))
    .map((category) => ({
      ...category,
      children: buildTree(categories, category.id),
    }));
}

// Get Category Breadcrumbs
export async function getCategoryBreadcrumbs(categoryId: string): Promise<Category[]> {
  const category = await getCategoryById(categoryId);
  if (!category) return [];

  const breadcrumbs: Category[] = [];

  // Get all ancestor categories from path
  for (const ancestorId of category.path) {
    const ancestor = await getCategoryById(ancestorId);
    if (ancestor) {
      breadcrumbs.push(ancestor);
    }
  }

  // Add current category
  breadcrumbs.push(category);

  return breadcrumbs;
}

// Update Product Count
export async function updateCategoryProductCount(categoryId: string, count: number): Promise<void> {
  await updateItem(TABLE, { id: categoryId }, {
    productCount: count,
    updatedAt: new Date().toISOString(),
  });
}

// Increment/Decrement Product Count
export async function adjustCategoryProductCount(categoryId: string, delta: number): Promise<void> {
  const category = await getCategoryById(categoryId);
  if (!category) return;

  const newCount = Math.max(0, category.productCount + delta);
  await updateCategoryProductCount(categoryId, newCount);
}

// Reorder Categories
export async function reorderCategories(
  categoryOrders: Array<{ id: string; displayOrder: number }>
): Promise<void> {
  const updatePromises = categoryOrders.map(({ id, displayOrder }) =>
    updateItem(TABLE, { id }, {
      displayOrder,
      updatedAt: new Date().toISOString(),
    })
  );
  await Promise.all(updatePromises);
}

// Search Categories
export async function searchCategories(query: string): Promise<Category[]> {
  const categories = await getAllCategories();
  const lowerQuery = query.toLowerCase();

  return categories.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.description?.toLowerCase().includes(lowerQuery)
  );
}

// Get Categories with Products
export async function getCategoriesWithProducts(): Promise<Category[]> {
  const categories = await getActiveCategories();
  return categories.filter((c) => c.productCount > 0);
}
