import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import ReportsClient from './ReportsClient';

export default async function ReportsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }

  return <ReportsClient user={user} />;
}
