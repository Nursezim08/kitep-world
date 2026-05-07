import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import UsersClient from './UsersClient';

export default async function UsersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/admin/login');
  }

  if (user.role !== 'admin') {
    redirect('/admin/login');
  }

  return <UsersClient user={user} />;
}
