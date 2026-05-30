import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = getPrismaClient();

  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const branchUser = await prisma.branch_users.findFirst({
      where: { user_id: user.id },
    });

    if (!branchUser) {
      return NextResponse.json({ error: "No branch assigned" }, { status: 404 });
    }

    const order = await prisma.orders.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.branch_id !== branchUser.branch_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.order_status !== "paid") {
      return NextResponse.json(
        { error: "Only paid orders can be completed" },
        { status: 400 }
      );
    }

    const updated = await prisma.orders.update({
      where: { id },
      data: { order_status: "completed" },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("[Manager Complete Order] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
