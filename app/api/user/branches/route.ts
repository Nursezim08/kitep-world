import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function GET() {
  const prisma = getPrismaClient();

  try {
    // Проверка авторизации
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Блокируем только админов и менеджеров в режиме менеджера
    if (user.role === "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (user.role === "manager" && user.loginType === "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Получаем все активные филиалы из таблицы branches
    const branchesRaw = await prisma.branches.findMany({
      where: {
        status: "active",
      },
      orderBy: {
        code: "asc",
      },
    });

    // Форматируем данные для клиента
    const branches = branchesRaw.map((branch) => ({
      id: branch.id,
      code: branch.code,
      city: branch.city,
      district: branch.district,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      // work_days уже массив в БД
      workDays: branch.work_days || [],
      // Форматируем время из Time в строку HH:MM
      openTime: branch.open_time
        ? branch.open_time.toString().substring(0, 5)
        : "09:00",
      closeTime: branch.close_time
        ? branch.close_time.toString().substring(0, 5)
        : "18:00",
    }));

    return NextResponse.json({ branches });
  } catch (error) {
    console.error("Error fetching branches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
