import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

// GET /api/admin/reports - Получение данных для отчетов
export async function GET(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const payload = await verifyAuth(request);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "overview";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const branchId = searchParams.get("branchId");

    // Построение фильтра по датам
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    const where: any = {};
    if (Object.keys(dateFilter).length > 0) {
      where.created_at = dateFilter;
    }
    if (branchId && branchId !== "all") {
      where.branch_id = branchId;
    }

    switch (type) {
      case "overview": {
        // Общая статистика
        const [
          totalOrders,
          totalRevenue,
          totalUsers,
          totalProducts,
          ordersByStatus,
          revenueByBranch,
        ] = await Promise.all([
          prisma.orders.count({ where }),
          prisma.orders.aggregate({
            where: { ...where, order_status: { not: "cancelled" } },
            _sum: { total: true },
          }),
          prisma.users.count({ where: { role: "user", status: "active" } }),
          prisma.products.count({ where: { status: "active" } }),
          prisma.orders.groupBy({
            by: ["order_status"],
            where,
            _count: true,
          }),
          prisma.orders.groupBy({
            by: ["branch_id"],
            where: { ...where, order_status: { not: "cancelled" } },
            _sum: { total: true },
            _count: true,
          }),
        ]);

        // Получение названий филиалов
        const branchIds = revenueByBranch.map((b) => b.branch_id);
        const branches = await prisma.branches.findMany({
          where: { id: { in: branchIds } },
          select: { id: true, name: true, city: true },
        });

        const revenueByBranchWithNames = revenueByBranch.map((item) => {
          const branch = branches.find((b) => b.id === item.branch_id);
          return {
            branchId: item.branch_id,
            branchName: branch?.name || "Неизвестно",
            city: branch?.city || "",
            revenue: item._sum.total || 0,
            orders: item._count,
          };
        });

        return NextResponse.json({
          totalOrders,
          totalRevenue: totalRevenue._sum.total || 0,
          totalUsers,
          totalProducts,
          ordersByStatus,
          revenueByBranch: revenueByBranchWithNames,
        });
      }

      case "sales": {
        // Отчет по продажам
        const salesData = await prisma.order_items.groupBy({
          by: ["product_id"],
          where: {
            orders: where,
          },
          _sum: {
            quantity: true,
            total: true,
          },
          _count: true,
          orderBy: {
            _sum: {
              total: "desc",
            },
          },
          take: 20,
        });

        // Получение информации о товарах
        const productIds = salesData.map((item) => item.product_id);
        const products = await prisma.products.findMany({
          where: { id: { in: productIds } },
          include: {
            product_translations: {
              where: { locale: "ru" },
            },
            product_images: {
              where: { status: "active" },
              take: 1,
            },
          },
        });

        const salesWithProducts = salesData.map((item) => {
          const product = products.find((p) => p.id === item.product_id);
          return {
            productId: item.product_id,
            productName: product?.product_translations[0]?.name || "Неизвестно",
            sku: product?.sku || "",
            image: product?.product_images[0]?.image_url || null,
            quantity: item._sum.quantity || 0,
            revenue: item._sum.total || 0,
            orders: item._count,
          };
        });

        return NextResponse.json({ sales: salesWithProducts });
      }

      case "customers": {
        // Отчет по клиентам
        const topCustomers = await prisma.orders.groupBy({
          by: ["user_id"],
          where: { ...where, order_status: { not: "cancelled" } },
          _sum: {
            total: true,
          },
          _count: true,
          orderBy: {
            _sum: {
              total: "desc",
            },
          },
          take: 20,
        });

        // Получение информации о пользователях
        const userIds = topCustomers.map((item) => item.user_id);
        const users = await prisma.users.findMany({
          where: { id: { in: userIds } },
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        });

        const customersWithInfo = topCustomers.map((item) => {
          const user = users.find((u) => u.id === item.user_id);
          return {
            userId: item.user_id,
            fullName: user?.full_name || "Неизвестно",
            email: user?.email || "",
            phone: user?.phone || "",
            avatar: user?.avatar || null,
            totalSpent: item._sum.total || 0,
            orders: item._count,
          };
        });

        return NextResponse.json({ customers: customersWithInfo });
      }

      case "inventory": {
        // Отчет по остаткам
        const inventory = await prisma.branch_inventory.findMany({
          where: branchId && branchId !== "all" ? { branch_id: branchId } : {},
          include: {
            products: {
              include: {
                product_translations: {
                  where: { locale: "ru" },
                },
                product_images: {
                  where: { status: "active" },
                  take: 1,
                },
              },
            },
            branches: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
          },
          orderBy: {
            quantity: "asc",
          },
        });

        const inventoryData = inventory.map((item) => ({
          branchId: item.branch_id,
          branchName: item.branches.name,
          city: item.branches.city,
          productId: item.product_id,
          productName:
            item.products.product_translations[0]?.name || "Неизвестно",
          sku: item.products.sku,
          image: item.products.product_images[0]?.image_url || null,
          quantity: item.quantity,
          price: item.products.price,
          totalValue: Number(item.products.price) * item.quantity,
        }));

        return NextResponse.json({ inventory: inventoryData });
      }

      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}
