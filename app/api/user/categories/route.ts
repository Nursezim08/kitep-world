import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");

    // Получаем только активные корневые категории
    const categories = await prisma.categories.findMany({
      where: {
        parent_id: null,
        status: "active",
      },
      include: {
        category_translations: {
          select: {
            locale: true,
            name: true,
          },
        },
        _count: {
          select: {
            products: {
              where: {
                status: "active",
              },
            },
          },
        },
      },
      orderBy: {
        products: {
          _count: "desc",
        },
      },
      take: limit ? parseInt(limit) : undefined,
    });

    // Переименовываем поля в camelCase для клиента
    const result = categories.map((cat) => ({
      id: cat.id,
      image: cat.image,
      status: cat.status,
      translations: cat.category_translations,
      _count: cat._count,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить категории" },
      { status: 500 },
    );
  }
}
