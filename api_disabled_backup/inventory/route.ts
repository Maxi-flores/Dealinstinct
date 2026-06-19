import { NextRequest, NextResponse } from 'next/server';
import {
  getAllInventory,
  getInventoryItem,
  upsertInventory,
  updateStockQuantity,
  getLowStockItems,
  getOutOfStockItems,
  getActiveStockAlerts,
  getInventoryStats,
} from '@/lib/services/inventory';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const productId = searchParams.get('productId');
    const variantId = searchParams.get('variantId') || undefined;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const pageSize = searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : 50;

    let data;

    switch (action) {
      case 'item':
        if (!productId) {
          return NextResponse.json(
            { success: false, error: 'productId required' },
            { status: 400 }
          );
        }
        data = await getInventoryItem(productId, variantId);
        break;

      case 'lowStock':
        data = await getLowStockItems();
        break;

      case 'outOfStock':
        data = await getOutOfStockItems();
        break;

      case 'alerts':
        data = await getActiveStockAlerts();
        break;

      case 'stats':
        data = await getInventoryStats();
        break;

      default:
        data = await getAllInventory(page, pageSize);
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'upsert':
        if (!data.productId || !data.sku || data.quantity === undefined) {
          return NextResponse.json(
            { success: false, error: 'productId, sku, and quantity required' },
            { status: 400 }
          );
        }
        const inventory = await upsertInventory({
          productId: data.productId,
          variantId: data.variantId,
          sku: data.sku,
          quantity: data.quantity,
          reservedQuantity: data.reservedQuantity || 0,
          lowStockThreshold: data.lowStockThreshold || 10,
          location: data.location,
          warehouseId: data.warehouseId,
        });
        return NextResponse.json({ success: true, data: inventory });

      case 'adjust':
        if (!data.productId || !data.quantityChange || !data.type) {
          return NextResponse.json(
            { success: false, error: 'productId, quantityChange, and type required' },
            { status: 400 }
          );
        }
        const adjusted = await updateStockQuantity(
          data.productId,
          data.variantId,
          data.quantityChange,
          data.type,
          data.reason,
          data.userId
        );
        return NextResponse.json({ success: true, data: adjusted });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing inventory action:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to process inventory action' },
      { status: 500 }
    );
  }
}
