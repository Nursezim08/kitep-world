import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { generateVerificationCode, sendTelegramCode } from "@/lib/telegram";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId обязателен" }, { status: 400 });
    }

    // Проверяем существование пользователя
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "notAdmin" }, { status: 403 });
    }

    // Генерируем новый код
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут

    // Удаляем старые неиспользованные коды
    await prisma.admin_verifications.deleteMany({
      where: {
        user_id: user.id,
        verified: false,
      },
    });

    // Создаем новый код
    await prisma.admin_verifications.create({
      data: {
        id: crypto.randomUUID(),
        user_id: user.id,
        code,
        expires_at: expiresAt,
      },
    });

    // Отправляем код в Telegram
    const sent = await sendTelegramCode(user.id, code);

    if (!sent) {
      return NextResponse.json({ error: "codeNotSent" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Код отправлен повторно",
    });
  } catch (error) {
    console.error("Admin resend code error:", error);
    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
