import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { uploadImageToS3, isBase64Image } from "@/lib/s3";
import crypto from "crypto";

const mapCategory = (cat: any): any => ({
  id: cat.id,
  parentId: cat.parent_id,
  image: cat.image,
  status: cat.status,
  createdAt: cat.created_at ?? '',
  updatedAt: cat.updated_at ?? '',
  translations: (cat.category_translations || []).map((t: any) => ({
    id: t.id,
    locale: t.locale,
    name: t.name,
  })),
  children: (cat.other_categories || []).map((child: any) => mapCategory(child)),
  _count: {
    children: cat._count?.other_categories ?? 0,
    products: cat._count?.products ?? 0,
  },
  ...(cat.level !== undefined ? { level: cat.level } : {}),
});

// GET /api/admin/categories - Получить все категории
export async function GET(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const parentId = searchParams.get("parentId");
    const level = searchParams.get("level");

    // Если указан level, загружаем все категории с вычислением уровня
    if (level !== null && level !== undefined) {
      const levelNum = parseInt(level);

      const allCategories = await prisma.categories.findMany({
        where: {
          status: { not: "deleted" },
        },
        include: {
          category_translations: true,
          _count: {
            select: {
              other_categories: {
                where: { status: { not: "deleted" } },
              },
              products: true,
            },
          },
        },
      });

      const getCategoryLevel = (
        categoryId: string,
        categories: any[],
      ): number => {
        const category = categories.find((c) => c.id === categoryId);
        if (!category || !category.parent_id) return 0;
        return 1 + getCategoryLevel(category.parent_id, categories);
      };

      let filteredCategories = allCategories.filter((cat) => {
        const catLevel = getCategoryLevel(cat.id, allCategories);
        return catLevel === levelNum;
      });

      if (search) {
        filteredCategories = filteredCategories.filter((cat) => {
          const ruName =
            cat.category_translations.find((t: any) => t.locale === "ru")
              ?.name || "";
          const kgName =
            cat.category_translations.find((t: any) => t.locale === "kg")
              ?.name || "";
          return (
            ruName.toLowerCase().includes(search.toLowerCase()) ||
            kgName.toLowerCase().includes(search.toLowerCase())
          );
        });
      }

      const categoriesWithLevel = filteredCategories.map((cat) => ({
        ...cat,
        level: getCategoryLevel(cat.id, allCategories),
      }));

      return NextResponse.json(categoriesWithLevel.map(mapCategory));
    }

    // Стандартная логика с parentId
    const whereClause: any = {
      status: { not: "deleted" },
    };

    if (parentId === "null" || parentId === null) {
      whereClause.parent_id = null;
    } else if (parentId) {
      whereClause.parent_id = parentId;
    }

    if (search) {
      whereClause.category_translations = {
        some: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      };
    }

    const categories = await prisma.categories.findMany({
      where: whereClause,
      include: {
        category_translations: true,
        other_categories: {
          where: { status: { not: "deleted" } },
          include: {
            category_translations: true,
          },
        },
        _count: {
          select: {
            other_categories: {
              where: { status: { not: "deleted" } },
            },
            products: true,
          },
        },
      },
      orderBy: {
        category_translations: {
          _count: "desc",
        },
      },
    });

    return NextResponse.json(categories.map(mapCategory));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

// POST /api/admin/categories - Создать категорию
export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { parentId, image, translations, status } = body;

    // Валидация
    if (!translations || !translations.ru || !translations.kg) {
      return NextResponse.json(
        { error: "Translations for both ru and kg are required" },
        { status: 400 },
      );
    }

    if (!translations.ru.name || !translations.kg.name) {
      return NextResponse.json(
        { error: "Category name is required for both languages" },
        { status: 400 },
      );
    }

    // Загружаем изображение в S3, если это base64
    let imageUrl = image;
    if (image && isBase64Image(image)) {
      imageUrl = await uploadImageToS3(image, "categories");
    }

    const categoryId = crypto.randomUUID();

    // Создание категории с переводами
    const category = await prisma.categories.create({
      data: {
        id: categoryId,
        parent_id: parentId || null,
        image: imageUrl || null,
        status: status || "active",
        category_translations: {
          create: [
            {
              id: crypto.randomUUID(),
              locale: "ru",
              name: translations.ru.name,
            },
            {
              id: crypto.randomUUID(),
              locale: "kg",
              name: translations.kg.name,
            },
          ],
        },
      },
      include: {
        category_translations: true,
        _count: {
          select: {
            other_categories: true,
            products: true,
          },
        },
      },
    });

    return NextResponse.json(mapCategory(category), { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
