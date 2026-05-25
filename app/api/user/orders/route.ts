import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import crypto from "crypto";

export async function GET() {
  const prisma = getPrismaClient();

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role === "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (user.role === "manager" && user.loginType === "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const orders = await prisma.orders.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        branches: {
          select: {
            name: true,
            city: true,
          },
        },
        order_items: {
          include: {
            products: {
              select: {
                product_translations: {
                  select: {
                    locale: true,
                    name: true,
                  },
                },
                product_images: {
                  select: {
                    image_url: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Переименовываем поля в camelCase для клиента
    const result = orders.map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      totalAmount: Number(order.total),
      status: order.order_status,
      paymentStatus: order.payment_status,
      createdAt: order.created_at,
      comment: order.comment,
      branch: {
        name: order.branches.name,
        city: order.branches.city,
      },
      orderItems: order.order_items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: Number(item.total),
        product: {
          translations: item.products.product_translations,
          images: item.products.product_images.map((img) => ({
            imageUrl: img.image_url,
          })),
        },
      })),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role === "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (user.role === "manager" && user.loginType === "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { branchId, comment } = await request.json();

    if (!branchId) {
      return NextResponse.json({ error: "branchId is required" }, { status: 400 });
    }

    const branch = await prisma.branches.findUnique({ where: { id: branchId } });
    if (!branch || branch.status !== "active") {
      return NextResponse.json({ error: "Branch not found or inactive" }, { status: 404 });
    }

    const cartItems = await prisma.carts.findMany({
      where: { user_id: user.id },
      include: {
        products: true,
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const total = cartItems.reduce(
      (sum, item) => sum + Number(item.products.price) * item.quantity,
      0
    );

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const orderId = crypto.randomUUID();

    const order = await prisma.orders.create({
      data: {
        id: orderId,
        order_number: orderNumber,
        user_id: user.id,
        branch_id: branchId,
        comment: comment || null,
        total: total,
        payment_status: "failed",
        order_status: "paid",
        order_items: {
          create: cartItems.map((item) => ({
            id: crypto.randomUUID(),
            product_id: item.product_id,
            quantity: item.quantity,
            total: Number(item.products.price) * item.quantity,
          })),
        },
      },
    });

    await prisma.carts.deleteMany({ where: { user_id: user.id } });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
