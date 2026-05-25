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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "all";
    const paymentStatus = searchParams.get("paymentStatus") ?? "all";
    const dateFrom = searchParams.get("dateFrom") ?? "";
    const dateTo = searchParams.get("dateTo") ?? "";
    const sortBy = searchParams.get("sortBy") ?? "date_desc";
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");

    const where: any = { branch_id: branchId };

    if (status !== "all") {
      where.order_status = status;
    }

    if (paymentStatus !== "all") {
      where.payment_status = paymentStatus;
    }

    if (dateFrom) {
      where.created_at = { ...where.created_at, gte: new Date(dateFrom) };
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      where.created_at = { ...where.created_at, lte: toDate };
    }

    if (search) {
      where.OR = [
        { order_number: { contains: search, mode: "insensitive" } },
        { users: { full_name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const orderByMap: Record<string, any> = {
      date_desc: { created_at: "desc" },
      date_asc: { created_at: "asc" },
      total_desc: { total: "desc" },
      total_asc: { total: "asc" },
    };
    const orderBy = orderByMap[sortBy] ?? { created_at: "desc" };

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          users: { select: { full_name: true, email: true, phone: true } },
          order_items: { select: { id: true } },
        },
      }),
      prisma.orders.count({ where }),
    ]);

    const getStatusInfo = (s: string) => {
      switch (s) {
        case "paid": return { text: "Оплачен", key: "paid" };
        case "completed": return { text: "Завершён", key: "completed" };
        case "cancelled": return { text: "Отменён", key: "cancelled" };
        default: return { text: s, key: s };
      }
    };

    const getPaymentStatusInfo = (s: string) => {
      switch (s) {
        case "success": return { text: "Успешно", key: "success" };
        case "failed": return { text: "Не оплачен", key: "failed" };
        default: return { text: s, key: s };
      }
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    };

    return NextResponse.json({
      orders: orders.map((order) => {
        const statusInfo = getStatusInfo(order.order_status);
        const paymentInfo = getPaymentStatusInfo(order.payment_status);
        return {
          id: `#${order.order_number}`,
          rawId: order.id,
          customer: order.users?.full_name ?? "Неизвестно",
          email: order.users?.email ?? "",
          phone: order.users?.phone ?? "",
          items: order.order_items.length,
          total: `${Number(order.total).toLocaleString("ru-RU")} с`,
          totalRaw: Number(order.total),
          status: statusInfo.key,
          statusText: statusInfo.text,
          paymentStatus: paymentInfo.key,
          paymentStatusText: paymentInfo.text,
          date: formatDate(new Date(order.created_at)),
        };
      }),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[Manager Orders] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
