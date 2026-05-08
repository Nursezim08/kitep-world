import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import ManagerProductDetailClient from './ManagerProductDetailClient';

export default async function ManagerProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'manager') {
    redirect('/manager/login');
  }

  const { id } = await params;

  return <ManagerProductDetailClient user={user} productId={id} />;
}
