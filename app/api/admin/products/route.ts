import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { uploadImageToS3, isBase64Image } from "@/lib/s3";
import crypto from "crypto";

// GET /api/admin/products - Получить все товары с пагинацией
export async function GET(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");
    const statusFilter = searchParams.get("status");
    const brandFilter = searchParams.get("brand");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");

    const whereClause: any = {
      status: { not: "deleted" },
    };

    // Фильтр по категории
    if (categoryId && categoryId !== "all") {
      whereClause.category_id = categoryId;
    }

    // Фильтр по статусу
    if (statusFilter && statusFilter !== "all") {
      whereClause.status = statusFilter;
    }

    // Фильтр по бренду
    if (brandFilter && brandFilter !== "all") {
      whereClause.brand = brandFilter;
    }

    // Поиск по названию, SKU, бренду
    if (search) {
      whereClause.OR = [
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
          sku: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          brand: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Подсчет общего количества товаров
    const total = await prisma.products.count({ where: whereClause });

    // Определение сортировки
    let orderBy: any = {};
    if (sortBy === "name") {
      orderBy = { product_translations: { _count: sortOrder } };
    } else if (sortBy === "price") {
      orderBy = { price: sortOrder };
    } else {
      orderBy = { created_at: sortOrder };
    }

    // Получение товаров с пагинацией
    const products = await prisma.products.findMany({
      where: whereClause,
      include: {
        product_translations: true,
        product_images: {
          where: { status: "active" },
        },
        categories: {
          include: {
            category_translations: true,
          },
        },
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

    return NextResponse.json({
      products,
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
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// POST /api/admin/products - Создать товар
export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sku, categoryId, brand, price, status, translations, images } =
      body;

    // Валидация
    if (!sku || !categoryId || !price) {
      return NextResponse.json(
        { error: "SKU, category and price are required" },
        { status: 400 },
      );
    }

    if (!translations || !translations.ru || !translations.kg) {
      return NextResponse.json(
        { error: "Translations for both ru and kg are required" },
        { status: 400 },
      );
    }

    if (!translations.ru.name || !translations.kg.name) {
      return NextResponse.json(
        { error: "Product name is required for both languages" },
        { status: 400 },
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 },
      );
    }

    // Проверка уникальности SKU
    const existingProduct = await prisma.products.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with this SKU already exists" },
        { status: 400 },
      );
    }

    // Загружаем изображения в S3
    const uploadedImages = await Promise.all(
      images.map(async (image: string) => {
        if (isBase64Image(image)) {
          return await uploadImageToS3(image, "products");
        }
        return image;
      }),
    );

    const productId = crypto.randomUUID();

    // Создание товара с переводами и изображениями
    const product = await prisma.products.create({
      data: {
        id: productId,
        sku,
        category_id: categoryId,
        brand: brand || null,
        price: parseFloat(price),
        status: status || "active",
        updated_at: new Date(),
        product_translations: {
          create: [
            {
              id: crypto.randomUUID(),
              locale: "ru",
              name: translations.ru.name,
              description: translations.ru.description || null,
            },
            {
              id: crypto.randomUUID(),
              locale: "kg",
              name: translations.kg.name,
              description: translations.kg.description || null,
            },
          ],
        },
        product_images: {
          create: uploadedImages.map((imageUrl) => ({
            id: crypto.randomUUID(),
            image_url: imageUrl,
            status: "active" as const,
          })),
        },
      },
      include: {
        product_translations: true,
        product_images: true,
        categories: {
          include: {
            category_translations: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
