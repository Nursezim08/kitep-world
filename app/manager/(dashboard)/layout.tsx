import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import ManagerLayout from './ManagerLayout';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Проверяем авторизацию
  if (!user) {
    redirect('/manager/login');
  }

  // Проверяем роль менеджера
  if (user.role !== 'manager') {
    redirect('/');
  }

  return <ManagerLayout user={user}>{children}</ManagerLayout>;
}
