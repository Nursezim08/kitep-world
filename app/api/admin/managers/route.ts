import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import crypto from "crypto";

// GET - получить всех менеджеров с пагинацией
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
    const branchFilter = searchParams.get("branch");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const whereClause: any = {
      role: "manager",
    };

    // Фильтр по статусу
    if (statusFilter && statusFilter !== "all") {
      whereClause.status = statusFilter;
    }

    // Фильтр по филиалу
    if (branchFilter && branchFilter !== "all") {
      whereClause.branch_users = {
        some: {
          branch_id: branchFilter,
        },
      };
    }

    // Поиск по имени или email
    if (search) {
      whereClause.OR = [
        {
          full_name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Подсчет общего количества менеджеров
    const total = await prisma.users.count({ where: whereClause });

    // Определение сортировки
    let orderBy: any = {};
    if (sortBy === "name") {
      orderBy = { full_name: sortOrder };
    } else if (sortBy === "email") {
      orderBy = { email: sortOrder };
    } else {
      orderBy = { created_at: sortOrder };
    }

    // Получаем менеджеров с пагинацией
    const managers = await prisma.users.findMany({
      where: whereClause,
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        status: true,
        created_at: true,
        branch_users: {
          select: {
            branch_id: true,
            branches: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
          },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      managers: managers.map((m) => ({
        id: m.id,
        fullName: m.full_name,
        email: m.email,
        phone: m.phone,
        status: m.status,
        createdAt: m.created_at,
        branchUsers: m.branch_users.map((bu) => ({
          branch: {
            id: bu.branches.id,
            name: bu.branches.name,
            city: bu.branches.city,
          },
        })),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get managers error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - создать нового менеджера
export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, email, phone, password, branchId } = body;

    // Валидация
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Проверка существования email
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }

    // Проверка существования телефона (если указан)
    if (phone) {
      const existingPhone = await prisma.users.findUnique({
        where: { phone },
      });

      if (existingPhone) {
        return NextResponse.json(
          { error: "Phone already exists" },
          { status: 400 },
        );
      }
    }

    // Хешируем пароль
    const passwordHash = await hashPassword(password);

    // Создаем менеджера
    const manager = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        full_name: fullName,
        email,
        phone: phone || null,
        password_hash: passwordHash,
        role: "manager",
        email_verified: true,
        status: "active",
        updated_at: new Date(),
      },
    });

    // Если указан филиал, привязываем менеджера к филиалу
    if (branchId) {
      await prisma.branch_users.create({
        data: {
          id: crypto.randomUUID(),
          user_id: manager.id,
          branch_id: branchId,
        },
      });
    }

    return NextResponse.json({
      message: "Manager created successfully",
      manager: {
        id: manager.id,
        fullName: manager.full_name,
        email: manager.email,
        phone: manager.phone,
        status: manager.status,
      },
    });
  } catch (error) {
    console.error("Create manager error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
