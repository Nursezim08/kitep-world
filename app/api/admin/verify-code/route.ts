import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { createToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { error: "userId и code обязательны" },
        { status: 400 },
      );
    }

    // Находим код верификации
    const verification = await prisma.admin_verifications.findFirst({
      where: {
        user_id: userId,
        code,
        verified: false,
      },
      include: {
        users: true,
      },
    });

    if (!verification) {
      return NextResponse.json({ error: "invalidCode" }, { status: 401 });
    }

    // Проверяем срок действия кода
    if (new Date() > verification.expires_at) {
      return NextResponse.json({ error: "codeExpired" }, { status: 401 });
    }

    // Помечаем код как использованный
    await prisma.admin_verifications.update({
      where: { id: verification.id },
      data: { verified: true },
    });

    // Создаем JWT токен
    const token = await createToken({
      userId: verification.users.id,
      email: verification.users.email,
      role: verification.users.role,
      loginType: "admin", // Вход через форму админа
    });

    // Устанавливаем cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: verification.users.id,
        fullName: verification.users.full_name,
        email: verification.users.email,
        role: verification.users.role,
      },
    });
  } catch (error) {
    console.error("Admin verify code error:", error);
    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
