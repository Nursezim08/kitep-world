import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// GET /api/admin/users - Получение списка пользователей
export async function GET(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const user = await verifyAuth(request);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";

    const where: any = {
      // Исключаем текущего администратора из списка
      id: {
        not: user.userId,
      },
    };

    // Поиск по имени или email
    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Фильтр по роли
    if (role && role !== "all") {
      where.role = role;
    }

    // Фильтр по статусу
    if (status && status !== "all") {
      where.status = status;
    }

    const users = await prisma.users.findMany({
      where,
      select: {
        id: true,
        full_name: true,
        email: true,
        email_verified: true,
        role: true,
        phone: true,
        avatar: true,
        status: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            orders: true,
            branch_users: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Ошибка при получении пользователей" },
      { status: 500 },
    );
  }
}

// POST /api/admin/users - Создание нового пользователя
export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const user = await verifyAuth(request);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const body = await request.json();
    const { fullName, email, phone, role, password, status } = body;

    // Валидация
    if (!fullName || !email || !role || !password) {
      return NextResponse.json(
        { error: "Заполните все обязательные поля" },
        { status: 400 },
      );
    }

    // Проверка существующего email
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 400 },
      );
    }

    // Проверка существующего телефона
    if (phone) {
      const existingPhone = await prisma.users.findUnique({
        where: { phone },
      });

      if (existingPhone) {
        return NextResponse.json(
          { error: "Пользователь с таким телефоном уже существует" },
          { status: 400 },
        );
      }
    }

    // Хеширование пароля
    const passwordHash = await bcrypt.hash(password, 10);

    // Создание пользователя
    const newUser = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        full_name: fullName,
        email,
        phone: phone || null,
        role,
        password_hash: passwordHash,
        status: status || "active",
        email_verified: true,
        updated_at: new Date(),
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        email_verified: true,
        role: true,
        phone: true,
        avatar: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Ошибка при создании пользователя" },
      { status: 500 },
    );
  }
}
