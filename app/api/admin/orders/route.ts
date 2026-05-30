import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

// GET /api/admin/orders - Получение списка заказов
export async function GET(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const payload = await verifyAuth(request);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const branchId = searchParams.get("branchId") || "all";
    const paymentStatus = searchParams.get("paymentStatus") || "all";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const minTotal = searchParams.get("minTotal") || "";
    const maxTotal = searchParams.get("maxTotal") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Построение фильтров
    const where: any = {};

    // Поиск по номеру заказа или имени клиента
    if (search) {
      where.OR = [
        { order_number: { contains: search, mode: "insensitive" } },
        { users: { full_name: { contains: search, mode: "insensitive" } } },
        { users: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Фильтр по статусу заказа
    if (status !== "all") {
      where.order_status = status;
    }

    // Фильтр по статусу оплаты
    if (paymentStatus !== "all") {
      where.payment_status = paymentStatus;
    }

    // Фильтр по филиалу
    if (branchId !== "all") {
      where.branch_id = branchId;
    }

    // Фильтр по диапазону дат
    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) where.created_at.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.created_at.lte = end;
      }
    }

    // Фильтр по диапазону суммы
    if (minTotal || maxTotal) {
      where.total = {};
      if (minTotal) where.total.gte = parseFloat(minTotal);
      if (maxTotal) where.total.lte = parseFloat(maxTotal);
    }

    // Сортировка
    const allowedSortFields: Record<string, string> = {
      created_at: "created_at",
      total: "total",
      order_number: "order_number",
    };
    const sortField = allowedSortFields[sortBy] || "created_at";
    const orderBy: any = { [sortField]: sortOrder === "asc" ? "asc" : "desc" };

    // Получение заказов
    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true,
            },
          },
          branches: {
            select: {
              id: true,
              name: true,
              city: true,
            },
          },
          order_items: {
            include: {
              products: {
                include: {
                  product_translations: {
                    where: { locale: "ru" },
                  },
                },
              },
            },
          },
          payments: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.orders.count({ where }),
    ]);

    const mappedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      user: {
        id: order.users?.id ?? "",
        fullName: order.users?.full_name ?? "Неизвестно",
        email: order.users?.email ?? "",
        phone: order.users?.phone ?? null,
      },
      branch: {
        id: order.branches?.id ?? "",
        name: order.branches?.name ?? "",
        city: order.branches?.city ?? "",
      },
      total: Number(order.total),
      orderStatus: order.order_status,
      paymentStatus: order.payment_status,
      createdAt: order.created_at,
      items: order.order_items,
    }));

    return NextResponse.json({
      orders: mappedOrders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
