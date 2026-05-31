import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const userId = '050f7dc1-60a4-4fb6-92c2-5ee8b94e0475';

try {
  const orders = await prisma.orders.findMany({
    where: { user_id: userId },
    select: {
      id: true,
      order_number: true,
      payment_status: true,
      payments: true,
    },
    orderBy: { created_at: 'desc' },
  });
  console.log(JSON.stringify(orders, null, 2));
} finally {
  await prisma.$disconnect();
}
