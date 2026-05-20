import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import crypto from "crypto";

// GET /api/admin/settings - Получение всех настроек
export async function GET(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const user = await verifyAuth(request);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const settings = await prisma.settings.findMany({
      orderBy: {
        key: "asc",
      },
    });

    // Преобразуем в объект для удобства
    const settingsObject = settings.reduce(
      (acc: Record<string, string>, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {} as Record<string, string>,
    );

    return NextResponse.json({ settings: settingsObject });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Ошибка при получении настроек" },
      { status: 500 },
    );
  }
}

// POST /api/admin/settings - Обновление настроек
export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const user = await verifyAuth(request);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Неверный формат данных" },
        { status: 400 },
      );
    }

    // Обновляем каждую настройку
    const updatePromises = Object.entries(settings).map(([key, value]) =>
      prisma.settings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { id: crypto.randomUUID(), key, value: String(value) },
      }),
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении настроек" },
      { status: 500 },
    );
  }
}
