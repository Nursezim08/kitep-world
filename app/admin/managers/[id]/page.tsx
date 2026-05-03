import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ManagerDetailClient from './ManagerDetailClient';

export default async function ManagerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  // Проверяем авторизацию
  if (!user) {
    redirect('/admin/login');
  }

  // Проверяем роль администратора
  if (user.role !== 'admin') {
    redirect('/');
  }

  const { id } = await params;

  // Получаем полную информацию о менеджере
  const managerData = await prisma.user.findUnique({
    where: { id },
    include: {
      branchUsers: {
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
              city: true,
              district: true,
              address: true,
              phone: true,
              email: true,
              status: true,
            },
          },
        },
      },
      orders: {
        select: {
          id: true,
          orderNumber: true,
          total: true,
          orderStatus: true,
          paymentStatus: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
    },
  });

  if (!managerData || managerData.role !== 'manager') {
    redirect('/admin/managers');
  }

  // Преобразуем даты в строки для клиентского компонента
  const manager = {
    ...managerData,
    createdAt: managerData.createdAt.toISOString(),
    updatedAt: managerData.updatedAt.toISOString(),
    orders: managerData.orders.map(order => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      total: order.total.toString(),
    })),
  };

  return <ManagerDetailClient manager={manager} currentUser={user} />;
}
