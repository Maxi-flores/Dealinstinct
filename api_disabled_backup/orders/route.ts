import { NextRequest, NextResponse } from 'next/server';
import {
  createOrder,
  getOrderById,
  getOrderByNumber,
  listOrders,
  getUserOrders,
  updateOrderStatus,
  updatePaymentStatus,
  fulfillOrder,
  cancelOrder,
  getOrderStats,
} from '@/lib/services/orders';
import type { OrderStatus, PaymentStatus } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const orderId = searchParams.get('id');
    const orderNumber = searchParams.get('orderNumber');
    const userId = searchParams.get('userId');

    if (action === 'stats') {
      const startDate = searchParams.get('startDate') || undefined;
      const endDate = searchParams.get('endDate') || undefined;
      const stats = await getOrderStats(startDate, endDate);
      return NextResponse.json({ success: true, data: stats });
    }

    if (orderId) {
      const order = await getOrderById(orderId);
      return NextResponse.json({ success: true, data: order });
    }

    if (orderNumber) {
      const order = await getOrderByNumber(orderNumber);
      return NextResponse.json({ success: true, data: order });
    }

    if (userId) {
      const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 20;
      const orders = await getUserOrders(userId, limit);
      return NextResponse.json({ success: true, data: orders });
    }

    // List all orders with filters
    const filters = {
      status: searchParams.get('status') as OrderStatus | undefined,
      paymentStatus: searchParams.get('paymentStatus') as PaymentStatus | undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      pageSize: searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : 20,
    };

    const result = await listOrders(filters);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create':
        if (!data.userId || !data.items || !data.shippingAddress || !data.billingAddress) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields' },
            { status: 400 }
          );
        }
        const order = await createOrder(data);
        return NextResponse.json({ success: true, data: order }, { status: 201 });

      case 'updateStatus':
        if (!data.orderId || !data.status) {
          return NextResponse.json(
            { success: false, error: 'orderId and status required' },
            { status: 400 }
          );
        }
        await updateOrderStatus(data.orderId, data.status);
        return NextResponse.json({ success: true });

      case 'updatePayment':
        if (!data.orderId || !data.paymentStatus) {
          return NextResponse.json(
            { success: false, error: 'orderId and paymentStatus required' },
            { status: 400 }
          );
        }
        await updatePaymentStatus(data.orderId, data.paymentStatus, data.stripePaymentIntentId);
        return NextResponse.json({ success: true });

      case 'fulfill':
        if (!data.orderId) {
          return NextResponse.json(
            { success: false, error: 'orderId required' },
            { status: 400 }
          );
        }
        await fulfillOrder(data.orderId);
        return NextResponse.json({ success: true });

      case 'cancel':
        if (!data.orderId) {
          return NextResponse.json(
            { success: false, error: 'orderId required' },
            { status: 400 }
          );
        }
        await cancelOrder(data.orderId, data.reason);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing order action:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to process order' },
      { status: 500 }
    );
  }
}
