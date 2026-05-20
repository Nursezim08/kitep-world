import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import crypto from "crypto";

// POST - Переназначить менеджеров между филиалами
export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fromBranchId, toBranchId, managerIds } = body;

    // Валидация
    if (
      !fromBranchId ||
      !toBranchId ||
      !Array.isArray(managerIds) ||
      managerIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Необходимо указать филиалы и менеджеров для переназначения" },
        { status: 400 },
      );
    }

    // Проверяем что филиалы существуют
    const [fromBranch, toBranch] = await Promise.all([
      prisma.branches.findUnique({ where: { id: fromBranchId } }),
      prisma.branches.findUnique({ where: { id: toBranchId } }),
    ]);

    if (!fromBranch || !toBranch) {
      return NextResponse.json(
        { error: "Один или оба филиала не найдены" },
        { status: 404 },
      );
    }

    // Проверяем что все менеджеры существуют и привязаны к исходному филиалу
    const branchUsers = await prisma.branch_users.findMany({
      where: {
        branch_id: fromBranchId,
        user_id: { in: managerIds },
      },
      include: {
        users: true,
      },
    });

    if (branchUsers.length !== managerIds.length) {
      return NextResponse.json(
        {
          error: "Один или несколько менеджеров не найдены в исходном филиале",
        },
        { status: 400 },
      );
    }

    // Выполняем переназначение в транзакции
    await prisma.$transaction(async (tx) => {
      // Удаляем менеджеров из исходного филиала
      await tx.branch_users.deleteMany({
        where: {
          branch_id: fromBranchId,
          user_id: { in: managerIds },
        },
      });

      // Добавляем менеджеров в целевой филиал
      await tx.branch_users.createMany({
        data: managerIds.map((managerId: string) => ({
          id: crypto.randomUUID(),
          branch_id: toBranchId,
          user_id: managerId,
        })),
        skipDuplicates: true,
      });
    });

    return NextResponse.json({
      message: "Менеджеры успешно переназначены",
      count: managerIds.length,
    });
  } catch (error) {
    console.error("Error reassigning managers:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
