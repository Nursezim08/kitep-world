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
      return NextResponse.json(
        { error: "No branch assigned" },
        { status: 404 },
      );
    }

    const branchId = branchUser.branch_id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todayOrdersCount,
      todayRevenueResult,
      totalInventory,
      recentOrders,
    ] = await Promise.all([
      prisma.orders.count({
        where: {
          branch_id: branchId,
          created_at: { gte: today, lt: tomorrow },
        },
      }),
      prisma.orders.aggregate({
        where: {
          branch_id: branchId,
          created_at: { gte: today, lt: tomorrow },
        },
        _sum: { total: true },
      }),
      prisma.branch_inventory.aggregate({
        where: { branch_id: branchId },
        _sum: { quantity: true },
      }),
      prisma.orders.findMany({
        where: { branch_id: branchId },
        take: 5,
        orderBy: { created_at: "desc" },
        include: {
          users: {
            select: { full_name: true },
          },
        },
      }),
    ]);

    const todayRevenue = todayRevenueResult._sum.total
      ? Number(todayRevenueResult._sum.total)
      : 0;

    const totalQty = totalInventory._sum.quantity ?? 0;

    const getTimeAgo = (date: Date) => {
      const diff = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diff < 60) return `${diff} сек назад`;
      if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
      return `${Math.floor(diff / 86400)} д назад`;
    };

    const getStatusInfo = (status: string) => {
      switch (status) {
        case "paid": return { text: "Оплачен", key: "paid" };
        case "completed": return { text: "Завершен", key: "completed" };
        case "cancelled": return { text: "Отменен", key: "cancelled" };
        default: return { text: status, key: "paid" };
      }
    };

    return NextResponse.json({
      stats: {
        todayOrders: todayOrdersCount.toString(),
        totalStock: totalQty.toLocaleString("ru-RU"),
        todayRevenue: `${todayRevenue.toLocaleString("ru-RU")} с`,
      },
      recentOrders: recentOrders.map((order) => {
        const statusInfo = getStatusInfo(order.order_status);
        return {
          id: `#${order.order_number}`,
          customer: order.users?.full_name || "Неизвестно",
          amount: `${Number(order.total).toLocaleString("ru-RU")} с`,
          status: statusInfo.key,
          statusText: statusInfo.text,
          time: getTimeAgo(new Date(order.created_at)),
        };
      }),
    });
  } catch (error) {
    console.error("[Manager Dashboard] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
