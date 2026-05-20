import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const searchParams = request.nextUrl.searchParams;
    const popular = searchParams.get("popular") === "true";
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");

    const where: any = {
      status: "active",
    };

    if (categoryId) {
      where.category_id = categoryId;
    }

    // Поиск по названию, описанию, бренду, SKU
    if (search) {
      where.OR = [
        {
          product_translations: {
            some: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          product_translations: {
            some: {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          brand: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          sku: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Подсчет общего количества товаров
    const total = await prisma.products.count({ where });

    // Определение сортировки
    let orderBy: any = {};
    if (sortBy === "price") {
      orderBy = { price: sortOrder };
    } else if (sortBy === "name") {
      orderBy = { product_translations: { _count: sortOrder } };
    } else {
      orderBy = { created_at: sortOrder };
    }

    // Получаем товары с пагинацией
    const products = await prisma.products.findMany({
      where,
      include: {
        product_translations: {
          select: {
            locale: true,
            name: true,
            description: true,
          },
        },
        product_images: {
          where: {
            status: "active",
          },
          select: {
            image_url: true,
          },
          take: 1,
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        order_items: popular
          ? {
              include: {
                orders: {
                  select: {
                    created_at: true,
                  },
                },
              },
            }
          : undefined,
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    // Рассчитываем средний рейтинг и количество проданных для каждого товара
    const productsWithRating = products.map((product) => {
      const totalRating = product.reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      const averageRating =
        product.reviews.length > 0
          ? Number((totalRating / product.reviews.length).toFixed(1))
          : 0;

      let totalSold = 0;

      if (popular && product.order_items) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        totalSold = (product.order_items as any[]).reduce(
          (sum: number, item: any) => {
            const orderDate = new Date(item.orders.created_at);
            if (orderDate >= thirtyDaysAgo) {
              return sum + item.quantity;
            }
            return sum;
          },
          0,
        );
      }

      // Убираем reviews и order_items из ответа, переименовываем поля в camelCase
      const {
        reviews: _reviews,
        order_items: _order_items,
        product_translations,
        product_images,
        ...rest
      } = product;

      return {
        ...rest,
        translations: product_translations,
        images: product_images.map((img) => ({ imageUrl: img.image_url })),
        averageRating,
        totalSold,
      };
    });

    // Если запрос популярных товаров, сортируем по количеству продаж
    if (popular) {
      productsWithRating.sort((a, b) => b.totalSold - a.totalSold);
    }

    return NextResponse.json({
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить товары" },
      { status: 500 },
    );
  }
}
