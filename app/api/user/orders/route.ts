import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Проверка авторизации
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Проверка роли
    if (user.role !== 'user') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { branchId, comment } = body;

    // Валидация
    if (!branchId) {
      return NextResponse.json(
        { error: 'Branch ID is required' },
        { status: 400 }
      );
    }

    // Проверяем существование филиала
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch || branch.status !== 'active') {
      return NextResponse.json(
        { error: 'Branch not found or inactive' },
        { status: 404 }
      );
    }

    // Получаем корзину пользователя
    const cartItems = await prisma.cart.findMany({
      where: {
        userId: user.userId,
      },
      include: {
        product: {
          include: {
            translations: true,
            images: true,
          },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Рассчитываем общую сумму
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    // Генерируем номер заказа
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Создаем заказ в транзакции
    const order = await prisma.$transaction(async (tx) => {
      // Создаем заказ
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user.userId,
          branchId,
          totalAmount,
          status: 'pending', // Ожидает оплаты
          comment: comment || undefined,
        },
      });

      // Создаем элементы заказа
      await tx.orderItem.createMany({
        data: cartItems.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      });

      // Очищаем корзину
      await tx.cart.deleteMany({
        where: {
          userId: user.userId,
        },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
