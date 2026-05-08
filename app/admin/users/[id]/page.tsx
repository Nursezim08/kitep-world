import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import UserDetailClient from './UserDetailClient';

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }

  const { id } = await params;

  return <UserDetailClient user={user} userId={id} />;
}
