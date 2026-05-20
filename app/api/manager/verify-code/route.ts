import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { createToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const { userId, code } = await request.json();

    console.log("[Manager Verify] Verification attempt for userId:", userId);

    if (!userId || !code) {
      return NextResponse.json(
        { error: "userId и code обязательны" },
        { status: 400 },
      );
    }

    // Находим код верификации
    const verification = await prisma.email_verifications.findFirst({
      where: {
        user_id: userId,
        code,
        verified: false,
      },
      include: {
        users: {
          include: {
            branch_users: {
              include: {
                branches: true,
              },
            },
          },
        },
      },
    });

    if (!verification) {
      console.log("[Manager Verify] ERROR: Invalid code");
      return NextResponse.json({ error: "invalidCode" }, { status: 401 });
    }

    // Проверяем срок действия кода
    if (new Date() > verification.expires_at) {
      console.log("[Manager Verify] ERROR: Code expired");
      return NextResponse.json({ error: "codeExpired" }, { status: 401 });
    }

    // Проверяем, что пользователь - менеджер
    if (verification.users.role !== "manager") {
      console.log("[Manager Verify] ERROR: User is not a manager");
      return NextResponse.json({ error: "notManager" }, { status: 403 });
    }

    // Проверяем, что менеджер привязан к филиалу
    if (
      !verification.users.branch_users ||
      verification.users.branch_users.length === 0
    ) {
      console.log("[Manager Verify] ERROR: Manager not assigned to any branch");
      return NextResponse.json({ error: "noBranchAssigned" }, { status: 403 });
    }

    // Помечаем код как использованный
    await prisma.email_verifications.update({
      where: { id: verification.id },
      data: { verified: true },
    });

    console.log("[Manager Verify] Code verified successfully");

    // Создаем JWT токен
    const token = await createToken({
      userId: verification.users.id,
      email: verification.users.email,
      role: verification.users.role,
      loginType: "manager",
    });

    // Устанавливаем cookie
    await setAuthCookie(token);

    console.log("[Manager Verify] SUCCESS: Token created and cookie set");

    return NextResponse.json({
      success: true,
      branchId: verification.users.branch_users[0].branch_id,
      user: {
        id: verification.users.id,
        fullName: verification.users.full_name,
        email: verification.users.email,
        role: verification.users.role,
      },
    });
  } catch (error) {
    console.error("[Manager Verify] EXCEPTION:", error);
    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
