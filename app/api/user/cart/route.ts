import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { cookies } from "next/headers";
import {
  cookieName,
  fallbackLng,
  type Language,
  languages,
} from "@/app/i18n/settings";
import crypto from "crypto";

// GET /api/user/cart - Получение корзины пользователя
export async function GET() {
  const prisma = getPrismaClient();
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Получаем язык из cookie
    const cookieStore = await cookies();
    const lang = cookieStore.get(cookieName)?.value;
    const locale =
      lang && languages.includes(lang as Language)
        ? (lang as Language)
        : fallbackLng;

    const cartItems = await prisma.carts.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        products: {
          include: {
            product_translations: {
              where: {
                locale: locale,
              },
            },
            product_images: {
              where: { status: "active" },
              take: 1,
            },
            categories: {
              include: {
                category_translations: {
                  where: {
                    locale: locale,
                  },
                },
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
            name: product_translations[0]?.name || "",
            description: product_translations[0]?.description || "",
            images: product_images.map((img) => ({ imageUrl: img.image_url })),
            category: {
              name: categories.category_translations[0]?.name || "",
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

    if (!user || user.role !== "user") {
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

    if (!user || user.role !== "user") {
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
