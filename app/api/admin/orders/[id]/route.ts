import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ORDER_INCLUDE = Prisma.validator<Prisma.ordersInclude>()({
  users: {
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      avatar: true,
    },
  },
  branches: {
    select: {
      id: true,
      name: true,
      code: true,
      city: true,
      district: true,
      address: true,
      phone: true,
    },
  },
  order_items: {
    include: {
      products: {
        include: {
          product_translations: {
            where: { locale: 'ru' },
          },
          product_images: {
            where: { status: 'active' },
            take: 1,
          },
        },
      },
    },
  },
  payments: true,
});

type OrderWithIncludes = Prisma.ordersGetPayload<{ include: typeof ORDER_INCLUDE }>;

function serializeOrder(order: OrderWithIncludes) {
  return {
    id: order.id,
    orderNumber: order.order_number,
    total: Number(order.total),
    orderStatus: order.order_status,
    paymentStatus: order.payment_status,
    comment: order.comment ?? null,
    createdAt: order.created_at.toISOString(),
    user: {
      id: order.users.id,
      fullName: order.users.full_name,
      email: order.users.email,
      phone: order.users.phone,
      avatar: order.users.avatar,
    },
    branch: {
      id: order.branches.id,
      name: order.branches.name,
      code: order.branches.code,
      city: order.branches.city,
      district: order.branches.district,
      address: order.branches.address,
      phone: order.branches.phone,
    },
    items: order.order_items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      total: Number(item.total),
      product: {
        id: item.products.id,
        sku: item.products.sku,
        price: Number(item.products.price),
        translations: item.products.product_translations.map((t) => ({
          name: t.name,
          description: t.description,
        })),
        images: item.products.product_images.map((img) => ({
          imageUrl: img.image_url,
        })),
      },
    })),
    payments: order.payments.map((payment) => ({
      id: payment.id,
      provider: payment.provider,
      transactionId: payment.transaction_id,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      paidAt: payment.paid_at.toISOString(),
    })),
  };
}

// GET /api/admin/orders/[id] - Получение заказа по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyAuth(request);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const order = await prisma.orders.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order: serializeOrder(order) });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/orders/[id] - Обновление статуса заказа
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyAuth(request);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { orderStatus } = body;

    if (!orderStatus || !['paid', 'completed', 'cancelled'].includes(orderStatus)) {
      return NextResponse.json(
        { error: 'Invalid order status' },
        { status: 400 }
      );
    }

    await prisma.orders.update({
      where: { id },
      data: { order_status: orderStatus },
    });

    const order = await prisma.orders.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order: serializeOrder(order) });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
