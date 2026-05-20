import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    if (user.role !== "manager") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    // Получаем филиал менеджера
    const branchUser = await prisma.branch_users.findFirst({
      where: { user_id: user.id },
      include: { branches: true },
    });

    if (!branchUser) {
      return NextResponse.json({ error: "Филиал не найден" }, { status: 404 });
    }

    const branchId = branchUser.branch_id;

    // Получаем параметры поиска
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");

    // Формируем условия фильтрации
    const where: any = {
      status: { not: "deleted" },
    };

    // Поиск по названию, SKU или бренду
    if (search) {
      where.OR = [
        { sku: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        {
          product_translations: {
            some: {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        },
      ];
    }

    // Фильтр по категории
    if (categoryId && categoryId !== "all") {
      where.category_id = categoryId;
    }

    // Получаем все товары с остатками для данного филиала
    const products = await prisma.products.findMany({
      where,
      include: {
        product_translations: true,
        product_images: {
          where: { status: "active" },
          orderBy: { id: "asc" },
          take: 1,
        },
        categories: {
          include: {
            category_translations: true,
          },
        },
        branch_inventory: {
          where: { branch_id: branchId },
        },
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Форматируем данные для фронтенда
    const formattedProducts = products.map((product) => ({
      id: product.id,
      sku: product.sku,
      categoryId: product.category_id,
      brand: product.brand,
      price: Number(product.price),
      status: product.status,
      createdAt: product.created_at.toISOString(),
      updatedAt: product.updated_at.toISOString(),
      translations: product.product_translations,
      images: product.product_images,
      category: product.categories,
      inventory: product.branch_inventory[0] || { quantity: 0 },
      _count: product._count,
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Error fetching manager products:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить товары" },
      { status: 500 },
    );
  }
}
