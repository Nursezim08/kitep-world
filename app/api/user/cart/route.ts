import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import crypto from "crypto";

// Вспомогательная функция: проверяет доступ к пользовательскому разделу
function isUserAccess(user: { role: string; loginType?: string; id?: string } | null): boolean {
  if (!user) return false;
  if (user.role === "admin") return false;
  if (user.role === "manager" && user.loginType === "manager") return false;
  return true;
}

// GET /api/user/cart - Получение корзины пользователя
export async function GET() {
  const prisma = getPrismaClient();
  try {
    const user = await getCurrentUser();

    if (!user || !isUserAccess(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cartItems = await prisma.carts.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        products: {
          include: {
            product_translations: true,
            product_images: {
              where: { status: "active" },
              take: 1,
            },
            categories: {
              include: {
                category_translations: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Фильтруем только активные товары и форматируем ответ
    const activeCartItems = cartItems
      .filter((item) => item.products.status === "active")
      .map((item) => {
        const {
          product_translations,
          product_images,
          categories,
          ...productData
        } = item.products;
        return {
          id: item.id,
          user_id: item.user_id,
          product_id: item.product_id,
          quantity: item.quantity,
          created_at: item.created_at,
          product: {
            ...productData,
            translations: product_translations.map((t) => ({
              locale: t.locale,
              name: t.name,
              description: t.description,
            })),
            images: product_images.map((img) => ({ imageUrl: img.image_url })),
            category: {
              translations: categories.category_translations.map((t) => ({
                locale: t.locale,
                name: t.name,
              })),
            },
          },
        };
      });

    return NextResponse.json({ cartItems: activeCartItems });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 },
    );
  }
}

// POST /api/user/cart - Добавление товара в корзину
export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const user = await getCurrentUser();

    if (!user || !isUserAccess(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1" },
        { status: 400 },
      );
    }

    // Проверяем существование товара
    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product || product.status !== "active") {
      return NextResponse.json(
        { error: "Product not found or inactive" },
        { status: 404 },
      );
    }

    // Проверяем, есть ли товар уже в корзине
    const existingCartItem = await prisma.carts.findUnique({
      where: {
        user_id_product_id: {
          user_id: user.id,
          product_id: productId,
        },
      },
    });

    let cartItem;

    if (existingCartItem) {
      // Обновляем количество
      cartItem = await prisma.carts.update({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
        include: {
          products: {
            include: {
              product_translations: true,
              product_images: {
                where: { status: "active" },
                take: 1,
              },
            },
          },
        },
      });
    } else {
      // Создаем новую запись
      cartItem = await prisma.carts.create({
        data: {
          id: crypto.randomUUID(),
          user_id: user.id,
          product_id: productId,
          quantity,
        },
        include: {
          products: {
            include: {
              product_translations: true,
              product_images: {
                where: { status: "active" },
                take: 1,
              },
            },
          },
        },
      });
    }

    return NextResponse.json({ cartItem });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 },
    );
  }
}

// DELETE /api/user/cart - Очистка всей корзины
export async function DELETE() {
  const prisma = getPrismaClient();
  try {
    const user = await getCurrentUser();

    if (!user || !isUserAccess(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.carts.deleteMany({
      where: {
        user_id: user.id,
      },
    });

    return NextResponse.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 },
    );
  }
}
