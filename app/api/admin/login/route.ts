import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { generateVerificationCode, sendTelegramCode } from "@/lib/telegram";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const { email, password } = await request.json();

    console.log("[Admin Login] Login attempt for email:", email);
    console.log(
      "[Admin Login] Prisma client:",
      typeof prisma,
      prisma ? "OK" : "UNDEFINED",
    );

    if (!email || !password) {
      console.log("[Admin Login] ERROR: Missing email or password");
      return NextResponse.json(
        { error: "Email и пароль обязательны" },
        { status: 400 },
      );
    }

    // Находим пользователя по email
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.log("[Admin Login] ERROR: User not found");
      return NextResponse.json(
        { error: "invalidCredentials" },
        { status: 401 },
      );
    }

    console.log("[Admin Login] User found:", user.id, "Role:", user.role);

    // Проверяем пароль
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      console.log("[Admin Login] ERROR: Invalid password");
      return NextResponse.json(
        { error: "invalidCredentials" },
        { status: 401 },
      );
    }

    console.log("[Admin Login] Password valid");

    // Проверяем роль администратора
    if (user.role !== "admin") {
      console.log("[Admin Login] ERROR: User is not admin, role:", user.role);
      return NextResponse.json({ error: "notAdmin" }, { status: 403 });
    }

    // Проверяем статус аккаунта
    if (user.status === "blocked") {
      console.log("[Admin Login] ERROR: Account blocked");
      return NextResponse.json({ error: "accountBlocked" }, { status: 403 });
    }

    if (user.status === "inactive") {
      console.log("[Admin Login] ERROR: Account inactive");
      return NextResponse.json({ error: "accountInactive" }, { status: 403 });
    }

    console.log("[Admin Login] Account status OK");

    // Генерируем код подтверждения
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут

    console.log("[Admin Login] Generated code:", code);

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

    console.log("[Admin Login] Code saved to database");

    // Отправляем код в Telegram
    console.log("[Admin Login] Attempting to send code via Telegram...");
    const sent = await sendTelegramCode(user.id, code);

    if (!sent) {
      console.log("[Admin Login] ERROR: Failed to send code via Telegram");
      return NextResponse.json({ error: "codeNotSent" }, { status: 500 });
    }

    console.log("[Admin Login] SUCCESS: Code sent via Telegram");

    return NextResponse.json({
      success: true,
      userId: user.id,
      message: "Код отправлен в Telegram",
    });
  } catch (error) {
    console.error("[Admin Login] EXCEPTION:", error);
    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
