import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        products: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      });
    }

    const searchWhere = {
      status: "active" as const,
      OR: [
        {
          product_translations: {
            some: {
              OR: [
                { name: { contains: query, mode: "insensitive" as const } },
                {
                  description: {
                    contains: query,
                    mode: "insensitive" as const,
                  },
                },
              ],
            },
          },
        },
        { sku: { contains: query, mode: "insensitive" as const } },
        { brand: { contains: query, mode: "insensitive" as const } },
      ],
    };

    // Поиск товаров
    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: searchWhere,
        include: {
          product_translations: true,
          product_images: {
            take: 1,
            orderBy: { id: "asc" },
          },
          categories: {
            include: {
              category_translations: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.products.count({
        where: searchWhere,
      }),
    ]);

    // Форматирование данных
    const formattedProducts = products.map((product) => {
      const averageRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            product.reviews.length
          : 0;

      return {
        id: product.id,
        sku: product.sku,
        brand: product.brand,
        price: product.price,
        status: product.status,
        translations: product.product_translations,
        images: product.product_images.map((img) => ({
          imageUrl: img.image_url,
        })),
        category: product.categories
          ? {
              id: product.categories.id,
              translations: product.categories.category_translations,
            }
          : null,
        averageRating: parseFloat(averageRating.toFixed(1)),
        _count: {
          reviews: product._count.reviews,
        },
      };
    });

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Ошибка при поиске товаров" },
      { status: 500 },
    );
  }
}
