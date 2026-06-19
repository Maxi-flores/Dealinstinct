import { v4 as uuid } from 'uuid';
import { getItem, putItem, updateItem, scanItems, queryItems, tables } from '../aws/dynamodb';
import type { InventoryItem, InventoryMovement, StockAlert, PaginatedResponse } from '../types';

const INVENTORY_TABLE = tables.inventory;
const PRODUCTS_TABLE = tables.products;

// Get Inventory Item
export async function getInventoryItem(productId: string, variantId?: string): Promise<InventoryItem | null> {
  const key = variantId ? { productId, variantId } : { productId, variantId: 'default' };
  return getItem<InventoryItem>(INVENTORY_TABLE, key);
}

// Create/Update Inventory
export async function upsertInventory(data: Omit<InventoryItem, 'availableQuantity' | 'updatedAt'>): Promise<InventoryItem> {
  const now = new Date().toISOString();
  const variantId = data.variantId || 'default';

  const inventoryItem: InventoryItem = {
    ...data,
    variantId,
    availableQuantity: data.quantity - data.reservedQuantity,
    updatedAt: now,
  };

  await putItem(INVENTORY_TABLE, inventoryItem);
  return inventoryItem;
}

// Update Stock Quantity
export async function updateStockQuantity(
  productId: string,
  variantId: string | undefined,
  quantityChange: number,
  type: InventoryMovement['type'],
  reason?: string,
  userId?: string
): Promise<InventoryItem> {
  const vId = variantId || 'default';
  const current = await getInventoryItem(productId, vId);

  if (!current) {
    throw new Error('Inventory item not found');
  }

  const previousQuantity = current.quantity;
  const newQuantity = previousQuantity + quantityChange;

  if (newQuantity < 0) {
    throw new Error('Insufficient stock');
  }

  // Update inventory
  const updated: InventoryItem = {
    ...current,
    quantity: newQuantity,
    availableQuantity: newQuantity - current.reservedQuantity,
    updatedAt: new Date().toISOString(),
    ...(type === 'in' && { lastRestockedAt: new Date().toISOString() }),
  };

  await putItem(INVENTORY_TABLE, updated);

  // Record movement
  await recordInventoryMovement({
    productId,
    variantId: vId,
    sku: current.sku,
    type,
    quantity: quantityChange,
    previousQuantity,
    newQuantity,
    reason,
    userId: userId || 'system',
  });

  // Check for low stock alert
  if (newQuantity <= current.lowStockThreshold) {
    await createStockAlert(productId, current.sku, newQuantity, current.lowStockThreshold);
  }

  return updated;
}

