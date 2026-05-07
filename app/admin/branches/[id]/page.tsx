import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BranchDetailClient from './BranchDetailClient';

export default async function BranchDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Получаем полную информацию о филиале
  const branchData = await prisma.branch.findUnique({
    where: { id },
    include: {
      branchUsers: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
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
      _count: {
        select: {
          branchUsers: true,
          orders: true,
          inventory: true,
        },
      },
    },
  });

  if (!branchData) {
    redirect('/admin/branches');
  }

  // Преобразуем даты в строки для клиентского компонента
  const branch = {
    ...branchData,
    createdAt: branchData.createdAt.toISOString(),
    updatedAt: branchData.updatedAt.toISOString(),
    openTime: branchData.openTime?.toISOString() || null,
    closeTime: branchData.closeTime?.toISOString() || null,
    latitude: branchData.latitude?.toString() || null,
    longitude: branchData.longitude?.toString() || null,
    orders: branchData.orders.map(order => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      total: order.total.toString(),
    })),
  };

  return <BranchDetailClient branch={branch} currentUser={user} />;
}
