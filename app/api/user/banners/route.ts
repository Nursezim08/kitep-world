import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export async function GET() {
  const prisma = getPrismaClient();

  try {
    // Получаем только активные баннеры
    const banners = await (prisma as any).banner.findMany({
      where: {
        status: "active",
      },
      orderBy: {
        id: "asc",
      },
    });

    // Переименовываем поля в camelCase для клиента
    const result = banners.map((b: any) => ({
      id: b.id,
      url: b.url,
      status: b.status,
      desktopImage: b.desktopImage,
      mobileImage: b.mobileImage,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить баннеры" },
      { status: 500 },
    );
  }
}
