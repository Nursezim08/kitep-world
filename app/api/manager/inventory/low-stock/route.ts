import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branchUser = await prisma.branch_users.findFirst({
      where: { user_id: user.id },
    });

    if (!branchUser) {
      return NextResponse.json({ error: "No branch assigned" }, { status: 404 });
    }

    const branchId = branchUser.branch_id;

    const items = await prisma.branch_inventory.findMany({
      where: {
        branch_id: branchId,
        quantity: { gt: 0, lt: 10 },
      },
      orderBy: { quantity: "asc" },
      take: 10,
      include: {
        products: {
          select: {
            sku: true,
            product_translations: {
              where: { locale: "ru" },
              select: { name: true },
            },
            categories: {
              select: {
                category_translations: {
                  where: { locale: "ru" },
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    const result = items.map((item) => ({
      name: item.products.product_translations[0]?.name ?? "Без названия",
      sku: item.products.sku,
      category: item.products.categories?.category_translations[0]?.name ?? "Без категории",
      quantity: item.quantity,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Manager Inventory Low Stock] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
