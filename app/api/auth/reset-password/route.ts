import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { validatePassword } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "Все поля обязательны" },
        { status: 400 },
      );
    }

    // Валидация пароля
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 },
      );
    }

    // Поиск кода
    const resetRecord = await prisma.password_resets.findFirst({
      where: {
        email: email.toLowerCase(),
        code,
        used: false,
      },
    });

    if (!resetRecord) {
      return NextResponse.json({ error: "Неверный код" }, { status: 400 });
    }

    // Проверка срока действия
    if (new Date() > resetRecord.expires_at) {
      return NextResponse.json(
        { error: "Код истек. Запросите новый код." },
        { status: 400 },
      );
    }

    // Поиск пользователя
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 },
      );
    }

    // Хеширование нового пароля
    const hashedPassword = await hashPassword(newPassword);

    // Обновление пароля и пометка кода как использованного
    await prisma.$transaction([
      prisma.users.update({
        where: { id: user.id },
        data: { password_hash: hashedPassword },
      }),
      prisma.password_resets.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Пароль успешно изменен",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