// Reserve Stock
export async function reserveStock(
  productId: string,
  variantId: string | undefined,
  quantity: number
): Promise<boolean> {
  const vId = variantId || 'default';
  const current = await getInventoryItem(productId, vId);

  if (!current || current.availableQuantity < quantity) {
    return false;
  }

  await updateItem(INVENTORY_TABLE, { productId, variantId: vId }, {
    reservedQuantity: current.reservedQuantity + quantity,
    availableQuantity: current.availableQuantity - quantity,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

// Release Reserved Stock
export async function releaseReservedStock(
  productId: string,
  variantId: string | undefined,
  quantity: number
): Promise<void> {
  const vId = variantId || 'default';
  const current = await getInventoryItem(productId, vId);

  if (!current) return;

  const newReserved = Math.max(0, current.reservedQuantity - quantity);

  await updateItem(INVENTORY_TABLE, { productId, variantId: vId }, {
    reservedQuantity: newReserved,
    availableQuantity: current.quantity - newReserved,
    updatedAt: new Date().toISOString(),
  });
}

// Commit Reserved Stock (convert reserved to sold)
export async function commitReservedStock(
  productId: string,
  variantId: string | undefined,
  quantity: number,
  userId?: string
): Promise<void> {
  const vId = variantId || 'default';
  const current = await getInventoryItem(productId, vId);

  if (!current) return;

  const newQuantity = current.quantity - quantity;
  const newReserved = Math.max(0, current.reservedQuantity - quantity);

  await updateItem(INVENTORY_TABLE, { productId, variantId: vId }, {
    quantity: newQuantity,
    reservedQuantity: newReserved,
    availableQuantity: newQuantity - newReserved,
    updatedAt: new Date().toISOString(),
  });

  // Record movement
  await recordInventoryMovement({
    productId,
    variantId: vId,
    sku: current.sku,
    type: 'out',
    quantity: -quantity,
    previousQuantity: current.quantity,
    newQuantity,
    reason: 'Order fulfilled',
    userId: userId || 'system',
  });
}

// Record Inventory Movement
async function recordInventoryMovement(
  data: Omit<InventoryMovement, 'id' | 'createdAt'>
): Promise<InventoryMovement> {
  const movement: InventoryMovement = {
    ...data,
    id: uuid(),
    createdAt: new Date().toISOString(),
  };

  // Store in a movements table or append to a log
  // For simplicity, we can use a composite key with productId
  await putItem(`${INVENTORY_TABLE}-movements`, movement);

  return movement;
}

// Get Inventory Movements
export async function getInventoryMovements(
  productId: string,
  limit: number = 50
): Promise<InventoryMovement[]> {
  return queryItems<InventoryMovement>(
    `${INVENTORY_TABLE}-movements`,
    'productId = :productId',
    { ':productId': productId },
    undefined,
    limit
  );
}

// Create Stock Alert
async function createStockAlert(
  productId: string,
  sku: string,
  currentQuantity: number,
  threshold: number
): Promise<void> {
  // Get product name
  const product = await getItem<{ name: string }>(PRODUCTS_TABLE, { id: productId });

  const alert: StockAlert = {
    id: uuid(),
    productId,
    sku,
    productName: product?.name || 'Unknown Product',
    currentQuantity,
    threshold,
    alertType: currentQuantity === 0 ? 'out_of_stock' : 'low_stock',
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  await putItem(`${INVENTORY_TABLE}-alerts`, alert);
}

// Get Active Stock Alerts
export async function getActiveStockAlerts(): Promise<StockAlert[]> {
  return scanItems<StockAlert>(
    `${INVENTORY_TABLE}-alerts`,
    '#status = :status',
    { ':status': 'active' }
  );
}

// Acknowledge Stock Alert
export async function acknowledgeStockAlert(alertId: string, userId: string): Promise<void> {
  await updateItem(`${INVENTORY_TABLE}-alerts`, { id: alertId }, {
    status: 'acknowledged',
    acknowledgedAt: new Date().toISOString(),
    acknowledgedBy: userId,
  });
}

// Resolve Stock Alert
export async function resolveStockAlert(alertId: string): Promise<void> {
  await updateItem(`${INVENTORY_TABLE}-alerts`, { id: alertId }, {
    status: 'resolved',
  });
}

// Get All Inventory Items
export async function getAllInventory(page: number = 1, pageSize: number = 50): Promise<PaginatedResponse<InventoryItem>> {
  const items = await scanItems<InventoryItem>(INVENTORY_TABLE);

  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const paginatedItems = items.slice(start, start + pageSize);

  return {
    items: paginatedItems,
    total,
    page,
    pageSize,
    totalPages,
    hasMore: page < totalPages,
  };
}

// Get Low Stock Items
export async function getLowStockItems(): Promise<InventoryItem[]> {
  const items = await scanItems<InventoryItem>(INVENTORY_TABLE);
  return items.filter((item) => item.availableQuantity <= item.lowStockThreshold);
}

// Get Out of Stock Items
export async function getOutOfStockItems(): Promise<InventoryItem[]> {
  const items = await scanItems<InventoryItem>(INVENTORY_TABLE);
  return items.filter((item) => item.availableQuantity === 0);
}

// Bulk Restock
export async function bulkRestock(
  items: Array<{ productId: string; variantId?: string; quantity: number }>,
  userId: string
): Promise<void> {
  const updatePromises = items.map((item) =>
    updateStockQuantity(item.productId, item.variantId, item.quantity, 'in', 'Bulk restock', userId)
  );
  await Promise.all(updatePromises);
}

// Get Inventory Stats
export async function getInventoryStats(): Promise<{
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}> {
  const items = await scanItems<InventoryItem>(INVENTORY_TABLE);
  const products = await scanItems<{ id: string; costPrice?: number }>(PRODUCTS_TABLE);

  const productCostMap = new Map(products.map((p) => [p.id, p.costPrice || 0]));

  let totalValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  items.forEach((item) => {
    const cost = productCostMap.get(item.productId) || 0;
    totalValue += item.quantity * cost;

    if (item.availableQuantity === 0) {
      outOfStockCount++;
    } else if (item.availableQuantity <= item.lowStockThreshold) {
      lowStockCount++;
    }
  });

  return {
    totalItems: items.length,
    totalValue,
    lowStockCount,
    outOfStockCount,
  };
}
