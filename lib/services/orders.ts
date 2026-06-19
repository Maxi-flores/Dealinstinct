import { v4 as uuid } from 'uuid';
import { getItem, putItem, updateItem, scanItems, queryItems, tables } from '../aws/dynamodb';
import { commitReservedStock, releaseReservedStock, reserveStock } from './inventory';
import type { Order, OrderItem, OrderStatus, PaymentStatus, PaginatedResponse, Address } from '../types';

const TABLE = tables.orders;

// Generate Order Number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// Create Order
export async function createOrder(data: {
  userId: string;
  customerEmail: string;
  customerName: string;
  items: Omit<OrderItem, 'id'>[];
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod?: string;
  shippingCost?: number;
  discount?: number;
  notes?: string;
  metadata?: Record<string, any>;
}): Promise<Order> {
  const now = new Date().toISOString();

  // Calculate totals
  const items: OrderItem[] = data.items.map((item) => ({
    ...item,
    id: uuid(),
  }));

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discount = data.discount || 0;
  const shippingCost = data.shippingCost || 0;
  const tax = (subtotal - discount) * 0.21; // 21% VAT
  const total = subtotal - discount + shippingCost + tax;

  // Reserve stock for all items
  for (const item of items) {
    const reserved = await reserveStock(item.productId, item.variantId, item.quantity);
    if (!reserved) {
      throw new Error(`Insufficient stock for ${item.name}`);
    }
  }

  const order: Order = {
    id: uuid(),
    orderNumber: generateOrderNumber(),
    userId: data.userId,
    customerEmail: data.customerEmail,
    customerName: data.customerName,
    status: 'pending',
    paymentStatus: 'pending',
    fulfillmentStatus: 'unfulfilled',
    items,
    subtotal,
    discount,
    shippingCost,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    currency: 'EUR',
    shippingAddress: data.shippingAddress,
    billingAddress: data.billingAddress,
    shippingMethod: data.shippingMethod,
    notes: data.notes,
    metadata: data.metadata,
    createdAt: now,
    updatedAt: now,
  };

  await putItem(TABLE, order);
  return order;
}

// Get Order by ID
export async function getOrderById(id: string): Promise<Order | null> {
  return getItem<Order>(TABLE, { id });
}

// Get Order by Order Number
export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const orders = await queryItems<Order>(
    TABLE,
    'orderNumber = :orderNumber',
    { ':orderNumber': orderNumber },
    'orderNumber-index',
    1
  );
  return orders[0] || null;
}

// Update Order Status
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await updateItem(TABLE, { id }, {
    status,
    updatedAt: new Date().toISOString(),
  });
}

// Update Payment Status
export async function updatePaymentStatus(
  id: string,
  paymentStatus: PaymentStatus,
  stripePaymentIntentId?: string
): Promise<void> {
  const updates: Record<string, any> = {
    paymentStatus,
    updatedAt: new Date().toISOString(),
  };

  if (stripePaymentIntentId) {
    updates.stripePaymentIntentId = stripePaymentIntentId;
  }

  await updateItem(TABLE, { id }, updates);

  // If payment successful, confirm order
  if (paymentStatus === 'paid') {
    await updateOrderStatus(id, 'confirmed');
  }
}

// Mark Order as Fulfilled
export async function fulfillOrder(id: string): Promise<void> {
  const order = await getOrderById(id);
  if (!order) throw new Error('Order not found');

  // Commit reserved stock
  for (const item of order.items) {
    await commitReservedStock(item.productId, item.variantId, item.quantity);
  }

  await updateItem(TABLE, { id }, {
    fulfillmentStatus: 'fulfilled',
    status: 'shipped',
    updatedAt: new Date().toISOString(),
  });
}

// Cancel Order
export async function cancelOrder(id: string, reason?: string): Promise<void> {
  const order = await getOrderById(id);
  if (!order) throw new Error('Order not found');

  // Release reserved stock
  for (const item of order.items) {
    await releaseReservedStock(item.productId, item.variantId, item.quantity);
  }

  await updateItem(TABLE, { id }, {
    status: 'cancelled',
    notes: reason ? `${order.notes || ''}\nCancellation reason: ${reason}` : order.notes,
    updatedAt: new Date().toISOString(),
  });
}

// Refund Order
export async function refundOrder(id: string, amount?: number): Promise<void> {
  const order = await getOrderById(id);
  if (!order) throw new Error('Order not found');

  const refundAmount = amount || order.total;
  const isPartial = refundAmount < order.total;

  await updateItem(TABLE, { id }, {
    status: isPartial ? order.status : 'refunded',
    paymentStatus: isPartial ? 'partially_refunded' : 'refunded',
    updatedAt: new Date().toISOString(),
  });
}

// List Orders
export async function listOrders(
  filters: {
    userId?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<PaginatedResponse<Order>> {
  const { status, paymentStatus, startDate, endDate, page = 1, pageSize = 20 } = filters;

  // Build filter
  const filterParts: string[] = [];
  const expressionValues: Record<string, any> = {};

  if (filters.userId) {
    filterParts.push('userId = :userId');
    expressionValues[':userId'] = filters.userId;
  }

  if (status) {
    filterParts.push('#status = :status');
    expressionValues[':status'] = status;
  }

  if (paymentStatus) {
    filterParts.push('paymentStatus = :paymentStatus');
    expressionValues[':paymentStatus'] = paymentStatus;
  }

  const filterExpression = filterParts.length > 0 ? filterParts.join(' AND ') : undefined;

  let orders = await scanItems<Order>(TABLE, filterExpression, expressionValues);

  // Filter by date range
  if (startDate) {
    orders = orders.filter((o) => o.createdAt >= startDate);
  }
  if (endDate) {
    orders = orders.filter((o) => o.createdAt <= endDate);
  }

  // Sort by date descending
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Paginate
  const total = orders.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const items = orders.slice(start, start + pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
    hasMore: page < totalPages,
  };
}

// Get User Orders
export async function getUserOrders(userId: string, limit: number = 20): Promise<Order[]> {
  return queryItems<Order>(
    TABLE,
    'userId = :userId',
    { ':userId': userId },
    'userId-index',
    limit
  );
}

// Get Recent Orders
export async function getRecentOrders(limit: number = 10): Promise<Order[]> {
  const orders = await scanItems<Order>(TABLE);
  return orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

// Get Order Stats
export async function getOrderStats(startDate?: string, endDate?: string): Promise<{
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}> {
  let orders = await scanItems<Order>(TABLE);

  if (startDate) {
    orders = orders.filter((o) => o.createdAt >= startDate);
  }
  if (endDate) {
    orders = orders.filter((o) => o.createdAt <= endDate);
  }

  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

  return {
    totalOrders: orders.length,
    totalRevenue,
    averageOrderValue: paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0,
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
    processingOrders: orders.filter((o) => o.status === 'processing').length,
    completedOrders: orders.filter((o) => o.status === 'delivered').length,
    cancelledOrders: orders.filter((o) => o.status === 'cancelled').length,
  };
}

// Search Orders
export async function searchOrders(query: string): Promise<Order[]> {
  const orders = await scanItems<Order>(TABLE);
  const lowerQuery = query.toLowerCase();

  return orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(lowerQuery) ||
      o.customerEmail.toLowerCase().includes(lowerQuery) ||
      o.customerName.toLowerCase().includes(lowerQuery)
  );
}
