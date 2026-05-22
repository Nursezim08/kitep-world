import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

function isUserAccess(user: { role: string; loginType?: string } | null): boolean {
  if (!user) return false;
  if (user.role === 'admin') return false;
  if (user.role === 'manager' && user.loginType === 'manager') return false;
  return true;
}

// PATCH /api/user/cart/[id] - Обновление количества товара в корзине
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = getPrismaClient();
  try {
    const user = await getCurrentUser();

    if (!user || !isUserAccess(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { quantity } = await request.json();

    if (quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be at least 1' },
        { status: 400 }
      );
    }

    // Проверяем, что товар принадлежит пользователю
    const cartItem = await prisma.carts.findUnique({
      where: { id },
    });

    if (!cartItem || cartItem.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Обновляем количество
    const updatedCartItem = await prisma.carts.update({
      where: { id },
      data: { quantity },
    });

    return NextResponse.json({ cartItem: updatedCartItem });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/cart/[id] - Удаление товара из корзины
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = getPrismaClient();
  try {
    const user = await getCurrentUser();

    if (!user || !isUserAccess(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Проверяем, что товар принадлежит пользователю
    const cartItem = await prisma.carts.findUnique({
      where: { id },
    });

    if (!cartItem || cartItem.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Удаляем товар из корзины
    await prisma.carts.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    return NextResponse.json(
      { error: 'Failed to remove cart item' },
      { status: 500 }
    );
  }
}
