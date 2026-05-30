import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'manager') {
      console.log('[MANAGER_ORDER_GET] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    console.log('[MANAGER_ORDER_GET] Fetching order:', id);
    
    const prisma = getPrismaClient();

    // Получаем филиал менеджера (используем правильное имя таблицы)
    const branchUser = await prisma.branch_users.findFirst({
      where: { user_id: user.id },
      select: { branch_id: true },
    });

    if (!branchUser) {
      console.log('[MANAGER_ORDER_GET] Manager not assigned to any branch');
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    console.log('[MANAGER_ORDER_GET] Manager branch:', branchUser.branch_id);

    // Получаем заказ с проверкой доступа
    const order = await prisma.orders.findFirst({
      where: {
        id,
        branch_id: branchUser.branch_id,
      },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
        branches: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        order_items: {
          include: {
            products: {
              include: {
                product_translations: {
                  where: { locale: 'ru' },
                  select: {
                    name: true,
                    description: true,
                  },
                },
                product_images: {
                  take: 1,
                  select: {
                    image_url: true,
                  },
                },
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            provider: true,
            transaction_id: true,
            amount: true,
            status: true,
          },
        },
      },
    });

    if (!order) {
      console.log('[MANAGER_ORDER_GET] Order not found or access denied');
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    console.log('[MANAGER_ORDER_GET] Order found, items count:', order.order_items.length);

    const firstPayment = order.payments[0] ?? null;

    // Форматируем данные для фронтенда
    const formattedOrder = {
      id: order.id,
      orderNumber: order.order_number,
      totalAmount: Number(order.total),
      status: order.order_status,
      createdAt: order.created_at,
      user: {
        id: order.users?.id,
        fullName: order.users?.full_name,
        email: order.users?.email,
        phone: order.users?.phone,
      },
      branch: {
        id: order.branches?.id,
        name: order.branches?.name,
        city: order.branches?.city,
      },
      orderItems: order.order_items.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        price: Number(item.total),
        product: {
          id: item.products?.id,
          sku: item.products?.sku,
          translations: item.products?.product_translations || [],
          images: item.products?.product_images?.map((img: any) => ({
            imageUrl: img.image_url,
          })) || [],
        },
      })),
      payment: firstPayment
        ? {
            id: firstPayment.id,
            provider: firstPayment.provider,
            transactionId: firstPayment.transaction_id,
            amount: Number(firstPayment.amount),
            status: firstPayment.status,
          }
        : null,
    };

    console.log('[MANAGER_ORDER_GET] Returning formatted order');
    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error('[MANAGER_ORDER_GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
