import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const payload = await verifyAuth(request);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueResult,
      recentOrders,
    ] = await Promise.all([
      prisma.users.count({
        where: { role: "user" },
      }),
      prisma.products.count({
        where: { status: "active" },
      }),
      prisma.orders.count(),
      prisma.orders.aggregate({
        _sum: { total: true },
      }),
      prisma.orders.findMany({
        take: 5,
        orderBy: { created_at: "desc" },
        include: {
          users: {
            select: { full_name: true },
          },
        },
      }),
    ]);

    const totalRevenue = revenueResult._sum.total
      ? Number(revenueResult._sum.total)
      : 0;

    const formatRevenue = (amount: number) => {
      if (amount >= 1_000_000) {
        return `${(amount / 1_000_000).toFixed(1)}M с`;
      }
      if (amount >= 1_000) {
        return `${Math.round(amount / 1_000)}K с`;
      }
      return `${Math.round(amount)} с`;
    };

    const getTimeAgo = (date: Date) => {
      const diff = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diff < 60) return `${diff} сек назад`;
      if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
      return `${Math.floor(diff / 86400)} д назад`;
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case "paid": return "Оплачен";
        case "completed": return "Завершен";
        case "cancelled": return "Отменен";
        default: return status;
      }
    };

    return NextResponse.json({
      stats: {
        users: totalUsers.toLocaleString("ru-RU"),
        products: totalProducts.toLocaleString("ru-RU"),
        orders: totalOrders.toLocaleString("ru-RU"),
        revenue: formatRevenue(totalRevenue),
      },
      recentOrders: recentOrders.map((order) => ({
        id: `#${order.order_number}`,
        customer: order.users?.full_name || "Неизвестно",
        amount: `${Number(order.total).toLocaleString("ru-RU")} с`,
        status: getStatusText(order.order_status),
        time: getTimeAgo(new Date(order.created_at)),
      })),
    });
  } catch (error) {
    console.error("[Admin Dashboard] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
