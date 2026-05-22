import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import crypto from 'crypto';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = getPrismaClient();
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    if (user.role !== 'manager') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    // Получаем филиал менеджера
    const branchUser = await prisma.branch_users.findFirst({
      where: { user_id: user.id },
      select: { branch_id: true },
    });

    if (!branchUser) {
      return NextResponse.json({ error: 'Филиал не найден' }, { status: 404 });
    }

    const branchId = branchUser.branch_id;
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
    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    // Обновляем или создаем запись в inventory
    const existing = await prisma.branch_inventory.findFirst({
      where: { branch_id: branchId, product_id: productId },
    });

    let inventory;
    if (existing) {
      inventory = await prisma.branch_inventory.update({
        where: { id: existing.id },
        data: { quantity, updated_at: new Date() },
      });
    } else {
      inventory = await prisma.branch_inventory.create({
        data: {
          id: crypto.randomUUID(),
          branch_id: branchId,
          product_id: productId,
          quantity,
          updated_at: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      inventory: {
        id: inventory.id,
        quantity: inventory.quantity,
        updatedAt: inventory.updated_at.toISOString(),
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
