import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import ManagersClient from './ManagersClient';

export default async function ManagersPage() {
  const user = await getCurrentUser();

  // Проверяем авторизацию
  if (!user) {
    redirect('/admin/login');
  }

  // Проверяем роль администратора
  if (user.role !== 'admin') {
    redirect('/');
  }

  return <ManagersClient user={user} />;
}
