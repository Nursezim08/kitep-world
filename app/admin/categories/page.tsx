import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import CategoriesClient from './CategoriesClient';

export const metadata: Metadata = {
  title: 'Категории | Админ панель',
  description: 'Управление категориями товаров',
};

export default async function CategoriesPage() {
  const user = await getCurrentUser();

  // Проверяем авторизацию
  if (!user) {
    redirect('/admin/login');
  }

  // Проверяем роль администратора
  if (user.role !== 'admin') {
    redirect('/');
  }

  return <CategoriesClient user={user} />;
}
