import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import crypto from "crypto";

// GET - Получить все филиалы с пагинацией
export async function GET(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status");
    const cityFilter = searchParams.get("city");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const whereClause: any = {};

    // Фильтр по статусу
    if (statusFilter && statusFilter !== "all") {
      whereClause.status = statusFilter;
    }

    // Фильтр по городу
    if (cityFilter && cityFilter !== "all") {
      whereClause.city = cityFilter;
    }

    // Поиск по названию, коду или адресу
    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          code: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          address: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Подсчет общего количества филиалов
    const total = await prisma.branches.count({ where: whereClause });

    // Определение сортировки
    let orderBy: any = {};
    if (sortBy === "name") {
      orderBy = { name: sortOrder };
    } else if (sortBy === "city") {
      orderBy = { city: sortOrder };
    } else {
      orderBy = { created_at: sortOrder };
    }

    // Получение филиалов с пагинацией
    const branches = await prisma.branches.findMany({
      where: whereClause,
      include: {
        branch_users: {
          include: {
            users: {
              select: {
                id: true,
                full_name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            branch_users: true,
            orders: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      branches,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching branches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Создать новый филиал
export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      code,
      city,
      district,
      address,
      phone,
      email,
      managerIds,
      latitude,
      longitude,
      schedule,
      status = "active",
    } = body;

    // Валидация обязательных полей
    if (!name || !code || !city || !district || !address || !phone || !email) {
      return NextResponse.json(
        { error: "Все обязательные поля должны быть заполнены" },
        { status: 400 },
      );
    }

    // Проверка уникальности кода
    const existingBranch = await prisma.branches.findUnique({
      where: { code },
    });

    if (existingBranch) {
      return NextResponse.json(
        { error: "Филиал с таким кодом уже существует" },
        { status: 400 },
      );
    }

    // Если указаны менеджеры, проверяем что они существуют и являются менеджерами
    if (managerIds && Array.isArray(managerIds) && managerIds.length > 0) {
      const managers = await prisma.users.findMany({
        where: {
          id: { in: managerIds },
          role: "manager",
        },
        include: {
          branch_users: {
            select: {
              branch_id: true,
            },
          },
        },
      });

      if (managers.length !== managerIds.length) {
        return NextResponse.json(
          { error: "Один или несколько указанных менеджеров не найдены" },
          { status: 400 },
        );
      }

      // Проверяем, что менеджеры не назначены в другие филиалы
      for (const manager of managers) {
        if (manager.branch_users.length > 0) {
          return NextResponse.json(
            {
              error: `Менеджер ${manager.full_name} уже назначен в другой филиал`,
            },
            { status: 400 },
          );
        }
      }
    }

    // Обработка расписания
    let workDays: string[] = [];
    let openTime: string | null = null;
    let closeTime: string | null = null;

    if (schedule && typeof schedule === "object") {
      workDays = Object.entries(schedule)
        .filter(([_, dayData]: [string, any]) => dayData.isWorking)
        .map(([day, _]) => day);

      const firstWorkingDay = Object.values(schedule).find(
        (dayData: any) => dayData.isWorking,
      );
      if (firstWorkingDay && typeof firstWorkingDay === "object") {
        openTime = (firstWorkingDay as any).openTime || null;
        closeTime = (firstWorkingDay as any).closeTime || null;
      }
    }

    // Создание филиала
    const branch = await prisma.branches.create({
      data: {
        id: crypto.randomUUID(),
        name,
        code,
        city,
        district,
        address,
        phone,
        email,
        latitude: latitude !== null ? latitude : null,
        longitude: longitude !== null ? longitude : null,
        open_time: openTime ? new Date(`1970-01-01T${openTime}:00`) : null,
        close_time: closeTime ? new Date(`1970-01-01T${closeTime}:00`) : null,
        work_days: workDays,
        status,
        updated_at: new Date(),
      },
    });

    // Привязываем менеджеров к филиалу
    if (managerIds && Array.isArray(managerIds) && managerIds.length > 0) {
      await prisma.branch_users.createMany({
        data: managerIds.map((managerId) => ({
          id: crypto.randomUUID(),
          branch_id: branch.id,
          user_id: managerId,
        })),
      });
    }

    // Получаем созданный филиал с менеджерами
    const createdBranch = await prisma.branches.findUnique({
      where: { id: branch.id },
      include: {
        branch_users: {
          include: {
            users: {
              select: {
                id: true,
                full_name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ branch: createdBranch }, { status: 201 });
  } catch (error) {
    console.error("Error creating branch:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
