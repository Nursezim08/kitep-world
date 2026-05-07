import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import BranchesClient from './BranchesClient';

export default async function BranchesPage() {
  const user = await getCurrentUser();

  // Проверяем авторизацию
  if (!user) {
    redirect('/admin/login');
  }

  // Проверяем роль администратора
  if (user.role !== 'admin') {
    redirect('/');
  }

  return <BranchesClient user={user} />;
}
