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

    const [
      totalOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      totalInventoryItems,
      lowStockCount,
      outOfStockCount,
      inventoryValue,
    ] = await Promise.all([
      prisma.orders.count({ where: { branch_id: branchId } }),
      prisma.orders.count({ where: { branch_id: branchId, order_status: "paid" } }),
      prisma.orders.count({ where: { branch_id: branchId, order_status: "completed" } }),
      prisma.orders.count({ where: { branch_id: branchId, order_status: "cancelled" } }),
      prisma.branch_inventory.count({ where: { branch_id: branchId } }),
      prisma.branch_inventory.count({
        where: { branch_id: branchId, quantity: { gt: 0, lt: 10 } },
      }),
      prisma.branch_inventory.count({
        where: { branch_id: branchId, quantity: 0 },
      }),
      prisma.branch_inventory.findMany({
        where: { branch_id: branchId },
        select: {
          quantity: true,
          products: { select: { price: true } },
        },
      }),
    ]);

    const totalValue = inventoryValue.reduce((sum, item) => {
      return sum + item.quantity * Number(item.products.price);
    }, 0);

    const formatValue = (val: number) => {
      if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M с`;
      if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K с`;
      return `${val.toLocaleString("ru-RU")} с`;
    };

    return NextResponse.json({
      orders: {
        total: totalOrders.toString(),
        processing: processingOrders.toString(),
        completed: completedOrders.toString(),
        cancelled: cancelledOrders.toString(),
      },
      inventory: {
        total: totalInventoryItems.toLocaleString("ru-RU"),
        lowStock: lowStockCount.toString(),
        outOfStock: outOfStockCount.toString(),
        totalValue: formatValue(totalValue),
      },
    });
  } catch (error) {
    console.error("[Manager Stats] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
