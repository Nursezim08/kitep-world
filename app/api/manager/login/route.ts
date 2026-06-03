import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { generateVerificationCode, sendManagerLoginEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const { email, password } = await request.json();

    console.log("[Manager Login] Login attempt for email:", email);

    if (!email || !password) {
      console.log("[Manager Login] ERROR: Missing email or password");
      return NextResponse.json(
        { error: "Email и пароль обязательны" },
        { status: 400 },
      );
    }

    // Находим пользователя по email
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        branch_users: {
          include: {
            branches: true,
          },
        },
      },
    });

    if (!user) {
      console.log("[Manager Login] ERROR: User not found");
      return NextResponse.json(
        { error: "invalidCredentials" },
        { status: 401 },
      );
    }

    console.log("[Manager Login] User found:", user.id, "Role:", user.role);

    // Проверяем пароль
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      console.log("[Manager Login] ERROR: Invalid password");
      return NextResponse.json(
        { error: "invalidCredentials" },
        { status: 401 },
      );
    }

    console.log("[Manager Login] Password valid");

    // Проверяем роль менеджера
    if (user.role !== "manager") {
      console.log(
        "[Manager Login] ERROR: User is not manager, role:",
        user.role,
      );
      return NextResponse.json({ error: "notManager" }, { status: 403 });
    }

    // Проверяем, что менеджер привязан к филиалу
    if (!user.branch_users || user.branch_users.length === 0) {
      console.log("[Manager Login] ERROR: Manager not assigned to any branch");
      return NextResponse.json({ error: "noBranchAssigned" }, { status: 403 });
    }

    // Проверяем статус аккаунта
    if (user.status === "blocked") {
      console.log("[Manager Login] ERROR: Account blocked");
      return NextResponse.json({ error: "accountBlocked" }, { status: 403 });
    }

    if (user.status === "inactive") {
      console.log("[Manager Login] ERROR: Account inactive");
      return NextResponse.json({ error: "accountInactive" }, { status: 403 });
    }

    console.log("[Manager Login] Account status OK");

    // Генерируем код подтверждения
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    console.log("[Manager Login] Generated code:", code);

    // Удаляем старые неиспользованные коды
    await prisma.email_verifications.deleteMany({
      where: {
        user_id: user.id,
        verified: false,
      },
    });

    // Создаем новый код
    await prisma.email_verifications.create({
      data: {
        id: crypto.randomUUID(),
        user_id: user.id,
        email: user.email,
        code,
        expires_at: expiresAt,
      },
    });

    console.log("[Manager Login] Code saved to database");

    // Отправляем код на email
    console.log("[Manager Login] Attempting to send code via email...");
    const sent = await sendManagerLoginEmail(user.email, code);

    if (!sent) {
      console.error("[Manager Login] ERROR: Failed to send email!");
      return NextResponse.json(
        { error: "Не удалось отправить код на email. Пожалуйста, попробуйте позже или обратитесь к администратору." },
        { status: 500 },
      );
    }

    console.log("[Manager Login] SUCCESS: Code sent via email to", user.email);

    return NextResponse.json({
      success: true,
      userId: user.id,
      branchId: user.branch_users[0].branch_id,
      message: "Код отправлен на email",
    });
  } catch (error) {
    console.error("[Manager Login] EXCEPTION:", error);
    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
