import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { cookies } from "next/headers";
import {
  cookieName,
  fallbackLng,
  type Language,
  languages,
} from "@/app/i18n/settings";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const prisma = getPrismaClient();

  try {
    const { id } = await context.params;

    // Получаем язык из cookie
    const cookieStore = await cookies();
    const lang = cookieStore.get(cookieName)?.value;
    const locale =
      lang && languages.includes(lang as Language)
        ? (lang as Language)
        : fallbackLng;

    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        product_translations: {
          where: { locale: locale },
        },
        product_images: {
          where: { status: "active" },
        },
        categories: {
          include: {
            category_translations: {
              where: { locale: locale },
            },
          },
        },
        reviews: {
          include: {
            users: {
              select: {
                id: true,
                full_name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
    }

    if (product.status !== "active") {
      return NextResponse.json({ error: "Товар недоступен" }, { status: 404 });
    }

    const averageRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length
        : 0;

    return NextResponse.json({
      id: product.id,
      sku: product.sku,
      brand: product.brand,
      price: product.price,
      status: product.status,
      created_at: product.created_at,
      updated_at: product.updated_at,
      name: product.product_translations[0]?.name || "",
      description: product.product_translations[0]?.description || "",
      images: product.product_images.map((img) => ({
        id: img.id,
        imageUrl: img.image_url,
        status: img.status,
      })),
      category: {
        id: product.categories.id,
        name: product.categories.category_translations[0]?.name || "",
      },
      reviews: product.reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        user: {
          id: review.users.id,
          fullName: review.users.full_name,
          avatar: review.users.avatar,
        },
      })),
      averageRating: Number(averageRating.toFixed(1)),
      _count: product._count,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Ошибка при загрузке товара" },
      { status: 500 },
    );
  }
}
