import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function ManagerBranchPage({
  params,
}: {
  params: Promise<{ id: string }>;
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

  // Перенаправляем на новый дашборд
  redirect('/manager/dashboard');
}
