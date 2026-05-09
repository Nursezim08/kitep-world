import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import OrderDetailClient from './OrderDetailClient';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }

  const { id } = await params;

  return <OrderDetailClient user={user} orderId={id} />;
}
