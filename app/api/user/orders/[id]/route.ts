import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const order = await prisma.orders.findUnique({
      where: { id },
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
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
