import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { createToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const body = await request.json();
    const { userId, code } = body;

    if (!userId || !code) {
      return NextResponse.json(
        { error: "Необходимо указать userId и код верификации" },
        { status: 400 },
      );
    }

    // Проверка кода верификации
    const verification = await prisma.email_verifications.findFirst({
      where: {
        user_id: userId,
        code,
        verified: false,
        expires_at: {
          gt: new Date(),
        },
      },
      include: {
        users: true,
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Неверный или истекший код верификации" },
        { status: 400 },
      );
    }

    // Обновление статуса верификации
    await prisma.$transaction([
      prisma.email_verifications.update({
        where: { id: verification.id },
        data: { verified: true },
      }),
      prisma.users.update({
        where: { id: userId },
        data: { email_verified: true },
      }),
    ]);

    // Создание токена и установка cookie
    const token = await createToken({
      userId: verification.users.id,
      email: verification.users.email,
      role: verification.users.role,
    });

    await setAuthCookie(token);

    return NextResponse.json(
      {
        message: "Email успешно верифицирован",
        user: {
          id: verification.users.id,
          fullName: verification.users.full_name,
          email: verification.users.email,
          role: verification.users.role,
          phone: verification.users.phone,
          avatar: verification.users.avatar,
          status: verification.users.status,
          emailVerified: true,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Ошибка при верификации email" },
      { status: 500 },
    );
  }
}
