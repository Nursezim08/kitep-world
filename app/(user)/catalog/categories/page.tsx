import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import CategoriesClient from './CategoriesClient';

export default async function CategoriesPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'user') {
    redirect('/login');
  }

  return <CategoriesClient user={user} />;
}
