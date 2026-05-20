import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email и код обязательны" },
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

    return NextResponse.json({
      success: true,
      message: "Код подтвержден",
    });
  } catch (error) {
    console.error("Verify reset code error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
