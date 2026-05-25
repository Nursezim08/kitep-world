import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

// GET /api/admin/banners - Получение всех баннеров
export async function GET(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const banners = await prisma.banner.findMany({
      orderBy: { id: "desc" },
      include: { translations: true },
    });

    const mapped = banners.map((b) => ({
      ...b,
      title: b.translations.find((t) => t.locale === 'ru')?.title ?? b.translations[0]?.title ?? '',
    }));

    return NextResponse.json({ banners: mapped });
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/admin/banners - Создание баннера
export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, desktopImage, mobileImage, url, status } = body;

    // Валидация
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Название обязательно" },
        { status: 400 },
      );
    }

    if (!desktopImage) {
      return NextResponse.json(
        { error: "Изображение для десктопа обязательно" },
        { status: 400 },
      );
    }

    if (!mobileImage) {
      return NextResponse.json(
        { error: "Изображение для мобильных обязательно" },
        { status: 400 },
      );
    }

    if (!["active", "inactive"].includes(status)) {
      return NextResponse.json({ error: "Неверный статус" }, { status: 400 });
    }

    // Создание баннера (Banner модель использует @default(uuid()) — id не нужно передавать)
    const banner = await prisma.banner.create({
      data: {
        desktopImage,
        mobileImage,
        url: url?.trim() || null,
        status,
        translations: {
          create: [
            { locale: 'ru', title: title.trim() },
          ],
        },
      },
      include: { translations: true },
    });

    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    console.error("Error creating banner:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
