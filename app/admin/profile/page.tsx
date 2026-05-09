import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AdminProfileClient from './AdminProfileClient';

export default async function AdminProfilePage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }

  return <AdminProfileClient user={user} />;
}
