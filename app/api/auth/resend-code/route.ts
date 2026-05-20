import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Необходимо указать userId" },
        { status: 400 },
      );
    }

    // Получение пользователя
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 },
      );
    }

    if (user.email_verified) {
      return NextResponse.json(
        { error: "Email уже верифицирован" },
        { status: 400 },
      );
    }

    // Проверка на частоту запросов (не более 1 раза в минуту)
    const recentVerification = await prisma.email_verifications.findFirst({
      where: {
        user_id: userId,
        created_at: {
          gt: new Date(Date.now() - 60 * 1000), // 1 минута назад
        },
      },
    });

    if (recentVerification) {
      return NextResponse.json(
        { error: "Подождите минуту перед повторной отправкой кода" },
        { status: 429 },
      );
    }

    // Генерация нового кода
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    await prisma.email_verifications.create({
      data: {
        id: crypto.randomUUID(),
        user_id: user.id,
        email: user.email,
        code: verificationCode,
        expires_at: expiresAt,
      },
    });

    // Отправка email с кодом
    await sendVerificationEmail(user.email, verificationCode);

    return NextResponse.json(
      {
        message: "Код верификации отправлен повторно",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Resend code error:", error);
    return NextResponse.json(
      { error: "Ошибка при отправке кода" },
      { status: 500 },
    );
  }
}
