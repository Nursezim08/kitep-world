import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
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

  const prisma = getPrismaClient();

  // Получаем полную информацию о менеджере
  const managerData = await prisma.users.findUnique({
    where: { id },
    include: {
      branch_users: {
        include: {
          branches: {
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
    },
  });

  if (!managerData || managerData.role !== 'manager') {
    redirect('/admin/managers');
  }

  // Преобразуем в camelCase для клиентского компонента
  const manager = {
    id: managerData.id,
    fullName: managerData.full_name,
    email: managerData.email,
    phone: managerData.phone,
    status: managerData.status,
    createdAt: managerData.created_at.toISOString(),
    updatedAt: managerData.updated_at.toISOString(),
    branchUsers: managerData.branch_users.map((bu) => ({
      branch: {
        id: bu.branches.id,
        name: bu.branches.name,
        code: bu.branches.code,
        city: bu.branches.city,
        district: bu.branches.district,
        address: bu.branches.address,
        phone: bu.branches.phone,
        email: bu.branches.email,
        status: bu.branches.status,
      },
    })),
    orders: managerData.orders.map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      total: order.total.toString(),
      orderStatus: order.order_status,
      paymentStatus: order.payment_status,
      createdAt: order.created_at.toISOString(),
    })),
  };

  return <ManagerDetailClient manager={manager} currentUser={user} />;
}
