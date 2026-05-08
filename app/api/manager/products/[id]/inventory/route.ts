import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    if (user.role !== 'manager') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    // Получаем филиал менеджера
    const branchUser = await prisma.branchUser.findFirst({
      where: { userId: user.id },
      include: { branch: true },
    });

    if (!branchUser) {
      return NextResponse.json({ error: 'Филиал не найден' }, { status: 404 });
    }

    const branchId = branchUser.branchId;
    const { id: productId } = await params;
    const body = await request.json();
    const { quantity } = body;

    // Валидация
    if (typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json(
        { error: 'Некорректное количество' },
        { status: 400 }
      );
    }

    // Проверяем существование товара
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    // Обновляем или создаем запись в inventory
    const inventory = await prisma.branchInventory.upsert({
      where: {
        branchId_productId: {
          branchId,
          productId,
        },
      },
      update: {
        quantity,
      },
      create: {
        branchId,
        productId,
        quantity,
      },
    });

    return NextResponse.json({
      success: true,
      inventory: {
        id: inventory.id,
        quantity: inventory.quantity,
        updatedAt: inventory.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json(
      { error: 'Не удалось обновить количество' },
      { status: 500 }
    );
  }
}
