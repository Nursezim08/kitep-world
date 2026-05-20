import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const prisma = getPrismaClient();

  try {
    const payload = await verifyAuth(request);

    if (!payload || payload.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.orders.findMany({
      where: {
        user_id: payload.userId,
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
