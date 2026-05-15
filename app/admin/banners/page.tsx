import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import BannersClient from './BannersClient';

export default async function BannersPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }

  return <BannersClient user={user} />;
}
