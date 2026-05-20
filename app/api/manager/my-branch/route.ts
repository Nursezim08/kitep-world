import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Получаем первый филиал менеджера
    const branchUser = await prisma.branch_users.findFirst({
      where: {
        user_id: user.id,
      },
      include: {
        branches: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!branchUser) {
      return NextResponse.json(
        { error: "No branch assigned" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      branchId: branchUser.branch_id,
      branch: branchUser.branches,
    });
  } catch (error) {
    console.error("[Manager My Branch] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
