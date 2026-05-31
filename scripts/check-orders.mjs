import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const userId = '050f7dc1-60a4-4fb6-92c2-5ee8b94e0475';

try {
  const all = await prisma.orders.findMany({
    where: { user_id: userId },
    select: {
      id: true,
      order_number: true,
      payment_status: true,
      order_status: true,
      total: true,
      created_at: true,
    },
    orderBy: { created_at: 'desc' },
  });
  console.log('Total orders for user:', all.length);
  console.log(JSON.stringify(all, null, 2));

  const successOrders = all.filter((o) => o.payment_status === 'success');
  console.log('Orders with payment_status=success:', successOrders.length);
} finally {
  await prisma.$disconnect();
}
