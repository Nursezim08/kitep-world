import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/user/cart - Получение корзины пользователя
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'user') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const cartItems = await prisma.cart.findMany({
      where: {
        userId: user.id,
      },
      include: {
        product: {
          include: {
            translations: true,
            images: {
              where: { status: 'active' },
              take: 1,
            },
            category: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Фильтруем только активные товары
    const activeCartItems = cartItems.filter(
      (item) => item.product.status === 'active'
    );

    return NextResponse.json({ cartItems: activeCartItems });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST /api/user/cart - Добавление товара в корзину
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'user') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be at least 1' },
        { status: 400 }
      );
    }

    // Проверяем существование товара
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.status !== 'active') {
      return NextResponse.json(
        { error: 'Product not found or inactive' },
        { status: 404 }
      );
    }

    // Проверяем, есть ли товар уже в корзине
    const existingCartItem = await prisma.cart.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    let cartItem;

    if (existingCartItem) {
      // Обновляем количество
      cartItem = await prisma.cart.update({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
        include: {
          product: {
            include: {
              translations: true,
              images: {
                where: { status: 'active' },
                take: 1,
              },
            },
          },
        },
      });
    } else {
      // Создаем новую запись
      cartItem = await prisma.cart.create({
        data: {
          userId: user.id,
          productId,
          quantity,
        },
        include: {
          product: {
            include: {
              translations: true,
              images: {
                where: { status: 'active' },
                take: 1,
              },
            },
          },
        },
      });
    }

    return NextResponse.json({ cartItem });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/cart - Очистка всей корзины
export async function DELETE() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'user') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.cart.deleteMany({
      where: {
        userId: user.id,
      },
    });

    return NextResponse.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
