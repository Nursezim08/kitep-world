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
  const branchData = await prisma.branches.findUnique({
    where: { id },
    include: {
      branch_users: {
        include: {
          users: {
            select: {
              id: true,
              full_name: true,
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
          order_number: true,
          total: true,
          order_status: true,
          payment_status: true,
          created_at: true,
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 10,
      },
      _count: {
        select: {
          branch_users: true,
          orders: true,
          branch_inventory: true,
        },
      },
    },
  });

  if (!branchData) {
    redirect('/admin/branches');
  }

  // Преобразуем данные для клиентского компонента (snake_case -> camelCase)
  const branch = {
    id: branchData.id,
    name: branchData.name,
    code: branchData.code,
    city: branchData.city,
    district: branchData.district,
    address: branchData.address,
    phone: branchData.phone,
    email: branchData.email,
    latitude: branchData.latitude !== null ? branchData.latitude.toString() : null,
    longitude: branchData.longitude !== null ? branchData.longitude.toString() : null,
    openTime: branchData.open_time ? branchData.open_time.toISOString() : null,
    closeTime: branchData.close_time ? branchData.close_time.toISOString() : null,
    status: branchData.status,
    createdAt: branchData.created_at.toISOString(),
    updatedAt: branchData.updated_at.toISOString(),
    branchUsers: branchData.branch_users.map((bu) => ({
      user: {
        id: bu.users.id,
        fullName: bu.users.full_name,
        email: bu.users.email,
        phone: bu.users.phone,
        status: bu.users.status,
      },
    })),
    orders: branchData.orders.map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      total: order.total.toString(),
      orderStatus: order.order_status,
      paymentStatus: order.payment_status,
      createdAt: order.created_at.toISOString(),
    })),
    _count: {
      branchUsers: branchData._count.branch_users,
      orders: branchData._count.orders,
      inventory: branchData._count.branch_inventory,
    },
  };

  return <BranchDetailClient branch={branch} currentUser={user} />;
}
